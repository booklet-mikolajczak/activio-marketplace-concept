import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { timingSafeEqual } from 'node:crypto';
import { FeedbackStore, statuses } from './lib/feedback-store.mjs';

const project_dir = dirname(fileURLToPath(import.meta.url));
const expected_user = process.env.ACTIVIO_DEMO_USER || 'activio';
const expected_password = process.env.ACTIVIO_DEMO_PASSWORD || '';
const host = process.env.ACTIVIO_DEMO_HOST || '127.0.0.1';
const port = Number(process.env.ACTIVIO_DEMO_PORT || 8080);
const feedback_dir = process.env.ACTIVIO_FEEDBACK_DIR
    || resolve(project_dir, '..', 'activio-club-feedback');
const feedback_store = new FeedbackStore(feedback_dir);

if (!expected_password) {
    throw new Error('Ustaw ACTIVIO_DEMO_PASSWORD przed uruchomieniem.');
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('ACTIVIO_DEMO_PORT musi być poprawnym numerem portu.');
}

if (!['127.0.0.1', '0.0.0.0', '::1'].includes(host)) {
    throw new Error('ACTIVIO_DEMO_HOST musi mieć wartość 127.0.0.1, 0.0.0.0 albo ::1.');
}

await feedback_store.initialize();

const content_types = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.svg': 'image/svg+xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.webp': 'image/webp',
};

function safe_equal(left, right) {
    const left_buffer = Buffer.from(left);
    const right_buffer = Buffer.from(right);

    return left_buffer.length === right_buffer.length
        && timingSafeEqual(left_buffer, right_buffer);
}

function credentials(request) {
    const authorization = request.headers.authorization || '';

    if (!authorization.startsWith('Basic ')) {
        return ['', ''];
    }

    try {
        const decoded = Buffer.from(authorization.slice(6), 'base64').toString('utf8');
        const separator = decoded.indexOf(':');

        return separator === -1
            ? ['', '']
            : [decoded.slice(0, separator), decoded.slice(separator + 1)];
    } catch {
        return ['', ''];
    }
}

function send(response, status, body, headers = {}) {
    response.writeHead(status, {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'text/plain; charset=utf-8',
        ...headers,
    });
    response.end(body);
}

function send_json(response, status, value) {
    const body = JSON.stringify(value);
    response.writeHead(status, {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'application/json; charset=utf-8',
    });
    response.end(body);
}

function clean_text(value, maximum_length, required = false) {
    const text = typeof value === 'string' ? value.trim() : '';

    if (required && text === '') {
        throw new Error('Brakuje wymaganego pola.');
    }

    return text.slice(0, maximum_length);
}

