import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root_url = new URL('../', import.meta.url);
const index_html = await readFile(new URL('mockup/index.html', root_url), 'utf8');
const app_js = await readFile(new URL('mockup/app.js', root_url), 'utf8');

function unique_attribute_values(source, attribute) {
    return [...new Set(
        [...source.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g'))]
            .map((match) => match[1]),
    )].sort();
}

test('every prototype route resolves to a view', () => {
    const views = unique_attribute_values(index_html, 'data-view');
    const routes = unique_attribute_values(index_html, 'data-go');
    const missing_views = routes.filter((route) => !views.includes(route));

    assert.deepEqual(missing_views, []);
});

test('every declared action has an application handler', () => {
    const actions = unique_attribute_values(index_html, 'data-action');
    const missing_handlers = actions.filter((action) => (
        !app_js.includes(`'${action}'`) && !app_js.includes(`"${action}"`)
    ));

    assert.deepEqual(missing_handlers, []);
});

test('mockup assets use the declared version', () => {
    const version = index_html.match(/name="activio-mockup-version" content="([^"]+)"/)?.[1];
    const versioned_assets = [
        ...index_html.matchAll(/(?:href|src)="(?:styles\.css|app\.js|feedback\.js)\?v=([^"]+)"/g),
    ].map((match) => match[1]);

    assert.ok(version);
    assert.deepEqual(versioned_assets, [version, version, version]);
});
