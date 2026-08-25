import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root_url = new URL('../', import.meta.url);
const index_html = await readFile(new URL('mockup/index.html', root_url), 'utf8');
const app_js = await readFile(new URL('mockup/app.js', root_url), 'utf8');
const styles_css = await readFile(new URL('mockup/styles.css', root_url), 'utf8');
const mockup_readme = await readFile(new URL('mockup/README.md', root_url), 'utf8');
const business_concept = await readFile(new URL('docs/activio_business_concept.md', root_url), 'utf8');
const technical_concept = await readFile(new URL('docs/activio_technical_concept.md', root_url), 'utf8');

function unique_attribute_values(source, attribute) {
    return [...new Set(
        [...source.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g'))]
            .map((match) => match[1]),
    )].sort();
}

function json_object_after(source, declaration) {
    const declaration_start = source.indexOf(declaration);
    assert.notEqual(declaration_start, -1, `Missing declaration: ${declaration}`);
    const object_start = source.indexOf('{', declaration_start);
    const object_end = source.indexOf('\n};', object_start);
    assert.notEqual(object_end, -1, `Unclosed declaration: ${declaration}`);

    return JSON.parse(source.slice(object_start, object_end + 2));
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

test('printer offer includes current detailed copy and price tables', () => {
    const offer_source = app_js.slice(
        app_js.indexOf('const activio_offer_categories = ['),
        app_js.indexOf('const activio_offer_details = {'),
    );
    const details_source = app_js.slice(
        app_js.indexOf('const activio_offer_details = {'),
        app_js.indexOf('const concept_product_ids = new Set'),
    );
    const categories = Function(`${offer_source}; return activio_offer_categories;`)();
    const details = Function(`${details_source}; return activio_offer_details;`)();
    const product_ids = categories.flatMap((category) => category.products.map((product) => product.id));

    assert.equal(Object.keys(details).length, 34);
    assert.deepEqual(Object.keys(details).sort(), [...product_ids].sort());
    Object.values(details).forEach((product) => {
        assert.ok(product.description.length > 40, product.source_id);
        assert.ok(product.features.length >= 3, product.source_id);
        assert.ok(product.pricing.length > 0 || product.pricing_note !== '', product.source_id);
    });
    assert.equal(details['cotton-shirt'].features.length, 4);
    assert.deepEqual(details['cotton-shirt'].pricing[1], [
        'Cena',
        '49,00 zł / szt',
        '45,00 zł / szt',
        '42,00 zł / szt',
    ]);
    assert.match(app_js, /class="offer-product-features"/);
    assert.match(app_js, /class="offer-price-table"/);
    assert.match(app_js, /const visible_columns =/);
    assert.match(app_js, /Cennik w przygotowaniu\./);
    assert.match(app_js, /const is_join = form_type === 'join-club';\s*if \(is_join\) \{\s*form\.reset\(\);/);
    assert.match(styles_css, /\.offer-products article p \{[^}]*font-size: 15px/);
    assert.match(styles_css, /\.offer-price-table \{[^}]*font-size: 14px/);
    assert.match(styles_css, /\.offer-price-note \{[^}]*font-size: 14px/);
    assert.match(styles_css, /\.club-registration-form \.club-registration-consent input \{[^}]*width: 16px; height: 16px/);
});

test('ACTIVIO Club join actions lead to the landing registration form', () => {
    assert.match(index_html, /id="club-registration"/);
    assert.match(index_html, /data-action-form="join-club"/);
    assert.match(app_js, /if \(action === 'join-club'\) \{\s*render_view\('club-program'\)/);
    assert.match(app_js, /getElementById\('club-registration'\)\?\.scrollIntoView/);
});

test('second feedback round is reflected across copy, catalog and project rules', () => {
    const clubs_view = index_html.slice(
        index_html.indexOf('data-view="clubs"'),
        index_html.indexOf('data-view="club-program"'),
    );
    const store_view = index_html.slice(
        index_html.indexOf('data-view="store"'),
        index_html.indexOf('data-view="club"'),
    );
    const payment_failed = index_html.slice(
        index_html.indexOf('data-view="payment-failed"'),
        index_html.indexOf('data-view="order-not-found"'),
    );
    const listing_create = index_html.slice(
        index_html.indexOf('data-view="partner-listing-create"'),
        index_html.indexOf('data-view="partner-orders"'),
    );
    const partner_brand = index_html.slice(
        index_html.indexOf('data-view="partner-brand"'),
        index_html.indexOf('data-view="partner-team"'),
    );
    const system_catalog_guide = index_html.slice(
        index_html.indexOf('data-view="system-catalog-guide"'),
        index_html.indexOf('data-view="system-catalog-product"'),
    );
    const system_clubs = index_html.slice(
        index_html.indexOf('data-view="system-clubs"'),
        index_html.indexOf('data-view="system-club"'),
    );
    const system_listings = index_html.slice(
        index_html.indexOf('data-view="system-listings"'),
        index_html.indexOf('data-view="system-orders"'),
    );
    const system_order_exception = index_html.slice(
        index_html.indexOf('data-view="system-order-exception"'),
        index_html.indexOf('data-view="system-case-resolution"'),
    );
    const visible_copy = index_html.replace(/<[^>]+>/g, ' ');

    assert.match(clubs_view, /Twój sklep klubowy\.<br>Bez inwestycji\./);
    assert.match(clubs_view, /Klub rozwija markę swojego klubu\. ACTIVIO obsługuje sprzedaż\./);
    assert.match(payment_failed, /Numer zamówienia/);
    assert.match(payment_failed, /AC\/2026\/1052/);
    assert.doesNotMatch(payment_failed, /Numer próby|PAY\/2026\/8841/);

    assert.match(store_view, /data-store-product-search/);
    assert.match(store_view, /class="store-category-grid"/);
    assert.match(app_js, /class="store-category-box"/);
    assert.match(app_js, /product\.dataset\.storeSearch\.includes\(product_search\)/);
    assert.match(app_js, /other_preview_count/);
    assert.ok(app_js.includes("window.matchMedia('(max-width: 640px)')"));
    assert.ok(app_js.includes("window.matchMedia('(max-width: 980px)')"));
    assert.match(app_js, /\? 2 : 4/);
    assert.match(app_js, /window\.addEventListener\('resize'/);
    assert.match(app_js, /Pokaż więcej/);
    assert.doesNotMatch(app_js, /containers\.other\.hidden = !store_show_all/);

    const official_offer_images = json_object_after(app_js, 'const activio_offer_images = ');
    const offer_details = json_object_after(app_js, 'const activio_offer_details = ');
    const offer_source_ids = Object.values(offer_details).map((details) => details.source_id);
    const all_official_offer_images = Object.values(official_offer_images).flat();
    assert.equal(Object.keys(official_offer_images).length, 34);
    assert.deepEqual(Object.keys(official_offer_images).sort(), [...offer_source_ids].sort());
    Object.values(official_offer_images).forEach((images) => {
        assert.ok(images.length >= 2 && images.length <= 6);
        assert.equal(new Set(images).size, images.length);
        assert.ok(images.every((image) => image.startsWith('https://www.activio.pl/uploads/')));
    });
    assert.equal(official_offer_images.bluzy.length, 6);
    assert.equal(all_official_offer_images.length, 142);
    assert.equal(new Set(all_official_offer_images).size, all_official_offer_images.length);
    assert.match(app_js, /activio_offer_images\[details\.source_id\]/);
    assert.match(app_js, /source_id: source_details\?\.source_id \|\| ''/);
    assert.match(app_js, /data-offer-gallery-thumb/);
    assert.match(app_js, /data-offer-gallery-main data-offer-image[^>]+loading="lazy" decoding="async"/);
    assert.match(app_js, /data-offer-image data-fallback-src=[^>]+loading="lazy" decoding="async" fetchpriority="low"/);
    assert.match(app_js, /class="offer-gallery-thumbs" role="group"/);
    assert.match(app_js, /data-offer-gallery-open data-index="0" aria-label="Powiększ zdjęcie produktu/);
    assert.match(app_js, /const offer_lightbox = \{/);
    assert.match(app_js, /element\.setAttribute\('role', 'dialog'\)/);
    assert.match(app_js, /element\.setAttribute\('aria-modal', 'true'\)/);
    assert.match(app_js, /document\.addEventListener\('keydown', this\.keydown_handler\)/);
    assert.match(app_js, /event\.key === 'Escape'/);
    assert.match(app_js, /event\.key === 'ArrowLeft'/);
    assert.match(app_js, /event\.key === 'ArrowRight'/);
    assert.match(app_js, /event\.key !== 'Tab'/);
    assert.match(app_js, /this\.previously_focused\.focus\(\)/);
    assert.match(app_js, /this\.stage\.addEventListener\('touchstart'/);
    assert.match(app_js, /this\.stage\.addEventListener\('touchend'/);
    const lightbox_source = app_js.slice(
        app_js.indexOf('const offer_lightbox = {'),
        app_js.indexOf('function render_activio_offer_catalog'),
    );
    assert.match(lightbox_source, /event\.target === element \|\| event\.target === this\.stage/);
    assert.match(lightbox_source, /this\.ignore_stage_click_until = Date\.now\(\) \+ 400/);
    assert.match(lightbox_source, /document\.body\.style\.overflow = this\.previous_body_overflow/);
    assert.match(lightbox_source, /this\.background_inert_states = \[\.\.\.document\.body\.children\]/);
    assert.match(lightbox_source, /element\.inert = true/);
    assert.match(lightbox_source, /element\.inert = inert/);
    assert.match(lightbox_source, /\(\(raw_index % image_count\) \+ image_count\) % image_count/);
    assert.match(lightbox_source, /this\.image\.dataset\.fallbackApplied = 'true';\s+this\.image\.removeAttribute\('src'\)/);
    assert.match(lightbox_source, /event\.stopPropagation\(\);\s+this\.close\(\)/);
    const gallery_click_handler = app_js.slice(
        app_js.indexOf('const offer_gallery_thumb'),
        app_js.indexOf('const product_template_button'),
    );
    assert.match(gallery_click_handler, /delete main_image\.dataset\.fallbackApplied/);
    assert.match(gallery_click_handler, /main_image\.src = offer_gallery_thumb\.dataset\.src/);
    assert.match(gallery_click_handler, /main_image\.alt =/);
    assert.match(gallery_click_handler, /gallery_count\.textContent =/);
    assert.match(gallery_click_handler, /gallery_trigger\.dataset\.index = String\(index\)/);
    assert.match(gallery_click_handler, /setAttribute\('aria-pressed'/);
    assert.match(gallery_click_handler, /offer_lightbox\.open\(/);
    const gallery_error_handler = app_js.slice(
        app_js.indexOf("document.addEventListener('error'"),
        app_js.indexOf("document.addEventListener('click'"),
    );
    assert.match(gallery_error_handler, /failed_image\.src = failed_image\.dataset\.fallbackSrc/);
    assert.match(gallery_error_handler, /thumbnail\.dataset\.src = failed_image\.dataset\.fallbackSrc/);
    assert.match(styles_css, /\.offer-gallery-thumbs/);
    assert.match(styles_css, /\.offer-gallery-trigger[^}]+cursor: zoom-in/);
    assert.match(styles_css, /\.offer-lightbox \{/);
    assert.match(styles_css, /\.offer-lightbox\[hidden\] { display: none; }/);
    assert.match(styles_css, /\.offer-lightbox-stage/);
    assert.match(styles_css, /\.offer-lightbox-counter/);
    assert.match(business_concept, /Kliknięcie głównego zdjęcia otwiera pełnoekranowy lightbox/);
    assert.match(technical_concept, /główne zdjęcie otwiera dostępny lightbox z licznikiem i nawigacją/);

    assert.match(listing_create, /data-download-product-template/);
    assert.match(listing_create, /data-template-product-name="Koszulka bawełniana z imieniem i numerem"/);
    assert.doesNotMatch(listing_create, /data-download-product-template[^>]*data-product-name=/);
    assert.match(listing_create, /name="design_source" value="club"/);
    assert.match(listing_create, /name="club_design" type="file"/);
    assert.match(app_js, /image\/svg\+xml/);
    assert.match(app_js, /fixed_options: true/);
    assert.match(app_js, /options: \['Matowe'\]/);
    assert.match(index_html, /data-product-option-field/);
    assert.match(index_html, /data-fixed-product-option/);
    assert.match(app_js, /product_option_field\.hidden = Boolean\(product\.fixed_options\)/);
    assert.match(app_js, /product\.fixed_options\s*\? product\.options\[0\]/);
    assert.doesNotMatch(app_js.slice(app_js.indexOf("'jersey-magnet':"), app_js.indexOf("'car-jersey':")), /Błyszczące/);

    assert.match(partner_brand, /Herb, licencję, kolory oraz treści oficjalnego sklepu\./);
    assert.match(partner_brand, /Podstawowy ciemny/);
    assert.match(partner_brand, /Podstawowy jasny/);
    assert.match(partner_brand, /Dodatkowy kolor/);
    assert.doesNotMatch(index_html, /club\.finance\.manage/);
    assert.doesNotMatch(visible_copy, /\bonboarding\b/i);

    assert.match(system_catalog_guide, /Jeden zaprojektowany szablon tworzy oferty wielu klubów/);
    assert.match(system_catalog_guide, /dwa kolory podstawowe: ciemny i jasny/);
    assert.match(system_catalog_guide, /klub załącza własny plik wykonany na szablonie/);
    assert.doesNotMatch(system_clubs, />Bezterminowa</);
    assert.match(system_clubs, />Zweryfikowana</);
    assert.doesNotMatch(system_listings, /<th>Licencja<\/th>/);
    assert.match(system_order_exception, /nie został przekazany do produkcji, ponieważ wycofano materiał/);
    assert.match(system_order_exception, /Pokaż informacje techniczne/);

    assert.match(business_concept, /Każdy produkt bazowy ma zaprojektowany i wersjonowany szablon/);
    assert.match(business_concept, /Każdy produkt w Ofercie B2B ma galerię co najmniej dwóch oficjalnych zdjęć/);
    assert.match(business_concept, /Magnes koszulka ma wyłącznie matowe wykończenie/);
    assert.match(business_concept, /Interfejs użytkownika jest po polsku/);
    assert.match(technical_concept, /źródło projektu: ACTIVIO albo plik klubu wykonany na szablonie/);
    assert.match(technical_concept, /`primary_dark`, `primary_light` i `additional`/);
    assert.match(technical_concept, /galeria co najmniej dwóch wersjonowanych zdjęć produktu/);
    assert.match(mockup_readme, /Galerie Oferty B2B korzystają z oficjalnych zdjęć `activio\.pl`/);
    assert.match(mockup_readme, /niedostępność strony źródłowej ograniczy galerię do\s+pojedynczego obrazu/);
});

test('club feedback decisions stay reflected in the prototype', () => {
    const partner_dashboard = index_html.slice(
        index_html.indexOf('data-view="partner-dashboard"'),
        index_html.indexOf('data-view="partner-offer"'),
    );
    const partner_offer = index_html.slice(
        index_html.indexOf('data-view="partner-offer"'),
        index_html.indexOf('data-view="partner-catalog"'),
    );
    const partner_brand = index_html.slice(
        index_html.indexOf('data-view="partner-brand"'),
        index_html.indexOf('data-view="partner-team"'),
    );
    const partner_listing = index_html.slice(
        index_html.indexOf('data-view="partner-listing"'),
        index_html.indexOf('data-view="partner-order"'),
    );
    const partner_settlement = index_html.slice(
        index_html.indexOf('data-view="partner-settlement"'),
        index_html.indexOf('data-view="partner-payout-request"'),
    );
    const partner_payout_request = index_html.slice(
        index_html.indexOf('data-view="partner-payout-request"'),
        index_html.indexOf('data-view="partner-club"'),
    );
    const partner_settlements = index_html.slice(
        index_html.indexOf('data-view="partner-settlements"'),
        index_html.indexOf('data-view="partner-listing"'),
    );
    const payout_submit = app_js.slice(
        app_js.indexOf("if (form_type === 'partner-request-payout')"),
        app_js.indexOf('const is_join =', app_js.indexOf("if (form_type === 'partner-request-payout')")),
    );

    assert.match(index_html, /<h1>Pulpit klubu<\/h1>/);
    assert.doesNotMatch(index_html, /<h1>(?:Dzień dobry|Witaj)[^<]*<\/h1>/);
    assert.match(partner_offer, /Twój zarobek brutto/);
    assert.match(partner_offer, /data-club-earning>24,60 zł/);
    assert.doesNotMatch(partner_offer, /Różnica między ceną sklepu a minimum ACTIVIO/);
    assert.match(app_js, /club_earning_gross = entry\.club_earning_net \* 1\.23/);
    assert.match(app_js, /<strong data-club-earning>/);
    assert.match(app_js, /data-price-error role="alert"/);
    assert.match(app_js, /price_error\.textContent = is_valid/);
    assert.match(partner_listing, /Różnica brutto względem minimum/);
    assert.doesNotMatch(partner_listing, /Twój zarobek brutto/);
    assert.match(partner_dashboard, /Należne klubowi brutto/);
    assert.match(partner_dashboard, /1 581,78 zł/);
    assert.match(partner_dashboard, /934,80 zł brutto/);
    assert.doesNotMatch(partner_dashboard, /Należne klubowi netto|Podstawa dla klubu \(netto\)/);
    assert.match(index_html, /data-go="partner-payout-request">Zleć wypłatę/);
    assert.doesNotMatch(index_html, /data-action="request-payout"/);
    assert.match(partner_settlement, /data-document-state/);
    assert.match(partner_settlement, /data-settlement-status/);
    assert.match(partner_payout_request, /data-action-form="partner-request-payout"/);
    assert.match(partner_payout_request, /name="document_number"/);
    assert.match(partner_payout_request, /name="document_file" type="file"/);
    assert.match(partner_payout_request, /accept="\.pdf,\.jpg,\.jpeg,\.png" required/);
    assert.match(partner_payout_request, /checkout-confirm wide/);
    assert.match(partner_payout_request, /data-payout-request-result tabindex="-1"/);
    assert.match(partner_payout_request, /Faktura VAT — 1 279,20 zł brutto/);
    assert.match(partner_payout_request, /Rachunek bez VAT — 1 040,00 zł/);
    const tax_rule_index = partner_settlements.indexOf('class="settlement-rule tax-rule"');
    const payout_history_index = partner_settlements.indexOf('class="partner-panel payout-history"');
    assert.ok(tax_rule_index >= 0);
    assert.ok(payout_history_index >= 0);
    assert.ok(tax_rule_index < payout_history_index);
    assert.match(partner_settlements, /Oczekujące brutto/);
    assert.match(partner_settlements, /302,58 zł/);
    assert.match(partner_settlements, /Wypłacone brutto łącznie/);
    assert.match(partner_settlements, /10 750,20 zł/);
    assert.match(app_js, /Wypłata zlecona/);
    assert.match(app_js, /Rachunek przekazany/);
    assert.match(app_js, /payout_result\.innerHTML/);
    assert.match(payout_submit, /form\.elements\.document_type\.value === 'invoice'/);
    assert.match(payout_submit, /escape_html\(raw_document_filename\)/);
    assert.match(payout_submit, /escape_html\(raw_document_number\)/);
    assert.match(payout_submit, /settlement_payout_amount = payout_amount/);
    assert.match(payout_submit, /system_document_filename\.textContent = raw_document_filename/);
    assert.match(payout_submit, /system_vat_value\.textContent = invoice \? '239,20 zł' : 'Nie dotyczy'/);
    assert.match(payout_submit, /system_approval_summary\.textContent/);
    assert.match(app_js, /payout_result\.focus\(\)/);
    assert.match(app_js, /payout_document_type\.value === 'invoice'/);
    assert.match(app_js, /generated_document_numbers\.includes\(document_number\.value\)/);
    assert.match(app_js, /'partner-payout-request': 'partner-settlements'/);
    assert.match(index_html, /data-system-document-filename/);
    assert.match(index_html, /data-system-approval-summary/);
    assert.doesNotMatch(app_js, /if \(action === 'request-payout'\)/);
    assert.match(partner_brand, /<dt>Współpraca od<\/dt><dd>12\.03\.2026<\/dd>/);
    assert.match(partner_brand, /table-status available">Bezterminowa/);
    assert.doesNotMatch(partner_brand, /Ważna do|wygasa/i);
    assert.doesNotMatch(index_html, /Wypłata miesięczna|Miesięczny proces, nie wypłata na żądanie/);
});

test('payouts use a continuous balance and club requests', () => {
    const partner_settlements = index_html.slice(
        index_html.indexOf('data-view="partner-settlements"'),
        index_html.indexOf('data-view="partner-listing"'),
    );
    const partner_settlement = index_html.slice(
        index_html.indexOf('data-view="partner-settlement"'),
        index_html.indexOf('data-view="partner-payout-request"'),
    );
    const partner_payout_request = index_html.slice(
        index_html.indexOf('data-view="partner-payout-request"'),
        index_html.indexOf('data-view="partner-club"'),
    );
    const partner_club = index_html.slice(
        index_html.indexOf('data-view="partner-club"'),
        index_html.indexOf('data-view="partner-brand"'),
    );
    const system_settlements = index_html.slice(
        index_html.indexOf('data-view="system-settlements"'),
        index_html.indexOf('data-view="system-settlement"'),
    );
    const system_settlement = index_html.slice(
        index_html.indexOf('data-view="system-settlement"'),
        index_html.indexOf('data-view="system-audit"'),
    );
    const payout_submit = app_js.slice(
        app_js.indexOf("if (form_type === 'partner-request-payout')"),
        app_js.indexOf('const is_join =', app_js.indexOf("if (form_type === 'partner-request-payout')")),
    );
    const calendar_month = 'stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia';
    const calendar_close_semantics = new RegExp(`zamknięci\\w*\\s+(?:miesiąca|${calendar_month}|okresu(?! bezpieczeństwa))`, 'i');
    const monthly_close_semantics = new RegExp(`SettlementPeriod|rozliczenie miesięczne|${calendar_close_semantics.source}`, 'i');

    assert.match(business_concept, /Wypłaty nie są miesięczne\./);
    assert.match(business_concept, /Miesiąc może być wyłącznie filtrem raportu/);
    assert.match(business_concept, /Objęte wpisy są rezerwowane dla tego zlecenia i nie mogą wejść do kolejnego/);
    assert.match(technical_concept, /### `ClubPayoutRequest`/);
    assert.match(technical_concept, /Nie modelować miesięcznego `SettlementPeriod`/);
    assert.match(technical_concept, /atomowo tworzy niezmienny snapshot dostępnych środków i rezerwuje objęte wpisy ledgera/);
    assert.match(technical_concept, /suma ledgera → payout request → payout/);
    assert.doesNotMatch(technical_concept, /ledger → settlement/);
    assert.doesNotMatch(technical_concept, /### `ClubSettlement`/);
    assert.match(partner_settlements, /Kwota do wypłaty/);
    assert.match(partner_settlements, /Historia wypłat/);
    assert.match(partner_settlements, /05\.07\.2026/);
    assert.match(partner_settlements, /03\.06\.2026/);
    assert.match(partner_settlements, /data-current-payout hidden/);
    assert.doesNotMatch(partner_settlements, /Aktualne saldo · 94 dostępne pozycje/);
    assert.match(partner_settlements, /Historia salda/);
    assert.match(partner_settlements, /Wszystkie zdarzenia/);
    assert.match(partner_settlement, /<h1>Zlecanie wypłaty<\/h1>/);
    assert.match(partner_settlement, /Saldo rośnie na bieżąco/);
    assert.match(partner_payout_request, /<strong data-payout-summary-title>Aktualne saldo<\/strong>/);
    assert.match(partner_club, /<strong>Wypłata na wniosek<\/strong>/);
    assert.match(system_settlements, /Klub \/ zlecenie/);
    assert.match(system_settlements, /WYP\/2026\/008 · zlecono 24\.08\.2026/);
    assert.match(system_settlement, /Snapshot salda zapisany/);
    assert.match(app_js, /Saldo jest ciągłe:/);
    assert.match(app_js, /Wypłatę zleca klub/);
    assert.match(index_html, /data-go="system-integrations">1\. Nieudana próba wypłaty/);
    assert.match(payout_submit, /const payout_reference = 'WYP\/2026\/008'/);
    assert.match(payout_submit, /available_payout_amount\.textContent = '0,00 zł'/);
    assert.match(payout_submit, /dashboard_payout_amount\.textContent = '0,00 zł'/);
    assert.match(payout_submit, /dashboard_payout_alert\.querySelector\('strong'\)\.textContent = 'Wypłata czeka na weryfikację'/);
    assert.match(payout_submit, /payout_summary_vat_value\.textContent = invoice \? '239,20 zł' : 'Nie dotyczy'/);
    assert.match(payout_submit, /payout_vat_detail\.textContent = invoice \? 'Dla rozliczenia fakturą VAT' : 'Rachunek bez VAT'/);
    assert.match(payout_submit, /payout_current\.hidden = false/);
    assert.match(payout_submit, /state\.textContent = 'W zleceniu'/);
    assert.match(payout_submit, /form\.hidden = true/);
    assert.equal([...index_html.matchAll(/data-payout-ledger-state/g)].length, 3);
    assert.doesNotMatch(index_html, /Okres miesięczny|Zamknij okres|Okres pozostaje zamknięty|Lista okresów klubów|zamkniętego okresu|Rozliczenie za lipiec|← Rozliczenie lipca|system-close-period/);
    assert.doesNotMatch(app_js, /system-close-period|ACTIVIO zamyka okres|częstotliwość rozliczeń|rozlicza partnerów okresowo|Operator zatwierdza dokument i tworzy zlecenie wypłaty/);
    assert.doesNotMatch(index_html, monthly_close_semantics);
    assert.doesNotMatch(app_js, monthly_close_semantics);
    assert.doesNotMatch(business_concept, calendar_close_semantics);
    assert.doesNotMatch(technical_concept, calendar_close_semantics);
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
