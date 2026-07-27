const views = [...document.querySelectorAll('[data-view]')];
const store_header = document.querySelector('[data-store-header]');
const partner_header = document.querySelector('[data-partner-header]');
const store_footer = document.querySelector('[data-store-footer]');
const scenario_rail = document.querySelector('[data-scenario-rail]');
const scenario_backdrop = document.querySelector('.scenario-backdrop');
const assumption_drawer = document.querySelector('[data-assumption-drawer]');
const assumption_title = document.querySelector('[data-assumption-title]');
const assumption_content = document.querySelector('[data-assumption-content]');
const toast = document.querySelector('[data-toast]');
const refresh_button = document.querySelector('[data-refresh-latest]');
const version_time = document.querySelector('[data-version-time]');

const partner_views = ['partner-dashboard', 'partner-offer', 'partner-orders', 'partner-settlements'];
const valid_views = views.map((view) => view.dataset.view);
const document_cache = new Map();
const loaded_document_timestamp = Date.parse(document.lastModified) || Date.now();
let known_version_signature = null;
let version_check_in_progress = false;

const assumptions = {
    marketplace: {
        title: 'Strona główna ACTIVIO',
        items: [
            'Strona główna rozdziela trzy usługi: Oferta B2B, ACTIVIO Club i Sklep.',
            'Produkty klubów i produkty własne ACTIVIO są sprzedawane w Sklepie oraz dodawane do jednego koszyka.',
            'ACTIVIO jest jedynym sprzedawcą, a kluby są partnerami i licencjodawcami marki.',
        ],
    },
    offer: {
        title: 'Oferta dla klubów',
        items: [
            'Oferta to usługa druku i produkcji kierowana bezpośrednio do organizacji sportowych.',
            'Produkt prowadzi do zapytania albo zamówienia B2B, nie do koszyka konsumenckiego.',
            'Katalog i producenci są kontrolowani przez ACTIVIO.',
        ],
    },
    clubs: {
        title: 'ACTIVIO Club',
        items: [
            'Ta część prezentuje program partnerski oraz oficjalne sklepy klubowe.',
            'Klub nie jest sprzedawcą: wybiera produkty, ustala ceny i otrzymuje wynagrodzenie.',
            'Wejście do sklepu konkretnego klubu zachowuje jego markę, ofertę i historię.',
        ],
    },
    store: {
        title: 'Sklep ACTIVIO',
        items: [
            'Sklep łączy produkty klubów oraz dopuszczone produkty własne ACTIVIO.',
            'Katalog można filtrować według kategorii i klubu oraz sortować według popularności.',
            'Produkty z różnych klubów trafiają do jednego koszyka i są kupowane od ACTIVIO.',
        ],
    },
    club: {
        title: 'Sklep klubu',
        items: [
            'Sklep ma własny adres, identyfikację i historię, ale działa na wspólnej platformie ACTIVIO.',
            'Klub wybiera ofertę z katalogu bazowego i ustala cenę detaliczną nie niższą od minimum ACTIVIO.',
            'Klub nie dodaje własnych dostawców ani dowolnych produktów; katalog rozszerza ACTIVIO o zatwierdzonych producentów.',
            'Komunikat o wsparciu klubu musi odpowiadać umowie i faktycznemu sposobowi rozliczenia.',
        ],
    },
    product: {
        title: 'Produkt personalizowany',
        items: [
            'Konfigurację zapisujemy jako wersjonowany zestaw pól, nie jako luźne komentarze do zamówienia.',
            'Podgląd jest poglądowy; przed zakupem klient potwierdza numer i napis.',
            'Wyjątek od prawa odstąpienia wymaga prawdziwej personalizacji i jasnej informacji przed zakupem.',
            'Cena sprzedaży, cena minimalna, koszt, udział klubu, pliki produkcyjne i personalizacja są utrwalane na pozycji zamówienia.',
        ],
    },
    cart: {
        title: 'Mieszany koszyk',
        items: [
            'Jedno zamówienie może zawierać pozycje przypisane do różnych klubów.',
            'Udział klubu liczony jest osobno dla każdej pozycji, a warunki zakupu pozostają częścią historii zamówienia.',
            'Jedna paczka jest możliwa tylko przy wspólnym centrum realizacji; opóźnienie jednego produktu opóźnia całość.',
            'MVP nie dzieli płatności pomiędzy kluby — ACTIVIO pobiera całość i rozlicza partnerów okresowo.',
        ],
    },
    checkout: {
        title: 'Checkout',
        items: [
            'Kupujący zawiera jedną umowę z ACTIVIO i otrzymuje jeden dokument sprzedaży.',
            'Przed płatnością pokazujemy finalną cenę, dostawę, termin realizacji i zasady personalizacji.',
            'Płatność obsługuje zewnętrzny operator; platforma nie przechowuje środków klientów ani klubów.',
        ],
    },
    confirmation: {
        title: 'Potwierdzenie',
        items: [
            'Jedno zamówienie klienta może uruchomić kilka zapisów udziału klubowego.',
            'Klient widzi sumę i podział wsparcia, ale nie wewnętrzną marżę ani koszt produkcji.',
            'Status klienta opisuje całe zamówienie; operacyjnie każda pozycja ma osobny status produkcji.',
        ],
    },
    'partner-dashboard': {
        title: 'Panel klubu',
        items: [
            'Panel jest osobnym modułem ACTIVIO, a nie rozszerzeniem paneli Npack lub Naklejkon.',
            'Sprzedaż oznacza wartość produktów klubowych; „należne klubowi” to zobowiązanie ACTIVIO z umowy.',
            'Klub widzi agregaty i pozycje swoich produktów, bez danych innych klubów.',
            'Sprzedaż klienta jest brutto, a wynagrodzenie klubu pokazujemy jako podstawę netto, VAT i kwotę brutto do wypłaty.',
        ],
    },
    'partner-offer': {
        title: 'Oferta i ceny',
        items: [
            'Klub sam ustala cenę detaliczną każdego listingu, ale nie może zejść poniżej minimum ACTIVIO.',
            'Minimum jest wersjonowane per wariant i personalizację; sprawdzamy je ponownie przy publikacji i checkoutcie.',
            'W MVP nie ma kuponów, rabatów ani promocji cenowych.',
            'Cennik ilościowy activio.pl jest źródłem katalogu, nie automatycznym minimum dla pojedynczej sztuki produkowanej na zamówienie.',
            'Czy całe przekroczenie minimum jest udziałem klubu, wymaga jeszcze decyzji podatkowej i umownej.',
            'Podniesienie minimum nie zmienia po cichu ceny klubu: listing wymaga nowej ceny albo zostaje wstrzymany w dniu wejścia zmiany.',
        ],
    },
    'partner-orders': {
        title: 'Widok zamówień klubu',
        items: [
            'Uprawnienie jest ograniczone do pozycji powiązanych z danym klubem, nie do całego mieszanego koszyka.',
            'Domyślnie klub nie potrzebuje adresu, telefonu ani e-maila kupującego.',
            'Personalizację pokazujemy tylko w zakresie uzasadnionym obsługą produktu i reklamacji.',
            'Eksport oraz każde wejście w dane powinny podlegać uprawnieniom i audytowi.',
        ],
    },
    'partner-settlements': {
        title: 'Rozliczenia',
        items: [
            'To nie portfel płatniczy, lecz księga zobowiązań ACTIVIO wobec klubu.',
            'Każda sprzedaż, korekta, reklamacja i wypłata tworzy nieusuwalny zapis powiązany z pozycją zamówienia.',
            'Kwota staje się dostępna dopiero po ustalonym okresie bezpieczeństwa.',
            'Klub VAT wystawia fakturę i otrzymuje netto plus VAT; klub bez VAT wystawia dokument bez VAT i otrzymuje netto.',
            'Częstotliwość wypłat, próg minimalny i skutki ujemnego salda wymagają decyzji księgowej.',
        ],
    },
    'project-hub': {
        title: 'O projekcie',
        items: [
            'Ta część prototypu łączy widoki produktu z pełną dokumentacją koncepcyjną.',
            'Dokumenty są ładowane z plików Markdown, więc udostępniona wersja pokazuje ich aktualną treść.',
            'Materiały opisują rekomendacje i pytania do decyzji, a nie zatwierdzoną specyfikację implementacyjną.',
        ],
    },
    'feedback-history': {
        title: 'Historia uwag i zmian',
        items: [
            'Widok jest zasilany tą samą trwałą bazą co panel uwag i nie duplikuje komentarzy w kodzie mockupu.',
            'Odrzucone uwagi testowe są pomijane.',
            'Odpowiedzi opisują podjęte działania, a status wskazuje, czy wdrożenie zostało zakończone.',
        ],
    },
    'project-concept': {
        title: 'Koncepcja biznesowa',
        items: [
            'Dokument jest przeznaczony dla biznesu: obejmuje model sprzedaży, ceny, role, operacje, ryzyka i plan pilotażu.',
            'Spis treści po lewej prowadzi do każdej sekcji bez opuszczania prototypu.',
        ],
    },
    'project-assumptions': {
        title: 'Założenia produktu',
        items: [
            'To rozdział kanonicznego dokumentu biznesowego, a nie osobna kopia treści.',
            'Cena detaliczna klubu i minimum ACTIVIO pozostają dwiema osobnymi wartościami biznesowymi.',
        ],
    },
    'project-technical': {
        title: 'Dodatek techniczny',
        items: [
            'Dokument jest przeznaczony dla zespołu IT i nie jest wymagany do rozmowy biznesowej.',
            'Zawiera architekturę, integrację z ShopSystem, model domenowy, bezpieczeństwo, testy i plan wdrożenia.',
        ],
    },
};

