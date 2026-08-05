import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const project_dir = dirname(fileURLToPath(import.meta.url));
const expected_user = process.env.ACTIVIO_DEMO_USER || 'activio';
const expected_password = process.env.ACTIVIO_DEMO_PASSWORD || '';
const host = process.env.ACTIVIO_DEMO_HOST || '127.0.0.1';
const port = Number(process.env.ACTIVIO_DEMO_PORT || 8080);
const trust_proxy = process.env.ACTIVIO_TRUST_PROXY === 'true';
const website_feedback_host = normalize_website_feedback_host(
    process.env.ACTIVIO_WEBSITE_FEEDBACK_HOST || '',
);
const website_feedback_project_key = process.env.ACTIVIO_WEBSITE_FEEDBACK_PROJECT_KEY
    || 'activio-club-concept';
const website_feedback_version = process.env.ACTIVIO_WEBSITE_FEEDBACK_VERSION || '2026-08-05.1';
const website_feedback_development = process.env.ACTIVIO_WEBSITE_FEEDBACK_DEVELOPMENT === 'true';
const session_cookie = 'activio_session';
const session_duration_seconds = 7 * 24 * 60 * 60;
const session_secret = randomBytes(32);
const login_attempt_limit = 10;
const login_attempt_window_ms = 10 * 60 * 1000;
const login_attempts = new Map();

if (!expected_password) {
    throw new Error('Ustaw ACTIVIO_DEMO_PASSWORD przed uruchomieniem.');
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('ACTIVIO_DEMO_PORT musi być poprawnym numerem portu.');
}

if (!['127.0.0.1', '0.0.0.0', '::1'].includes(host)) {
    throw new Error('ACTIVIO_DEMO_HOST musi mieć wartość 127.0.0.1, 0.0.0.0 albo ::1.');
}

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(website_feedback_project_key)) {
    throw new Error('ACTIVIO_WEBSITE_FEEDBACK_PROJECT_KEY ma nieprawidłowy format.');
}
if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(website_feedback_version)) {
    throw new Error('ACTIVIO_WEBSITE_FEEDBACK_VERSION ma nieprawidłowy format.');
}

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

function normalize_website_feedback_host(value) {
    if (!value.trim()) {
        return '';
    }

    try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol)
            || url.username
            || url.password
            || url.search
            || url.hash
            || !['', '/'].includes(url.pathname)) {
            throw new Error();
        }

        return url.origin;
    } catch {
        throw new Error('ACTIVIO_WEBSITE_FEEDBACK_HOST musi być originem HTTP(S).');
    }
}

function website_feedback_loader_source() {
    if (!website_feedback_host) {
        return "'use strict';\n";
    }

    const config = JSON.stringify({
        api: `${website_feedback_host}/api/website-feedback/v1`,
        development: website_feedback_development,
        host: website_feedback_host,
        project: website_feedback_project_key,
        version: website_feedback_version,
    });
    const development_attribute = website_feedback_development
        ? "    script.dataset.feedbackDevelopment = 'true';\n"
        : '';

    return `(() => {
    'use strict';
    if (window.__activioWebsiteFeedbackIntegration) return;
    window.__activioWebsiteFeedbackIntegration = true;
    const config = ${config};
    const script = document.createElement('script');
    script.src = config.host + '/website-feedback/widget/v1/loader.js?v=' + encodeURIComponent(config.version);
    script.async = true;
    script.dataset.feedbackProject = config.project;
    script.dataset.feedbackVersion = config.version;
    script.dataset.feedbackApi = config.api;
${development_attribute}
    document.head.append(script);
})();
`;
}

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

function session_signature(expires_at) {
    return createHmac('sha256', session_secret)
        .update(`${expected_user}:${expires_at}:activio-demo-session`)
        .digest('base64url');
}

function cookies(request) {
    return Object.fromEntries(
        String(request.headers.cookie || '')
            .split(';')
            .map((entry) => entry.trim())
            .filter(Boolean)
            .map((entry) => {
                const separator = entry.indexOf('=');
                return separator === -1
                    ? [entry, '']
                    : [entry.slice(0, separator), entry.slice(separator + 1)];
            }),
    );
}

function has_valid_session(request) {
    const value = cookies(request)[session_cookie] || '';
    const separator = value.indexOf('.');

    if (separator === -1) {
        return false;
    }

    const expires_at = Number(value.slice(0, separator));
    const signature = value.slice(separator + 1);

    return Number.isSafeInteger(expires_at)
        && expires_at > Math.floor(Date.now() / 1000)
        && safe_equal(session_signature(expires_at), signature);
}

