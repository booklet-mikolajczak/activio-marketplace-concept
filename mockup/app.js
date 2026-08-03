const views = [...document.querySelectorAll('[data-view]')];
const store_header = document.querySelector('[data-store-header]');
const partner_header = document.querySelector('[data-partner-header]');
const partner_mobile_nav = document.querySelector('[data-partner-mobile-nav]');
const system_header = document.querySelector('[data-system-header]');
const system_mobile_nav = document.querySelector('[data-system-mobile-nav]');
const system_sidebar = document.querySelector('[data-system-sidebar]');
const system_sidebar_backdrop = document.querySelector('.system-sidebar-backdrop');
const store_footer = document.querySelector('[data-store-footer]');
const scenario_rail = document.querySelector('[data-scenario-rail]');
const scenario_backdrop = document.querySelector('.scenario-backdrop');
const assumption_drawer = document.querySelector('[data-assumption-drawer]');
const assumption_title = document.querySelector('[data-assumption-title]');
const assumption_content = document.querySelector('[data-assumption-content]');
const toast = document.querySelector('[data-toast]');
const refresh_button = document.querySelector('[data-refresh-latest]');
const version_time = document.querySelector('[data-version-time]');
const action_dialog = document.querySelector('[data-action-dialog]');
const action_title = document.querySelector('[data-action-title]');
const action_kicker = document.querySelector('[data-action-kicker]');
const action_content = document.querySelector('[data-action-content]');

const partner_views = [
    'partner-dashboard',
    'partner-offer',
    'partner-catalog',
    'partner-listing-create',
    'partner-listing',
    'partner-orders',
    'partner-order',
    'partner-settlements',
    'partner-settlement',
    'partner-club',
    'partner-brand',
    'partner-team',
    'partner-security',
    'partner-notifications',
    'partner-listing-review',
    'partner-price-conflict',
    'partner-compliance',
    'partner-settlement-problem',
    'partner-orders-empty',
    'partner-access-denied',
];
const partner_auth_views = [
    'partner-login',
    'partner-invite',
    'partner-two-factor',
    'partner-password-reset',
];
const partner_nav_roots = {
    'partner-catalog': 'partner-offer',
    'partner-listing-create': 'partner-offer',
    'partner-listing': 'partner-offer',
    'partner-order': 'partner-orders',
    'partner-settlement': 'partner-settlements',
    'partner-brand': 'partner-club',
    'partner-team': 'partner-club',
    'partner-security': 'partner-club',
    'partner-listing-review': 'partner-offer',
    'partner-price-conflict': 'partner-offer',
    'partner-compliance': 'partner-club',
    'partner-settlement-problem': 'partner-settlements',
    'partner-orders-empty': 'partner-orders',
    'partner-access-denied': 'partner-dashboard',
};
const system_views = [
    'system-dashboard',
    'system-clubs',
    'system-club',
    'system-catalog',
    'system-catalog-guide',
    'system-catalog-product',
    'system-catalog-variant',
    'system-listings',
    'system-orders',
    'system-cases',
    'system-settlements',
    'system-settlement',
    'system-audit',
    'system-users',
    'system-order-exception',
    'system-case-resolution',
    'system-club-suspension',
    'system-catalog-impact',
    'system-settlement-problem',
    'system-integrations',
];
const system_nav_roots = {
    'system-club': 'system-clubs',
    'system-catalog-guide': 'system-catalog',
    'system-catalog-product': 'system-catalog',
    'system-catalog-variant': 'system-catalog',
    'system-cases': 'system-orders',
    'system-settlement': 'system-settlements',
    'system-order-exception': 'system-orders',
    'system-case-resolution': 'system-orders',
    'system-club-suspension': 'system-clubs',
    'system-catalog-impact': 'system-catalog',
    'system-settlement-problem': 'system-settlements',
};
const valid_views = views.map((view) => view.dataset.view);
const document_cache = new Map();
const loaded_document_timestamp = Date.parse(document.lastModified) || Date.now();
let known_version_signature = null;
let version_check_in_progress = false;
let store_show_all = false;

const clubs = {
    stal: {
        name: 'KS Stal Pleszew',
        city: 'Pleszew',
        logo: '../assets/clubs/stal-pleszew.png',
        since: '1924',
        products: 4,
        support_base: 20,
        academy_count: 146,
        intro: 'Od 1924 roku gramy dla Pleszewa. Kupując tutaj, wspierasz szkolenie dzieci i młodzieży.',
        story: 'Stal Pleszew łączy lokalną społeczność, drużyny seniorskie i akademię. Sklep pomaga finansować szkolenie młodych zawodników oraz codzienną działalność klubu.',
        gradient: 'linear-gradient(110deg, #101933 0 60%, #2a3963)',
    },
    kks: {
        name: 'KKS Kalisz',
        city: 'Kalisz',
        logo: '../assets/clubs/kks-kalisz.webp',
        since: '1925',
        products: 4,
        support_base: 8,
        academy_count: 184,
        intro: 'Niebiesko-biało-zielone barwy łączą kibiców z Kalisza. Każdy zakup wspiera rozwój klubowej akademii.',
        story: 'KKS Kalisz buduje sportową społeczność miasta wokół pierwszej drużyny i szkolenia młodzieży. Oficjalny sklep pozwala kibicom wspierać klub przy każdym zamówieniu.',
        gradient: 'linear-gradient(110deg, #12517e 0 55%, #1d7e55)',
    },
    pogon: {
        name: 'KS Pogoń Nowe Skalmierzyce',
        city: 'Nowe Skalmierzyce',
        logo: '../assets/clubs/pogon-nowe-skalmierzyce.webp',
        since: '1921',
        products: 4,
        support_base: 12,
        academy_count: 112,
        intro: 'Pogoń od pokoleń rozwija piłkę nożną w Nowych Skalmierzycach. Zakupy wspierają drużyny i szkolenie młodzieży.',
        story: 'Pogoń Nowe Skalmierzyce opiera się na lokalnej tożsamości, pracy trenerów i zaangażowaniu rodzin zawodników. Sklep daje społeczności prosty sposób wspierania klubu.',
        gradient: 'linear-gradient(110deg, #111a49 0 55%, #323985)',
    },
    jarota: {
        name: 'JKS Jarota Jarocin',
        city: 'Jarocin',
        logo: '../assets/clubs/jarota-jarocin.png',
        since: '1998',
        products: 4,
        support_base: 10,
        academy_count: 158,
        intro: 'Fioletowe barwy Jaroty są częścią sportowej historii Jarocina. Kupując oficjalny produkt, wspierasz klubowe szkolenie.',
        story: 'Jarota Jarocin rozwija zawodników i reprezentuje miasto na piłkarskich boiskach. Oficjalna kolekcja pozwala kibicom pokazywać barwy i finansowo wspierać szkolenie.',
        gradient: 'linear-gradient(110deg, #160d50 0 55%, #453291)',
    },
    activio: {
        name: 'ACTIVIO',
        city: 'Polska',
        logo: '../assets/brand/activio-logo.svg',
        products: 1,
    },
};

const products = {
    shirt: {
        name: 'Koszulka klubowa z personalizacją',
        price: 129,
        image: '../assets/products/koszulki-sportowe.jpg',
        lead: 'Lekka koszulka sportowa w oficjalnych barwach klubu. Wybierz swój numer i nazwisko.',
        option_label: 'Rozmiar',
        options: ['128', '140', '152', 'S', 'M', 'L', 'XL'],
        number_label: 'Numer zawodnika',
        name_label: 'Nazwisko lub pseudonim',
        has_size_guide: true,
    },
    hoodie: {
        name: 'Bluza klubowa z kapturem',
        activio_name: 'Bluza ACTIVIO Team',
        price: 179,
        image: '../assets/products/bluzy.jpg',
        lead: 'Ciepła bluza z trwałym nadrukiem. Wybierz rozmiar oraz kontrolowaną personalizację tekstową.',
        option_label: 'Rozmiar',
        options: ['128', '140', '152', 'S', 'M', 'L', 'XL'],
        number_label: 'Numer zawodnika',
        name_label: 'Nazwisko lub pseudonim',
        has_size_guide: true,
    },
    mug: {
        name: 'Kubek klubowy z imieniem',
        price: 49,
        image: '../assets/products/kubki.jpg',
        lead: 'Ceramiczny kubek 330 ml z herbem klubu. Dodaj imię lub numer w dopuszczonym polu personalizacji.',
        option_label: 'Kolor kubka',
        options: ['Biały', 'Granatowy'],
        number_label: 'Numer',
        name_label: 'Imię lub krótki napis',
        has_size_guide: false,
    },
    stickers: {
        name: 'Zestaw naklejek i magnesów',
        price: 29,
        image: '../assets/products/breloki.jpg',
        lead: 'Zestaw sześciu trwałych elementów w oficjalnych barwach klubu, wykonywany po złożeniu zamówienia.',
        option_label: 'Wariant zestawu',
        options: ['6 szt.', '12 szt.', '24 szt.'],
        number_label: 'Numer',
        name_label: 'Imię lub krótki napis',
        has_size_guide: false,
    },
    bag: {
        name: 'Torba sportowa z herbem',
        price: 69,
        image: '../assets/products/karty-zawodnika.jpg',
        lead: 'Praktyczna torba z zatwierdzonym herbem klubu oraz kontrolowaną personalizacją tekstową.',
        option_label: 'Pojemność',
        options: ['20 l', '35 l', '50 l'],
        number_label: 'Numer zawodnika',
        name_label: 'Imię lub nazwisko',
        has_size_guide: false,
    },
    cap: {
        name: 'Czapka klubowa z daszkiem',
        price: 59,
        image: '../assets/products/activio-czapka.jpg',
        lead: 'Bawełniana czapka pięciopanelowa z regulacją oraz oznaczeniem w oficjalnych barwach klubu.',
        option_label: 'Kolor',
        options: ['Granatowa', 'Czarna', 'Biała'],
        number_label: 'Numer',
        name_label: 'Krótki napis',
        has_size_guide: false,
    },
    clock: {
        name: 'Zegar klubowy z pleksi',
        price: 89,
        image: '../assets/products/activio-zegar.jpg',
        lead: 'Personalizowany zegar ścienny z herbem klubu, nadrukiem UV i kompletnym mechanizmem.',
        option_label: 'Rozmiar',
        options: ['30 × 30 cm', '40 × 40 cm'],
        number_label: 'Numer',
        name_label: 'Dedykacja',
        has_size_guide: false,
    },
    drawstring: {
        name: 'Worek sportowy z nadrukiem',
        price: 59,
        image: '../assets/products/activio-worek.png',
        lead: 'Bawełniany worek treningowy ze wzmocnionymi rogami, herbem i tekstem personalizacji.',
        option_label: 'Kolor',
        options: ['Czarny', 'Granatowy', 'Naturalny'],
        number_label: 'Numer zawodnika',
        name_label: 'Imię lub nazwisko',
        has_size_guide: false,
    },
    pencilcase: {
        name: 'Piórnik klubowy',
        price: 49,
        image: '../assets/products/activio-piornik.jpg',
        lead: 'Lekki piórnik z klubowym nadrukiem, zamkiem błyskawicznym i miejscem na krótki podpis.',
        option_label: 'Wariant',
        options: ['Klasyczny', 'Z karabinkiem'],
        number_label: 'Numer',
        name_label: 'Imię',
        has_size_guide: false,
    },
    medal: {
        name: 'Medal klubowy z personalizacją',
        price: 39,
        image: '../assets/products/activio-medale.jpg',
        lead: 'Indywidualny medal dla turnieju, ligi albo klubowego wydarzenia z kolorową grafiką i dedykacją.',
        option_label: 'Wykończenie',
        options: ['Złote', 'Srebrne', 'Brązowe'],
        number_label: 'Rok',
        name_label: 'Nazwa wydarzenia',
        has_size_guide: false,
    },
    playercard: {
        name: 'Karta zawodnika',
        price: 79,
        image: '../assets/products/activio-karty-zawodnika.jpg',
        lead: 'Personalizowana karta w stylu kolekcjonerskim ze zdjęciem, herbem, numerem i nazwiskiem.',
        option_label: 'Format',
        options: ['A5', 'A4'],
        number_label: 'Numer zawodnika',
        name_label: 'Imię i nazwisko',
        has_size_guide: false,
    },
    trophy: {
        name: 'Statuetka klubowa',
        price: 99,
        image: '../assets/products/activio-statuetki.jpg',
        lead: 'Personalizowana statuetka dla zawodnika, trenera, sponsora albo zwycięzcy turnieju.',
        option_label: 'Rozmiar',
        options: ['Mała', 'Średnia', 'Duża'],
        number_label: 'Rok',
        name_label: 'Dedykacja',
        has_size_guide: false,
    },
    transfer: {
        name: 'Naklejki transferowe 3D',
        price: 39,
        image: '../assets/products/activio-naklejki-transferowe.png',
        lead: 'Wypukłe naklejki bez widocznego tła, przeznaczone do szkła, metalu, ceramiki i akrylu.',
        option_label: 'Format',
        options: ['3 × 3 cm', '5 × 5 cm', '7 × 7 cm'],
        number_label: 'Numer',
        name_label: 'Krótki napis',
        has_size_guide: false,
    },
    cosmetic: {
        name: 'Kosmetyczka klubowa',
        price: 69,
        image: '../assets/products/activio-kosmetyczka.png',
        lead: 'Wodoodporna kosmetyczka na trening i wyjazdy z klubowym nadrukiem oraz krótką personalizacją.',
        option_label: 'Kolor',
        options: ['Czarna', 'Granatowa'],
        number_label: 'Numer',
        name_label: 'Imię lub nazwisko',
        has_size_guide: false,
    },
    waistbag: {
        name: 'Nerka sportowa',
        price: 59,
        image: '../assets/products/activio-nerka.png',
        lead: 'Kompaktowa nerka z regulowanym paskiem, klubowym nadrukiem i miejscem na imię.',
        option_label: 'Kolor',
        options: ['Czarna', 'Czerwona', 'Granatowa'],
        number_label: 'Numer',
        name_label: 'Imię',
        has_size_guide: false,
    },
    plaque: {
        name: 'Podziękowanie klubowe',
        price: 119,
        image: '../assets/products/activio-podziekowania.jpg',
        lead: 'Personalizowane podziękowanie dla sponsora, trenera lub osoby wspierającej klub.',
        option_label: 'Format',
        options: ['A5', 'A4'],
        number_label: 'Rok',
        name_label: 'Dedykacja',
        has_size_guide: false,
    },
    crest: {
        name: 'Herb klubu z pleksi',
        price: 149,
        image: '../assets/products/activio-herb-pleksi.jpg',
        lead: 'Wycinany po obrysie herb z nadrukiem UV do szatni, biura albo klubowej strefy kibica.',
        option_label: 'Rozmiar',
        options: ['30 cm', '50 cm', '70 cm'],
        number_label: 'Rok',
        name_label: 'Nazwa klubu',
        has_size_guide: false,
    },
    calendar: {
        name: 'Kalendarz klubowy',
        price: 49,
        image: '../assets/products/activio-kalendarze.jpg',
        lead: 'Sezonowy kalendarz z drużyną, sponsorami i terminami ważnymi dla klubowej społeczności.',
        option_label: 'Format',
        options: ['A4', 'A3'],
        number_label: 'Rok',
        name_label: 'Nazwa drużyny',
        has_size_guide: false,
    },
    magnets: {
        name: 'Zestaw magnesów taktycznych',
        price: 39,
        image: '../assets/products/activio-magnesy-taktyczne.jpg',
        lead: 'Zestaw dla trenera z numerami zawodników i piłką, przygotowany w kolorach drużyny.',
        option_label: 'Kolor drużyny',
        options: ['Żółty', 'Niebieski', 'Czerwony'],
        number_label: 'Numer zestawu',
        name_label: 'Nazwa drużyny',
        has_size_guide: false,
    },
    poster: {
        name: 'Plakat klubowy',
        price: 35,
        image: '../assets/products/activio-plakaty.jpg',
        lead: 'Plakat promujący mecz, nabór albo wydarzenie z klubową identyfikacją i wybranym tekstem.',
        option_label: 'Format',
        options: ['A3', 'A2', 'B2'],
        number_label: 'Rok',
        name_label: 'Tytuł wydarzenia',
        has_size_guide: false,
    },
};

Object.assign(products, {
    'player-labels': {
        name: 'Naklejki i naprasowanki dla zawodnika',
        price: 29,
        image: '../assets/products/activio-naprasowanki.webp',
        lead: 'Personalizowany zestaw z herbem klubu oraz jedną, dwiema albo trzema liniami tekstu.',
        option_label: 'Wariant zestawu',
        options: ['Herb + 1 linia', 'Herb + 2 linie', 'Herb + 3 linie'],
        number_label: 'Numer zawodnika',
        name_label: 'Imię i nazwisko',
        has_size_guide: false,
    },
    'lesson-plan': {
        name: 'Plan lekcji',
        price: 29,
        image: '../assets/products/activio-plan-lekcji-concept.webp',
        lead: 'Klubowy plan lekcji z herbem, imieniem zawodnika i miejscem na tygodniowy rozkład zajęć.',
        option_label: 'Format',
        options: ['A4', 'A3'],
        number_label: 'Numer zawodnika',
        name_label: 'Imię i nazwisko',
        has_size_guide: false,
    },
    'jersey-keyring': {
        name: 'Brelok koszulka',
        price: 25,
        image: '../assets/products/breloki.jpg',
        lead: 'Brelok w kształcie klubowej koszulki z barwami drużyny, herbem, numerem i nazwiskiem.',
        option_label: 'Wykończenie',
        options: ['Błyszczące', 'Matowe'],
        number_label: 'Numer zawodnika',
        name_label: 'Nazwisko',
        has_size_guide: false,
    },
    'jersey-magnet': {
        name: 'Magnes koszulka',
        price: 25,
        image: '../assets/products/activio-magnes-koszulka-concept.webp',
        lead: 'Magnes w kształcie klubowej koszulki, personalizowany barwami, herbem, numerem i nazwiskiem.',
        option_label: 'Wykończenie',
        options: ['Błyszczące', 'Matowe'],
        number_label: 'Numer zawodnika',
        name_label: 'Nazwisko',
        has_size_guide: false,
    },
    'car-jersey': {
        name: 'Koszulka do samochodu',
        price: 39,
        image: '../assets/products/activio-koszulka-samochod-concept.webp',
        lead: 'Miniaturowa koszulka klubowa do zawieszenia w samochodzie z numerem i nazwiskiem zawodnika.',
        option_label: 'Wariant zawieszki',
        options: ['Lusterko', 'Szyba boczna'],
        number_label: 'Numer zawodnika',
        name_label: 'Nazwisko',
        has_size_guide: false,
    },
    'shoe-labels': {
        name: 'Naklejki na buty',
        price: 19,
        image: '../assets/products/activio-naklejki-buty-concept.webp',
        lead: 'Odporne naklejki do oznaczania obuwia zawodnika: herb, numer oraz krótki podpis.',
        option_label: 'Liczba naklejek',
        options: ['8 szt.', '16 szt.', '24 szt.'],
        number_label: 'Numer zawodnika',
        name_label: 'Imię lub inicjały',
        has_size_guide: false,
    },
    coaster: {
        name: 'Podkładka',
        price: 29,
        image: '../assets/products/activio-podkladka.webp',
        lead: 'Personalizowana podkładka z klubowym motywem, herbem i wybranym podpisem.',
        option_label: 'Kształt',
        options: ['Okrągła', 'Kwadratowa'],
        number_label: 'Numer zawodnika',
        name_label: 'Krótki napis',
        has_size_guide: false,
    },
    mug: {
        name: 'Kubek pasiak',
        price: 49,
        image: '../assets/products/activio-kubek-pasiak-concept.webp',
        lead: 'Ceramiczny kubek w klubowe pasy, uzupełniony herbem i personalizacją zawodnika.',
        option_label: 'Pojemność',
        options: ['330 ml', '450 ml'],
        number_label: 'Numer zawodnika',
        name_label: 'Imię lub nazwisko',
        has_size_guide: false,
    },
    playercard: {
        name: 'Karta FIFA',
        price: 79,
        image: '../assets/products/activio-karty-zawodnika.jpg',
        lead: 'Personalizowana karta zawodnika ze zdjęciem, herbem, numerem, nazwiskiem i statystykami.',
        option_label: 'Format',
        options: ['A5', 'A4'],
        number_label: 'Numer zawodnika',
        name_label: 'Imię i nazwisko',
        requires_photo: true,
        has_size_guide: false,
    },
    shirt: {
        name: 'Koszulka bawełniana z imieniem i numerem',
        price: 79,
        image: '../assets/products/activio-koszulka-bawelniana.jpg',
        lead: 'Prosta bawełniana koszulka klubowa z herbem oraz imieniem i numerem zawodnika.',
        option_label: 'Rozmiar',
        options: ['128', '140', '152', 'S', 'M', 'L', 'XL'],
        number_label: 'Numer zawodnika',
        name_label: 'Imię lub nazwisko',
        has_size_guide: true,
    },
    clock: {
        name: 'Zegar ścienny',
        price: 89,
        image: '../assets/products/activio-zegar.jpg',
        lead: 'Personalizowany zegar ścienny z herbem i klubową grafiką, gotowy do zawieszenia.',
        option_label: 'Rozmiar',
        options: ['30 × 30 cm', '40 × 40 cm'],
        number_label: 'Numer zawodnika',
        name_label: 'Krótka dedykacja',
        has_size_guide: false,
    },
    'photo-puzzle': {
        name: 'FotoPuzzle ze zdjęciem',
        price: 59,
        image: '../assets/products/activio-fotopuzzle-concept.webp',
        lead: 'Puzzle ze zdjęciem zawodnika albo drużyny, przygotowane jako klubowy prezent.',
        option_label: 'Liczba elementów',
        options: ['48', '120', '300'],
        number_label: 'Rok',
        number_max_length: 4,
        name_label: 'Podpis zdjęcia',
        requires_photo: true,
        has_size_guide: false,
    },
    'photo-canvas': {
        name: 'FotoObraz',
        price: 119,
        image: '../assets/products/activio-fotoobraz-concept.webp',
        lead: 'Zdjęcie zawodnika albo drużyny wydrukowane na płótnie i naciągnięte na blejtram.',
        option_label: 'Format',
        options: ['30 × 40 cm', '40 × 60 cm', '50 × 70 cm'],
        number_label: 'Rok',
        number_max_length: 4,
        name_label: 'Podpis zdjęcia',
        requires_photo: true,
        has_size_guide: false,
    },
    poster: {
        name: 'FotoPlakat',
        price: 49,
        image: '../assets/products/activio-plakaty.jpg',
        lead: 'Personalizowany plakat ze zdjęciem zawodnika, drużyny albo klubowego wydarzenia.',
        option_label: 'Format',
        options: ['A3', 'A2', 'B2'],
        number_label: 'Rok',
        number_max_length: 4,
        name_label: 'Tytuł lub podpis',
        requires_photo: true,
        has_size_guide: false,
    },
    calendar: {
        name: 'FotoKalendarz',
        price: 59,
        image: '../assets/products/activio-kalendarze.jpg',
        lead: 'Klubowy kalendarz ze zdjęciem zawodnika albo drużyny i wybranym podpisem.',
        option_label: 'Format',
        options: ['A4', 'A3'],
        number_label: 'Rok',
        number_max_length: 4,
        name_label: 'Nazwa drużyny',
        requires_photo: true,
        has_size_guide: false,
    },
});

