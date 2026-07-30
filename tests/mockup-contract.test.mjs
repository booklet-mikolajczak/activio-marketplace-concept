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

test('use cases cover every functional view', () => {
    const use_cases_start = index_html.indexOf('<section class="view use-cases-view"');
    const use_cases_end = index_html.indexOf('<section class="view feedback-history-view"', use_cases_start);
    const use_cases_html = index_html.slice(use_cases_start, use_cases_end);
    const meta_views = new Set([
        'feedback-history',
        'project-assumptions',
        'project-concept',
        'project-hub',
        'project-research',
        'project-technical',
        'use-cases',
    ]);
    const functional_views = unique_attribute_values(index_html, 'data-view')
        .filter((view) => !meta_views.has(view));
    const covered_views = unique_attribute_values(use_cases_html, 'data-go');

    assert.ok(use_cases_start >= 0);
    assert.ok(use_cases_end > use_cases_start);
    assert.deepEqual(
        functional_views.filter((view) => !covered_views.includes(view)),
        [],
    );
});

test('use case inventory contains complete paths for all roles', () => {
    const roles = unique_attribute_values(index_html, 'data-use-case-role');
    const cards = [...index_html.matchAll(
        /<article class="use-case-card[^"]*" data-use-case-card="([^"]+)"([^>]*)>([\s\S]*?)<\/article>/g,
    )];

    assert.equal(roles.length, 11);
    const exception_cards = cards.filter(([_, __, attributes]) => (
        attributes.includes('data-use-case-kind="exception"')
    ));

    assert.equal(cards.length, 47);
    assert.equal(exception_cards.length, 22);
    cards.forEach(([_, identifier, __, card_html]) => {
        assert.ok(
            unique_attribute_values(card_html, 'data-go').length >= 2,
            `${identifier} does not contain a complete path`,
        );
    });
});

test('use case action steps point to controls on the selected view', () => {
    const view_markers = [...index_html.matchAll(
        /<section class="view[^"]*" data-view="([^"]+)"[^>]*>/g,
    )];
    const view_sources = new Map(view_markers.map((marker, index) => [
        marker[1],
        index_html.slice(
            marker.index,
            view_markers[index + 1]?.index ?? index_html.length,
        ),
    ]));
    const action_steps = [...index_html.matchAll(
        /<button\b[^>]*data-use-action="[^"]+"[^>]*>/g,
    )].map(([tag]) => ({
        action: tag.match(/data-use-action="([^"]+)"/)?.[1],
        route: tag.match(/data-go="([^"]+)"/)?.[1],
    }));

    assert.ok(action_steps.length > 0);
    action_steps.forEach(({ action, route }) => {
        assert.ok(route, `${action} does not declare its destination view`);
        assert.ok(
            view_sources.get(route)?.includes(`data-action="${action}"`),
            `${route} does not expose action ${action}`,
        );
    });
});