function is_authorized(request) {
    const [provided_user, provided_password] = credentials(request);
    return (
        safe_equal(expected_user, provided_user)
        && safe_equal(expected_password, provided_password)
    ) || has_valid_session(request);
}

function is_https(request) {
    return String(request.headers['x-forwarded-proto'] || '')
        .split(',')[0]
        .trim()
        .toLowerCase() === 'https'
        || request.socket.encrypted === true;
}

function safe_next(value) {
    const next = typeof value === 'string' ? value.slice(0, 500) : '/';

    if (!next.startsWith('/')) {
        return '/';
    }

    try {
        const base = 'http://activio.local';
        const parsed = new URL(next, base);
        const result = `${parsed.pathname}${parsed.search}${parsed.hash}`;
        return parsed.origin === base && !/^\/[/\\]/.test(result) ? result : '/';
    } catch {
        return '/';
    }
}

function client_address(request) {
    const forwarded = String(request.headers['x-forwarded-for'] || '');
    const forwarded_addresses = forwarded.split(',').map((value) => value.trim()).filter(Boolean);
    return String(
        trust_proxy && forwarded_addresses.length > 0
            ? forwarded_addresses.at(-1)
            : request.socket.remoteAddress || 'unknown',
    ).slice(0, 100);
}

function login_attempt_key(request, scope = 'form') {
    const address = client_address(request);
    const key = `${scope}:${address}`;

    if (!login_attempts.has(key) && login_attempts.size >= 1000) {
        const now = Date.now();
        for (const [key, entry] of login_attempts) {
            if (entry.reset_at <= now) {
                login_attempts.delete(key);
            }
        }

        if (login_attempts.size >= 1000) {
            login_attempts.delete(login_attempts.keys().next().value);
        }
    }

    return key;
}

function login_retry_after(request, scope = 'form') {
    const entry = login_attempts.get(login_attempt_key(request, scope));
    const now = Date.now();

    if (!entry || entry.reset_at <= now) {
        return 0;
    }

    return entry.count >= login_attempt_limit
        ? Math.max(1, Math.ceil((entry.reset_at - now) / 1000))
        : 0;
}

function record_failed_login(request, scope = 'form') {
    const address = login_attempt_key(request, scope);
    const now = Date.now();
    const current = login_attempts.get(address);
    const entry = !current || current.reset_at <= now
        ? { count: 1, reset_at: now + login_attempt_window_ms }
        : { ...current, count: current.count + 1 };

    login_attempts.set(address, entry);

}

function clear_failed_logins(request, scope = 'form') {
    login_attempts.delete(login_attempt_key(request, scope));
}

function is_html_navigation(request) {
    const method = request.method || '';
    const accept = String(request.headers.accept || '');
    return ['GET', 'HEAD'].includes(method)
        && (
            request.headers['sec-fetch-mode'] === 'navigate'
            || accept.split(',').some((value) => value.trim().startsWith('text/html'))
        );
}

function has_basic_credentials(request) {
    return String(request.headers.authorization || '').startsWith('Basic ');
}

function has_valid_basic_credentials(request) {
    const [provided_user, provided_password] = credentials(request);
    return safe_equal(expected_user, provided_user)
        && safe_equal(expected_password, provided_password);
}

function send_authentication_failure(request, response, status = 401, retry_after = 0) {
    const likely_browser = Boolean(request.headers['sec-fetch-mode'])
        || String(request.headers['user-agent'] || '').includes('Mozilla/')
        || String(request.headers.accept || '').includes('text/html');
    const headers = {
        ...(!likely_browser || has_basic_credentials(request)
            ? { 'WWW-Authenticate': 'Basic realm="ACTIVIO CLUB", charset="UTF-8"' }
            : {}),
        ...(retry_after > 0 ? { 'Retry-After': String(retry_after) } : {}),
    };
    const error = status === 429
        ? 'Zbyt wiele prób logowania. Spróbuj ponownie później.'
        : 'Wymagane logowanie.';

    if (new URL(request.url || '/', 'http://127.0.0.1').pathname.startsWith('/api/')) {
        send_json(response, status, { error, login_url: '/login' }, headers);
        return;
    }

    send(response, status, `${error}\nZaloguj: /login\n`, headers);
}

