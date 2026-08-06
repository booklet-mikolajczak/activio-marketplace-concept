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
        ...index_html.matchAll(/(?:href|src)="(?:styles\.css|app\.js)\?v=([^"]+)"/g),
    ].map((match) => match[1]);

    assert.ok(version);
    assert.deepEqual(versioned_assets, [version, version]);
    assert.match(index_html, /<script defer src="\/website-feedback-loader\.js"><\/script>/);
    assert.doesNotMatch(index_html, /feedback\.js/);
    assert.doesNotMatch(index_html, /vendor\/html2canvas/);
    assert.doesNotMatch(index_html, /data-feedback-ui/);
});

test('final starting catalog contains all approved products', () => {
    const catalog_source = app_js.slice(
        app_js.indexOf('const final_catalog = ['),
        app_js.indexOf('const catalog_categories = ['),
    );
    const product_ids = [...catalog_source.matchAll(/\{ id: '([^']+)'/g)]
        .map((match) => match[1]);
    const expected_ids = [
        'player-labels',
        'lesson-plan',
        'jersey-keyring',
        'jersey-magnet',
        'car-jersey',
        'shoe-labels',
        'coaster',
        'mug',
        'playercard',
        'shirt',
        'clock',
        'photo-puzzle',
        'photo-canvas',
        'poster',
        'calendar',
    ];

    assert.deepEqual(product_ids, expected_ids);
    [
        'Naklejki i naprasowanki dla zawodnika',
        'Plan lekcji',
        'Brelok koszulka',
        'Magnes koszulka',
        'Koszulka do samochodu',
        'Naklejki na buty',
        'Podkładka',
        'Kubek pasiak',
        'Karta FIFA',
        'Koszulka bawełniana z imieniem i numerem',
        'Zegar ścienny',
        'FotoPuzzle ze zdjęciem',
        'FotoObraz',
        'FotoPlakat',
        'FotoKalendarz',
    ].forEach((name) => assert.ok(app_js.includes(`name: '${name}'`), name));
});

test('printer offer and Club starting catalog stay separate', async () => {
    const offer_source = app_js.slice(
        app_js.indexOf('const activio_offer_categories = ['),
        app_js.indexOf('const concept_product_ids = new Set'),
    );
    const categories = Function(`${offer_source}; return activio_offer_categories;`)();
    const product_names = categories.flatMap((category) => (
        category.products.map((product) => product.name)
    ));
    const product_ids = categories.flatMap((category) => (
        category.products.map((product) => product.id)
    ));

    assert.deepEqual(categories.map((category) => category.id), ['clothing', 'gifts', 'bags', 'stickers', 'awards', 'print']);
    assert.deepEqual(categories.map((category) => category.products.length), [7, 4, 5, 7, 5, 6]);
    assert.equal(product_names.length, 34);
    assert.equal(new Set(product_names).size, 34);
    assert.equal(new Set(product_ids).size, 34);
    assert.ok(categories.every((category) => (
        category.products.every((product) => !product.image.includes('-concept.'))
    )));
    await Promise.all(categories.flatMap((category) => category.products.map((product) => (
        readFile(new URL(product.image.replace('../', ''), root_url))
    ))));
    assert.ok(app_js.includes("{ ...products[entry.id], id: entry.id, entry }"));
    assert.ok(app_js.includes("document.querySelector('.club-program-catalog > .section-heading')"));
    assert.ok(!app_js.includes("document.querySelector('.offer-catalog > .section-heading')"));
    assert.match(app_js, /data-action="join-club">Dodaj do sklepu klubowego/);
    assert.match(index_html, /id="club-program-catalog"/);
    assert.match(index_html, /15 produktów gotowych do wdrożenia w sklepie klubu/);
});

test('use cases cover every functional view', () => {
    const use_cases_start = index_html.indexOf('<section class="view use-cases-view"');
    const use_cases_end = index_html.indexOf('<section class="view project-hub-view"', use_cases_start);
    const use_cases_html = index_html.slice(use_cases_start, use_cases_end);
    const meta_views = new Set([
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