const final_catalog = [
    { id: 'player-labels', sku: 'CAT-NN-001', category: 'personalization', category_label: 'Personalizacja zawodnika', minimum: 19, variants: '3 układy tekstu', personalization: 'Herb + 1/2/3 linie', production: '2–4 dni', clubs: 14, popularity: 93 },
    { id: 'lesson-plan', sku: 'CAT-PL-002', category: 'gifts', category_label: 'Gadżety użytkowe', minimum: 19, variants: '2 formaty', personalization: 'Herb + imię', production: '2–4 dni', clubs: 11, popularity: 78 },
    { id: 'jersey-keyring', sku: 'CAT-BK-003', category: 'mini', category_label: 'Mini koszulki', minimum: 15, variants: '2 wykończenia', personalization: 'Numer + nazwisko', production: '2–4 dni', clubs: 15, popularity: 96 },
    { id: 'jersey-magnet', sku: 'CAT-MK-004', category: 'mini', category_label: 'Mini koszulki', minimum: 15, variants: '2 wykończenia', personalization: 'Numer + nazwisko', production: '2–4 dni', clubs: 13, popularity: 89 },
    { id: 'car-jersey', sku: 'CAT-KS-005', category: 'mini', category_label: 'Mini koszulki', minimum: 25, variants: '2 zawieszki', personalization: 'Numer + nazwisko', production: '3–5 dni', clubs: 12, popularity: 87 },
    { id: 'shoe-labels', sku: 'CAT-NB-006', category: 'personalization', category_label: 'Personalizacja zawodnika', minimum: 12, variants: '3 zestawy', personalization: 'Herb + numer + imię', production: '2–3 dni', clubs: 10, popularity: 82 },
    { id: 'coaster', sku: 'CAT-PD-007', category: 'gifts', category_label: 'Gadżety użytkowe', minimum: 19, variants: '2 kształty', personalization: 'Herb + podpis', production: '2–4 dni', clubs: 9, popularity: 74 },
    { id: 'mug', sku: 'CAT-KP-008', category: 'gifts', category_label: 'Gadżety użytkowe', minimum: 29, variants: '2 pojemności', personalization: 'Herb + imię + numer', production: '2–4 dni', clubs: 15, popularity: 94 },
    { id: 'playercard', sku: 'CAT-KF-009', category: 'player', category_label: 'Dla zawodnika', minimum: 49, variants: '2 formaty', personalization: 'Zdjęcie + dane + statystyki', production: '3–5 dni', clubs: 14, popularity: 98 },
    { id: 'shirt', sku: 'CAT-KB-010', category: 'player', category_label: 'Dla zawodnika', minimum: 59, variants: '7 rozmiarów', personalization: 'Imię + numer', production: '3–5 dni', clubs: 15, popularity: 97 },
    { id: 'clock', sku: 'CAT-ZS-011', category: 'decor', category_label: 'Dekoracje', minimum: 69, variants: '2 rozmiary', personalization: 'Herb + grafika', production: '3–5 dni', clubs: 12, popularity: 85 },
    { id: 'photo-puzzle', sku: 'CAT-FP-012', category: 'photo', category_label: 'Foto produkty', minimum: 39, variants: '3 liczby elementów', personalization: 'Zdjęcie + podpis', production: '3–5 dni', clubs: 8, popularity: 81 },
    { id: 'photo-canvas', sku: 'CAT-FO-013', category: 'photo', category_label: 'Foto produkty', minimum: 89, variants: '3 formaty', personalization: 'Zdjęcie + podpis', production: '4–6 dni', clubs: 7, popularity: 76 },
    { id: 'poster', sku: 'CAT-FL-014', category: 'photo', category_label: 'Foto produkty', minimum: 29, variants: '3 formaty', personalization: 'Zdjęcie + podpis', production: '2–4 dni', clubs: 11, popularity: 83 },
    { id: 'calendar', sku: 'CAT-FK-015', category: 'photo', category_label: 'Foto produkty', minimum: 39, variants: '2 formaty', personalization: 'Zdjęcie + podpis', production: '3–5 dni', clubs: 13, popularity: 91 },
].map((entry, index) => ({ ...entry, newness: 15 - index }));

const catalog_categories = [
    { id: 'personalization', label: 'Personalizacja zawodnika', lead: 'Oznacz sprzęt i przygotuj zestaw dla zawodnika.' },
    { id: 'mini', label: 'Mini koszulki', lead: 'Klubowe koszulki w formie breloka, magnesu i zawieszki.' },
    { id: 'gifts', label: 'Gadżety użytkowe', lead: 'Produkty używane w szkole, domu i klubie.' },
    { id: 'player', label: 'Dla zawodnika', lead: 'Personalizowane produkty z imieniem, numerem i zdjęciem.' },
    { id: 'decor', label: 'Dekoracje', lead: 'Klubowe elementy do pokoju zawodnika i kibica.' },
    { id: 'photo', label: 'Foto produkty', lead: 'Zdjęcia drużyny i zawodnika w kilku gotowych formatach.' },
];

const concept_product_ids = new Set([
    'lesson-plan',
    'jersey-magnet',
    'car-jersey',
    'shoe-labels',
    'mug',
    'photo-puzzle',
    'photo-canvas',
]);

