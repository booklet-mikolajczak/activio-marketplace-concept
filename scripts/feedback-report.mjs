import { stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FeedbackStore } from '../lib/feedback-store.mjs';

const script_dir = dirname(fileURLToPath(import.meta.url));
const project_dir = resolve(script_dir, '..');
const feedback_dir = process.env.ACTIVIO_FEEDBACK_DIR
    || resolve(project_dir, '..', 'activio-club-feedback');
const arguments_list = process.argv.slice(2);

function argument(name, fallback = '') {
    const index = arguments_list.indexOf(name);
    return index === -1 ? fallback : arguments_list[index + 1] || fallback;
}

const database_path = resolve(feedback_dir, 'feedback-events.sqlite');
const database_stat = await stat(database_path).catch(() => null);
if (!database_stat?.isFile()) {
    throw new Error(`Nie znaleziono archiwum uwag: ${database_path}`);
}
const wal_stat = await stat(`${database_path}-wal`).catch(() => null);
if (wal_stat?.isFile() && wal_stat.size > 0) {
    process.stderr.write(
        'Uwaga: archiwum ma aktywny WAL; backup musi zawierać pliki .sqlite, -wal i -shm.\n',
    );
}

const store = new FeedbackStore(feedback_dir);
await store.initialize({ read_only: true });

try {
    const feedback = store.list({
        status: argument('--status', 'open'),
        view: argument('--view'),
    });

    if (arguments_list.includes('--json')) {
        process.stdout.write(`${JSON.stringify(feedback, null, 2)}\n`);
    } else if (feedback.length === 0) {
        process.stdout.write('Brak uwag spełniających filtry.\n');
    } else {
        feedback.forEach((item) => {
            process.stdout.write(`## ${item.id} · ${item.status} · ${item.view}\n\n`);
            process.stdout.write(`Autor: ${item.author} · ${item.created_at}\n\n`);
            process.stdout.write(`${item.comment}\n\n`);

            if (item.selected_text) {
                process.stdout.write(`Zaznaczony tekst: “${item.selected_text}”\n\n`);
            }

            process.stdout.write(`Kotwica: ${item.element_id || item.selector || 'brak'}\n`);
            process.stdout.write(`Wersja: ${item.mockup_version || 'brak'}\n`);
            process.stdout.write(`URL: ${item.page_url || 'brak'}\n`);
            process.stdout.write(`Screenshot: ${item.screenshot_file ? `screenshots/${item.screenshot_file}` : 'brak'}\n`);

            if (item.comments.length > 0) {
                process.stdout.write('\nKomentarze i działania:\n');
                item.comments.forEach((comment) => {
                    const kind = comment.kind === 'action' ? 'działanie' : 'odpowiedź';
                    process.stdout.write(`- [${kind}] ${comment.author}: ${comment.comment}\n`);
                });
            }

            process.stdout.write('\n');
        });
    }
} finally {
    store.database?.close();
}