let current_view = 'marketplace';
let cart_count = 2;
let toast_timeout;

function close_overlays() {
    scenario_rail.classList.remove('open');
    scenario_backdrop.classList.remove('open');
    assumption_drawer.classList.remove('open');
    assumption_drawer.setAttribute('aria-hidden', 'true');
}

function show_toast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toast_timeout);
    toast_timeout = window.setTimeout(() => toast.classList.remove('show'), 3000);
}

function latest_url() {
    const url = new URL(window.location.href);
    url.searchParams.delete('v');
    url.searchParams.set('fresh', String(Date.now()));
    return url.toString();
}

function reload_latest() {
    refresh_button.classList.remove('update-available');
    version_time.textContent = 'Pobieram…';
    window.location.replace(latest_url());
}

async function fetch_version_state() {
    const asset_paths = [
        './',
        'styles.css',
        'app.js',
        'feedback.js',
        '../docs/activio_business_concept.md',
        '../docs/activio_technical_concept.md',
    ];
    const states = await Promise.all(asset_paths.map(async (path, index) => {
        const url = new URL(path, window.location.href);
        url.username = '';
        url.password = '';
        url.searchParams.set('_version_check', `${Date.now()}-${index}`);
        const response = await fetch(url, { method: 'HEAD', cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const modified = response.headers.get('Last-Modified') || '';
        return {
            path,
            etag: response.headers.get('ETag') || '',
            modified,
            timestamp: Date.parse(modified) || 0,
        };
    }));

    return {
        states,
        signature: states.map((state) => `${state.path}:${state.etag}:${state.modified}`).join('|'),
        latest_timestamp: Math.max(...states.map((state) => state.timestamp)),
    };
}

function show_current_version(timestamp) {
    const date = new Date(timestamp || Date.now());
    const short_time = date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    version_time.textContent = window.innerWidth <= 640 ? short_time : `Aktualna ${short_time}`;
    version_time.dateTime = date.toISOString();
    refresh_button.title = `Najnowsza wersja plików: ${date.toLocaleString('pl-PL')}. Kliknij, aby pobrać ponownie.`;
}

function show_available_version() {
    refresh_button.classList.add('update-available');
    version_time.textContent = window.innerWidth <= 640 ? 'Nowa' : 'Nowa wersja';
    refresh_button.title = 'Dostępna jest nowsza wersja prototypu. Kliknij, aby ją pobrać.';
}

async function check_version(is_initial = false) {
    if (version_check_in_progress) {
        return;
    }

    version_check_in_progress = true;

    try {
        const version = await fetch_version_state();
        const document_state = version.states.find((state) => state.path === './');

        if (is_initial && document_state.timestamp > loaded_document_timestamp + 500) {
            reload_latest();
            return;
        }

        if (known_version_signature && known_version_signature !== version.signature) {
            show_available_version();
            return;
        }

        known_version_signature = version.signature;
        show_current_version(version.latest_timestamp);
    } catch (error) {
        version_time.textContent = 'Odśwież ↻';
        refresh_button.title = 'Nie udało się sprawdzić wersji. Kliknij, aby pobrać prototyp bez cache.';
    } finally {
        version_check_in_progress = false;
    }
}

function format_price(value) {
    return `${value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
}

function update_offer_price(input) {
    const offer_item = input.closest('[data-offer-item]');
    const minimum_price = Number(offer_item.dataset.minPrice);
    const sale_price = Number(input.value);
    const spread = offer_item.querySelector('[data-price-spread]');
    const result = spread.closest('.price-result');
    const save_button = offer_item.querySelector('[data-save-price]');
    const is_valid = Number.isFinite(sale_price) && sale_price >= minimum_price;

    input.classList.toggle('invalid', !is_valid);
    input.setAttribute('aria-invalid', String(!is_valid));
    result.classList.toggle('invalid', !is_valid);
    save_button.disabled = !is_valid;
    spread.textContent = is_valid
        ? format_price(sale_price - minimum_price)
        : `Minimum: ${format_price(minimum_price)}`;
}

function escape_html(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function slugify_heading(value) {
    return value
        .replace(/[Łł]/g, 'l')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pl-PL')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function render_markdown_link(label, href) {
    const safe_label = label;
    const internal_routes = {
        'activio_business_concept.md': 'project-concept',
        'activio_technical_concept.md': 'project-technical',
        'mockup/index.html': 'marketplace',
    };
    const [href_path, href_fragment = ''] = href.split('#');
    const assumptions_route = href_path.endsWith('activio_business_concept.md')
        && href_fragment === 'zalozenia-produktu';
    const internal_route = Object.entries(internal_routes)
        .find(([path]) => href_path.endsWith(path))?.[1];
    const resolved_route = assumptions_route ? 'project-assumptions' : internal_route;

    if (resolved_route) {
        return `<a href="#${resolved_route}" data-go="${resolved_route}">${safe_label}</a>`;
    }

    if (href.startsWith('#')) {
        return `<a href="${escape_html(href)}" data-document-anchor="${escape_html(href.slice(1))}">${safe_label}</a>`;
    }

    if (/^https?:\/\//.test(href)) {
        return `<a href="${escape_html(href)}" target="_blank" rel="noreferrer">${safe_label}</a>`;
    }

    const relative_href = href_path.endsWith('.md')
        ? `../docs/${href_path.replace(/^\.\//, '')}${href_fragment ? `#${href_fragment}` : ''}`
        : href;
    return `<a href="${escape_html(relative_href)}" target="_blank">${safe_label}</a>`;
}

function render_inline_markdown(value) {
    const inline_code = [];
    const protected_value = value.replace(/`([^`]+)`/g, (_match, code) => {
        inline_code.push(`<code>${escape_html(code)}</code>`);
        return `%%INLINECODE${inline_code.length - 1}%%`;
    });

    let html = escape_html(protected_value);
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => render_markdown_link(label, href));
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    html = html.replace(/%%INLINECODE(\d+)%%/g, (_match, index) => inline_code[Number(index)]);

    return html;
}

function split_markdown_table_row(line) {
    return line
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((cell) => cell.trim());
}

function is_markdown_table_separator(line) {
    const cells = split_markdown_table_row(line);
    return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function render_markdown(markdown) {
    const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
    const html = [];
    let paragraph = [];
    let list_type = null;
    let code_lines = null;
    let code_language = '';

    const flush_paragraph = () => {
        if (paragraph.length > 0) {
            html.push(`<p>${render_inline_markdown(paragraph.join(' '))}</p>`);
            paragraph = [];
        }
    };

    const close_list = () => {
        if (list_type) {
            html.push(`</${list_type}>`);
            list_type = null;
        }
    };

    const flush_blocks = () => {
        flush_paragraph();
        close_list();
    };

    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];

        if (code_lines !== null) {
            if (line.startsWith('```')) {
                html.push(`<pre><code class="language-${escape_html(code_language)}">${escape_html(code_lines.join('\n'))}</code></pre>`);
                code_lines = null;
                code_language = '';
            } else {
                code_lines.push(line);
            }
            continue;
        }

        const code_match = line.match(/^```(.*)$/);
        if (code_match) {
            flush_blocks();
            code_lines = [];
            code_language = code_match[1].trim();
            continue;
        }

        if (line.trim() === '') {
            flush_blocks();
            continue;
        }

        if (line.startsWith('|') && lines[index + 1] && is_markdown_table_separator(lines[index + 1])) {
            flush_blocks();
            const headers = split_markdown_table_row(line);
            const rows = [];
            index += 2;

            while (index < lines.length && lines[index].startsWith('|')) {
                rows.push(split_markdown_table_row(lines[index]));
                index += 1;
            }
            index -= 1;

            html.push('<div class="markdown-table-wrap"><table><thead><tr>');
            headers.forEach((header) => html.push(`<th>${render_inline_markdown(header)}</th>`));
            html.push('</tr></thead><tbody>');
            rows.forEach((row) => {
                html.push('<tr>');
                row.forEach((cell) => html.push(`<td>${render_inline_markdown(cell)}</td>`));
                html.push('</tr>');
            });
            html.push('</tbody></table></div>');
            continue;
        }

        const heading_match = line.match(/^(#{1,3})\s+(.+)$/);
        if (heading_match) {
            flush_blocks();
            const level = heading_match[1].length;
            html.push(`<h${level}>${render_inline_markdown(heading_match[2])}</h${level}>`);
            continue;
        }

        const quote_match = line.match(/^>\s?(.*)$/);
        if (quote_match) {
            flush_blocks();
            html.push(`<blockquote><p>${render_inline_markdown(quote_match[1])}</p></blockquote>`);
            continue;
        }

        const unordered_match = line.match(/^\s*[-*]\s+(.+)$/);
        const ordered_match = line.match(/^\s*\d+\.\s+(.+)$/);
        if (unordered_match || ordered_match) {
            flush_paragraph();
            const next_list_type = unordered_match ? 'ul' : 'ol';
            if (list_type !== next_list_type) {
                close_list();
                list_type = next_list_type;
                html.push(`<${list_type}>`);
            }
            html.push(`<li>${render_inline_markdown((unordered_match || ordered_match)[1])}</li>`);
            continue;
        }

        paragraph.push(line.trim());
    }

    if (code_lines !== null) {
        html.push(`<pre><code>${escape_html(code_lines.join('\n'))}</code></pre>`);
    }
    flush_blocks();

    return html.join('');
}

function build_document_toc(view) {
    const content = view.querySelector('[data-document-content]');
    const toc = view.querySelector('[data-document-toc]');
    const used_slugs = new Map();
    const headings = [...content.querySelectorAll('h2, h3')];

    headings.forEach((heading) => {
        const base_slug = slugify_heading(heading.textContent) || 'sekcja';
        const occurrence = used_slugs.get(base_slug) || 0;
        used_slugs.set(base_slug, occurrence + 1);
        heading.id = occurrence === 0 ? base_slug : `${base_slug}-${occurrence + 1}`;
    });

    toc.innerHTML = headings
        .map((heading) => `<a class="level-${heading.tagName.slice(1)}" href="#${heading.id}" data-document-anchor="${heading.id}">${escape_html(heading.textContent)}</a>`)
        .join('');
}

function extract_markdown_section(markdown, section_id) {
    if (!section_id) {
        return markdown;
    }

    const lines = markdown.split('\n');
    const start_index = lines.findIndex((line) => {
        const heading = line.match(/^(#{1,3})\s+(.+)$/);
        return heading && slugify_heading(heading[2]) === section_id;
    });

    if (start_index === -1) {
        return markdown;
    }

    const start_heading = lines[start_index].match(/^(#{1,3})\s+(.+)$/);
    const start_level = start_heading[1].length;
    let end_index = lines.length;

    for (let index = start_index + 1; index < lines.length; index += 1) {
        const heading = lines[index].match(/^(#{1,3})\s+(.+)$/);

        if (heading && heading[1].length <= start_level) {
            end_index = index;
            break;
        }
    }

    const section_lines = lines.slice(start_index, end_index);
    section_lines[0] = `# ${start_heading[2]}`;

    return section_lines.join('\n').trim();
}

async function load_document(view_name) {
    const view = document.querySelector(`[data-view="${view_name}"][data-document-src]`);
    if (!view) {
        return;
    }

    if (view.dataset.documentLoaded === 'true') {
        return;
    }

    const source = view.dataset.documentSrc;
    const content = view.querySelector('[data-document-content]');

    try {
        let markdown = document_cache.get(source);
        if (!markdown) {
            const response = await fetch(source, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            markdown = await response.text();
            document_cache.set(source, markdown);
        }

        const visible_markdown = extract_markdown_section(
            markdown,
            view.dataset.documentSection || '',
        );
        content.innerHTML = render_markdown(visible_markdown);
        build_document_toc(view);
        view.dataset.documentLoaded = 'true';
    } catch (error) {
        content.innerHTML = `<div class="markdown-error"><strong>Nie udało się załadować dokumentu.</strong><p>Otwórz prototyp przez serwer HTTP albo przejdź bezpośrednio do <a href="${escape_html(source)}" target="_blank">pliku źródłowego</a>.</p></div>`;
    }
}

function render_assumptions(view_name) {
    const data = assumptions[view_name] || assumptions.marketplace;
    assumption_title.textContent = data.title;
    assumption_content.innerHTML = `<ul>${data.items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function render_view(view_name, update_hash = true) {
    const next_view = valid_views.includes(view_name) ? view_name : 'marketplace';
    current_view = next_view;

    views.forEach((view) => {
        view.hidden = view.dataset.view !== next_view;
    });

    const is_partner = partner_views.includes(next_view);
    store_header.hidden = is_partner;
    partner_header.hidden = !is_partner;
    store_footer.hidden = is_partner;

    document.querySelectorAll('[data-go]').forEach((button) => {
        button.classList.toggle('active', button.dataset.go === next_view);
    });

    render_assumptions(next_view);
    load_document(next_view);
    close_overlays();

    if (update_hash && window.location.hash !== `#${next_view}`) {
        window.history.pushState(null, '', `#${next_view}`);
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
    window.dispatchEvent(new CustomEvent('activio:viewchange', {
        detail: { view: next_view },
    }));
}

function render_store_products() {
    const container = document.querySelector('[data-store-products]');
    const active_filter = document.querySelector('[data-store-filter].active')?.dataset.storeFilter || 'all';
    const selected_club = document.querySelector('[data-store-club]')?.value || 'all';
    const sort = document.querySelector('[data-store-sort]')?.value || 'popular';
    const products = [...document.querySelectorAll('[data-store-product]')];
    const sort_key = sort === 'price-asc'
        ? 'price'
        : sort === 'newest' ? 'newness' : 'popularity';
    const direction = sort === 'price-asc' ? 1 : -1;

    products
        .sort((left, right) => direction * (
            Number(left.dataset[sort_key]) - Number(right.dataset[sort_key])
        ))
        .forEach((product) => {
            product.hidden = (active_filter !== 'all' && product.dataset.storeCategory !== active_filter)
                || (selected_club !== 'all' && product.dataset.storeClub !== selected_club);
            container.append(product);
        });
}

document.addEventListener('click', (event) => {
    if (event.target === scenario_backdrop) {
        close_overlays();
        return;
    }

    const favorite_button = event.target.closest('[data-favorite]');
    if (favorite_button) {
        event.preventDefault();
        event.stopPropagation();
        const is_favorite = favorite_button.getAttribute('aria-pressed') !== 'true';
        favorite_button.setAttribute('aria-pressed', String(is_favorite));
        favorite_button.textContent = is_favorite ? '♥' : '♡';
        favorite_button.setAttribute('aria-label', is_favorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych');
        show_toast(is_favorite ? 'Dodano do ulubionych' : 'Usunięto z ulubionych');
        return;
    }

    const store_filter = event.target.closest('[data-store-filter]');
    if (store_filter) {
        document.querySelectorAll('[data-store-filter]').forEach((button) => {
            button.classList.toggle('active', button === store_filter);
        });
        render_store_products();
        return;
    }

    const product_filter = event.target.closest('[data-product-filter]');
    if (product_filter) {
        const category = product_filter.dataset.productFilter;
        document.querySelectorAll('[data-product-filter]').forEach((button) => {
            button.classList.toggle('active', button === product_filter);
        });
        document.querySelectorAll('.marketplace-view .product-card[data-category]').forEach((card) => {
            card.hidden = category !== 'all' && !card.dataset.category.split(' ').includes(category);
        });
        return;
    }

    const club_filter = event.target.closest('[data-club-filter]');
    if (club_filter) {
        const category = club_filter.dataset.clubFilter;
        document.querySelectorAll('[data-club-filter]').forEach((button) => {
            button.classList.toggle('active', button === club_filter);
        });
        document.querySelectorAll('.club-products .product-card[data-category]').forEach((card) => {
            card.hidden = category !== 'all' && !card.dataset.category.split(' ').includes(category);
        });
        return;
    }

    const quantity_button = event.target.closest('[data-quantity-change]');
    if (quantity_button) {
        const value = quantity_button.parentElement.querySelector('span');
        const next_quantity = Math.max(1, Number(value.textContent) + Number(quantity_button.dataset.quantityChange));
        value.textContent = String(next_quantity);
        cart_count = [...document.querySelectorAll('.quantity span')]
            .reduce((sum, quantity) => sum + Number(quantity.textContent), 0);
        document.querySelectorAll('[data-cart-count]').forEach((counter) => {
            counter.textContent = String(cart_count);
        });
        show_toast(`Ilość zaktualizowana: ${next_quantity}`);
        return;
    }

    const save_price_button = event.target.closest('[data-save-price]');
    if (save_price_button) {
        const input = save_price_button.closest('[data-offer-item]').querySelector('[data-sale-price]');
        update_offer_price(input);
        if (!save_price_button.disabled) {
            show_toast(`Cena ${format_price(Number(input.value))} została zapisana`);
        }
        return;
    }

    const demo_action = event.target.closest('[data-demo-action]');
    if (demo_action) {
        event.preventDefault();
        show_toast(demo_action.dataset.demoAction);
        return;
    }

    const document_anchor = event.target.closest('[data-document-anchor]');
    if (document_anchor) {
        event.preventDefault();
        const document_view = document_anchor.closest('.document-view');
        [...document_view.querySelectorAll('[id]')]
            .find((element) => element.id === document_anchor.dataset.documentAnchor)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    const go_button = event.target.closest('[data-go]');
    if (go_button) {
        event.preventDefault();
        render_view(go_button.dataset.go);
        return;
    }

    if (event.target.closest('[data-prototype-menu]')) {
        const should_open = !scenario_rail.classList.contains('open');
        close_overlays();
        scenario_rail.classList.toggle('open', should_open);
        scenario_backdrop.classList.toggle('open', should_open);
        return;
    }

    if (event.target.closest('[data-assumptions]')) {
        const should_open = !assumption_drawer.classList.contains('open');
        scenario_rail.classList.remove('open');
        scenario_backdrop.classList.toggle('open', should_open);
        assumption_drawer.classList.toggle('open', should_open);
        assumption_drawer.setAttribute('aria-hidden', String(!should_open));
        return;
    }

    const size_button = event.target.closest('.size-options button');
    if (size_button) {
        document.querySelectorAll('.size-options button').forEach((button) => button.classList.remove('selected'));
        size_button.classList.add('selected');
        return;
    }

    const gallery_button = event.target.closest('.gallery-thumbs button');
    if (gallery_button) {
        document.querySelectorAll('.gallery-thumbs button').forEach((button) => button.classList.remove('active'));
        gallery_button.classList.add('active');
        return;
    }

    const filter_button = event.target.closest('.filter-bar button');
    if (filter_button) {
        document.querySelectorAll('.filter-bar button').forEach((button) => button.classList.remove('active'));
        filter_button.classList.add('active');
        const filter_text = filter_button.childNodes[0].textContent.trim().toLocaleLowerCase('pl-PL');
        document.querySelectorAll('.orders-table tbody tr').forEach((row) => {
            const status = row.querySelector('.table-status')?.textContent.trim().toLocaleLowerCase('pl-PL') || '';
            row.hidden = filter_text !== 'wszystkie'
                && !status.includes(filter_text === 'problem' ? 'reklamacja' : filter_text);
        });
        return;
    }

    const payment_button = event.target.closest('.payment-options button');
    if (payment_button) {
        document.querySelectorAll('.payment-options button').forEach((button) => button.classList.remove('selected'));
        payment_button.classList.add('selected');
        return;
    }

    const delivery_option = event.target.closest('.delivery-option');
    if (delivery_option) {
        document.querySelectorAll('.delivery-option').forEach((option) => {
            option.classList.remove('selected');
            option.querySelector('input').checked = false;
        });
        delivery_option.classList.add('selected');
        delivery_option.querySelector('input').checked = true;
    }
});

const number_input = document.querySelector('[data-number-input]');
const name_input = document.querySelector('[data-name-input]');
const number_preview = document.querySelector('[data-preview-number]');
const name_preview = document.querySelector('[data-preview-name]');

number_input.addEventListener('input', () => {
    number_input.value = number_input.value.replace(/\D/g, '').slice(0, 2);
    number_preview.textContent = number_input.value || '—';
    document.querySelector('[data-number-count]').textContent = `${number_input.value.length}/2`;
});

name_input.addEventListener('input', () => {
    name_input.value = name_input.value.toLocaleUpperCase('pl-PL').slice(0, 14);
    name_preview.textContent = name_input.value || 'TWÓJ NAPIS';
    document.querySelector('[data-name-count]').textContent = `${name_input.value.length}/14`;
});

const personalization_confirm = document.querySelector('[data-personalization-confirm]');
const add_cart_button = document.querySelector('[data-add-cart]');

personalization_confirm.addEventListener('change', () => {
    add_cart_button.disabled = !personalization_confirm.checked;
});

add_cart_button.addEventListener('click', () => {
    if (add_cart_button.disabled) {
        return;
    }

    cart_count += 1;
    document.querySelectorAll('[data-cart-count]').forEach((counter) => {
        counter.textContent = String(cart_count);
    });
    show_toast('Koszulka została dodana do koszyka');
});

const checkout_confirm = document.querySelector('[data-checkout-confirm]');
const place_order_button = document.querySelector('[data-place-order]');

checkout_confirm.addEventListener('change', () => {
    place_order_button.disabled = !checkout_confirm.checked;
});

place_order_button.addEventListener('click', () => {
    if (!place_order_button.disabled) {
        render_view('confirmation');
    }
});

document.querySelector('.filter-bar input')?.addEventListener('input', (event) => {
    const phrase = event.target.value.trim().toLocaleLowerCase('pl-PL');
    document.querySelectorAll('.orders-table tbody tr').forEach((row) => {
        row.hidden = phrase !== '' && !row.textContent.toLocaleLowerCase('pl-PL').includes(phrase);
    });
});

document.querySelector('.club-view select')?.addEventListener('change', (event) => {
    show_toast(`Sortowanie: ${event.target.value}`);
});

document.querySelector('.sales-chart select')?.addEventListener('change', (event) => {
    show_toast(`Zakres wykresu: ${event.target.value}`);
});

document.querySelectorAll('[data-store-club], [data-store-sort]').forEach((select) => {
    select.addEventListener('change', render_store_products);
});

document.querySelectorAll('[data-sale-price]').forEach((input) => {
    input.addEventListener('input', () => update_offer_price(input));
});

refresh_button.addEventListener('click', reload_latest);

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        check_version();
    }
});

window.setInterval(() => check_version(), 30000);

window.addEventListener('popstate', () => {
    render_view(window.location.hash.slice(1), false);
});

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        close_overlays();
    }

    if (
        (event.key === 'Enter' || event.key === ' ')
        && event.target.matches('[role="link"][data-go], [role="button"][data-demo-action]')
    ) {
        event.preventDefault();
        if (event.target.dataset.go) {
            render_view(event.target.dataset.go);
        } else {
            show_toast(event.target.dataset.demoAction);
        }
    }
});

render_store_products();
render_view(window.location.hash.slice(1) || 'marketplace', false);
check_version(true);
