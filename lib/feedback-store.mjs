import { randomUUID } from 'node:crypto';
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const valid_statuses = new Set(['new', 'in_progress', 'resolved', 'rejected']);

export class FeedbackStore {
    constructor(feedback_dir) {
        this.feedback_dir = feedback_dir;
        this.screenshot_dir = resolve(feedback_dir, 'screenshots');
        this.database_path = resolve(feedback_dir, 'feedback-events.sqlite');
        this.database = null;
        this.read_only = false;
    }

    async initialize(options = {}) {
        if (options.read_only === true) {
            this.read_only = true;
            this.database = new DatabaseSync(this.database_path, { readOnly: true });
            this.database.exec('PRAGMA query_only = ON; PRAGMA busy_timeout = 5000;');
            return;
        }

        this.read_only = false;
        await mkdir(this.screenshot_dir, { recursive: true, mode: 0o700 });
        this.database = new DatabaseSync(this.database_path);
        await chmod(this.database_path, 0o600);
        this.database.exec(`
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = FULL;
            PRAGMA busy_timeout = 5000;

            CREATE TABLE IF NOT EXISTS feedback_events (
                sequence INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id TEXT NOT NULL UNIQUE,
                feedback_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                created_at TEXT NOT NULL,
                payload TEXT NOT NULL
            ) STRICT;

            CREATE INDEX IF NOT EXISTS feedback_events_feedback_id
                ON feedback_events (feedback_id, sequence);

            CREATE TRIGGER IF NOT EXISTS feedback_events_no_update
            BEFORE UPDATE ON feedback_events
            BEGIN
                SELECT RAISE(ABORT, 'Feedback events are append-only');
            END;

            CREATE TRIGGER IF NOT EXISTS feedback_events_no_delete
            BEFORE DELETE ON feedback_events
            BEGIN
                SELECT RAISE(ABORT, 'Feedback events are append-only');
            END;
        `);
    }

    append_event(feedback_id, event_type, payload) {
        this.assert_writable();
        const event = {
            event_id: randomUUID(),
            feedback_id,
            event_type,
            created_at: new Date().toISOString(),
            payload,
        };

        this.database.prepare(`
            INSERT INTO feedback_events (
                event_id,
                feedback_id,
                event_type,
                created_at,
                payload
            ) VALUES (?, ?, ?, ?, ?)
        `).run(
            event.event_id,
            event.feedback_id,
            event.event_type,
            event.created_at,
            JSON.stringify(event.payload),
        );

        return event;
    }

    read_events() {
        return this.database.prepare(`
            SELECT sequence, event_id, feedback_id, event_type, created_at, payload
            FROM feedback_events
            ORDER BY sequence ASC
        `).all().map((row) => ({
            sequence: Number(row.sequence),
            event_id: row.event_id,
            feedback_id: row.feedback_id,
            event_type: row.event_type,
            created_at: row.created_at,
            payload: JSON.parse(row.payload),
        }));
    }

    materialize() {
        const feedback_by_id = new Map();

        this.read_events().forEach((event) => {
            if (event.event_type === 'created') {
                feedback_by_id.set(event.feedback_id, {
                    id: event.feedback_id,
                    ...event.payload,
                    status: 'new',
                    created_at: event.created_at,
                    updated_at: event.created_at,
                    comments: [],
                    history: [event],
                });
                return;
            }

            const feedback = feedback_by_id.get(event.feedback_id);

            if (!feedback) {
                return;
            }

            feedback.history.push(event);
            feedback.updated_at = event.created_at;

            if (event.event_type === 'comment_added') {
                feedback.comments.push({
                    id: event.event_id,
                    author: event.payload.author,
                    comment: event.payload.comment,
                    kind: event.payload.kind === 'action' ? 'action' : 'reply',
                    created_at: event.created_at,
                });
            }

            if (event.event_type === 'status_changed') {
                feedback.status = event.payload.status;
            }
        });

        return [...feedback_by_id.values()]
            .sort((left, right) => right.created_at.localeCompare(left.created_at));
    }

    list(filters = {}) {
        return this.materialize().filter((feedback) => {
            if (filters.view && feedback.view !== filters.view) {
                return false;
            }

            if (filters.status === 'open') {
                return !['resolved', 'rejected'].includes(feedback.status);
            }

            if (filters.status && filters.status !== 'all' && feedback.status !== filters.status) {
                return false;
            }

            return true;
        });
    }

    get(feedback_id) {
        return this.materialize().find((feedback) => feedback.id === feedback_id) || null;
    }

    async create(payload, screenshot_data_url = '') {
        this.assert_writable();
        const feedback_id = `fb_${Date.now().toString(36)}_${randomUUID().slice(0, 8)}`;
        let screenshot_file = null;
        let screenshot_type = null;

        if (screenshot_data_url) {
            const match = screenshot_data_url.match(/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)$/);

            if (!match) {
                throw new Error('Nieprawidłowy format screenshota.');
            }

            const extension = match[1] === 'jpeg' ? 'jpg' : 'png';
            const screenshot = Buffer.from(match[2], 'base64');

            if (screenshot.byteLength > 4 * 1024 * 1024) {
                throw new Error('Screenshot przekracza limit 4 MB.');
            }

            screenshot_file = `${feedback_id}.${extension}`;
            screenshot_type = `image/${match[1]}`;
            await writeFile(
                resolve(this.screenshot_dir, screenshot_file),
                screenshot,
                { flag: 'wx', mode: 0o600 },
            );
        }

        this.append_event(feedback_id, 'created', {
            ...payload,
            screenshot_file,
            screenshot_type,
        });

        return this.get(feedback_id);
    }

    add_comment(feedback_id, author, comment, kind = 'reply') {
        this.assert_writable();
        if (!this.get(feedback_id)) {
            return null;
        }

        this.append_event(feedback_id, 'comment_added', {
            author,
            comment,
            kind: kind === 'action' ? 'action' : 'reply',
        });

        return this.get(feedback_id);
    }

    change_status(feedback_id, status, author) {
        this.assert_writable();
        if (!valid_statuses.has(status)) {
            throw new Error('Nieprawidłowy status uwagi.');
        }

        if (!this.get(feedback_id)) {
            return null;
        }

        this.append_event(feedback_id, 'status_changed', { status, author });

        return this.get(feedback_id);
    }

    async screenshot(feedback_id) {
        const feedback = this.get(feedback_id);

        if (!feedback?.screenshot_file) {
            return null;
        }

        return {
            body: await readFile(resolve(this.screenshot_dir, feedback.screenshot_file)),
            content_type: feedback.screenshot_type,
        };
    }

    assert_writable() {
        if (this.read_only) {
            throw new Error('Archiwum uwag jest otwarte wyłącznie do odczytu.');
        }
    }
}

export function statuses() {
    return [...valid_statuses];
}