function escape_html(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function send(response, status, body, headers = {}) {
    response.writeHead(status, {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'text/plain; charset=utf-8',
        ...headers,
    });
    response.end(body);
}

function send_html(response, status, body, headers = {}) {
    response.writeHead(status, {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Length': Buffer.byteLength(body),
        'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'self'",
        'Content-Type': 'text/html; charset=utf-8',
        ...headers,
    });
    response.end(body);
}

function send_json(response, status, value, headers = {}) {
    const body = JSON.stringify(value);
    response.writeHead(status, {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'application/json; charset=utf-8',
        ...headers,
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

async function read_body(request, maximum_bytes) {
    const chunks = [];
    let bytes = 0;

    for await (const chunk of request) {
        bytes += chunk.length;

        if (bytes > maximum_bytes) {
            throw new Error('Żądanie przekracza limit rozmiaru.');
        }

        chunks.push(chunk);
    }

    return Buffer.concat(chunks).toString('utf8');
}

function login_page(next, user = '', error = '') {
    const safe_redirect = safe_next(next);
    const error_html = error
        ? `<p class="error" role="alert">${escape_html(error)}</p>`
        : '';

    return `<!doctype html>
<html lang="pl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>Logowanie — ACTIVIO</title>
    <style>
        :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
        * { box-sizing: border-box; }
        body { min-height: 100vh; display: grid; place-items: center; margin: 0; padding: 24px; color: #121827; background: linear-gradient(140deg, #17154a, #6f207e 60%, #b12670); }
        main { width: min(100%, 410px); padding: 36px; border-radius: 20px; background: #fff; box-shadow: 0 24px 70px rgba(9, 8, 35, .32); }
        .brand { display: flex; align-items: center; margin-bottom: 30px; }
        .brand img { width: 145px; height: auto; display: block; }
        h1 { margin: 0 0 8px; font-size: 30px; letter-spacing: -.04em; }
        p { margin: 0 0 24px; color: #697386; font-size: 14px; line-height: 1.5; }
        label { display: grid; gap: 7px; margin-top: 16px; font-size: 12px; font-weight: 800; }
        input { width: 100%; padding: 12px 13px; border: 1px solid #ccd3df; border-radius: 10px; font: inherit; }
        input:focus { outline: 3px solid rgba(40, 95, 220, .17); border-color: #245ed8; }
        button { width: 100%; margin-top: 22px; padding: 13px; border: 0; border-radius: 10px; color: #fff; background: #185ad7; font: inherit; font-weight: 850; cursor: pointer; }
        .error { margin: 18px 0 0; padding: 11px 12px; border-radius: 9px; color: #8e1b25; background: #fff0f1; font-size: 12px; font-weight: 700; }
        small { display: block; margin-top: 20px; color: #8a94a5; font-size: 10px; line-height: 1.5; }
    </style>
</head>
<body>
    <main>
        <div class="brand"><img src="/assets/brand/activio-logo.svg" alt="ACTIVIO"></div>
        <h1>Prototyp koncepcyjny</h1>
        <p>Zaloguj się, aby przejrzeć mockup, dokumentację i uwagi projektu.</p>
        ${error_html}
        <form method="post" action="/login">
            <input type="hidden" name="next" value="${escape_html(safe_redirect)}">
            <label>Login
                <input name="user" value="${escape_html(user)}" autocomplete="username" required autofocus>
            </label>
            <label>Hasło
                <input type="password" name="password" autocomplete="current-password" required>
            </label>
            <button type="submit">Zaloguj się</button>
        </form>
        <small>Dostęp jest przeznaczony dla zaproszonych osób. Dane logowania otrzymasz od zespołu ACTIVIO.</small>
    </main>
    <script>
        const next = document.querySelector('[name="next"]');
        if (location.hash && !next.value.includes('#')) next.value += location.hash;
    </script>
</body>
</html>`;
}

async function handle_login(request, response, url) {
    if (request.method === 'GET' || request.method === 'HEAD') {
        const next = safe_next(url.searchParams.get('next') || '/');

        if (has_valid_session(request)) {
            response.writeHead(303, { 'Cache-Control': 'no-store', Location: next });
            response.end();
            return;
        }

        if (request.method === 'HEAD') {
            const body = login_page(next);
            response.writeHead(200, {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Content-Length': Buffer.byteLength(body),
                'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'self'",
                'Content-Type': 'text/html; charset=utf-8',
            });
            response.end();
        } else {
            send_html(response, 200, login_page(next));
        }
        return;
    }

    if (request.method !== 'POST') {
        send(response, 405, 'Niedozwolona metoda.\n', { Allow: 'GET, HEAD, POST' });
        return;
    }

    if (!is_same_origin(request)) {
        send_html(response, 403, login_page('/', '', 'Niedozwolone źródło żądania.'));
        return;
    }

    const form = new URLSearchParams(await read_body(request, 16 * 1024));
    const user = clean_text(form.get('user'), 80);
    const password = typeof form.get('password') === 'string'
        ? form.get('password').slice(0, 500)
        : '';
    const next = safe_next(form.get('next'));
    const retry_after = login_retry_after(request);

    if (retry_after > 0) {
        send_html(
            response,
            429,
            login_page(next, user, 'Zbyt wiele prób logowania. Spróbuj ponownie później.'),
            { 'Retry-After': String(retry_after) },
        );
        return;
    }

    if (!safe_equal(expected_user, user) || !safe_equal(expected_password, password)) {
        record_failed_login(request);
        send_html(response, 401, login_page(next, user, 'Nieprawidłowy login lub hasło.'));
        return;
    }

    clear_failed_logins(request);
    const expires_at = Math.floor(Date.now() / 1000) + session_duration_seconds;
    const value = `${expires_at}.${session_signature(expires_at)}`;
    const secure = is_https(request) ? '; Secure' : '';

    response.writeHead(303, {
        'Cache-Control': 'no-store',
        Location: next,
        'Set-Cookie': `${session_cookie}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${session_duration_seconds}${secure}`,
    });
    response.end();
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
    const url = new URL(request.url || '/', 'http://127.0.0.1');
    const basic_attempt = has_basic_credentials(request);

    if (
        url.pathname === '/assets/brand/activio-logo.svg'
        && ['GET', 'HEAD'].includes(request.method || '')
    ) {
        try {
            const logo_path = resolve(project_dir, 'assets', 'brand', 'activio-logo.svg');
            const logo_stat = await stat(logo_path);
            response.writeHead(200, {
                'Cache-Control': 'public, max-age=3600',
                'Content-Length': logo_stat.size,
                'Content-Type': content_types['.svg'],
                'X-Content-Type-Options': 'nosniff',
            });
            response.end(request.method === 'HEAD' ? undefined : await readFile(logo_path));
        } catch {
            send(response, 404, 'Nie znaleziono logo.\n');
        }
        return;
    }

    if (basic_attempt && url.pathname !== '/login' && !has_valid_session(request)) {
        const retry_after = login_retry_after(request, 'basic');
        const valid_basic = has_valid_basic_credentials(request);

        if (retry_after > 0) {
            send_authentication_failure(request, response, 429, retry_after);
            return;
        }

        if (valid_basic) {
            clear_failed_logins(request, 'basic');
        } else {
            record_failed_login(request, 'basic');
            if (is_html_navigation(request)) {
                response.writeHead(302, {
                    'Cache-Control': 'no-store',
                    Location: `/login?next=${encodeURIComponent(request.url || '/')}`,
                });
                response.end();
            } else {
                send_authentication_failure(request, response);
            }
            return;
        }
    }

    if (url.pathname === '/login') {
        try {
            await handle_login(request, response, url);
        } catch (error) {
            send_html(response, 400, login_page(
                '/',
                '',
                error instanceof Error ? error.message : 'Nie udało się zalogować.',
            ));
        }
        return;
    }

    if (!is_authorized(request)) {
        if (url.pathname.startsWith('/api/')) {
            send_authentication_failure(request, response);
            return;
        }

        if (is_html_navigation(request)) {
            response.writeHead(302, {
                'Cache-Control': 'no-store',
                Location: `/login?next=${encodeURIComponent(request.url || '/')}`,
            });
            response.end();
            return;
        }

        send_authentication_failure(request, response);
        return;
    }

    if (/^\/docs\/prototypes\/activio\/?$/.test(url.pathname)) {
        response.writeHead(302, {
            'Cache-Control': 'no-store',
            Location: `/mockup/${url.search}`,
        });
        response.end();
        return;
    }

    if (url.pathname === '/website-feedback-loader.js'
        && ['GET', 'HEAD'].includes(request.method || '')) {
        const body = website_feedback_loader_source();
        response.writeHead(200, {
            'Cache-Control': 'private, no-store',
            'Content-Length': Buffer.byteLength(body),
            'Content-Type': 'text/javascript; charset=utf-8',
            'X-Content-Type-Options': 'nosniff',
        });
        response.end(request.method === 'HEAD' ? undefined : body);
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
            ...(content_type.startsWith('text/html')
                ? { 'Content-Security-Policy': "frame-ancestors 'self'" }
                : {}),
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
    process.stdout.write(`Website Feedback: ${website_feedback_host || 'wyłączony'}\n`);
});