const assumptions = {
    marketplace: {
        title: 'Strona główna ACTIVIO',
        items: [
            'Strona główna rozdziela trzy usługi: Druk dla Klubów, ACTIVIO Club i Market.',
            'Produkty klubów i produkty własne ACTIVIO są sprzedawane w Markecie oraz dodawane do jednego koszyka.',
            'ACTIVIO jest jedynym sprzedawcą, a kluby są partnerami i licencjodawcami marki.',
        ],
    },
    about: {
        title: 'O ACTIVIO',
        items: [
            'Podstrona przedstawia ACTIVIO jako drukarnię i operatora całego procesu klubowego produktu.',
            'Komunikacja obejmuje produkcję, personalizację, sprzedaż i wysyłkę, bez przypisywania klubom roli sprzedawcy.',
            'Deklaracje o firmie i realizacji należy przed publikacją potwierdzić z właścicielem marki.',
        ],
    },
    contact: {
        title: 'Kontakt z ACTIVIO',
        items: [
            'Dane kontaktowe odpowiadają informacjom publikowanym obecnie na activio.pl.',
            'Formularz rozdziela zapytania produktowe, program partnerski oraz sprawy istniejących zamówień.',
            'W gotowym systemie wysłanie formularza wymaga obsługi zgód, polityki prywatności, ochrony antyspamowej i potwierdzenia dostarczenia.',
        ],
    },
    offer: {
        title: 'Oferta dla klubów',
        items: [
            'Oferta to usługa druku i produkcji kierowana bezpośrednio do organizacji sportowych.',
            'Katalog zawiera 15 pozycji z finalnej listy produktowej przekazanej 3 sierpnia 2026.',
            'Kategorie są warstwą nawigacyjną prototypu; lista produktów jest źródłem nadrzędnym.',
            'Produkt prowadzi do formularza zapytania B2B z uzupełnionym tematem, nie do koszyka konsumenckiego.',
            'Katalog i producenci są kontrolowani przez ACTIVIO.',
            'Pokazane ceny i minima są przykładowe do czasu przekazania finalnego cennika.',
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
    'club-program': {
        title: 'Landing programu ACTIVIO Club',
        items: [
            'Landing wyjaśnia model partnerski przed przejściem do formularza kontaktowego lub panelu demonstracyjnego.',
            'ACTIVIO pozostaje sprzedawcą i obsługuje produkcję, płatności, wysyłkę oraz klienta.',
            'Klub wybiera zatwierdzone produkty, ustala ceny ponad minimum i otrzymuje wynagrodzenie zapisane per pozycja zamówienia.',
            'Kwoty, stawki i rozliczenia pokazane w prototypie są przykładami koncepcyjnymi, nie ofertą handlową.',
        ],
    },
    store: {
        title: 'Market ACTIVIO',
        items: [
            'Market łączy produkty klubów oraz dopuszczone produkty własne ACTIVIO.',
            'Katalog dzieli ofertę na najpopularniejsze produkty, nowości i pozostałe pozycje.',
            'Produkty można filtrować według kategorii i klubu oraz sortować według popularności, ceny lub daty dodania.',
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
    'partner-listing': {
        title: 'Szczegóły produktu',
        items: [
            'Minimum ACTIVIO jest wersjonowane osobno dla wariantu i typu personalizacji.',
            'Prognoza wynagrodzenia klubu nie wynika automatycznie z różnicy między ceną detaliczną a minimum.',
            'Publikacja wymaga zaakceptowanego projektu, aktualnej licencji i poprawnej ceny.',
            'Wstrzymanie listingu nie usuwa historii cen, projektów ani wcześniejszych zamówień.',
        ],
    },
    'partner-order': {
        title: 'Szczegóły zamówienia',
        items: [
            'Klub widzi wyłącznie własną pozycję, nie pełny mieszany koszyk.',
            'Adres, telefon, e-mail i dane płatności kupującego pozostają po stronie ACTIVIO.',
            'ACTIVIO obsługuje produkcję, dostawę, zwroty i reklamacje; klub widzi ich wpływ na rozliczenie.',
            'Każde wejście w szczegóły pozycji podlega audytowi.',
        ],
    },
    'partner-settlement': {
        title: 'Okres rozliczeniowy',
        items: [
            'To miesięczne rozliczenie zobowiązania, nie portfel ani wypłata środków na żądanie.',
            'ACTIVIO zamyka okres, klub przekazuje właściwy dokument, a wypłatę zatwierdza ACTIVIO.',
            'Korekty pozostają osobnymi wpisami i są widoczne w zestawieniu.',
            'Zmiana rachunku wymaga ponownego uwierzytelnienia i drugiego składnika.',
        ],
    },
    'partner-club': {
        title: 'Dane klubu i umowa',
        items: [
            'Dane formalne i podatkowe są weryfikowane przed uruchomieniem sprzedaży i rozliczeń.',
            'Zmiana danych organizacji jest zgłoszeniem do weryfikacji, nie natychmiastową edycją rekordu.',
            'Umowa określa model wynagrodzenia, częstotliwość rozliczeń i prawa do marki.',
        ],
    },
    'partner-brand': {
        title: 'Marka i witryna',
        items: [
            'Pliki marki są wersjonowane; produkty wskazują konkretną zaakceptowaną wersję.',
            'Klub potwierdza prawo ACTIVIO do użycia nazwy, herbu i przekazanych treści.',
            'Wygaśnięcie albo wycofanie licencji może wstrzymać zależne listingi.',
            'Treści witryny publikuje ACTIVIO po sprawdzeniu.',
        ],
    },
    'partner-team': {
        title: 'Zespół i role',
        items: [
            'Każda osoba korzysta z własnego konta; współdzielenie loginu nie jest dopuszczone.',
            'Role rozdzielają ofertę, rozliczenia, markę oraz administrację użytkownikami.',
            'Eksporty i zmiany uprawnień są zapisywane w dzienniku audytowym.',
        ],
    },
    'partner-security': {
        title: 'Bezpieczeństwo',
        items: [
            'Dla administratora i księgowości wymagamy 2FA.',
            'Zmiana rachunku bankowego wymaga ponownego podania hasła i kodu 2FA.',
            'Logowania, eksporty, zmiany finansowe i dostęp do zamówień są audytowane.',
        ],
    },
    'partner-notifications': {
        title: 'Powiadomienia',
        items: [
            'Komunikaty prowadzą do konkretnego produktu, rozliczenia, zamówienia albo ustawienia.',
            'Najważniejsze alerty dotyczą ceny minimalnej, dokumentów, praw do marki i bezpieczeństwa.',
            'Oznaczenie jako przeczytane nie usuwa komunikatu ani śladu wysyłki.',
        ],
    },
    'system-dashboard': {
        title: 'Operacje ACTIVIO',
        items: [
            'To zaplecze BOK i operacji ACTIVIO w istniejącym Systemie, nie panel klubu ani nowy produkt sklepowy.',
            'Kolejki łączą dane domeny Activio ze statusami ShopSystem, ale nie kopiują jego odpowiedzialności.',
            'Decyzje operatora, ponowienia i zmiany statusów są audytowane.',
        ],
    },
    'system-clubs': {
        title: 'Kluby i onboarding',
        items: [
            'Klub jest partnerem domeny Activio, nie osobnym Shop ani Offer w ShopSystem.',
            'Sprzedaż można uruchomić dopiero po umowie, weryfikacji organizacji, praw do marki i rachunku.',
            'Status ograniczony pozwala blokować wybrane procesy bez usuwania historii partnera.',
        ],
    },
    'system-club': {
        title: 'Karta klubu',
        items: [
            'Karta agreguje dane partnera i odsyła do listingów, rozliczeń oraz audytu.',
            'Wrażliwe zmiany wymagają powodu, odpowiednich uprawnień i śladu decyzji.',
            'Panel klubu otwierany z Systemu pozostaje objęty izolacją tenantową.',
        ],
    },
    'system-catalog': {
        title: 'Katalog i minima',
        items: [
            'ACTIVIO kontroluje szablony produktów, producentów, warianty i dostępne personalizacje.',
            'Minimum jest wersjonowane per wariant i personalizację oraz może obowiązywać od przyszłej daty.',
            'Zmiana minimum wskazuje dotknięte listingi; nie nadpisuje ceny ustalonej przez klub.',
        ],
    },
    'system-listings': {
        title: 'Projekty i listingi',
        items: [
            'Publikacja wymaga zgodnej ceny, zaakceptowanego projektu, aktywnych praw do marki i kontroli ACTIVIO.',
            'Akceptacja klubu nie oznacza automatycznej publikacji.',
            'Każda wersja projektu, ceny i statusu pozostaje w historii.',
        ],
    },
    'system-orders': {
        title: 'Zamówienia i wyjątki',
        items: [
            'ShopSystem pozostaje źródłem transakcji, płatności, produkcji i wysyłki.',
            'Activio przechowuje powiązanie pozycji z klubem, listingiem, personalizacją i snapshotem rozliczenia.',
            'Widok operacyjny służy obsłudze wyjątków, nie tworzy drugiego systemu zamówień.',
        ],
    },
    'system-cases': {
        title: 'Reklamacje i korekty',
        items: [
            'ACTIVIO odpowiada klientowi i podejmuje decyzję reklamacyjną.',
            'Ponowna produkcja nie zawsze oznacza korektę wynagrodzenia klubu.',
            'Uznana korekta tworzy nowy wpis ledgeru i nie usuwa pierwotnego naliczenia.',
        ],
    },
    'system-settlements': {
        title: 'Rozliczenia klubów',
        items: [
            'Okresy są zamykane miesięcznie, a wypłaty zatwierdzane ręcznie przez ACTIVIO.',
            'Dokument, VAT, rachunek, korekty i saldo muszą być zgodne przed wypłatą.',
            'To księga zobowiązań i proces rozliczeniowy, nie portfel płatniczy.',
        ],
    },
    'system-settlement': {
        title: 'Akceptacja wypłaty',
        items: [
            'Operator zatwierdza dokument i tworzy zlecenie wypłaty dopiero po kompletnej kontroli.',
            'Zmiana rachunku albo statusu podatkowego blokuje proces do ponownej weryfikacji.',
            'Decyzja i jej uzasadnienie są nieedytowalnym zdarzeniem audytowym.',
        ],
    },
    'system-audit': {
        title: 'Audyt operacyjny',
        items: [
            'Zdarzenia przechodzą z correlation ID przez ShopSystem, Activio i procesy operacyjne.',
            'Ponowienia używają idempotency key, więc nie mogą dublować naliczeń, korekt ani wypłat.',
            'Uzgodnienie kontrolne porównuje źródłowe pozycje zamówień ze snapshotami i ledgerem.',
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
    'project-research': {
        title: 'Research regulacyjny',
        items: [
            'To materiał źródłowy wspierający decyzje, a nie porada prawna ani zatwierdzona interpretacja.',
            'Wnioski dotyczące sprzedawcy, personalizacji, danych, płatności i raportowania wymagają potwierdzenia z prawnikiem i księgowym.',
        ],
    },
};

Object.assign(assumptions, {
    'payment-failed': { title: 'Nieudana płatność', items: ['Nieudana próba nie uruchamia produkcji ani naliczenia klubu.', 'Ponowienie dotyczy tego samego koszyka i nie może pobrać kwoty podwójnie.'] },
    'order-not-found': { title: 'Nie znaleziono zamówienia', items: ['Komunikat nie ujawnia, czy numer albo e-mail istnieje.', 'Odzyskanie numeru odbywa się przez zweryfikowany kanał klienta.'] },
    'customer-order-problem': { title: 'Niewykonalna pozycja', items: ['Decyzję podejmujemy per pozycja mieszanego koszyka.', 'Częściowy zwrot i korekta klubowa są osobnymi zapisami.'] },
    'customer-return': { title: 'Zwrot standardowego produktu', items: ['Odstąpienie dotyczy produktu niewykonanego według specyfikacji klienta.', 'Produkt personalizowany nadal może podlegać reklamacji.'] },
    'partner-login': { title: 'Logowanie partnera', items: ['Każda osoba ma indywidualne konto.', 'Panel partnera korzysta z istniejącego mechanizmu logowania, jeśli potwierdzi to spike techniczny.'] },
    'partner-invite': { title: 'Aktywacja zaproszenia', items: ['Zaproszenie jest jednorazowe i przypisane do osoby oraz roli.', 'Aktywacja ownera kończy się konfiguracją 2FA.'] },
    'partner-two-factor': { title: 'Weryfikacja dwuetapowa', items: ['Owner i księgowość wymagają drugiego składnika.', 'Odzyskanie 2FA wymaga osobnej weryfikacji tożsamości.'] },
    'partner-password-reset': { title: 'Reset hasła', items: ['Komunikat nie potwierdza istnienia konta.', 'Zmiana hasła unieważnia pozostałe sesje i nie omija 2FA.'] },
    'partner-listing-review': { title: 'Listing zwrócony do poprawy', items: ['Odrzucona wersja pozostaje w historii.', 'Ponowne przekazanie tworzy nową wersję projektu.'] },
    'partner-price-conflict': { title: 'Konflikt ceny minimalnej', items: ['ACTIVIO nie nadpisuje ceny ustalonej przez klub.', 'Brak reakcji wstrzymuje tylko dotknięty wariant.'] },
    'partner-compliance': { title: 'Wygasłe prawa do marki', items: ['Wygaśnięcie licencji blokuje nową sprzedaż zależnych listingów.', 'Opłacone zamówienia zachowują utrwaloną wersję licencji.'] },
    'partner-settlement-problem': { title: 'Problem rozliczenia', items: ['Odrzucony dokument jest zastępowany nową wersją.', 'Klub nie ponawia samodzielnie wypłaty na niezweryfikowany rachunek.'] },
    'partner-orders-empty': { title: 'Pusty stan sprzedaży', items: ['Pusty widok wskazuje następne sensowne działanie.', 'Klub nadal nie tworzy dowolnego produktu poza katalogiem ACTIVIO.'] },
    'partner-access-denied': { title: 'Brak uprawnienia', items: ['Kontrola działa na poziomie akcji i zasobu, nie tylko widoczności przycisku.', 'Niedozwolona próba pozostawia ślad audytowy.'] },
    'system-order-exception': { title: 'Wyjątek realizacji', items: ['ShopSystem pozostaje źródłem produkcji, a ACTIVIO prowadzi decyzję biznesową.', 'Anulowanie jednej pozycji nie usuwa pozostałych pozycji ani historii.'] },
    'system-case-resolution': { title: 'Decyzja reklamacyjna', items: ['Skutek finansowy zależy od przyczyny i odpowiedzialności.', 'Decyzja jest zapisana per pozycja i nie usuwa pierwotnego naliczenia.'] },
    'system-club-suspension': { title: 'Zawieszenie partnera', items: ['Zakres blokady jest jawny i analizowany przed zapisem.', 'Zamówienia w toku, historia oraz ledger nie znikają.'] },
    'system-catalog-impact': { title: 'Archiwizacja produktu bazowego', items: ['Produkt używany przez kluby wymaga analizy wpływu i planu migracji.', 'Snapshoty i opłacone zamówienia pozostają odtwarzalne.'] },
    'system-settlement-problem': { title: 'Nieudana wypłata', items: ['Nieudana próba nie tworzy nowego zobowiązania.', 'Ponowienie wymaga zweryfikowanego rachunku, nowej próby i audytu.'] },
    'system-integrations': { title: 'Integracje i ponowienia', items: ['Każde ponowienie jest idempotentne i powiązane z correlation ID.', 'Operator sprawdza skutek biznesowy przed ręcznym ponowieniem.'] },
});

let current_view = 'marketplace';
let current_club_id = 'stal';
let current_product_id = 'shirt';
let current_product_club_id = 'stal';
let order_status_filter = 'wszystkie';
let order_search_phrase = '';
let use_case_role_filter = 'all';
let use_case_kind_filter = 'all';
let cart_items = [
    {
        key: 'stal-shirt-m-10-kowalski',
        club_id: 'stal',
        product_id: 'shirt',
        option: 'M',
        number: '10',
        name: 'KOWALSKI',
        quantity: 1,
    },
    {
        key: 'kks-mug-bialy-ola',
        club_id: 'kks',
        product_id: 'mug',
        option: 'Biały',
        number: '',
        name: 'OLA',
        quantity: 1,
    },
];
let cart_count = 2;
let toast_timeout;
let overlay_trigger = null;

function close_overlays(restore_focus = false) {
    scenario_rail.classList.remove('open');
    scenario_rail.setAttribute('aria-hidden', 'true');
    scenario_rail.inert = true;
    scenario_backdrop.classList.remove('open');
    assumption_drawer.classList.remove('open');
    assumption_drawer.setAttribute('aria-hidden', 'true');
    assumption_drawer.inert = true;
    document.querySelector('[data-prototype-menu-trigger]').setAttribute('aria-expanded', 'false');
    document.querySelectorAll('[data-assumptions]').forEach((button) => {
        if (!button.closest('[data-assumption-drawer]')) {
            button.setAttribute('aria-expanded', 'false');
        }
    });

    if (restore_focus) {
        overlay_trigger?.focus();
    }
    overlay_trigger = null;
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
        '../docs/activio_marketplace_research.md',
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
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function cart_item_details(item) {
    const details = [item.option];
    if (item.photo) {
        details.push(`zdjęcie ${item.photo}`);
    }
    if (item.number) {
        details.push(`numer ${item.number}`);
    }
    if (item.name) {
        details.push(item.name);
    }
    return details.join(' · ');
}

function render_cart() {
    const cart_container = document.querySelector('[data-cart-items]');
    const checkout_container = document.querySelector('[data-checkout-items]');
    const grouped_items = cart_items.reduce((groups, item) => {
        groups[item.club_id] ||= [];
        groups[item.club_id].push(item);
        return groups;
    }, {});
    const groups = Object.entries(grouped_items).map(([club_id, items]) => {
        const club = clubs[club_id];
        const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
        const support = items.reduce((sum, item) => (
            sum + (club.support_base || 0) * item.quantity
        ), 0);
        const support_text = club.support_base
            ? `Wsparcie dla Klubu: ${format_price(support)} brutto`
            : 'produkt własny ACTIVIO';
        const item_markup = items.map((item) => {
            const product = products[item.product_id];
            const name = item.club_id === 'activio' && product.activio_name
                ? product.activio_name
                : product.name;
            return `
                <article class="cart-item" data-cart-item-key="${escape_html(item.key)}">
                    <div class="cart-product-thumb"><img src="${escape_html(product.image)}" alt=""></div>
                    <div>
                        <h3>${escape_html(name)}</h3>
                        <p>${escape_html(cart_item_details(item))}</p>
                        <button type="button" data-go="product" data-product-id="${escape_html(item.product_id)}" data-club-id="${escape_html(item.club_id)}">Edytuj personalizację</button>
                        <button type="button" data-cart-remove>Usuń</button>
                    </div>
                    <div class="quantity">
                        <button type="button" data-quantity-change="-1" aria-label="Zmniejsz ilość">−</button>
                        <span>${item.quantity}</span>
                        <button type="button" data-quantity-change="1" aria-label="Zwiększ ilość">+</button>
                    </div>
                    <strong>${format_price(product.price * item.quantity)}</strong>
                </article>
            `;
        }).join('');

        return `
            <div class="cart-group">
                <div class="cart-club">
                    <img class="club-crest-image" src="${escape_html(club.logo)}" alt="">
                    <div>
                        <strong>${escape_html(club.name)}</strong>
                        <small>${quantity} ${quantity === 1 ? 'produkt' : 'produkty'} · ${support_text}</small>
                    </div>
                </div>
                ${item_markup}
            </div>
        `;
    }).join('');

    const shipping_note = cart_items.length > 0 ? `
        <div class="shipping-note">
            <span>▣</span>
            <div><strong>Jedna wspólna paczka</strong><p>Wyślemy zamówienie, gdy wszystkie produkty będą gotowe. Przewidywana wysyłka: 29–31 lipca.</p></div>
            <button type="button" data-go="checkout">Zmień</button>
        </div>` : '<div class="cart-empty">Dodaj produkt, aby przejść do dostawy i płatności.</div>';
    cart_container.innerHTML = `${groups}${shipping_note}`;

    checkout_container.innerHTML = cart_items.map((item) => {
        const product = products[item.product_id];
        const club = clubs[item.club_id];
        const name = item.club_id === 'activio' && product.activio_name
            ? product.activio_name
            : product.name;
        return `
            <div>
                <span class="summary-thumb logo-thumb"><img src="${escape_html(club.logo)}" alt=""></span>
                <p><strong>${escape_html(name)} × ${item.quantity}</strong><small>${escape_html(club.name)} · ${escape_html(cart_item_details(item))}</small></p>
                <b>${format_price(product.price * item.quantity)}</b>
            </div>
        `;
    }).join('');

    cart_count = cart_items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart_items.reduce((sum, item) => (
        sum + products[item.product_id].price * item.quantity
    ), 0);
    const support = cart_items.reduce((sum, item) => (
        sum + (clubs[item.club_id].support_base || 0) * item.quantity
    ), 0);
    const shipping = cart_items.length > 0
        ? Number(document.querySelector('.delivery-option.selected')?.dataset.shippingPrice || 12.99)
        : 0;
    const total = subtotal + shipping;
    const support_by_club = Object.entries(grouped_items)
        .filter(([club_id]) => club_id !== 'activio')
        .map(([club_id, items]) => {
            const club_support = items.reduce((sum, item) => (
                sum + (clubs[club_id].support_base || 0) * item.quantity
            ), 0);
            return `${clubs[club_id].name} ${format_price(club_support)} brutto`;
        });
    const club_count = new Set(
        cart_items.filter((item) => item.club_id !== 'activio').map((item) => item.club_id),
    ).size;

    document.querySelectorAll('[data-cart-count]').forEach((counter) => {
        counter.textContent = String(cart_count);
    });
    document.querySelectorAll('[data-cart-subtotal]').forEach((element) => {
        element.textContent = format_price(subtotal);
    });
    document.querySelectorAll('[data-cart-support]').forEach((element) => {
        element.textContent = `${format_price(support)} brutto`;
    });
    document.querySelectorAll('[data-shipping-total]').forEach((element) => {
        element.textContent = format_price(shipping);
    });
    document.querySelectorAll('[data-cart-total]').forEach((element) => {
        element.textContent = format_price(total);
    });
    document.querySelectorAll('[data-cart-support-split]').forEach((element) => {
        element.textContent = support_by_club.length > 0
            ? `Wsparcie dla Klubów: ${support_by_club.join(' · ')}`
            : 'Brak produktów przypisanych do wsparcia Klubu.';
    });
    document.querySelectorAll('[data-view="cart"] [data-go="checkout"]').forEach((button) => {
        button.disabled = cart_items.length === 0;
    });
    document.querySelector('[data-cart-title]').textContent = cart_items.length === 0
        ? 'Twój koszyk jest pusty.'
        : club_count === 0
            ? 'Produkty ACTIVIO. Jedno zamówienie.'
        : club_count === 1
            ? 'Jeden klub. Jedno zamówienie.'
            : `${club_count} kluby. Jedno zamówienie.`;
}

function normalize_product_cards() {
    document.querySelectorAll('.product-card[data-go="product"]').forEach((card) => {
        const link = document.createElement('button');
        link.type = 'button';
        link.className = 'product-card-hit';
        link.dataset.go = 'product';
        link.dataset.productId = card.dataset.productId;
        if (card.dataset.clubId) {
            link.dataset.clubId = card.dataset.clubId;
        }
        link.setAttribute('aria-label', `Otwórz produkt: ${card.querySelector('h3')?.textContent || 'produkt'}`);
        card.prepend(link);
        card.removeAttribute('data-go');
        card.removeAttribute('role');
        card.removeAttribute('tabindex');
    });
}

function close_action_dialog() {
    if (action_dialog.open) {
        action_dialog.close();
    }
}

function open_action_dialog(title, content, kicker = 'ACTIVIO') {
    action_title.textContent = title;
    action_kicker.textContent = kicker;
    action_content.innerHTML = content;

    if (!action_dialog.open) {
        action_dialog.showModal();
    }
}

function update_club_context(club_id) {
    const resolved_club_id = clubs[club_id] && club_id !== 'activio' ? club_id : 'stal';
    const club = clubs[resolved_club_id];
    if (resolved_club_id !== 'activio') {
        current_club_id = resolved_club_id;
    }

    document.querySelectorAll('[data-club-name]').forEach((element) => {
        element.textContent = club.name;
    });
    document.querySelectorAll('[data-club-logo]').forEach((image) => {
        image.src = club.logo;
        image.alt = `Herb ${club.name}`;
    });
    document.querySelector('[data-club-intro]').textContent = club.intro;
    document.querySelector('[data-club-product-count]').textContent = `${final_catalog.length} produktów`;
    document.querySelector('[data-club-since]').textContent = `RAZEM OD ${club.since}`;
    document.querySelector('[data-club-academy-count]').textContent = String(club.academy_count);
    document.querySelector('.club-hero').style.background = club.gradient;
}

function final_catalog_entry(product_id) {
    return final_catalog.find((entry) => entry.id === product_id) || final_catalog[0];
}

function catalog_club_markup(club_id) {
    const club = clubs[club_id];
    const logo_class = club_id === 'activio' ? 'mini-activio-logo' : 'mini-club-logo';
    const label = club_id === 'activio' ? '' : ` ${escape_html(club.name)}`;

    return `<img class="${logo_class}" src="${club.logo}" alt="${escape_html(club.name)}">${label}`;
}

function catalog_product_card(entry, club_id, context = 'store') {
    const product = products[entry.id];
    const club = clubs[club_id];
    const category_label = entry.category_label;
    const common = `class="product-card" data-go="product" data-product-id="${entry.id}" data-category="${entry.category}" data-price="${product.price}" data-popularity="${entry.popularity}" data-newness="${entry.newness}" role="link" tabindex="0"`;
    const store_data = context === 'store'
        ? ` data-club-id="${club_id}" data-store-product="${entry.id}-${club_id}" data-feedback-id="store:product:${entry.id}-${club_id}" data-store-category="${entry.category}" data-store-club="${club_id}"`
        : '';
    const club_data = context === 'marketplace' ? ` data-club-id="${club_id}"` : '';
    const label = context === 'club'
        ? escape_html(category_label)
        : catalog_club_markup(club_id);
    const badge = ['player-labels', 'shirt', 'playercard', 'shoe-labels'].includes(entry.id)
        ? '<span class="art-label">PERSONALIZUJ</span>'
        : '';
    const concept_badge = concept_product_ids.has(entry.id)
        ? '<span class="concept-image-label">WIZUALIZACJA</span>'
        : '';

    return `<article ${common}${store_data}${club_data}>
        <div class="product-art">${badge}${concept_badge}<img class="product-photo" src="${product.image}" alt="${escape_html(product.name)} — ${escape_html(club.name)}" loading="lazy"></div>
        <div class="product-meta"><span class="product-club">${label}</span><h3>${escape_html(product.name)}</h3><div><strong>${format_price(product.price)}</strong><span>${escape_html(entry.personalization)}</span></div></div>
    </article>`;
}

function render_final_offer_catalog() {
    const category_grid = document.querySelector('.offer-category-grid');
    const tree = document.querySelector('.offer-tree nav');
    const browser = document.querySelector('.offer-products');

    category_grid.innerHTML = catalog_categories.map((category, index) => {
        const entries = final_catalog.filter((entry) => entry.category === category.id);
        const image = products[entries[0].id].image;
        return `<button type="button" data-scroll-to="offer-category-${category.id}"><img src="${image}" alt=""><span>${String(index + 1).padStart(2, '0')}</span><strong>${escape_html(category.label)}</strong><small>${entries.length} ${entries.length === 1 ? 'produkt' : 'produkty'} ↓</small></button>`;
    }).join('');

    tree.innerHTML = catalog_categories.map((category) => {
        const links = final_catalog
            .filter((entry) => entry.category === category.id)
            .map((entry) => `<button type="button" data-scroll-to="offer-${entry.id}">${escape_html(products[entry.id].name)}</button>`)
            .join('');
        return `<div><button type="button" data-scroll-to="offer-category-${category.id}">${escape_html(category.label)}</button>${links}</div>`;
    }).join('');

    browser.innerHTML = catalog_categories.map((category, index) => {
        const entries = final_catalog.filter((entry) => entry.category === category.id);
        const articles = entries.map((entry) => {
            const product = products[entry.id];
            const concept_badge = concept_product_ids.has(entry.id)
                ? '<span class="concept-image-label">WIZUALIZACJA</span>'
                : '';
            return `<article id="offer-${entry.id}">${concept_badge}<img src="${product.image}" alt="${escape_html(product.name)}"><div><small>REALIZACJA ${escape_html(entry.production)}</small><h3>${escape_html(product.name)}</h3><p>${escape_html(product.lead)}</p><strong>od ${format_price(entry.minimum)} / szt.</strong><button type="button" data-offer-question="${escape_html(product.name)}">Zapytaj o produkt →</button></div></article>`;
        }).join('');
        return `<section id="offer-category-${category.id}"><header><span>${String(index + 1).padStart(2, '0')}</span><div><small>${escape_html(category.label)}</small><h2>${escape_html(category.lead)}</h2></div></header>${articles}</section>`;
    }).join('');
}

function render_final_catalogs() {
    const club_cycle = ['stal', 'kks', 'pogon', 'jarota'];
    const store_container = document.querySelector('[data-store-products="popular"]');
    const club_container = document.querySelector('.club-products');
    const marketplace_container = document.querySelector('.marketplace-view .product-section .product-grid');

    store_container.innerHTML = final_catalog
        .map((entry, index) => catalog_product_card(entry, club_cycle[index % club_cycle.length], 'store'))
        .join('');
    club_container.innerHTML = final_catalog
        .map((entry) => catalog_product_card(entry, 'stal', 'club'))
        .join('');
    marketplace_container.innerHTML = [...final_catalog]
        .sort((left, right) => right.popularity - left.popularity)
        .slice(0, 6)
        .map((entry, index) => catalog_product_card(entry, club_cycle[index % club_cycle.length], 'marketplace'))
        .join('');

    const project_note = '<aside class="catalog-prototype-note"><strong>FINALNA LISTA · DANE ROBOCZE</strong><span>Produkty są zatwierdzone. Ceny, minima, warianty i terminy są przykładowe. Żółte oznaczenie „Wizualizacja” wskazuje wygenerowane zdjęcie koncepcyjne.</span></aside>';
    [
        document.querySelector('.offer-catalog > .section-heading'),
        document.querySelector('[data-view="partner-catalog"] .partner-page-head'),
        document.querySelector('[data-view="system-catalog"] .system-page-head'),
    ].forEach((anchor) => anchor.insertAdjacentHTML('afterend', project_note));

    const filter_buttons = catalog_categories
        .map((category) => `<button class="chip" type="button" data-store-filter="${category.id}">${escape_html(category.label)}</button>`)
        .join('');
    document.querySelector('.store-category-filter .chips').innerHTML = `<button class="chip active" type="button" data-store-filter="all">Wszystko</button>${filter_buttons}`;
    document.querySelector('.marketplace-view .product-section .chips').innerHTML = `<button class="chip active" type="button" data-product-filter="all">Wszystko</button>${catalog_categories.map((category) => `<button class="chip" type="button" data-product-filter="${category.id}">${escape_html(category.label)}</button>`).join('')}`;
    document.querySelector('.club-tabs').innerHTML = `<button class="active" type="button" data-club-filter="all">Wszystkie</button>${catalog_categories.map((category) => `<button type="button" data-club-filter="${category.id}">${escape_html(category.label)}</button>`).join('')}<span data-club-product-count>${final_catalog.length} produktów</span>`;

    const partner_filters = document.querySelector('.partner-catalog-toolbar > div');
    partner_filters.innerHTML = `<button class="active" type="button" data-partner-catalog-filter="all">Wszystkie</button>${catalog_categories.map((category) => `<button type="button" data-partner-catalog-filter="${category.id}">${escape_html(category.label)}</button>`).join('')}`;
    document.querySelector('.partner-catalog-grid').innerHTML = final_catalog.map((entry) => {
        const product = products[entry.id];
        return `<article data-partner-catalog-product="${entry.category}" data-catalog-search="${escape_html(`${product.name} ${entry.category_label}`.toLocaleLowerCase('pl-PL'))}"><img src="${product.image}" alt="${escape_html(product.name)}"><div><span>${escape_html(entry.category_label)}</span><strong>${escape_html(product.name)}</strong><p>${escape_html(entry.variants)} · ${escape_html(entry.personalization)} · produkcja ${escape_html(entry.production)}</p><dl><div><dt>Minimum od</dt><dd>${format_price(entry.minimum)}</dd></div><div><dt>Kluby korzystające</dt><dd>${entry.clubs}</dd></div></dl><button class="button primary full" type="button" data-go="partner-listing-create" data-product-id="${entry.id}">Wybierz produkt</button></div></article>`;
    }).join('');

    const active_offer_ids = ['shirt', 'mug', 'playercard', 'jersey-keyring', 'calendar'];
    document.querySelector('[data-view="partner-offer"] .offer-grid').innerHTML = active_offer_ids.map((product_id, index) => {
        const entry = final_catalog_entry(product_id);
        const product = products[product_id];
        const spread = product.price - entry.minimum;
        return `<article class="offer-card" data-offer-item data-min-price="${entry.minimum}">
            <img src="${product.image}" alt="${escape_html(product.name)}" loading="lazy">
            <div class="offer-card-main"><div class="offer-title"><div><span>${escape_html(entry.category_label)}</span><strong>${escape_html(product.name)}</strong></div><span class="table-status ${index === 4 ? 'pending' : 'available'}">${index === 4 ? 'Projekt' : 'Aktywna'}</span></div>
            <div class="price-editor"><label>Minimum ACTIVIO brutto <output>${format_price(entry.minimum)}</output></label><label>Cena brutto w Twoim sklepie <span><input type="number" min="${entry.minimum}" step="1" value="${product.price}" data-sale-price> zł</span></label><div class="price-result"><span>Kwota brutto ponad minimum</span><strong data-price-spread>${format_price(spread)}</strong><small>Wartości przykładowe · to nie jest automatycznie wynagrodzenie klubu</small></div></div>
            <div class="offer-actions"><button type="button" data-go="product" data-product-id="${product_id}" data-club-id="stal">Podgląd produktu</button><button class="button primary" type="button" data-save-price>Zapisz cenę</button></div></div>
        </article>`;
    }).join('');

    const system_view = document.querySelector('[data-view="system-catalog"]');
    system_view.querySelector('.system-kpi-grid').innerHTML = `<article><span>Aktywne produkty bazowe</span><strong>${final_catalog.length}</strong><small>${catalog_categories.length} kategorii</small></article><article><span>Warianty katalogowe</span><strong>36</strong><small>Formaty i zestawy</small></article><article><span>Ceny do potwierdzenia</span><strong>${final_catalog.length}</strong><small>Wartości przykładowe</small></article><article class="attention"><span>Braki w finalnym cenniku</span><strong>${final_catalog.length}</strong><small>Minima wymagają decyzji</small></article>`;
    system_view.querySelector('.system-main-table tbody').innerHTML = final_catalog.map((entry) => {
        const product = products[entry.id];
        return `<tr><td><span class="product-cell"><img src="${product.image}" alt=""><span><strong>${escape_html(product.name)}</strong><small>${entry.sku}</small></span></span></td><td>ACTIVIO</td><td>${escape_html(entry.variants)}</td><td>${escape_html(entry.personalization)}</td><td><strong>${format_price(entry.minimum)} brutto</strong><small>wartość przykładowa</small></td><td>${entry.clubs} klubów</td><td><span class="table-status pending">Cena do potwierdzenia</span></td><td><button class="table-link" type="button" data-action="system-catalog-summary" data-product-id="${entry.id}">Podgląd →</button></td></tr>`;
    }).join('');
    const category_select = system_view.querySelector('.system-filter-bar select');
    category_select.innerHTML = `<option>Wszystkie kategorie</option>${catalog_categories.map((category) => `<option>${escape_html(category.label)}</option>`).join('')}`;

    render_final_offer_catalog();
}

function filter_partner_catalog() {
    const category = document.querySelector('[data-partner-catalog-filter].active')?.dataset.partnerCatalogFilter || 'all';
    const phrase = document.querySelector('.partner-catalog-toolbar input')?.value.trim().toLocaleLowerCase('pl-PL') || '';

    document.querySelectorAll('[data-partner-catalog-product]').forEach((product) => {
        product.hidden = (category !== 'all' && product.dataset.partnerCatalogProduct !== category)
            || (phrase !== '' && !product.dataset.catalogSearch.includes(phrase));
    });
}

function update_partner_listing_context(product_id) {
    const entry = final_catalog_entry(product_id);
    const product = products[entry.id];
    const view = document.querySelector('[data-view="partner-listing-create"]');
    const base = view.querySelector('.listing-base-product');
    const summary = view.querySelector('.listing-create-summary');

    view.querySelector('.partner-page-head h1').textContent = `${product.name} dla KS Stal`;
    base.querySelector('.panel-heading strong').textContent = entry.sku;
    base.querySelector(':scope > div > img').src = product.image;
    base.querySelector(':scope > div > img').alt = product.name;
    base.querySelector(':scope > div > span > strong').textContent = product.name;
    base.querySelector(':scope > div > span > p').textContent = `${entry.variants} · ${entry.personalization} · produkcja ${entry.production}`;
    view.querySelector('.variant-check-grid').innerHTML = product.options.map((option) => `<label><input type="checkbox" checked>${escape_html(option)}</label>`).join('');
    summary.querySelector('img').src = product.image;
    summary.querySelector('img').alt = `Przykładowy projekt: ${product.name}`;
    summary.querySelector('input[name="listing_name"]').value = product.name;
    const price = summary.querySelector('input[name="price"]');
    price.min = String(entry.minimum);
    price.value = String(product.price);
    const totals = summary.querySelectorAll(':scope > div strong');
    totals[0].textContent = format_price(entry.minimum);
    totals[1].textContent = format_price(product.price - entry.minimum);
}

function update_product_context(product_id, club_id = current_club_id) {
    const product = products[product_id] || products.shirt;
    const resolved_club_id = clubs[club_id] ? club_id : current_club_id;
    const club = clubs[resolved_club_id];
    const is_activio = resolved_club_id === 'activio';
    const product_name = is_activio && product.activio_name ? product.activio_name : product.name;
    const price = format_price(product.price);

    current_product_id = product_id;
    current_product_club_id = resolved_club_id;
    if (!is_activio) {
        update_club_context(resolved_club_id);
    }

    document.querySelectorAll('[data-product-name]').forEach((element) => {
        element.textContent = product_name;
    });
    document.querySelectorAll('[data-product-price]').forEach((element) => {
        element.textContent = price;
    });
    document.querySelectorAll('[data-product-club-logo]').forEach((image) => {
        image.src = club.logo;
        image.alt = is_activio ? 'ACTIVIO' : `Herb ${club.name}`;
        image.classList.toggle('product-activio-logo', is_activio);
    });

    const product_image = document.querySelector('[data-product-image]');
    product_image.src = product.image;
    product_image.alt = product_name;
    document.querySelector('[data-product-lead]').textContent = product.lead;
    document.querySelector('[data-option-label]').textContent = product.option_label;
    document.querySelector('[data-number-label]').textContent = product.number_label;
    document.querySelector('[data-name-label]').textContent = product.name_label;
    const number_max_length = product.number_max_length || 2;
    number_input.maxLength = number_max_length;
    const photo_upload_field = document.querySelector('[data-photo-upload-field]');
    photo_upload_field.hidden = !product.requires_photo;
    product_photo_input.value = '';
    product_photo_label.textContent = 'Wybierz zdjęcie z urządzenia';
    document.querySelector('[data-size-guide-button]').hidden = !product.has_size_guide;
    document.querySelector('.size-options').innerHTML = product.options
        .map((option) => `<button${option === 'M' || (!product.options.includes('M') && option === product.options[0]) ? ' class="selected"' : ''} type="button">${escape_html(option)}</button>`)
        .join('');
    document.querySelector('[data-product-club-label]').textContent = is_activio
        ? 'Produkt własny ACTIVIO'
        : `Oficjalny produkt ${club.name}`;
    document.querySelector('[data-product-seller-note]').textContent = is_activio
        ? 'Cena jest ceną brutto. Ten produkt nie jest przypisany do wynagrodzenia klubu.'
        : `Cena jest ceną brutto, a zakup wspiera ${club.name}.`;

    const club_link = document.querySelector('[data-product-club-link]');
    club_link.textContent = club.name;
    club_link.dataset.go = is_activio ? 'store' : 'club';

    document.querySelector('.gallery-main').dataset.galleryMode = 'product';
    document.querySelectorAll('.gallery-thumbs button').forEach((button, index) => {
        button.classList.toggle('active', index === 0);
    });
    number_input.value = '';
    name_input.value = '';
    number_preview.textContent = '—';
    name_preview.textContent = 'TWÓJ NAPIS';
    document.querySelector('[data-number-count]').textContent = `0/${number_max_length}`;
    document.querySelector('[data-name-count]').textContent = '0/14';
    personalization_confirm.checked = false;
    add_cart_button.disabled = true;
}

function inquiry_form(topic, order_mode = false) {
    const safe_topic = escape_html(topic);
    return `
        <form class="action-form" data-action-form="${order_mode ? 'business-order' : 'business-inquiry'}">
            <label>Klub lub organizacja<input name="club" required autocomplete="organization" placeholder="Nazwa organizacji"></label>
            <label>Osoba kontaktowa<input name="name" required autocomplete="name" placeholder="Imię i nazwisko"></label>
            <label>E-mail<input name="email" type="email" required autocomplete="email" placeholder="kontakt@klub.pl"></label>
            <label>Telefon<input name="phone" type="tel" autocomplete="tel" placeholder="+48 600 000 000"></label>
            <label class="wide">Temat<input name="topic" value="${safe_topic}" required></label>
            ${order_mode ? '<label>Orientacyjna liczba sztuk<input name="quantity" type="number" min="1" value="20" required></label><label>Potrzebny termin<input name="deadline" type="date"></label>' : ''}
            <label class="wide">Czego potrzebujesz?<textarea name="message" required placeholder="Produkt, liczba sztuk, znakowanie i termin"></textarea></label>
            <p class="action-form-note">To oddzielna ścieżka B2B. Nie dodaje produktów do koszyka konsumenckiego.</p>
            <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">${order_mode ? 'Utwórz zamówienie B2B' : 'Wyślij zapytanie'}</button></footer>
        </form>`;
}

function search_result_button(product_id, club_id) {
    const product = products[product_id];
    const club = clubs[club_id];
    const name = club_id === 'activio' && product.activio_name ? product.activio_name : product.name;

    return `<button type="button" data-search-product="${product_id}" data-club-id="${club_id}">
        <img src="${product.image}" alt="">
        <span><strong>${escape_html(name)}</strong><small>${escape_html(club.name)}</small></span>
        <b>${format_price(product.price)} →</b>
    </button>`;
}

function render_search_results(phrase = '') {
    const search_products = [
        ['shirt', 'stal'],
        ['mug', 'kks'],
        ['playercard', 'pogon'],
        ['jersey-keyring', 'jarota'],
        ['photo-puzzle', 'stal'],
        ['clock', 'kks'],
    ];
    const normalized_phrase = phrase.trim().toLocaleLowerCase('pl-PL');
    const results = search_products.filter(([product_id, club_id]) => {
        const product = products[product_id];
        const club = clubs[club_id];
        const haystack = `${product.name} ${product.activio_name || ''} ${club.name} ${club.city}`.toLocaleLowerCase('pl-PL');
        return normalized_phrase === '' || haystack.includes(normalized_phrase);
    });
    const list = document.querySelector('[data-search-results]');
    list.innerHTML = results.length
        ? results.map(([product_id, club_id]) => search_result_button(product_id, club_id)).join('')
        : '<p class="dialog-empty">Brak produktów dla tej frazy.</p>';
}

function show_action(action, source) {
    const topic = source.dataset.inquiryTopic || 'Oferta dla klubu';

    if (action === 'system-catalog-summary') {
        const entry = final_catalog_entry(source.dataset.productId);
        const product = products[entry.id];
        open_action_dialog(product.name, `
            <div class="project-preview"><img src="${product.image}" alt="${escape_html(product.name)}"><div><strong>${entry.sku} · ${escape_html(entry.category_label)}</strong><p>${escape_html(product.lead)}</p></div></div>
            <div class="info-grid">
                <article><span>${escape_html(entry.variants)}</span><div><strong>Warianty</strong><p>${escape_html(product.options.join(' · '))}</p></div></article>
                <article><span>${format_price(entry.minimum)}</span><div><strong>Przykładowe minimum brutto</strong><p>Wymaga potwierdzenia w finalnym cenniku.</p></div></article>
            </div>
            <p class="action-info"><strong>Personalizacja:</strong> ${escape_html(entry.personalization)} · produkcja ${escape_html(entry.production)} · ${entry.clubs} klubów korzysta z produktu.</p>
        `, 'KATALOG CENTRALNY');
        return;
    }

    if (action === 'search') {
        open_action_dialog('Znajdź produkt lub klub', `
            <label class="search-field"><span>⌕</span><input type="search" placeholder="Np. kubek, KKS Kalisz, bluza…" data-search-input autofocus></label>
            <div class="dialog-list" data-search-results></div>
        `, 'WYSZUKIWARKA');
        render_search_results();
        document.querySelector('[data-search-input]').focus();
        return;
    }

    if (action === 'business-inquiry' || action === 'business-order') {
        open_action_dialog(
            action === 'business-order' ? 'Nowe zamówienie B2B' : 'Zapytaj o ofertę',
            inquiry_form(topic, action === 'business-order'),
            'OFERTA DLA KLUBÓW',
        );
        return;
    }

    if (action === 'join-club') {
        open_action_dialog('Zgłoś klub do programu', `
            <form class="action-form" data-action-form="join-club">
                <label>Nazwa klubu<input name="club" required autocomplete="organization"></label>
                <label>Dyscyplina<select name="sport"><option>Piłka nożna</option><option>Siatkówka</option><option>Koszykówka</option><option>Inna</option></select></label>
                <label>Miasto<input name="city" required></label>
                <label>NIP lub numer rejestrowy<input name="registration" required></label>
                <label>Osoba kontaktowa<input name="name" required autocomplete="name"></label>
                <label>E-mail<input name="email" type="email" required autocomplete="email"></label>
                <label class="wide">Wiadomość<textarea name="message" placeholder="Krótko opisz klub i oczekiwania wobec sklepu"></textarea></label>
                <p class="action-form-note">Zgłoszenie rozpoczyna weryfikację organizacji, praw do marki i materiałów. Publikację zatwierdza ACTIVIO.</p>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Wyślij zgłoszenie</button></footer>
            </form>
        `, 'ACTIVIO CLUB');
        return;
    }

    if (action === 'size-guide') {
        open_action_dialog('Tabela rozmiarów', `
            <p class="action-info">Wymiary gotowego produktu w centymetrach. W razie wątpliwości porównaj z podobną odzieżą mierzoną na płasko.</p>
            <table class="size-table"><thead><tr><th>Rozmiar</th><th>Szerokość</th><th>Długość</th></tr></thead><tbody>
                <tr><td>128</td><td>38 cm</td><td>52 cm</td></tr><tr><td>140</td><td>41 cm</td><td>57 cm</td></tr><tr><td>152</td><td>44 cm</td><td>62 cm</td></tr>
                <tr><td>S</td><td>48 cm</td><td>68 cm</td></tr><tr><td>M</td><td>52 cm</td><td>71 cm</td></tr><tr><td>L</td><td>56 cm</td><td>74 cm</td></tr><tr><td>XL</td><td>60 cm</td><td>77 cm</td></tr>
            </tbody></table>
        `, 'POMOC W WYBORZE');
        return;
    }

    if (action === 'payment-info') {
        open_action_dialog('Bezpieczna płatność', `
            <div class="info-grid">
                <article><span>1</span><div><strong>Jeden sprzedawca</strong><p>Płatność pobiera ACTIVIO za całe zamówienie, także gdy koszyk obejmuje kilka klubów.</p></div></article>
                <article><span>2</span><div><strong>Zewnętrzny operator</strong><p>Dane karty i autoryzację przetwarza operator płatności. ACTIVIO nie przechowuje numeru karty.</p></div></article>
                <article><span>3</span><div><strong>Jedno potwierdzenie</strong><p>Po płatności otrzymujesz numer zamówienia i jeden dokument sprzedaży od ACTIVIO.</p></div></article>
            </div>
        `, 'PŁATNOŚĆ');
        return;
    }

    if (action === 'locker-picker') {
        open_action_dialog('Wybierz Paczkomat', `
            <label class="search-field"><span>⌕</span><input type="search" value="Pleszew" aria-label="Szukaj miejscowości"></label>
            <div class="dialog-list">
                <button type="button" data-locker-option="PPL01M · ul. Poznańska 12, Pleszew"><span>▣</span><span><strong>PPL01M</strong><small>ul. Poznańska 12 · 0,4 km</small></span><b>Wybierz</b></button>
                <button type="button" data-locker-option="PPL02A · ul. Kaliska 18, Pleszew"><span>▣</span><span><strong>PPL02A</strong><small>ul. Kaliska 18 · 1,1 km</small></span><b>Wybierz</b></button>
                <button type="button" data-locker-option="PPL03N · ul. Sienkiewicza 7, Pleszew"><span>▣</span><span><strong>PPL03N</strong><small>ul. Sienkiewicza 7 · 1,8 km</small></span><b>Wybierz</b></button>
            </div>
        `, 'DOSTAWA');
        return;
    }

    if (action === 'track-order') {
        open_action_dialog('Zamówienie AC/2026/1048', `
            <div class="tracking-list">
                <div><i>✓</i><span><strong>Płatność przyjęta</strong><small>23 lipca, 17:42</small></span></div>
                <div><i>2</i><span><strong>Produkcja dwóch pozycji</strong><small>Aktualnie · planowane zakończenie 28 lipca</small></span></div>
                <div class="pending"><i>3</i><span><strong>Wspólna paczka</strong><small>Planowane nadanie 29–31 lipca</small></span></div>
                <div class="pending"><i>4</i><span><strong>Dostarczenie</strong><small>Numer przesyłki pojawi się po nadaniu</small></span></div>
            </div>
            <p class="action-info">Cała paczka czeka na najwolniejszy produkt. ACTIVIO odpowiada za produkcję, wysyłkę i obsługę zamówienia.</p>
        `, 'STATUS ZAMÓWIENIA');
        return;
    }

    if (action === 'customer-order-help') {
        open_action_dialog('Odzyskaj numer zamówienia', `
            <form class="action-form" data-action-form="customer-order-help">
                <p class="action-form-note">Podaj adres e-mail użyty przy zakupie. Wyślemy listę numerów zamówień z ostatnich 90 dni.</p>
                <label class="wide">Adres e-mail<input name="email" type="email" value="jan.kowalski@example.pl" required autocomplete="email"></label>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Wyślij numery zamówień</button></footer>
            </form>
        `, 'ZAKUP GOŚCINNY');
        return;
    }

    if (action === 'customer-carrier-track') {
        open_action_dialog('Dostawa zamówienia AC/2026/1048', `
            <div class="tracking-list">
                <div><i>✓</i><span><strong>Paczkomat PPL01M potwierdzony</strong><small>ul. Poznańska 12, Pleszew</small></span></div>
                <div class="pending"><i>2</i><span><strong>Oczekiwanie na zakończenie produkcji</strong><small>Numer przesyłki zostanie nadany po skompletowaniu obu pozycji.</small></span></div>
                <div class="pending"><i>3</i><span><strong>Powiadomienie e-mail i SMS</strong><small>Wyśle je przewoźnik po umieszczeniu paczki w automacie.</small></span></div>
            </div>
            <p class="action-info">W MVP całe zamówienie jest wysyłane jedną paczką. Termin zależy od najwolniejszej pozycji.</p>
        `, 'DOSTAWA');
        return;
    }

    if (action === 'customer-contact') {
        open_action_dialog('Kontakt z obsługą ACTIVIO', `
            <form class="action-form" data-action-form="customer-contact">
                <label class="wide">Temat<select name="topic"><option>Status produkcji lub dostawy</option><option>Zmiana przed rozpoczęciem produkcji</option><option>Płatność lub dokument</option><option>Inna sprawa</option></select></label>
                <label class="wide">Wiadomość<textarea name="message" required>Proszę o informację dotyczącą zamówienia AC/2026/1048.</textarea></label>
                <p class="action-form-note">Kontakt obsługuje ACTIVIO, nie klub. Numer zamówienia zostanie dołączony automatycznie.</p>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Wyślij wiadomość</button></footer>
            </form>
        `, 'OBSŁUGA KLIENTA');
        return;
    }

    if (action === 'retry-payment') {
        open_action_dialog('Ponów płatność 190,99 zł', `
            <p class="action-info">Utworzymy nową próbę płatności dla tego samego koszyka. Poprzednia próba PAY/2026/8841 pozostanie odrzucona.</p>
            <div class="dialog-list"><button type="button" data-go="confirmation"><span class="dialog-icon">B</span><span><strong>BLIK</strong><small>Nowa jednorazowa próba</small></span><b>Wybierz →</b></button><button type="button" data-go="confirmation"><span class="dialog-icon">▣</span><span><strong>Karta lub szybki przelew</strong><small>Przez operatora płatności</small></span><b>Wybierz →</b></button></div>
        `, 'PŁATNOŚĆ');
        return;
    }

    if (action === 'change-payment-method') {
        open_action_dialog('Wybierz inną metodę płatności', '<p class="action-info">Koszyk pozostaje zarezerwowany. Zmiana metody nie tworzy drugiego zamówienia ani naliczenia dla klubu.</p><div class="dialog-actions"><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="button" data-action="retry-payment">Wybierz metodę</button></div>', 'PŁATNOŚĆ');
        return;
    }

    if (action === 'cancel-failed-payment') {
        open_action_dialog('Anulować nieopłacone zamówienie?', '<p class="action-info">Nie pobrano środków, nie uruchomiono produkcji i nie powstało naliczenie klubowe. Koszyk przestanie być zarezerwowany.</p><div class="dialog-actions"><button class="dialog-button" type="button" data-action-close>Wróć</button><button class="dialog-button primary" type="button" data-go="store">Anuluj i wróć do Marketu</button></div>', 'ANULOWANIE');
        return;
    }

    if (action === 'customer-partial-cancel') {
        open_action_dialog('Decyzja została zapisana', '<div class="tracking-list"><div><i>✓</i><span><strong>Kubek anulowany</strong><small>Zwrot 49,00 zł tą samą metodą płatności</small></span></div><div class="pending"><i>2</i><span><strong>Koszulka trafi do wysyłki</strong><small>Dostawa pozostaje bez zmiany</small></span></div><div class="pending"><i>3</i><span><strong>Korekta KKS Kalisz</strong><small>Osobny, odwracalny wpis rozliczeniowy</small></span></div></div><div class="dialog-actions"><button class="dialog-button primary" type="button" data-go="customer-order">Wróć do zamówienia</button></div>', 'CZĘŚCIOWE ANULOWANIE');
        return;
    }

    if (action === 'customer-refund-details') {
        open_action_dialog('Zwrot za jedną pozycję', '<p class="action-info">ACTIVIO zwróci 49,00 zł tą samą metodą płatności. Dostawa 12,99 zł pozostaje, ponieważ pozostała część zamówienia zostanie wysłana.</p>', 'ZWROT ŚRODKÓW');
        return;
    }

    if (action === 'partner-recovery-code' || action === 'partner-two-factor-help') {
        const recovery = action === 'partner-recovery-code';
        open_action_dialog(recovery ? 'Użyj kodu odzyskiwania' : 'Odzyskaj dostęp do 2FA', recovery
            ? '<form class="action-form" data-action-form="partner-recovery-code"><label class="wide">Kod odzyskiwania<input value="ACTV-4F8K-91PL" required></label><footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Zweryfikuj kod</button></footer></form>'
            : '<p class="action-info">Administrator klubu nie może wyłączyć 2FA innej osobie. ACTIVIO zweryfikuje tożsamość i reprezentację przed odzyskaniem konta.</p><div class="dialog-actions"><button class="dialog-button primary" type="button" data-action-close>Rozumiem</button></div>', 'BEZPIECZEŃSTWO');
        return;
    }

    if (action === 'partner-listing-comment') {
        open_action_dialog('Pytanie do operatora katalogu', '<form class="action-form" data-action-form="partner-listing-comment"><label class="wide">Wiadomość<textarea required>Czy zaakceptowany herb SVG v4 zostanie automatycznie podpięty do projektu?</textarea></label><footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Wyślij pytanie</button></footer></form>', 'LISTING LST-014-018');
        return;
    }

    if (action === 'partner-resubmit-listing') {
        open_action_dialog('Przekaż poprawioną wersję', '<form class="action-form" data-action-form="partner-resubmit-listing"><label>Herb<select><option>stal-pleszew-v4.svg · zaakceptowany</option></select></label><label>Projekt<input value="koszulka-stal-v3.pdf" required></label><label class="wide">Opis zmian<textarea>Podmieniono herb na SVG i poprawiono margines napisu w rozmiarze 152.</textarea></label><footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Przekaż v3</button></footer></form>', 'PONOWNA WERYFIKACJA');
        return;
    }

    if (action === 'partner-pause-conflicting-variant') {
        open_action_dialog('Wstrzymać wariant S–XL?', '<p class="action-info">Wariant przestanie być dostępny 1 sierpnia. Pozostałe warianty i wcześniejsze zamówienia pozostaną bez zmian.</p><div class="dialog-actions"><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="button" data-action="confirm-pause-conflicting-variant">Wstrzymaj wariant</button></div>', 'CENA MINIMALNA');
        return;
    }

    if (action === 'partner-payout-details') {
        open_action_dialog('Historia prób wypłaty', '<div class="tracking-list"><div><i>✓</i><span><strong>Zlecenie utworzone</strong><small>29.07 · PAYOUT-1184</small></span></div><div><i>!</i><span><strong>Bank odrzucił przelew</strong><small>30.07 · AC01 · rachunek zamknięty</small></span></div><div class="pending"><i>3</i><span><strong>Oczekiwanie na nowy rachunek</strong><small>Bez automatycznego ponowienia</small></span></div></div>', 'WYPŁATA');
        return;
    }

    if (action === 'partner-request-access') {
        open_action_dialog('Prośba wysłana do administratora klubu', '<p class="action-info">Marek Kowalski otrzyma prośbę o uprawnienie club.finance.manage. Do czasu decyzji dostęp pozostaje zablokowany.</p>', 'UPRAWNIENIA');
        return;
    }

    if (action === 'system-order-technical-log') {
        open_action_dialog('Log ShopSystem · pozycja 2', '<pre class="action-code">17:42:15 ORDER_ITEM_ACCEPTED\n17:44:09 MATERIAL_BATCH_CHECK\n17:44:09 PROD_MATERIAL_BLOCKED\n17:44:10 ACTIVIO_EXCEPTION_CREATED</pre><p class="action-info">Identyfikator korelacji: cor-29ab17. Personalizacja i snapshot pliku pozostały zapisane.</p>', 'REALIZACJA');
        return;
    }

    if (action === 'system-offboard-operator') {
        open_action_dialog('Natychmiast zakończ dostęp operatora', '<form class="action-form" data-action-form="system-offboard-operator"><label class="wide">Operator<select><option>Tomasz Wrona · Finanse</option></select></label><label class="wide">Powód<select><option>Zakończenie współpracy</option><option>Incydent bezpieczeństwa</option><option>Zmiana zakresu obowiązków</option></select></label><label class="wide">Uzasadnienie<textarea required>Zakończenie współpracy z dniem 30.07.2026.</textarea></label><p class="action-form-note">Konto zostanie zablokowane, wszystkie sesje i tokeny unieważnione, a historia działań zachowana.</p><footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Zablokuj i zakończ sesje</button></footer></form>', 'BEZPIECZEŃSTWO');
        return;
    }

    if (action === 'system-retry-integration') {
        open_action_dialog('Bezpieczne ponowienie zdarzenia', '<p class="action-info">Najpierw sprawdzono, że naliczenie SET-014-1048-1 nie powstało. Ponowienie użyje event ID evt-29ab17 oraz tego samego idempotency key.</p><div class="dialog-actions"><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="button" data-action="confirm-integration-retry">Ponów teraz</button></div>', 'INTEGRACJE');
        return;
    }

    if (action === 'system-integration-detail') {
        open_action_dialog('SHIPMENT_STATUS_SYNC · evt-81ff02', '<p class="action-info">Trzecia próba zakończyła się HTTP 503. Następna automatyczna próba za 8 minut; status klienta pozostaje na ostatniej potwierdzonej wartości.</p>', 'INTEGRACJE');
        return;
    }

    if (action === 'club-story') {
        const club = clubs[current_club_id];
        open_action_dialog(club.name, `
            <div class="info-grid">
                <article><img class="club-crest-image" src="${club.logo}" alt="Herb ${escape_html(club.name)}"><div><strong>Razem od ${club.since} roku</strong><p>${escape_html(club.story)}</p></div></article>
                <article><span>${club.academy_count}</span><div><strong>Młodzi zawodnicy</strong><p>Sklep jest jednym z kanałów wspierających działalność i szkolenie klubu.</p></div></article>
            </div>
        `, 'HISTORIA KLUBU');
        return;
    }

    if (action === 'partner-catalog') {
        open_action_dialog('Katalog produktów ACTIVIO', `
            <p class="action-info">Klub wybiera z kontrolowanego katalogu. Nie dodaje własnych dostawców ani dowolnych produktów.</p>
            <div class="dialog-list">
                ${search_result_button('mug', 'stal').replace('<button ', '<button data-catalog-add="mug" ')}
                ${search_result_button('playercard', 'stal').replace('<button ', '<button data-catalog-add="playercard" ')}
                ${search_result_button('photo-puzzle', 'stal').replace('<button ', '<button data-catalog-add="photo-puzzle" ')}
            </div>
        `, 'PANEL KLUBU');
        return;
    }

    if (action === 'review-project') {
        open_action_dialog('Projekt torby klubowej', `
            <div class="project-preview"><img src="${products.bag.image}" alt="Projekt torby sportowej"><div><strong>Wersja 2 · do akceptacji klubu</strong><p>Herb: lewy bok · napis: KS STAL PLESZEW · kolory zgodne z przekazanymi materiałami.</p></div></div>
            <p class="action-info">Akceptacja dotyczy wyglądu. ACTIVIO ponownie sprawdza produkt, pliki produkcyjne i cenę przed publikacją.</p>
            <div class="dialog-actions"><button class="dialog-button" type="button" data-project-decision="changes">Poproś o poprawki</button><button class="dialog-button primary" type="button" data-project-decision="approve">Akceptuję projekt</button></div>
        `, 'AKCEPTACJA MARKI');
        return;
    }

    if (action === 'review-listing-project') {
        open_action_dialog('Projekt koszulki klubowej', `
            <div class="project-preview"><img src="${products.shirt.image}" alt="Projekt koszulki klubowej"><div><strong>Wersja 3 · zaakceptowana</strong><p>Herb: lewa pierś · numer i nazwisko: plecy · kolory zgodne z materiałem stal-pleszew-v4.svg.</p></div></div>
            <div class="tracking-list">
                <div><i>✓</i><span><strong>Akceptacja klubu</strong><small>18.06.2026 · Marek Kowalski</small></span></div>
                <div><i>✓</i><span><strong>Weryfikacja ACTIVIO</strong><small>19.06.2026 · Anna Nowak</small></span></div>
                <div><i>✓</i><span><strong>Publikacja</strong><small>20.06.2026 · wersja produkcyjna 3</small></span></div>
            </div>
        `, 'HISTORIA PROJEKTU');
        return;
    }

    if (action === 'submit-settlement-document') {
        open_action_dialog('Dokument za lipiec 2026', `
            <form class="action-form" data-action-form="settlement-document">
                <p class="action-form-note">Dokument powinien opiewać na <strong>1 040,00 zł netto + 239,20 zł VAT</strong>. W prototypie wybór pliku jest symulowany.</p>
                <label class="wide">Numer faktury VAT<input name="invoice" required placeholder="FV/07/2026"></label>
                <label class="wide">Plik PDF<input name="file" type="text" required value="FV-07-2026.pdf"></label>
                <label class="wide">Potwierdzenie<select name="confirmation" required><option value="">Wybierz…</option><option value="confirmed">Kwota i rachunek są prawidłowe</option></select></label>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Przekaż do weryfikacji</button></footer>
            </form>
        `, 'ROZLICZENIE MIESIĘCZNE');
        return;
    }

    if (action === 'edit-club-data') {
        open_action_dialog('Zgłoś zmianę danych klubu', `
            <form class="action-form" data-action-form="club-data-change">
                <label>Zakres zmiany<select name="scope" required><option value="">Wybierz…</option><option>Dane rejestrowe</option><option>Status VAT</option><option>Reprezentant</option><option>Adres</option></select></label>
                <label>Data obowiązywania<input name="date" type="date" required></label>
                <label class="wide">Opis zmiany<textarea name="description" required placeholder="Podaj aktualne i nowe dane"></textarea></label>
                <p class="action-form-note">Zmiana trafi do ACTIVIO do weryfikacji. Aktualne dane pozostaną aktywne do jej zakończenia.</p>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Wyślij zgłoszenie</button></footer>
            </form>
        `, 'DANE FORMALNE');
        return;
    }

    if (action === 'request-brand-change' || action === 'renew-license') {
        open_action_dialog(action === 'renew-license' ? 'Odnowienie licencji' : 'Nowe materiały marki', `
            <form class="action-form" data-action-form="brand-change">
                <label>Rodzaj materiału<select name="type" required><option>Herb lub logo</option><option>Licencja / zgoda</option><option>Kolory marki</option><option>Treści witryny</option></select></label>
                <label>Plik<input name="file" required value="${action === 'renew-license' ? 'licencja-stal-2027.pdf' : 'stal-pleszew-v5.svg'}"></label>
                <label class="wide">Informacja dla ACTIVIO<textarea name="message" placeholder="Co się zmieniło i od kiedy materiał obowiązuje?"></textarea></label>
                <p class="action-form-note">Nowa wersja nie zastąpi używanych materiałów do czasu weryfikacji i akceptacji.</p>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Przekaż do weryfikacji</button></footer>
            </form>
        `, 'MARKA KLUBU');
        return;
    }

    if (action === 'invite-member') {
        open_action_dialog('Zaproś osobę do panelu', `
            <form class="action-form" data-action-form="invite-member">
                <label>Imię i nazwisko<input name="name" required autocomplete="name"></label>
                <label>E-mail<input name="email" type="email" required autocomplete="email"></label>
                <label class="wide">Rola<select name="role" required><option>Menedżer sklepu</option><option>Księgowość</option><option>Podgląd</option><option>Administrator</option></select></label>
                <p class="action-form-note">Zaproszenie jest ważne 48 godzin. Nowy administrator musi włączyć 2FA przed uzyskaniem pełnego dostępu.</p>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Wyślij zaproszenie</button></footer>
            </form>
        `, 'ZESPÓŁ KLUBU');
        return;
    }

    if (action === 'member-details') {
        open_action_dialog('Uprawnienia użytkownika', `
            <form class="action-form" data-action-form="member-update">
                <p class="action-form-note"><strong>Anna Nowak</strong> · anna@stalpleszew.pl</p>
                <label class="wide">Rola<select name="role"><option>Menedżer sklepu</option><option>Księgowość</option><option>Podgląd</option><option>Administrator</option></select></label>
                <footer><button class="dialog-button" type="button" data-action="remove-member">Odbierz dostęp</button><button class="dialog-button primary" type="submit">Zapisz rolę</button></footer>
            </form>
        `, 'ZESPÓŁ KLUBU');
        return;
    }

    if (action === 'change-bank') {
        open_action_dialog('Bezpieczna zmiana rachunku', `
            <form class="action-form" data-action-form="bank-change">
                <p class="action-form-note">Zmiana wstrzyma wypłatę do czasu weryfikacji nowego rachunku przez ACTIVIO.</p>
                <label class="wide">Hasło<input name="password" type="password" required autocomplete="current-password"></label>
                <label class="wide">Nowy IBAN<input name="iban" required placeholder="PL00 0000 0000 0000 0000 0000 0000"></label>
                <label class="wide">Kod 2FA<input name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required placeholder="000000"></label>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Przekaż do weryfikacji</button></footer>
            </form>
        `, 'PONOWNE UWIERZYTELNIENIE');
        return;
    }

    if (action === 'manage-2fa' || action === 'manage-sessions' || action === 'security-alerts') {
        const security_content = {
            'manage-2fa': ['Weryfikacja dwuetapowa', 'Aplikacja uwierzytelniająca jest aktywna. Zapisano 8 niewykorzystanych kodów odzyskiwania.'],
            'manage-sessions': ['Aktywne sesje', 'MacBook Pro · Pleszew · teraz<br>iPhone · Pleszew · 12 minut temu'],
            'security-alerts': ['Alerty bezpieczeństwa', 'Aktywne: nowe logowanie, eksport danych, zmiana rachunku i zmiana uprawnień.'],
        }[action];
        open_action_dialog(security_content[0], `<p class="action-info">${security_content[1]}</p><div class="dialog-actions"><button class="dialog-button" type="button" data-action-close>Zamknij</button><button class="dialog-button primary" type="button" data-action="security-saved">Zapisz ustawienia</button></div>`, 'BEZPIECZEŃSTWO');
        return;
    }

    if (['contact-manager', 'save-storefront'].includes(action)) {
        open_action_dialog(action === 'contact-manager' ? 'Wiadomość do opiekuna' : 'Publikacja treści witryny', `
            <form class="action-form" data-action-form="${action}">
                <label class="wide">${action === 'contact-manager' ? 'Wiadomość' : 'Informacja dla weryfikującego'}<textarea name="message" required>${action === 'save-storefront' ? 'Proszę opublikować zaktualizowane treści witryny.' : ''}</textarea></label>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Wyślij do ACTIVIO</button></footer>
            </form>
        `, action === 'contact-manager' ? 'KONTAKT' : 'WITRYNA KLUBU');
        return;
    }

    if (action === 'system-global-search') {
        open_action_dialog('Wyszukiwarka Systemu', `
            <label class="search-field"><span>⌕</span><input type="search" placeholder="Zamówienie, klub, listing lub rozliczenie" autofocus></label>
            <div class="dialog-list">
                <button type="button" data-go="system-club"><span>ACT</span><span><strong>KS Stal Pleszew</strong><small>Partner ACT-014</small></span><b>Otwórz →</b></button>
                <button type="button" data-go="system-orders"><span>ZAM</span><span><strong>AC/2026/1048 · pozycja 1</strong><small>Koszulka klubowa · KS Stal</small></span><b>Otwórz →</b></button>
                <button type="button" data-go="system-settlement"><span>FIN</span><span><strong>Lipiec 2026 · KS Stal</strong><small>1 279,20 zł brutto · do weryfikacji</small></span><b>Otwórz →</b></button>
            </div>
        `, 'SYSTEM');
        return;
    }

    if (action === 'system-settings') {
        open_action_dialog('Ustawienia użytkownika', `
            <div class="info-grid"><article><span>AN</span><div><strong>Anna Nowak</strong><p>Operator ACTIVIO · motyw jasny.</p></div></article><article><span>7</span><div><strong>Skróty w Systemie</strong><p>ACTIVIO jest przypięte do lewego paska.</p></div></article></div>
        `, 'SYSTEM');
        return;
    }

    if (action === 'system-invite-operator') {
        open_action_dialog('Zaproś operatora ACTIVIO', `
            <form class="action-form" data-action-form="system-invite-operator">
                <label>Imię i nazwisko<input name="name" required autocomplete="name"></label>
                <label>E-mail służbowy<input name="email" type="email" required autocomplete="email"></label>
                <label class="wide">Rola<select name="role" required><option>Operacje partnerów</option><option>Katalog</option><option>Obsługa klienta</option><option>Finanse</option><option>Administrator</option></select></label>
                <label class="wide">Data wygaśnięcia dostępu<input name="expires" type="date"></label>
                <p class="action-form-note">Operator aktywuje indywidualne konto, ustawia hasło i konfiguruje 2FA przed pierwszym dostępem do danych.</p>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Wyślij zaproszenie</button></footer>
            </form>
        `, 'ADMINISTRACJA SYSTEMU');
        return;
    }

    if (action === 'system-user-detail') {
        open_action_dialog('Anna Nowak · dostęp operatora', `
            <form class="action-form" data-action-form="system-user-update">
                <p class="action-form-note"><strong>anna.nowak@activio.pl</strong> · konto aktywne · 2FA włączone · ostatnie logowanie teraz.</p>
                <label class="wide">Rola główna<select name="role"><option>Administrator</option><option>Operacje partnerów</option><option>Katalog</option><option>Obsługa klienta</option><option>Finanse</option></select></label>
                <label class="wide">Dodatkowy zakres<select name="scope"><option>Brak — zakres roli głównej</option><option>Czasowy eksport danych</option><option>Podgląd rozliczeń</option></select></label>
                <div class="info-grid wide"><article><span>✓</span><div><strong>2FA aktywne</strong><p>Aplikacja uwierzytelniająca · 8 kodów odzyskiwania.</p></div></article><article><span>2</span><div><strong>Aktywne sesje</strong><p>MacBook · iPhone służbowy.</p></div></article></div>
                <footer><button class="dialog-button" type="button" data-action="system-user-block">Zablokuj konto</button><button class="dialog-button primary" type="submit">Zapisz dostęp</button></footer>
            </form>
        `, 'OPERATOR ACTIVIO');
        return;
    }

    if (action === 'system-role-detail') {
        open_action_dialog('Rola: Operator katalogu', `
            <form class="action-form" data-action-form="system-role-update">
                <p class="action-form-note">Rola obejmuje wyłącznie zadania katalogowe. Działania finansowe i administracyjne pozostają niedostępne.</p>
                <label class="wide">Nazwa roli<input name="name" value="Katalog" required></label>
                <div class="role-permission-grid wide"><label><input type="checkbox" checked> Produkty bazowe i SKU</label><label><input type="checkbox" checked> Ceny minimalne</label><label><input type="checkbox" checked> Weryfikacja listingów</label><label><input type="checkbox"> Rozliczenia klubów</label><label><input type="checkbox"> Reklamacje</label><label><input type="checkbox"> Operatorzy i role</label></div>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Zapisz rolę</button></footer>
            </form>
        `, 'ROLE I UPRAWNIENIA');
        return;
    }

    if (action === 'system-access-review') {
        open_action_dialog('Przegląd dostępu operatora', `
            <form class="action-form" data-action-form="system-access-review">
                <p class="action-form-note"><strong>Magda Kaczmarek · BOK</strong><br>Czasowy eksport danych przyznano 02.07.2026 do obsługi reklamacji zbiorczej.</p>
                <label class="wide">Decyzja<select name="decision"><option>Usuń dodatkowy eksport</option><option>Przedłuż do wskazanej daty</option><option>Pozostaw bez zmian</option></select></label>
                <label class="wide">Uzasadnienie<textarea name="reason" required>Cel dostępu został zakończony.</textarea></label>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Zapisz przegląd</button></footer>
            </form>
        `, 'KONTROLA DOSTĘPU');
        return;
    }

    if (action === 'system-new-club') {
        open_action_dialog('Nowy partner klubowy', `
            <form class="action-form" data-action-form="system-new-club">
                <label>Nazwa klubu<input name="club" required></label><label>NIP<input name="nip" required></label>
                <label>Miasto<input name="city" required></label><label>Opiekun<select name="manager"><option>Anna Nowak</option><option>Piotr Lis</option></select></label>
                <label class="wide">E-mail reprezentanta<input name="email" type="email" required></label>
                <p class="action-form-note">Utworzenie partnera rozpoczyna onboarding. Nie publikuje witryny ani produktów.</p>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Rozpocznij onboarding</button></footer>
            </form>
        `, 'SYSTEM / ACTIVIO');
        return;
    }

    if (action === 'system-club-status') {
        open_action_dialog('Status KS Stal Pleszew', `
            <form class="action-form" data-action-form="system-club-status">
                <label class="wide">Nowy status<select name="status" required><option>Aktywny</option><option>Ograniczony</option><option>Wstrzymany</option></select></label>
                <label class="wide">Uzasadnienie<textarea name="reason" required placeholder="Powód i zakres ograniczenia"></textarea></label>
                <p class="action-form-note">Wstrzymanie partnera blokuje publikację i sprzedaż jego listingów, ale nie usuwa danych ani historii.</p>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Zapisz decyzję</button></footer>
            </form>
        `, 'DECYZJA OPERATORA');
        return;
    }

    if (action === 'system-partner-preview') {
        open_action_dialog('Podgląd panelu KS Stal Pleszew', `
            <p class="action-info">Operator może otworzyć bezpieczny podgląd w kontekście wskazanego klubu. Tryb jest tylko do odczytu, wyraźnie oznaczony i zapisany w audycie — nie używa sesji partnera ani nie omija polityk tenantowych.</p>
            <div class="dialog-actions"><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="button" data-action="system-open-partner-preview">Otwórz podgląd tylko do odczytu</button></div>
        `, 'KONTROLOWANY PODGLĄD');
        return;
    }

    if (['system-club-documents', 'system-review-step', 'system-review-license', 'system-review-bank', 'system-edit-club'].includes(action)) {
        const system_club_dialogs = {
            'system-club-documents': ['Dokumenty klubu', 'Umowa partnerska · podpisana<br>Licencja na markę · ważna do 12.09.2026<br>Potwierdzenie rachunku · zweryfikowane'],
            'system-review-step': ['Weryfikacja organizacji', 'KRS 0000128456 · NIP 6170004182 · reprezentacja zgodna z dokumentami.'],
            'system-review-license': ['Odnowienie licencji', 'Aktualna licencja wygasa 12.09.2026. Klub otrzymał przypomnienie; nowy dokument nie został jeszcze przekazany.'],
            'system-review-bank': ['Weryfikacja rachunku', 'Rachunek PL •••• 0047 zweryfikowano 12.03.2026. Brak późniejszych zmian.'],
            'system-edit-club': ['Edycja danych rozliczeniowych', 'Zmiana danych formalnych wymaga dokumentu źródłowego, uprawnienia operatora i wpisu audytowego.'],
        }[action];
        open_action_dialog(system_club_dialogs[0], `<p class="action-info">${system_club_dialogs[1]}</p><div class="dialog-actions"><button class="dialog-button primary" type="button" data-action-close>Zamknij</button></div>`, 'KARTA KLUBU');
        return;
    }

    if (action === 'system-new-template' || action === 'system-template-detail') {
        const is_new_catalog_product = action === 'system-new-template';
        open_action_dialog(is_new_catalog_product ? 'Dodaj produkt bazowy' : 'Koszulka sportowa · CAT-TS-001', `
            <form class="action-form" data-action-form="system-catalog-template">
                <p class="action-form-note">${is_new_catalog_product ? '<strong>Produkt bazowy opisuje to, co ACTIVIO produkuje.</strong> Nie jest ofertą konkretnego klubu. Po zapisaniu dodasz warianty, minima, personalizację, zdjęcia oraz pliki produkcyjne.' : 'Edytujesz wspólne dane produktu bazowego. Zmiana nie zastępuje klubowych projektów, zdjęć ani cen sprzedaży.'}</p>
                <label>Nazwa produktu<input name="name" value="${is_new_catalog_product ? '' : 'Koszulka sportowa'}" required></label>
                <label>Kategoria<select name="category"><option>Odzież sportowa</option><option>Odzież codzienna</option><option>Akcesoria</option><option>Gadżety</option></select></label>
                <label>Producent<select name="producer"><option>ACTIVIO</option></select></label>
                <label>Jednostka<select name="unit"><option>szt.</option><option>komplet</option><option>para</option></select></label>
                <label>Stawka VAT<select name="vat"><option>23%</option><option>8%</option></select></label>
                <label>Czas produkcji<select name="lead"><option>3–5 dni roboczych</option><option>5–7 dni roboczych</option><option>7–10 dni roboczych</option></select></label>
                <label class="wide">Opis dla obsługi<textarea name="description" required>${is_new_catalog_product ? '' : 'Koszulka bazowa do klubowych projektów sportowych.'}</textarea></label>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">${is_new_catalog_product ? 'Utwórz wersję roboczą' : 'Zapisz dane produktu'}</button></footer>
            </form>
        `, 'KATALOG ACTIVIO');
        return;
    }

    if (action === 'system-duplicate-template') {
        open_action_dialog('Duplikuj szablon katalogowy', `
            <form class="action-form" data-action-form="system-duplicate-template">
                <p class="action-form-note">Kopia otrzyma nowy identyfikator i status roboczy. Nie przejmie listingów klubowych ani historii cen.</p>
                <label class="wide">Nazwa kopii<input name="name" value="Koszulka sportowa — kopia" required></label>
                <label>Producent<select name="producer"><option>ACTIVIO</option></select></label>
                <label>Kopiuj warianty<select name="variants"><option>Tak, wszystkie 7 SKU</option><option>Nie</option></select></label>
                <label class="wide">Kopiuj pliki produkcyjne<select name="files"><option>Tak, jako wersje robocze</option><option>Nie</option></select></label>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Utwórz kopię roboczą</button></footer>
            </form>
        `, 'KATALOG ACTIVIO');
        return;
    }

    if (action === 'system-new-variant' || action === 'system-edit-variant') {
        const editing = action === 'system-edit-variant';
        open_action_dialog(editing ? 'Edytuj wariant CAT-TS-001-M' : 'Nowy wariant produktu', `
            <form class="action-form" data-action-form="system-catalog-variant">
                <label>Rozmiar<input name="size" value="${editing ? 'M' : ''}" required></label>
                <label>Kolor bazowy<input name="color" value="${editing ? 'Biały · #FFFFFF' : ''}" required></label>
                <label>Kod producenta<input name="producer_code" value="${editing ? 'ACT-TS-WHT-M' : ''}" required></label>
                <label>EAN<input name="ean" value="${editing ? '5901234567812' : ''}"></label>
                <label>Waga w gramach<input name="weight" type="number" min="1" value="${editing ? '180' : ''}" required></label>
                <label>Lead time<select name="lead"><option>3–5 dni</option><option>5–7 dni</option><option>7–10 dni</option></select></label>
                <p class="action-form-note">Zmiana danych wariantu tworzy wersję audytową. Identyfikatory użyte w zamówieniach pozostają niezmienne.</p>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">${editing ? 'Zapisz wariant' : 'Utwórz wariant'}</button></footer>
            </form>
        `, 'WARIANT / SKU');
        return;
    }

    if (action === 'system-new-minimum') {
        open_action_dialog('Nowa wersja ceny minimalnej', `
            <form class="action-form" data-action-form="system-catalog-minimum">
                <label>Baza brutto<input name="base" type="number" min="0" step="0.01" value="69.00" required></label>
                <label>Numer<input name="number" type="number" min="0" step="0.01" value="8.00" required></label>
                <label>Nazwisko<input name="name_surcharge" type="number" min="0" step="0.01" value="7.00" required></label>
                <label>Obowiązuje od<input name="effective" type="date" value="2026-08-01" required></label>
                <label class="wide">Powód zmiany<textarea name="reason" required>Aktualizacja kosztu materiału i znakowania.</textarea></label>
                <p class="action-form-note">System pokaże wpływ na listingi przed zapisem. Nowa wersja nie zmienia zamówień ani historycznych naliczeń.</p>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Zapisz i przeanalizuj wpływ</button></footer>
            </form>
        `, 'WERSJONOWANE MINIMUM');
        return;
    }

    if (action === 'system-edit-personalization') {
        open_action_dialog('Reguły personalizacji', `
            <form class="action-form" data-action-form="system-catalog-personalization">
                <label>Numer — minimum<input name="number_min" type="number" value="0" min="0" required></label>
                <label>Numer — maksimum<input name="number_max" type="number" value="99" min="0" required></label>
                <label>Nazwisko — min. znaków<input name="name_min" type="number" value="2" min="0" required></label>
                <label>Nazwisko — maks. znaków<input name="name_max" type="number" value="14" min="1" required></label>
                <label class="wide">Dozwolone znaki<select name="characters"><option>Litery, spacja i łącznik</option><option>Tylko litery</option></select></label>
                <label class="wide">Moderacja<select name="moderation"><option>Automatyczna lista + ręczna obsługa wyjątku</option><option>Tylko ręczna</option></select></label>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Zapisz nową wersję reguł</button></footer>
            </form>
        `, 'PERSONALIZACJA');
        return;
    }

    if (action === 'system-edit-production') {
        open_action_dialog('Parametry produkcyjne', `
            <form class="action-form" data-action-form="system-catalog-production">
                <label>Materiał<input name="material" value="Poliester 145 g/m²" required></label>
                <label>Technologia<select name="technology"><option>Sublimacja + termotransfer</option><option>DTF</option><option>Sitodruk</option></select></label>
                <label>Obszar nadruku<input name="area" value="280 × 360 mm" required></label>
                <label>Profil koloru<select name="profile"><option>CMYK · FOGRA39</option><option>CMYK · FOGRA51</option></select></label>
                <label class="wide">Instrukcja kontroli<textarea name="quality" required>Sprawdź plik, kontrast, treść personalizacji i pozycję nadruku.</textarea></label>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Zapisz parametry</button></footer>
            </form>
        `, 'PRODUKCJA');
        return;
    }

    if (action === 'system-catalog-upload-image' || action === 'system-catalog-upload-file') {
        const image = action === 'system-catalog-upload-image';
        open_action_dialog(image ? 'Dodaj zdjęcie katalogowe' : 'Nowa wersja pliku produkcyjnego', `
            <form class="action-form" data-action-form="${image ? 'system-catalog-image' : 'system-catalog-file'}">
                <label class="wide">Plik<input name="file" value="${image ? 'koszulka-detal-v2.jpg' : 'koszulka-sportowa-v7.ai'}" required></label>
                <label>${image ? 'Rodzaj widoku' : 'Typ pliku'}<select name="type"><option>${image ? 'Detal produktu' : 'Plik produkcyjny'}</option><option>${image ? 'Widok główny' : 'Podgląd PDF'}</option><option>${image ? 'Przykład znakowania' : 'Tabela parametrów'}</option></select></label>
                <label>${image ? 'Tekst alternatywny' : 'Numer wersji'}<input name="version" value="${image ? 'Detal materiału koszulki' : 'v7'}" required></label>
                <label class="wide">Opis zmiany<textarea name="description" required>${image ? 'Nowe zdjęcie materiału i szwu bocznego.' : 'Aktualizacja obszaru bezpiecznego dla nazwiska.'}</textarea></label>
                <p class="action-form-note">${image ? 'Nowe zdjęcie wymaga weryfikacji przed publikacją.' : 'Poprzedni plik pozostanie dostępny w historii i przy zamówieniach korzystających ze starszej wersji.'}</p>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Prześlij do weryfikacji</button></footer>
            </form>
        `, image ? 'GALERIA KATALOGOWA' : 'PLIKI PRODUKCYJNE');
        return;
    }

    if (action === 'system-catalog-history') {
        open_action_dialog('Pełna historia produktu CAT-TS-001', `
            <div class="tracking-list">
                <div><i>v6</i><span><strong>Minimum S–XL i pliki produkcyjne</strong><small>24.07.2026 · Anna Nowak · cor-cat-7821</small></span></div>
                <div><i>v5</i><span><strong>Walidacja nazwiska do 14 znaków</strong><small>18.06.2026 · Piotr Lis · cor-cat-7144</small></span></div>
                <div><i>v4</i><span><strong>Profil FOGRA39 i obszar nadruku</strong><small>02.04.2026 · Anna Nowak · cor-cat-5922</small></span></div>
                <div><i>v3</i><span><strong>Tabela rozmiarów i tolerancje</strong><small>10.01.2026 · Marta Kowal · cor-cat-4110</small></span></div>
            </div>
            <p class="action-info">Każda wersja wskazuje operatora, czas, powód oraz obiekty zależne. Wersji użytej w zamówieniu nie można usunąć.</p>
        `, 'AUDYT KATALOGU');
        return;
    }

    if (action === 'system-price-impact') {
        open_action_dialog('Wpływ minimum od 1 sierpnia', `
            <div class="info-grid"><article><span>38</span><div><strong>Listingi koszulki</strong><p>Korzystają z dotkniętych wariantów.</p></div></article><article><span>3</span><div><strong>Konflikty cen</strong><p>Zostaną wstrzymane bez reakcji klubu.</p></div></article><article><span>35</span><div><strong>Bez konfliktu</strong><p>Cena detaliczna pozostaje poprawna.</p></div></article></div>
        `, 'ANALIZA CEN');
        return;
    }

    if (action === 'system-listing-review') {
        open_action_dialog('Weryfikacja listingu', `
            <div class="project-preview"><img src="${products.shirt.image}" alt="Projekt produktu"><div><strong>KS Stal · Koszulka · wersja 3</strong><p>Projekt zaakceptowany przez klub. Cena 129,00 zł; minimum wariantu od 01.08: 84,00 zł.</p></div></div>
            <div class="tracking-list"><div><i>✓</i><span><strong>Prawa do marki</strong><small>Ważne do 12.09.2026</small></span></div><div><i>✓</i><span><strong>Cena i warianty</strong><small>Brak konfliktu w tym listingu</small></span></div><div><i>✓</i><span><strong>Plik produkcyjny</strong><small>Wersja 3 gotowa</small></span></div></div>
            <div class="dialog-actions"><button class="dialog-button" type="button" data-action="system-listing-fix">Zwróć do poprawy</button><button class="dialog-button primary" type="button" data-action="system-listing-approve">Zatwierdź publikację</button></div>
        `, 'LISTING ACTIVIO');
        return;
    }

    if (action === 'system-order-detail') {
        open_action_dialog('Pozycja AC/2026/1048 · 1', `
            <div class="info-grid"><article><span>1</span><div><strong>ShopSystem</strong><p>Opłacone · transaction TX-1048 · shop ACTIVIO.</p></div></article><article><span>2</span><div><strong>Activio</strong><p>KS Stal · LST-014-001 v3 · snapshot ceny i personalizacji.</p></div></article><article><span>3</span><div><strong>Rozliczenie</strong><p>20,00 zł netto · oczekuje na dostawę i okres bezpieczeństwa.</p></div></article></div>
            <p class="action-info">Produkcję, wysyłkę i dane klienta otwiera się w uprawnionym widoku ShopSystem. Activio nie utrzymuje ich drugiej kopii.</p>
        `, 'KONTEKST POZYCJI');
        return;
    }

    if (action === 'system-case-evidence') {
        open_action_dialog('Dowody REK/2026/118', `<div class="project-preview"><img src="${products.mug.image}" alt="Zdjęcie reklamowanego produktu"><div><strong>2 pliki od klienta</strong><p>Wada nadruku widoczna po lewej stronie produktu. Dane klienta pozostają w sprawie BOK.</p></div></div>`, 'REKLAMACJA');
        return;
    }

    if (action === 'system-reject-invoice') {
        open_action_dialog('Zwróć dokument do klubu', `
            <form class="action-form" data-action-form="system-reject-invoice">
                <label class="wide">Powód<select name="reason"><option>Nieprawidłowa kwota</option><option>Nieprawidłowe dane</option><option>Nieczytelny dokument</option><option>Inny</option></select></label>
                <label class="wide">Wiadomość<textarea name="message" required></textarea></label>
                <footer><button class="dialog-button" type="button" data-action-close>Anuluj</button><button class="dialog-button primary" type="submit">Zwróć do poprawy</button></footer>
            </form>
        `, 'ROZLICZENIE');
        return;
    }

    if (action === 'system-audit-detail') {
        open_action_dialog('Zdarzenie cor-29ab17', `<div class="tracking-list"><div><i>✓</i><span><strong>ShopSystem · ORDER_ITEM_PAID</strong><small>17:42:13 · AC/2026/1048 · 1</small></span></div><div><i>!</i><span><strong>Activio · pierwsza próba</strong><small>17:42:14 · przejściowy błąd zapisu</small></span></div><div><i>✓</i><span><strong>Activio · retry 1</strong><small>17:43:02 · jeden wpis SET-014-1048-1</small></span></div></div>`, 'AUDYT INTEGRACJI');
        return;
    }

}

function download_blob(filename, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function export_orders() {
    const rows = [...document.querySelectorAll('.orders-table table tr')]
        .filter((row) => !row.hidden)
        .map((row) => (
        [...row.querySelectorAll('th, td')]
            .map((cell) => {
                const value = cell.innerText.trim().replaceAll('\n', ' · ');
                const safe_value = /^[=+\-@]/.test(value) ? `'${value}` : value;
                return `"${safe_value.replaceAll('"', '""')}"`;
            })
            .join(';')
        ));
    download_blob('activio-zamowienia-lipiec-2026.csv', `\uFEFF${rows.join('\n')}`, 'text/csv;charset=utf-8');
    show_toast('Pobrano zestawienie zamówień CSV');
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
        'activio_marketplace_research.md': 'project-research',
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
            if (response.status === 401) {
                const next = `${window.location.pathname}${window.location.search}${window.location.hash}`;
                window.location.assign(`/login?next=${encodeURIComponent(next)}`);
                return;
            }
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

function apply_use_case_filters() {
    let has_visible_exception = false;
    document.querySelectorAll('[data-use-case-role]').forEach((group) => {
        const role_matches = use_case_role_filter === 'all'
            || group.dataset.useCaseRole === use_case_role_filter;
        let has_visible_card = false;
        group.querySelectorAll('[data-use-case-card]').forEach((card) => {
            const kind = card.dataset.useCaseKind || 'core';
            const kind_matches = use_case_kind_filter === 'all' || kind === use_case_kind_filter;
            card.hidden = !kind_matches;
            has_visible_card ||= kind_matches;
            if (role_matches && kind_matches && kind === 'exception') {
                has_visible_exception = true;
            }
        });
        group.hidden = !role_matches || !has_visible_card;
    });
    const exception_heading = document.querySelector('.use-case-section-heading');
    if (exception_heading) {
        exception_heading.hidden = !has_visible_exception;
    }
}

function render_view(view_name, update_hash = true) {
    let next_view = valid_views.includes(view_name) ? view_name : 'marketplace';
    if (next_view === 'checkout' && cart_items.length === 0) {
        next_view = 'cart';
        show_toast('Dodaj produkt, aby przejść do płatności');
    }
    current_view = next_view;

    views.forEach((view) => {
        view.hidden = view.dataset.view !== next_view;
    });

    const is_partner = partner_views.includes(next_view);
    const is_system = system_views.includes(next_view);
    const is_partner_auth = partner_auth_views.includes(next_view);
    document.body.classList.toggle('system-mode', is_system);
    document.body.classList.toggle('partner-auth-mode', is_partner_auth);
    store_header.hidden = is_partner || is_system || is_partner_auth;
    partner_header.hidden = !is_partner;
    partner_mobile_nav.hidden = !is_partner;
    system_header.hidden = !is_system;
    system_mobile_nav.hidden = !is_system;
    system_sidebar.hidden = !is_system;
    system_sidebar.classList.remove('open');
    system_sidebar_backdrop.hidden = true;
    store_footer.hidden = is_partner || is_system || is_partner_auth;

    const active_partner_root = partner_nav_roots[next_view] || next_view;
    const active_system_root = system_nav_roots[next_view] || next_view;
    document.querySelectorAll('[data-go]').forEach((button) => {
        const is_partner_navigation = button.closest('[data-partner-header], [data-partner-mobile-nav]');
        const is_system_navigation = button.closest('[data-system-sidebar]');
        const is_system_app_trigger = button.closest('[data-system-header]');
        const active_view = is_partner_navigation
            ? active_partner_root
            : (is_system_navigation ? active_system_root : (is_system_app_trigger && is_system ? 'system-dashboard' : next_view));
        button.classList.toggle('active', button.dataset.go === active_view);
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
    const containers = {
        popular: document.querySelector('[data-store-products="popular"]'),
        new: document.querySelector('[data-store-products="new"]'),
        other: document.querySelector('[data-store-products="other"]'),
    };
    const shelves = {
        popular: document.querySelector('[data-store-shelf="popular"]'),
        new: document.querySelector('[data-store-shelf="new"]'),
        other: document.querySelector('[data-store-shelf="other"]'),
    };
    const load_more = document.querySelector('[data-store-load-more]');
    const show_all_button = document.querySelector('[data-store-show-all]');
    const active_filter = document.querySelector('[data-store-filter].active')?.dataset.storeFilter || 'all';
    const selected_club = document.querySelector('select[data-store-club]')?.value || 'all';
    const sort = document.querySelector('[data-store-sort]')?.value || 'popular';
    const products = [...document.querySelectorAll('[data-store-product]')];
    const eligible = products.filter((product) => (
        (active_filter === 'all' || product.dataset.storeCategory === active_filter)
        && (selected_club === 'all' || product.dataset.storeClub === selected_club)
    ));
    const by_popularity = (left, right) => Number(right.dataset.popularity) - Number(left.dataset.popularity);
    const by_newness = (left, right) => Number(right.dataset.newness) - Number(left.dataset.newness);
    const selected_sort = (left, right) => {
        if (sort === 'price-asc') {
            return Number(left.dataset.price) - Number(right.dataset.price);
        }
        return sort === 'newest' ? by_newness(left, right) : by_popularity(left, right);
    };

    const popular = [...eligible].sort(by_popularity).slice(0, 3);
    const popular_ids = new Set(popular.map((product) => product.dataset.storeProduct));
    const newest = eligible
        .filter((product) => !popular_ids.has(product.dataset.storeProduct))
        .sort(by_newness)
        .slice(0, 2);
    const featured_ids = new Set([...popular, ...newest].map((product) => product.dataset.storeProduct));
    const other = eligible.filter((product) => !featured_ids.has(product.dataset.storeProduct));

    const groups = { popular, new: newest, other };
    Object.entries(groups).forEach(([group, items]) => {
        items.sort(selected_sort).forEach((product) => {
            product.hidden = false;
            containers[group].append(product);
        });
    });
    products
        .filter((product) => !eligible.includes(product))
        .forEach((product) => {
            product.hidden = true;
            containers.other.append(product);
        });

    shelves.popular.hidden = popular.length === 0;
    shelves.new.hidden = newest.length === 0;
    shelves.other.hidden = other.length === 0;
    containers.other.hidden = !store_show_all;
    load_more.hidden = other.length === 0;
    show_all_button.textContent = store_show_all
        ? 'Pokaż mniej'
        : `Pokaż wszystkie (${other.length})`;
    show_all_button.setAttribute('aria-expanded', String(store_show_all));
    document.querySelector('[data-store-empty]').hidden = eligible.length > 0;
}

function render_club_products() {
    const container = document.querySelector('.club-products');
    const sort = document.querySelector('[data-club-sort]').value;
    const sort_key = sort === 'price-asc'
        ? 'price'
        : sort === 'newest' ? 'newness' : 'popularity';
    const direction = sort === 'price-asc' ? 1 : -1;

    [...container.querySelectorAll('.product-card')]
        .sort((left, right) => direction * (
            Number(left.dataset[sort_key]) - Number(right.dataset[sort_key])
        ))
        .forEach((product) => container.append(product));
}

function render_sales_chart(range) {
    const chart_values = range === '7'
        ? [44, 58, 39, 72, 64, 91, 78]
        : [28, 42, 34, 56, 48, 68, 74, 61, 82, 72, 91, 78];
    const bars = [...document.querySelectorAll('.chart-bars i')];
    const start_index = bars.length - chart_values.length;
    bars.forEach((bar, index) => {
        bar.hidden = index < start_index;
        if (!bar.hidden) {
            bar.style.height = `${chart_values[index - start_index]}%`;
        }
    });
    document.querySelector('[data-chart-title]').textContent = range === '7'
        ? 'Ostatnie 7 dni'
        : 'Ostatnie 30 dni';
    document.querySelector('.chart-axis').innerHTML = range === '7'
        ? '<span>17 lip</span><span>19 lip</span><span>21 lip</span><span>23 lip</span>'
        : '<span>24 cze</span><span>1 lip</span><span>8 lip</span><span>15 lip</span><span>23 lip</span>';
}

function apply_order_filters() {
    document.querySelectorAll('.orders-table tbody tr').forEach((row) => {
        const status = row.querySelector('.table-status')?.textContent.trim().toLocaleLowerCase('pl-PL') || '';
        const matches_status = order_status_filter === 'wszystkie'
            || status.includes(order_status_filter === 'problem' ? 'reklamacja' : order_status_filter);
        const matches_phrase = order_search_phrase === ''
            || row.textContent.toLocaleLowerCase('pl-PL').includes(order_search_phrase);
        row.hidden = !matches_status || !matches_phrase;
    });
}

document.addEventListener('click', (event) => {
    if (event.target === action_dialog || event.target.closest('[data-action-close]')) {
        close_action_dialog();
        return;
    }

    const system_sidebar_toggle = event.target.closest('[data-system-sidebar-toggle]');
    if (system_sidebar_toggle) {
        const should_open = !system_sidebar.classList.contains('open');
        system_sidebar.classList.toggle('open', should_open);
        system_sidebar_backdrop.hidden = !should_open;
        return;
    }

    const catalog_button = event.target.closest('[data-catalog-add]');
    if (catalog_button) {
        catalog_button.disabled = true;
        catalog_button.querySelector('b').textContent = 'Dodano do oferty';
        show_toast('Produkt dodany ze statusem „Przygotowanie projektu”');
        return;
    }

    const search_product = event.target.closest('[data-search-product]');
    if (search_product) {
        update_product_context(search_product.dataset.searchProduct, search_product.dataset.clubId);
        close_action_dialog();
        render_view('product');
        return;
    }

    const locker_option = event.target.closest('[data-locker-option]');
    if (locker_option) {
        document.querySelector('[data-locker-value]').value = locker_option.dataset.lockerOption;
        close_action_dialog();
        show_toast('Paczkomat został zmieniony');
        return;
    }

    const project_decision = event.target.closest('[data-project-decision]');
    if (project_decision) {
        const offer_card = document.querySelector('[data-offer-item]:last-child');
        const status = offer_card.querySelector('.table-status');
        const preview = offer_card.querySelector('.offer-actions > button:first-child');
        if (project_decision.dataset.projectDecision === 'approve') {
            status.textContent = 'Do weryfikacji ACTIVIO';
            status.className = 'table-status pending';
            preview.textContent = 'Podgląd produktu';
            preview.dataset.go = 'product';
            preview.dataset.productId = 'bag';
            preview.dataset.clubId = 'stal';
            preview.removeAttribute('data-action');
            show_toast('Projekt zaakceptowany i przekazany do weryfikacji ACTIVIO');
        } else {
            status.textContent = 'Poprawki';
            status.className = 'table-status issue';
            show_toast('Projekt wrócił do ACTIVIO z prośbą o poprawki');
        }
        close_action_dialog();
        return;
    }

    const offer_question = event.target.closest('[data-offer-question]');
    if (offer_question) {
        const topic_input = document.querySelector('[data-offer-topic]');
        topic_input.value = offer_question.dataset.offerQuestion;
        document.getElementById('offer-contact').scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.setTimeout(() => topic_input.focus(), 450);
        return;
    }

    const scroll_button = event.target.closest('[data-scroll-to]');
    if (scroll_button) {
        document.getElementById(scroll_button.dataset.scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    const use_case_filter = event.target.closest('[data-use-case-filter]');
    if (use_case_filter) {
        use_case_role_filter = use_case_filter.dataset.useCaseFilter;
        document.querySelectorAll('[data-use-case-filter]').forEach((button) => {
            button.classList.toggle('active', button === use_case_filter);
        });
        apply_use_case_filters();
        return;
    }

    const use_case_kind_button = event.target.closest('[data-use-case-kind-filter]');
    if (use_case_kind_button) {
        use_case_kind_filter = use_case_kind_button.dataset.useCaseKindFilter;
        document.querySelectorAll('[data-use-case-kind-filter]').forEach((button) => {
            button.classList.toggle('active', button === use_case_kind_button);
        });
        apply_use_case_filters();
        return;
    }

    const use_case_action_step = event.target.closest('[data-use-action]');
    if (use_case_action_step) {
        event.preventDefault();
        render_view(use_case_action_step.dataset.go);
        window.requestAnimationFrame(() => {
            document.querySelector(
                `[data-view="${use_case_action_step.dataset.go}"] [data-action="${use_case_action_step.dataset.useAction}"]`,
            )?.click();
        });
        return;
    }

    const partner_catalog_filter = event.target.closest('[data-partner-catalog-filter]');
    if (partner_catalog_filter) {
        document.querySelectorAll('[data-partner-catalog-filter]').forEach((button) => {
            button.classList.toggle('active', button === partner_catalog_filter);
        });
        filter_partner_catalog();
        return;
    }

    const catalog_image_button = event.target.closest('[data-catalog-image]');
    if (catalog_image_button) {
        const gallery = catalog_image_button.closest('.catalog-gallery');
        gallery.querySelector('[data-catalog-main-image]').src = catalog_image_button.dataset.catalogImage;
        gallery.querySelectorAll('[data-catalog-image]').forEach((button) => {
            button.classList.toggle('active', button === catalog_image_button);
        });
        return;
    }

    const action_button = event.target.closest('[data-action]');
    if (action_button) {
        event.preventDefault();
        const action = action_button.dataset.action;
        if (action === 'show-hero-concepts') {
            const concepts = document.querySelector('[data-hero-concepts]');
            const content = concepts.querySelector('[data-hero-concepts-content]');
            if (!content.childElementCount) {
                content.innerHTML = document.querySelector('[data-hero-concepts-template]').innerHTML;
            }
            concepts.hidden = false;
            window.requestAnimationFrame(() => concepts.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        } else if (action === 'hide-hero-concepts') {
            const concepts = document.querySelector('[data-hero-concepts]');
            concepts.hidden = true;
            document.querySelector('.prototype-hero-options').scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (action === 'focus-club-list') {
            document.querySelector('[data-view="clubs"] .club-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (action === 'export-orders') {
            export_orders();
        } else if (action === 'print-settlement') {
            window.print();
        } else if (action === 'toggle-listing') {
            const status = document.querySelector('[data-listing-status]');
            const is_active = status.textContent.trim() === 'Aktywna';
            status.textContent = is_active ? 'Wstrzymana' : 'Aktywna';
            status.className = `table-status ${is_active ? 'reversed' : 'available'}`;
            action_button.textContent = is_active ? 'Wznów sprzedaż' : 'Wstrzymaj sprzedaż';
            show_toast(is_active ? 'Listing został wstrzymany' : 'Listing przekazany do ponownej publikacji');
        } else if (action === 'mark-all-read') {
            document.querySelectorAll('.notification-list .unread').forEach((notification) => notification.classList.remove('unread'));
            document.querySelectorAll('.partner-notification-button b').forEach((badge) => badge.textContent = '0');
            show_toast('Wszystkie powiadomienia oznaczono jako przeczytane');
        } else if (action === 'download-price-list') {
            download_blob('activio-cennik-wariantow.csv', '\uFEFFWariant;Personalizacja;Minimum brutto;Cena sklepu brutto\n128-152;Numer i nazwisko;79,00;129,00\nS-XL;Numer i nazwisko;84,00;139,00', 'text/csv;charset=utf-8');
            show_toast('Pobrano cennik wariantów');
        } else if (action === 'export-settlement') {
            download_blob('activio-rozliczenie-2026-07.csv', '\uFEFFTyp;Powiązanie;Produkt;Zmiana netto\nSprzedaż;AC/2026/1048;Koszulka klubowa;+20,00\nKorekta;AC/2026/0984;Bidon klubowy;-9,00', 'text/csv;charset=utf-8');
            show_toast('Pobrano skład rozliczenia');
        } else if (['download-contract', 'download-brand-asset', 'export-audit'].includes(action)) {
            const files = {
                'download-contract': ['ACT-CLUB-2026-014.txt', 'Umowa partnerska ACT/CLUB/2026/014 — podgląd prototypu'],
                'download-brand-asset': ['stal-pleszew-v4.txt', 'Materiał marki stal-pleszew-v4.svg — podgląd prototypu'],
                'export-audit': ['activio-audyt.csv', '\uFEFFData;Osoba;Zdarzenie\nDzisiaj 18:14;Marek Kowalski;Wyświetlenie zamówienia'],
            };
            const [filename, content] = files[action];
            download_blob(filename, content, filename.endsWith('.csv') ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8');
            show_toast('Plik został przygotowany');
        } else if (['remove-member', 'security-saved'].includes(action)) {
            close_action_dialog();
            show_toast(action === 'remove-member' ? 'Dostęp użytkownika został odebrany' : 'Ustawienia bezpieczeństwa zapisane');
        } else if (['system-listing-fix', 'system-listing-approve'].includes(action)) {
            close_action_dialog();
            show_toast(action === 'system-listing-approve' ? 'Listing zatwierdzony do publikacji' : 'Listing zwrócony do poprawy z komentarzem operatora');
        } else if (['system-case-reproduce', 'system-case-adjust'].includes(action)) {
            const status = document.querySelector('[data-view="system-cases"] .case-detail .table-status');
            status.textContent = action === 'system-case-adjust' ? 'Korekta utworzona' : 'Ponowna produkcja';
            status.className = `table-status ${action === 'system-case-adjust' ? 'reversed' : 'production'}`;
            action_button.closest('.dialog-actions').querySelectorAll('button').forEach((button) => button.disabled = true);
            show_toast(action === 'system-case-adjust' ? 'Utworzono korektę −9,00 zł bez usuwania naliczenia' : 'Zlecono ponowną produkcję bez korekty klubu');
        } else if (action === 'system-approve-settlement') {
            const status = document.querySelector('[data-system-settlement-status]');
            status.textContent = 'Zatwierdzone do wypłaty';
            status.className = 'table-status available status-large';
            action_button.textContent = 'Zatwierdzone';
            action_button.disabled = true;
            show_toast('Wypłata 1 279,20 zł zaplanowana na 5 sierpnia');
        } else if (action === 'system-close-period') {
            action_button.textContent = 'Okres lipca zamknięty';
            action_button.disabled = true;
            show_toast('Okres zamknięty; utworzono zestawienia dla 12 klubów');
        } else if (action === 'system-retry-event') {
            action_button.textContent = 'Ponowiono';
            action_button.disabled = true;
            action_button.closest('tr').querySelector('.table-status').textContent = 'Sukces';
            action_button.closest('tr').querySelector('.table-status').className = 'table-status available';
            show_toast('Zdarzenie ponowione idempotentnie — bez duplikatu');
        } else if (action === 'system-reconciliation') {
            action_button.textContent = 'Uzgodniono · 0 różnic';
            action_button.disabled = true;
            show_toast('Uzgodnienie ShopSystem ↔ Activio zakończone');
        } else if (['system-export-operations', 'system-download-invoice', 'system-export-audit'].includes(action)) {
            const system_files = {
                'system-export-operations': ['activio-kolejka-operacyjna.csv', '\uFEFFPozycja;Klub;Status\nAC/2026/1048-1;KS Stal;W produkcji'],
                'system-download-invoice': ['FV-07-2026.txt', 'Prototyp dokumentu FV/07/2026 · 1 279,20 zł brutto'],
                'system-export-audit': ['activio-audyt-operacyjny.csv', '\uFEFFCzas;Źródło;Zdarzenie;Wynik\n17:42:13;ShopSystem;ORDER_ITEM_PAID;Sukces'],
            };
            const [filename, content] = system_files[action];
            download_blob(filename, content, filename.endsWith('.csv') ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8');
            show_toast('Plik został przygotowany');
        } else if (action === 'system-catalog-download-file') {
            download_blob('koszulka-sportowa-v6.txt', 'Prototyp pliku produkcyjnego koszulka-sportowa-v6.ai · SHA-256 …8f24', 'text/plain;charset=utf-8');
            show_toast('Pobrano aktywną wersję pliku katalogowego');
        } else if (action === 'customer-download-receipt') {
            download_blob('potwierdzenie-AC-2026-1048.txt', 'ACTIVIO · zamówienie AC/2026/1048 · 190,99 zł brutto · opłacone 23.07.2026', 'text/plain;charset=utf-8');
            show_toast('Pobrano potwierdzenie zamówienia');
        } else if (action === 'system-user-block') {
            close_action_dialog();
            show_toast('Konto operatora zostało zablokowane, a aktywne sesje zakończone');
        } else if (action === 'confirm-pause-conflicting-variant') {
            close_action_dialog();
            show_toast('Wariant S–XL zostanie wstrzymany 1 sierpnia');
        } else if (action === 'confirm-integration-retry') {
            close_action_dialog();
            show_toast('Zdarzenie evt-29ab17 przetworzono bez utworzenia duplikatu');
        } else if (action === 'system-bulk-review') {
            show_toast('Włączono tryb szybkiego przeglądu kolejki');
        } else if (action === 'system-open-partner-preview') {
            open_action_dialog('Podgląd tylko do odczytu', `
                <div class="info-grid"><article><span>67</span><div><strong>Zamówienia w lipcu</strong><p>Dane wyłącznie KS Stal Pleszew.</p></div></article><article><span>94</span><div><strong>Sprzedane pozycje</strong><p>4 aktywne listingi klubowe.</p></div></article><article><span>1 286</span><div><strong>Naliczenie netto</strong><p>Przed zamknięciem okresu.</p></div></article></div>
                <p class="action-info">To kontrolowany podgląd bez akcji partnera. Wejście zapisano w audycie operatora.</p>
            `, 'KS STAL PLESZEW');
        } else {
            show_action(action, action_button);
        }
        return;
    }

    if (event.target === scenario_backdrop) {
        close_overlays(true);
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
        store_show_all = false;
        render_store_products();
        return;
    }

    const store_show_all_button = event.target.closest('[data-store-show-all]');
    if (store_show_all_button) {
        store_show_all = !store_show_all;
        render_store_products();
        if (store_show_all) {
            document.querySelector('[data-store-shelf="other"]').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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

    const remove_button = event.target.closest('[data-cart-remove]');
    if (remove_button) {
        const item_element = remove_button.closest('[data-cart-item-key]');
        cart_items = cart_items.filter((item) => item.key !== item_element.dataset.cartItemKey);
        render_cart();
        show_toast('Produkt usunięty z koszyka');
        return;
    }

    const quantity_button = event.target.closest('[data-quantity-change]');
    if (quantity_button) {
        const item_element = quantity_button.closest('[data-cart-item-key]');
        const item = cart_items.find((cart_item) => cart_item.key === item_element.dataset.cartItemKey);
        const direction = quantity_button.dataset.quantityChange;
        const next_quantity = Math.max(1, item.quantity + Number(direction));
        item.quantity = next_quantity;
        render_cart();
        document.querySelector(
            `[data-cart-item-key="${item.key}"] [data-quantity-change="${direction}"]`,
        )?.focus();
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
        if (action_dialog.open) {
            close_action_dialog();
        }
        if (go_button.dataset.clubId && go_button.dataset.clubId !== 'activio') {
            update_club_context(go_button.dataset.clubId);
        }
        if (go_button.dataset.go === 'product' && go_button.dataset.productId) {
            update_product_context(
                go_button.dataset.productId,
                go_button.dataset.clubId || current_club_id,
            );
        }
        if (go_button.dataset.go === 'partner-listing-create' && go_button.dataset.productId) {
            update_partner_listing_context(go_button.dataset.productId);
        }
        render_view(go_button.dataset.go);
        return;
    }

    const prototype_menu_button = event.target.closest('[data-prototype-menu]');
    if (prototype_menu_button) {
        const should_open = !scenario_rail.classList.contains('open');
        if (should_open) {
            close_overlays();
            overlay_trigger = prototype_menu_button;
            scenario_rail.inert = false;
            scenario_rail.setAttribute('aria-hidden', 'false');
            scenario_rail.classList.add('open');
            scenario_backdrop.classList.add('open');
            document.querySelector('[data-prototype-menu-trigger]').setAttribute('aria-expanded', 'true');
            window.requestAnimationFrame(() => {
                scenario_rail.querySelector('.scenario-head button').focus();
            });
        } else {
            close_overlays(true);
        }
        return;
    }

    const assumptions_button = event.target.closest('[data-assumptions]');
    if (assumptions_button) {
        const should_open = !assumption_drawer.classList.contains('open');
        if (should_open) {
            close_overlays();
            overlay_trigger = assumptions_button;
            assumption_drawer.inert = false;
            assumption_drawer.setAttribute('aria-hidden', 'false');
            assumption_drawer.classList.add('open');
            scenario_backdrop.classList.add('open');
            assumptions_button.setAttribute('aria-expanded', 'true');
            window.requestAnimationFrame(() => {
                assumption_drawer.querySelector('.assumption-head button').focus();
            });
        } else {
            close_overlays(true);
        }
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
        document.querySelector('.gallery-main').dataset.galleryMode = gallery_button.dataset.galleryMode;
        return;
    }

    const filter_button = event.target.closest('.filter-bar button');
    if (filter_button) {
        document.querySelectorAll('.filter-bar button').forEach((button) => button.classList.remove('active'));
        filter_button.classList.add('active');
        order_status_filter = filter_button.childNodes[0].textContent.trim().toLocaleLowerCase('pl-PL');
        apply_order_filters();
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
        render_cart();
    }
});

document.addEventListener('input', (event) => {
    if (event.target.matches('[data-search-input]')) {
        render_search_results(event.target.value);
    }
});

document.addEventListener('submit', (event) => {
    const contact_form = event.target.closest('[data-contact-form]');
    if (contact_form) {
        event.preventDefault();
        contact_form.reset();
        show_toast('Wiadomość została przekazana do ACTIVIO');
        return;
    }

    const form = event.target.closest('[data-action-form]');
    if (!form) {
        return;
    }

    event.preventDefault();
    const form_type = form.dataset.actionForm;
    const reference = `AC-${Date.now().toString().slice(-6)}`;

    if (form_type === 'partner-login' || form_type === 'partner-invite') {
        render_view('partner-two-factor');
        show_toast(form_type === 'partner-invite' ? 'Konto utworzone — skonfiguruj drugi składnik' : 'Hasło poprawne — potwierdź drugi składnik');
        return;
    }

    if (form_type === 'partner-two-factor' || form_type === 'partner-recovery-code') {
        close_action_dialog();
        render_view('partner-dashboard');
        show_toast('Bezpieczne logowanie zakończone');
        return;
    }

    if (form_type === 'partner-password-reset') {
        open_action_dialog('Jeśli konto istnieje, link został wysłany', '<p class="action-info">Link jest ważny przez 30 minut i może zostać użyty tylko raz. Po zmianie hasła zakończymy pozostałe sesje.</p><div class="dialog-actions"><button class="dialog-button primary" type="button" data-go="partner-login">Wróć do logowania</button></div>', 'RESET HASŁA');
        return;
    }

    if (form_type === 'customer-order-lookup') {
        const order_number = form.elements.order_number.value.trim().toUpperCase();
        const email = form.elements.email.value.trim().toLowerCase();
        const found = order_number === 'AC/2026/1048' && email === 'jan.kowalski@example.pl';
        render_view(found ? 'customer-order' : 'order-not-found');
        show_toast(found ? 'Zamówienie AC/2026/1048 zostało odnalezione' : 'Nie znaleziono zamówienia dla podanych danych');
        return;
    }

    if (form_type === 'customer-claim') {
        open_action_dialog('Zgłoszenie zostało przyjęte', `
            <div class="tracking-list">
                <div><i>✓</i><span><strong>Sprawa REK/2026/121 zapisana</strong><small>Koszulka KS Stal · zamówienie AC/2026/1048</small></span></div>
                <div class="pending"><i>2</i><span><strong>Weryfikacja przez BOK ACTIVIO</strong><small>Odpowiedź e-mailem najpóźniej w ciągu 2 dni roboczych</small></span></div>
                <div class="pending"><i>3</i><span><strong>Rozwiązanie</strong><small>Poprawka, ponowna produkcja albo zwrot środków</small></span></div>
            </div>
            <p class="action-info">Personalizacja nie wyłącza prawa do reklamacji. Klub otrzyma wyłącznie informację o statusie i ewentualnej korekcie rozliczenia.</p>
            <div class="dialog-actions"><button class="dialog-button primary" type="button" data-go="customer-order">Wróć do zamówienia</button></div>
        `, 'REKLAMACJA');
        return;
    }

    if (form_type === 'customer-return') {
        open_action_dialog('Zwrot ZW/2026/044 został utworzony', '<div class="tracking-list"><div><i>✓</i><span><strong>Kod nadania wygenerowany</strong><small>Wyślemy go także e-mailem</small></span></div><div class="pending"><i>2</i><span><strong>Oczekiwanie na produkt</strong><small>Nadaj paczkę w ciągu 14 dni</small></span></div><div class="pending"><i>3</i><span><strong>Kontrola i zwrot 59,00 zł</strong><small>Tą samą metodą płatności</small></span></div></div>', 'ZWROT');
        return;
    }

    if (form_type === 'partner-listing-create') {
        open_action_dialog('Produkt przekazany do przygotowania', `
            <div class="tracking-list">
                <div><i>✓</i><span><strong>Wersja robocza LST-014-018 utworzona</strong><small>Koszulka sportowa · 7 wariantów · cena 129,00 zł</small></span></div>
                <div class="pending"><i>2</i><span><strong>Projekt ACTIVIO</strong><small>Herb KS Stal i wskazówki trafiły do grafika</small></span></div>
                <div class="pending"><i>3</i><span><strong>Akceptacja klubu i ACTIVIO</strong><small>Publikacja dopiero po obu decyzjach</small></span></div>
            </div>
            <div class="dialog-actions"><button class="dialog-button" type="button" data-go="partner-offer">Wróć do oferty</button><button class="dialog-button primary" type="button" data-go="partner-listing">Otwórz listing</button></div>
        `, 'NOWA OFERTA KLUBU');
        return;
    }

    if (form_type === 'settlement-document') {
        const document_state = document.querySelector('[data-document-state]');
        const settlement_status = document.querySelector('[data-settlement-status]');
        document_state.classList.add('uploaded');
        document_state.innerHTML = '<i>✓</i><strong>FV-07-2026.pdf</strong><p>Przekazano do ACTIVIO · trwa weryfikacja dokumentu</p><button class="button ghost" type="button" data-action="submit-settlement-document">Zastąp dokument</button>';
        settlement_status.textContent = 'Weryfikacja dokumentu';
        settlement_status.className = 'table-status production status-large';
        open_action_dialog('Dokument przekazany', `
            <div class="tracking-list">
                <div><i>✓</i><span><strong>Faktura zapisana</strong><small>Numer sprawy: ${reference}</small></span></div>
                <div class="pending"><i>2</i><span><strong>Weryfikacja ACTIVIO</strong><small>Kwota, dane i rachunek bankowy</small></span></div>
                <div class="pending"><i>3</i><span><strong>Wypłata miesięczna</strong><small>Planowany termin: 05.08.2026</small></span></div>
            </div>
        `, 'ROZLICZENIE MIESIĘCZNE');
        return;
    }

    const is_join = form_type === 'join-club';
    const form_messages = {
        'club-data-change': ['Zmiana danych zgłoszona', 'Weryfikacja dokumentów i rejestrów'],
        'brand-change': ['Materiał marki przekazany', 'Weryfikacja praw i jakości pliku'],
        'invite-member': ['Zaproszenie wysłane', 'Aktywacja konta i konfiguracja 2FA'],
        'member-update': ['Uprawnienia zapisane', 'Zmiana została zapisana w dzienniku audytowym'],
        'bank-change': ['Zmiana rachunku zgłoszona', 'Weryfikacja rachunku przez ACTIVIO'],
        'contact-manager': ['Wiadomość wysłana', 'Odpowiedź opiekuna ACTIVIO'],
        'save-storefront': ['Treści przekazane', 'Weryfikacja i publikacja przez ACTIVIO'],
        'customer-order-help': ['Wiadomość została wysłana', 'Sprawdź skrzynkę i folder ze spamem'],
        'customer-contact': ['Wiadomość trafiła do BOK', 'Odpowiedź ACTIVIO na podany adres e-mail'],
        'partner-listing-comment': ['Pytanie wysłane', 'Odpowiedź operatora katalogu'],
        'partner-resubmit-listing': ['Wersja v3 przekazana', 'Ponowna weryfikacja projektu przez ACTIVIO'],
        'partner-save-compliant-price': ['Nowa cena zapisana', 'Walidacja w dniu wejścia minimum'],
        'partner-renew-license': ['Dokument licencyjny przekazany', 'Weryfikacja praw przez ACTIVIO'],
        'partner-replace-settlement-document': ['Poprawiony dokument przekazany', 'Ponowna kontrola kwoty, VAT i danych'],
        'system-new-club': ['Onboarding rozpoczęty', 'Weryfikacja organizacji i reprezentacji'],
        'system-club-status': ['Decyzja zapisana', 'Aktualizacja procesów zależnych i powiadomienie klubu'],
        'system-catalog-template': ['Produkt bazowy zapisany', 'Uzupełnienie wariantów, minimum i plików przed aktywacją'],
        'system-duplicate-template': ['Kopia robocza utworzona', 'Uzupełnienie danych i weryfikacja przed aktywacją'],
        'system-catalog-variant': ['Wariant katalogowy zapisany', 'Walidacja SKU, parametrów i zależnych listingów'],
        'system-catalog-minimum': ['Nowa wersja minimum zapisana', 'Analiza wpływu i powiadomienie dotkniętych klubów'],
        'system-catalog-personalization': ['Reguły personalizacji zapisane', 'Walidacja istniejących projektów i listingów'],
        'system-catalog-production': ['Parametry produkcyjne zapisane', 'Weryfikacja plików i instrukcji produkcyjnych'],
        'system-catalog-image': ['Zdjęcie przekazane do weryfikacji', 'Kontrola jakości i publikacja w galerii'],
        'system-catalog-file': ['Nowa wersja pliku zapisana', 'Kontrola techniczna przed oznaczeniem jako aktywna'],
        'system-invite-operator': ['Zaproszenie operatora wysłane', 'Aktywacja konta i obowiązkowa konfiguracja 2FA'],
        'system-user-update': ['Dostęp operatora zapisany', 'Zmiana roli została dodana do audytu'],
        'system-role-update': ['Rola systemowa zapisana', 'Ponowna ocena efektywnych uprawnień operatorów'],
        'system-access-review': ['Przegląd dostępu zakończony', 'Decyzja i uzasadnienie zostały zapisane w audycie'],
        'system-offboard-operator': ['Dostęp operatora zakończony', 'Wszystkie sesje i tokeny zostały unieważnione'],
        'system-order-exception': ['Decyzja dla pozycji zapisana', 'Powiadomienie klienta i korekta rozliczenia'],
        'system-case-resolution': ['Decyzja reklamacyjna zapisana', 'Uruchomienie wybranego rozwiązania i skutku finansowego'],
        'system-club-suspension': ['Zakres partnera został zawieszony', 'Powiadomienie klubu i zabezpieczenie procesów w toku'],
        'system-archive-product': ['Archiwizacja została zaplanowana', 'Powiadomienie klubów i migracja zależnych listingów'],
        'system-payout-retry': ['Ponowienie wypłaty zlecone', 'Kontrola wyniku banku bez nowego zobowiązania'],
        'system-reject-invoice': ['Dokument zwrócony do klubu', 'Oczekiwanie na poprawioną fakturę'],
    };
    const form_message = form_messages[form_type];
    open_action_dialog(
        is_join ? 'Zgłoszenie klubu przyjęte' : (form_message?.[0] || 'Formularz został wysłany'),
        `<div class="tracking-list">
            <div><i>✓</i><span><strong>${is_join ? 'Zgłoszenie zapisane' : 'Sprawa utworzona'}</strong><small>Numer: ${reference}</small></span></div>
            <div class="pending"><i>2</i><span><strong>${is_join ? 'Weryfikacja organizacji i praw do marki' : (form_message?.[1] || 'Kontakt opiekuna ACTIVIO')}</strong><small>${form_type.startsWith('system-') ? 'Działanie i uzasadnienie zapisano w audycie' : 'Status będzie widoczny w odpowiednim widoku'}</small></span></div>
            ${is_join ? '<div class="pending"><i>3</i><span><strong>Produkty, projekty i ceny</strong><small>Publikacja dopiero po akceptacji klubu i ACTIVIO</small></span></div>' : ''}
        </div>`,
        is_join ? 'ACTIVIO CLUB' : 'OFERTA DLA KLUBÓW',
    );
});

const number_input = document.querySelector('[data-number-input]');
const name_input = document.querySelector('[data-name-input]');
const number_preview = document.querySelector('[data-preview-number]');
const name_preview = document.querySelector('[data-preview-name]');
const product_photo_input = document.querySelector('[data-product-photo-input]');
const product_photo_label = document.querySelector('[data-product-photo-label]');

number_input.addEventListener('input', () => {
    const max_length = number_input.maxLength > 0 ? number_input.maxLength : 2;
    number_input.value = number_input.value.replace(/\D/g, '').slice(0, max_length);
    number_preview.textContent = number_input.value || '—';
    document.querySelector('[data-number-count]').textContent = `${number_input.value.length}/${max_length}`;
});

name_input.addEventListener('input', () => {
    name_input.value = name_input.value.toLocaleUpperCase('pl-PL').slice(0, 14);
    name_preview.textContent = name_input.value || 'TWÓJ NAPIS';
    document.querySelector('[data-name-count]').textContent = `${name_input.value.length}/14`;
});

const personalization_confirm = document.querySelector('[data-personalization-confirm]');
const add_cart_button = document.querySelector('[data-add-cart]');

function validate_product_configuration() {
    const product = products[current_product_id] || products.shirt;
    const has_required_photo = !product.requires_photo || product_photo_input.files.length > 0;
    add_cart_button.disabled = !personalization_confirm.checked || !has_required_photo;
}

personalization_confirm.addEventListener('change', validate_product_configuration);

product_photo_input.addEventListener('change', () => {
    product_photo_label.textContent = product_photo_input.files[0]?.name || 'Wybierz zdjęcie z urządzenia';
    validate_product_configuration();
});

add_cart_button.addEventListener('click', () => {
    if (add_cart_button.disabled) {
        return;
    }

    const option = document.querySelector('.size-options button.selected')?.textContent.trim() || '';
    const cart_item = {
        key: `cart-${Date.now()}`,
        club_id: current_product_club_id,
        product_id: current_product_id,
        option,
        photo: product_photo_input.files[0]?.name || '',
        number: number_input.value,
        name: name_input.value,
        quantity: 1,
    };
    const matching_item = cart_items.find((item) => (
        item.club_id === cart_item.club_id
        && item.product_id === cart_item.product_id
        && item.option === cart_item.option
        && item.photo === cart_item.photo
        && item.number === cart_item.number
        && item.name === cart_item.name
    ));
    if (matching_item) {
        matching_item.quantity += 1;
    } else {
        cart_items.push(cart_item);
    }
    render_cart();
    const product = products[current_product_id];
    const product_name = current_product_club_id === 'activio' && product.activio_name
        ? product.activio_name
        : product.name;
    show_toast(`${product_name} — dodano do koszyka`);
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
    order_search_phrase = event.target.value.trim().toLocaleLowerCase('pl-PL');
    apply_order_filters();
});

document.querySelector('[data-club-sort]')?.addEventListener('change', render_club_products);

document.querySelector('[data-chart-range]')?.addEventListener('change', (event) => {
    render_sales_chart(event.target.value);
});

document.querySelectorAll('select[data-store-club], select[data-store-sort]').forEach((select) => {
    select.addEventListener('change', () => {
        store_show_all = false;
        render_store_products();
    });
});

document.querySelector('[data-store-club-search]')?.addEventListener('input', (event) => {
    const hidden_select = document.querySelector('select[data-store-club]');
    const query = event.target.value.trim().toLocaleLowerCase('pl-PL');
    const club_options = [...hidden_select.options].filter((option) => !['all', '__none__'].includes(option.value));
    const exact_match = club_options.find((option) => option.textContent.trim().toLocaleLowerCase('pl-PL') === query);
    const partial_matches = club_options.filter((option) => option.textContent.trim().toLocaleLowerCase('pl-PL').includes(query));

    hidden_select.value = query === ''
        ? 'all'
        : (exact_match?.value || (partial_matches.length === 1 ? partial_matches[0].value : '__none__'));
    store_show_all = false;
    render_store_products();
});

document.querySelector('.partner-catalog-toolbar input')?.addEventListener('input', filter_partner_catalog);

render_final_catalogs();

document.querySelectorAll('[data-sale-price]').forEach((input) => {
    input.addEventListener('input', () => update_offer_price(input));
});

const non_functional_views = new Set([
    'use-cases',
    'feedback-history',
    'project-hub',
    'project-concept',
    'project-assumptions',
    'project-technical',
    'project-research',
]);
const scenario_routes = new Set(
    [...document.querySelectorAll('[data-use-case-card] [data-go]')]
        .map((button) => button.dataset.go),
);
const functional_views = valid_views.filter((view) => !non_functional_views.has(view));
const covered_functional_views = functional_views.filter((view) => scenario_routes.has(view));
const coverage_output = document.querySelector('[data-use-case-coverage]');
if (coverage_output) {
    coverage_output.textContent = `${covered_functional_views.length}/${functional_views.length}`;
    const missing_views = functional_views.filter((view) => !scenario_routes.has(view));
    coverage_output.title = missing_views.length > 0
        ? `Brak w scenariuszach: ${missing_views.join(', ')}`
        : 'Każdy widok produktu występuje w co najmniej jednym scenariuszu';
}

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
        close_overlays(true);
    }
});

normalize_product_cards();
render_cart();
update_club_context(current_club_id);
update_product_context(current_product_id, current_club_id);
render_store_products();
render_view(window.location.hash.slice(1) || 'marketplace', false);
check_version(true);
