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

const store = new FeedbackStore(feedback_dir);
await store.initialize();

const feedback = store.list({
    status: argument('--status', 'open'),
    view: argument('--view'),
});

if (arguments_list.includes('--json')) {
    process.stdout.write(`${JSON.stringify(feedback, null, 2)}\n`);
    process.exit(0);
}

if (feedback.length === 0) {
    process.stdout.write('Brak uwag spełniających filtry.\n');
    process.exit(0);
}

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
        process.stdout.write('\nOdpowiedzi:\n');
        item.comments.forEach((comment) => {
            process.stdout.write(`- ${comment.author}: ${comment.comment}\n`);
        });
    }

    process.stdout.write('\n');
});