function clean_number(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function clean_rect(value) {
    if (!value || typeof value !== 'object') {
        return null;
    }

    return {
        left: clean_number(value.left),
        top: clean_number(value.top),
        width: Math.max(0, clean_number(value.width)),
        height: Math.max(0, clean_number(value.height)),
        page_x: clean_number(value.page_x),
        page_y: clean_number(value.page_y),
    };
}

function clean_viewport(value) {
    if (!value || typeof value !== 'object') {
        return null;
    }

    return {
        width: Math.max(0, Math.round(clean_number(value.width))),
        height: Math.max(0, Math.round(clean_number(value.height))),
        pixel_ratio: Math.max(0, clean_number(value.pixel_ratio, 1)),
    };
}

async function read_json(request, maximum_bytes = 6 * 1024 * 1024) {
    const chunks = [];
    let bytes = 0;

    for await (const chunk of request) {
        bytes += chunk.length;

        if (bytes > maximum_bytes) {
            throw new Error('Żądanie przekracza limit rozmiaru.');
        }

        chunks.push(chunk);
    }

    try {
        return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    } catch {
        throw new Error('Nieprawidłowy JSON.');
    }
}

function is_same_origin(request) {
    const origin = request.headers.origin;

    if (!origin) {
        return true;
    }

    try {
        return new URL(origin).host === request.headers.host;
    } catch {
        return false;
    }
}

async function handle_feedback_api(request, response, url) {
    if (!is_same_origin(request)) {
        send_json(response, 403, { error: 'Niedozwolone źródło żądania.' });
        return;
    }

    const path = url.pathname.replace(/\/+$/, '') || '/api/feedback';
    const screenshot_match = path.match(/^\/api\/feedback\/([^/]+)\/screenshot$/);
    const comments_match = path.match(/^\/api\/feedback\/([^/]+)\/comments$/);
    const feedback_match = path.match(/^\/api\/feedback\/([^/]+)$/);

    try {
        if (request.method === 'GET' && screenshot_match) {
            const screenshot = await feedback_store.screenshot(screenshot_match[1]);

            if (!screenshot) {
                send_json(response, 404, { error: 'Brak screenshota.' });
                return;
            }

            response.writeHead(200, {
                'Cache-Control': 'private, no-store',
                'Content-Length': screenshot.body.byteLength,
                'Content-Type': screenshot.content_type,
            });
            response.end(screenshot.body);
            return;
        }

        if (request.method === 'GET' && path === '/api/feedback') {
            const feedback = feedback_store.list({
                view: clean_text(url.searchParams.get('view'), 80),
                status: clean_text(url.searchParams.get('status'), 30) || 'all',
            });
            send_json(response, 200, {
                feedback,
                statuses: statuses(),
                storage: 'append-only',
            });
            return;
        }

        if (request.method === 'POST' && path === '/api/feedback') {
            const body = await read_json(request);
            const view = clean_text(body.view, 80, true);

            if (!/^[a-z0-9-]+$/.test(view)) {
                throw new Error('Nieprawidłowy identyfikator widoku.');
            }

            const feedback = await feedback_store.create({
                author: clean_text(body.author, 80, true),
                comment: clean_text(body.comment, 4000, true),
                view,
                page_url: clean_text(body.page_url, 500),
                element_id: clean_text(body.element_id, 240),
                selector: clean_text(body.selector, 1400),
                selected_text: clean_text(body.selected_text, 2000),
                element_text: clean_text(body.element_text, 3000),
                element_tag: clean_text(body.element_tag, 40),
                rect: clean_rect(body.rect),
                viewport: clean_viewport(body.viewport),
                mockup_version: clean_text(body.mockup_version, 120),
                user_agent: clean_text(request.headers['user-agent'], 500),
            }, clean_text(body.screenshot, 6 * 1024 * 1024));

            send_json(response, 201, { feedback });
            return;
        }

        if (request.method === 'POST' && comments_match) {
            const body = await read_json(request, 32 * 1024);
            const feedback = feedback_store.add_comment(
                comments_match[1],
                clean_text(body.author, 80, true),
                clean_text(body.comment, 4000, true),
                body.kind === 'action' ? 'action' : 'reply',
            );

            if (!feedback) {
                send_json(response, 404, { error: 'Nie znaleziono uwagi.' });
                return;
            }

            send_json(response, 201, { feedback });
            return;
        }

        if (request.method === 'PATCH' && feedback_match) {
            const body = await read_json(request, 16 * 1024);
            const feedback = feedback_store.change_status(
                feedback_match[1],
                clean_text(body.status, 30, true),
                clean_text(body.author, 80, true),
            );

            if (!feedback) {
                send_json(response, 404, { error: 'Nie znaleziono uwagi.' });
                return;
            }

            send_json(response, 200, { feedback });
            return;
        }

        if (request.method === 'GET' && feedback_match) {
            const feedback = feedback_store.get(feedback_match[1]);

            if (!feedback) {
                send_json(response, 404, { error: 'Nie znaleziono uwagi.' });
                return;
            }

            send_json(response, 200, { feedback });
            return;
        }

        send_json(response, 404, { error: 'Nie znaleziono endpointu.' });
    } catch (error) {
        send_json(response, 400, {
            error: error instanceof Error ? error.message : 'Nie udało się zapisać uwagi.',
        });
    }
}

async function resolve_file(request_url) {
    const url = new URL(request_url, 'http://127.0.0.1');
    const pathname = decodeURIComponent(url.pathname);
    const segments = pathname.split('/').filter(Boolean);

    if (pathname.includes('\0') || segments.some((segment) => segment.startsWith('.'))) {
        return null;
    }

    let file_path = resolve(project_dir, `.${pathname}`);

    if (file_path !== project_dir && !file_path.startsWith(`${project_dir}${sep}`)) {
        return null;
    }

    const file_stat = await stat(file_path);

    if (file_stat.isDirectory()) {
        file_path = resolve(file_path, 'index.html');
    }

    return file_path;
}

const server = createServer(async (request, response) => {
    const [provided_user, provided_password] = credentials(request);
    const authorized = safe_equal(expected_user, provided_user)
        && safe_equal(expected_password, provided_password);

    if (!authorized) {
        send(response, 401, 'Wymagane logowanie.\n', {
            'WWW-Authenticate': 'Basic realm="ACTIVIO CLUB", charset="UTF-8"',
        });
        return;
    }

    const url = new URL(request.url || '/', 'http://127.0.0.1');

    if (/^\/docs\/prototypes\/activio\/?$/.test(url.pathname)) {
        response.writeHead(302, {
            'Cache-Control': 'no-store',
            Location: `/mockup/${url.search}`,
        });
        response.end();
        return;
    }

    if (url.pathname.startsWith('/api/feedback')) {
        await handle_feedback_api(request, response, url);
        return;
    }

    if (!['GET', 'HEAD'].includes(request.method || '')) {
        send(response, 405, 'Niedozwolona metoda.\n', { Allow: 'GET, HEAD' });
        return;
    }

    try {
        const file_path = await resolve_file(request.url || '/');

        if (!file_path) {
            send(response, 404, 'Nie znaleziono zasobu.\n');
            return;
        }

        const file_stat = await stat(file_path);

        if (!file_stat.isFile()) {
            send(response, 404, 'Nie znaleziono zasobu.\n');
            return;
        }

        const content_type = content_types[extname(file_path).toLowerCase()]
            || 'application/octet-stream';

        response.writeHead(200, {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Content-Length': file_stat.size,
            'Content-Type': content_type,
            ETag: `"${file_stat.size.toString(16)}-${Math.round(file_stat.mtimeMs).toString(16)}"`,
            Expires: '0',
            'Last-Modified': file_stat.mtime.toUTCString(),
            Pragma: 'no-cache',
        });

        if (request.method === 'HEAD') {
            response.end();
            return;
        }

        response.end(await readFile(file_path));
    } catch {
        send(response, 404, 'Nie znaleziono zasobu.\n');
    }
});

server.listen(port, host, () => {
    const display_host = host === '0.0.0.0'
        ? '127.0.0.1'
        : host === '::1' ? '[::1]' : host;
    process.stdout.write(`ACTIVIO CLUB: http://${display_host}:${port}/\n`);
    process.stdout.write(`Login: ${expected_user}\n`);
    process.stdout.write(`Feedback: ${feedback_dir}\n`);
});
