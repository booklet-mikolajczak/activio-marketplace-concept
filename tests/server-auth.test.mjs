import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer, request as node_request } from 'node:http';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

async function free_port() {
    const server = createServer();
    await new Promise((resolve_listen) => server.listen(0, '127.0.0.1', resolve_listen));
    const address = server.address();
    await new Promise((resolve_close) => server.close(resolve_close));
    return address.port;
}

function request(input, init = {}) {
    return fetch(input, {
        ...init,
        signal: init.signal || AbortSignal.timeout(3000),
    });
}

async function raw_request(url) {
    return new Promise((resolve_response, reject_response) => {
        const request = node_request(url, (response) => {
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => resolve_response({
                body: Buffer.concat(chunks).toString('utf8'),
                headers: response.headers,
                status: response.statusCode,
            }));
        });
        request.setTimeout(3000, () => request.destroy(new Error('Timeout żądania.')));
        request.on('error', reject_response);
        request.end();
    });
}

async function wait_for_server(child, stderr) {
    await new Promise((resolve_ready, reject_ready) => {
        const timeout = setTimeout(
            () => reject_ready(new Error(
                `Serwer testowy nie uruchomił się na czas.\n${stderr()}`,
            )),
            5000,
        );

        child.stdout.on('data', (chunk) => {
            if (chunk.toString().includes('ACTIVIO CLUB:')) {
                clearTimeout(timeout);
                resolve_ready();
            }
        });
        child.once('exit', (code) => {
            clearTimeout(timeout);
            reject_ready(new Error(
                `Serwer testowy zakończył się kodem ${code}.\n${stderr()}`,
            ));
        });
    });
}

