import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { FeedbackStore } from '../lib/feedback-store.mjs';

test('materializes comment kinds and filters statuses', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'activio-feedback-'));
    const store = new FeedbackStore(directory);

    try {
        await store.initialize();
        const feedback = await store.create({
            author: 'Test',
            comment: 'Uwaga',
            view: 'store',
        });

        store.append_event(feedback.id, 'comment_added', {
            author: 'Stary klient',
            comment: 'Brak pola kind',
        });
        store.add_comment(feedback.id, 'Zespół', 'Zrealizowano', 'action');
        store.add_comment(feedback.id, 'Zespół', 'Nieznany typ', 'other');

        const comments = store.get(feedback.id).comments;
        assert.deepEqual(comments.map((comment) => comment.kind), ['reply', 'action', 'reply']);
        assert.equal(store.list({ status: 'open' }).length, 1);

        store.change_status(feedback.id, 'resolved', 'Zespół');
        assert.equal(store.list({ status: 'open' }).length, 0);
        assert.equal(store.list({ status: 'resolved' }).length, 1);
    } finally {
        store.database?.close();
        await rm(directory, { recursive: true });
    }
});

test('read-only archive mode neither creates nor mutates data', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'activio-feedback-readonly-'));
    const missing_store = new FeedbackStore(join(directory, 'missing'));

    try {
        await assert.rejects(missing_store.initialize({ read_only: true }));
        await assert.rejects(stat(missing_store.database_path));

        const writer = new FeedbackStore(directory);
        await writer.initialize();
        const feedback = await writer.create({ author: 'Test', comment: 'Archiwum', view: 'store' });
        writer.database?.close();

        const reader = new FeedbackStore(directory);
        await reader.initialize({ read_only: true });
        assert.equal(reader.get(feedback.id).comment, 'Archiwum');
        const screenshots_before = await readdir(reader.screenshot_dir);
        assert.throws(() => reader.append_event(feedback.id, 'comment_added', {
            author: 'Test',
            comment: 'Niedozwolony zapis',
        }));
        await assert.rejects(reader.create(
            { author: 'Test', comment: 'Niedozwolony zapis', view: 'store' },
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        ));
        assert.deepEqual(await readdir(reader.screenshot_dir), screenshots_before);
        reader.database?.close();
    } finally {
        missing_store.database?.close();
        await rm(directory, { recursive: true });
    }
});
