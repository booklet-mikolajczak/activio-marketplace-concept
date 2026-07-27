import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
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