test('uses form session for browsers and keeps Basic Auth for scripts', { timeout: 10000 }, async () => {
    const feedback_dir = await mkdtemp(join(tmpdir(), 'activio-server-auth-'));
    const port = await free_port();
    const user = 'panel-user';
    const password = 'test-password-123';
    const child = spawn(process.execPath, ['server.mjs'], {
        cwd: resolve(import.meta.dirname, '..'),
        env: {
            ...process.env,
            ACTIVIO_DEMO_HOST: '127.0.0.1',
            ACTIVIO_DEMO_PORT: String(port),
            ACTIVIO_DEMO_USER: user,
            ACTIVIO_DEMO_PASSWORD: password,
            ACTIVIO_FEEDBACK_DIR: feedback_dir,
            ACTIVIO_TRUST_PROXY: 'true',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stderr = '';
    child.stderr.on('data', (chunk) => {
        stderr = `${stderr}${chunk}`.slice(-8000);
    });

    try {
        await wait_for_server(child, () => stderr);
        const base = `http://127.0.0.1:${port}`;
        const basic = Buffer.from(`${user}:${password}`).toString('base64');
        const wrong_basic = Buffer.from(`${user}:wrong`).toString('base64');
        const unauthorized = await request(`${base}/mockup/#marketplace`, {
            redirect: 'manual',
            headers: { Accept: 'text/html' },
        });
        assert.equal(unauthorized.status, 302);
        assert.match(unauthorized.headers.get('location'), /^\/login\?next=/);
        assert.equal(unauthorized.headers.has('www-authenticate'), false);

        const login_url = new URL(unauthorized.headers.get('location'), base);
        const login = await request(login_url);
        assert.equal(login.status, 200);
        const login_body = await login.text();
        assert.match(login_body, /<form method="post" action="\/login">/);
        assert.match(login.headers.get('content-security-policy'), /frame-ancestors 'self'/);
        const login_head = await request(login_url, { method: 'HEAD' });
        assert.equal(login_head.status, 200);
        assert.equal(
            login_head.headers.get('content-security-policy'),
            login.headers.get('content-security-policy'),
        );
        assert.equal(login_head.headers.get('content-length'), String(Buffer.byteLength(login_body)));
        const public_logo = await request(`${base}/assets/brand/activio-logo.svg`);
        assert.equal(public_logo.status, 200);
        assert.match(public_logo.headers.get('content-type'), /^image\/svg\+xml/);
        assert.equal(public_logo.headers.get('x-content-type-options'), 'nosniff');
        assert.match(await public_logo.text(), /<svg/);
        const public_logo_head = await request(`${base}/assets/brand/activio-logo.svg`, {
            method: 'HEAD',
        });
        assert.equal(public_logo_head.status, 200);
        assert.equal(
            public_logo_head.headers.get('content-length'),
            public_logo.headers.get('content-length'),
        );
        const login_with_stale_basic = await request(`${base}/login`, {
            headers: {
                Accept: 'text/html',
                Authorization: `Basic ${wrong_basic}`,
            },
        });
        assert.equal(login_with_stale_basic.status, 200);
        assert.match(await login_with_stale_basic.text(), /<form method="post" action="\/login">/);
        const login_with_valid_basic = await request(`${base}/login`, {
            headers: {
                Accept: 'text/html',
                Authorization: `Basic ${basic}`,
            },
        });
        assert.equal(login_with_valid_basic.status, 200);
        const valid_basic_after_stale_login = await request(`${base}/api/feedback?status=all`, {
            headers: { Authorization: `Basic ${basic}` },
        });
        assert.equal(valid_basic_after_stale_login.status, 200);

        const invalid = await request(`${base}/login`, {
            method: 'POST',
            redirect: 'manual',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                user,
                password: 'wrong',
                next: '/mockup/',
            }),
        });
        assert.equal(invalid.status, 401);
        assert.match(await invalid.text(), /Nieprawidłowy login lub hasło/);

        const valid = await request(`${base}/login`, {
            method: 'POST',
            redirect: 'manual',
            headers: {
                Authorization: `Basic ${wrong_basic}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Forwarded-Proto': 'https',
            },
            body: new URLSearchParams({
                user,
                password,
                next: '/mockup/#marketplace',
            }),
        });
        assert.equal(valid.status, 303);
        assert.equal(valid.headers.get('location'), '/mockup/#marketplace');
        const cookie = valid.headers.get('set-cookie');
        assert.match(cookie, /activio_session=/);
        assert.match(cookie, /HttpOnly/);
        assert.match(cookie, /SameSite=Lax/);
        assert.match(cookie, /Secure/);

        const no_https_proxy = await request(`${base}/login`, {
            method: 'POST',
            redirect: 'manual',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                user,
                password,
                next: '/mockup/',
            }),
        });
        assert.equal(no_https_proxy.status, 303);
        assert.doesNotMatch(no_https_proxy.headers.get('set-cookie'), /Secure/);

        const authenticated = await request(`${base}/mockup/`, {
            headers: { Cookie: cookie.split(';')[0] },
        });
        assert.equal(authenticated.status, 200);
        assert.match(await authenticated.text(), /activio-mockup-version/);
        assert.match(authenticated.headers.get('content-security-policy'), /frame-ancestors 'self'/);
        const session_ignores_stale_basic = await request(`${base}/mockup/`, {
            redirect: 'manual',
            headers: {
                Authorization: `Basic ${wrong_basic}`,
                Cookie: cookie.split(';')[0],
            },
        });
        assert.equal(session_ignores_stale_basic.status, 200);

        const scripted = await request(`${base}/api/feedback?status=all`, {
            headers: { Authorization: `Basic ${basic}` },
        });
        assert.equal(scripted.status, 200);

        const api_unauthorized = await raw_request(`${base}/api/feedback?status=all`);
        assert.equal(api_unauthorized.status, 401);
        assert.match(api_unauthorized.headers['www-authenticate'], /^Basic /);
        assert.deepEqual(JSON.parse(api_unauthorized.body), {
            error: 'Wymagane logowanie.',
            login_url: '/login',
        });

        const protected_document = await raw_request(`${base}/docs/activio_business_concept.md`);
        assert.equal(protected_document.status, 401);
        assert.match(protected_document.headers['www-authenticate'], /^Basic /);

        const browser_api = await request(`${base}/api/feedback?status=all`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        assert.equal(browser_api.status, 401);
        assert.equal(browser_api.headers.has('www-authenticate'), false);

        const open_redirect = await request(`${base}/login?next=${encodeURIComponent('/..//example.org')}`, {
            redirect: 'manual',
            headers: { Cookie: cookie.split(';')[0] },
        });
        assert.equal(open_redirect.status, 303);
        assert.equal(open_redirect.headers.get('location'), '/');

        const forged_cookie = cookie
            .split(';')[0]
            .replace(/.$/, (character) => character === 'a' ? 'b' : 'a');
        const forged = await request(`${base}/mockup/`, {
            redirect: 'manual',
            headers: { Cookie: forged_cookie },
        });
        assert.equal(forged.status, 401);

        const foreign_origin = await request(`${base}/login`, {
            method: 'POST',
            redirect: 'manual',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Origin: 'https://example.org',
            },
            body: new URLSearchParams({ user, password, next: '/' }),
        });
        assert.equal(foreign_origin.status, 403);

        for (let attempt = 0; attempt < 9; attempt += 1) {
            const failed_basic = await request(`${base}/api/feedback?status=all`, {
                headers: { Authorization: `Basic ${wrong_basic}` },
            });
            assert.equal(failed_basic.status, 401);
        }
        const valid_basic_clears_failures = await request(
            `${base}/api/feedback?status=all`,
            { headers: { Authorization: `Basic ${basic}` } },
        );
        assert.equal(valid_basic_clears_failures.status, 200);

        for (let attempt = 0; attempt < 10; attempt += 1) {
            const failed_basic = await request(`${base}/api/feedback?status=all`, {
                headers: { Authorization: `Basic ${wrong_basic}` },
            });
            assert.equal(failed_basic.status, 401);
        }
        const limited_basic = await request(`${base}/api/feedback?status=all`, {
            headers: { Authorization: `Basic ${wrong_basic}` },
        });
        assert.equal(limited_basic.status, 429);
        assert.ok(Number(limited_basic.headers.get('retry-after')) > 0);
        const blocked_basic_does_not_block_session = await request(`${base}/mockup/`, {
            headers: {
                Authorization: `Basic ${wrong_basic}`,
                Cookie: cookie.split(';')[0],
            },
        });
        assert.equal(blocked_basic_does_not_block_session.status, 200);

        for (let attempt = 0; attempt < 10; attempt += 1) {
            const failed_form = await request(`${base}/login`, {
                method: 'POST',
                redirect: 'manual',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    user,
                    password: 'wrong',
                    next: '/mockup/',
                }),
            });
            assert.equal(failed_form.status, 401);
        }
        const limited_form = await request(`${base}/login`, {
            method: 'POST',
            redirect: 'manual',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ user, password, next: '/mockup/' }),
        });
        assert.equal(limited_form.status, 429);
        assert.ok(Number(limited_form.headers.get('retry-after')) > 0);
    } finally {
        if (child.exitCode === null && child.signalCode === null) {
            const exit = once(child, 'exit');
            child.kill('SIGTERM');
            let exit_timeout;
            const stopped = await Promise.race([
                exit,
                new Promise((resolve_timeout) => {
                    exit_timeout = setTimeout(() => resolve_timeout(false), 2000);
                    exit_timeout.unref();
                }),
            ]);
            clearTimeout(exit_timeout);
            if (stopped === false && child.exitCode === null && child.signalCode === null) {
                const killed = once(child, 'exit');
                child.kill('SIGKILL');
                await killed;
            }
        }
        await rm(feedback_dir, { recursive: true, force: true });
    }
});
