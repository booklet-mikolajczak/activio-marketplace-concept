# ACTIVIO CLUB — koncepcja i mockup

Niezależny, statyczny projekt koncepcyjny. Nie jest częścią `api.booklet` ani implementacją produkcyjną.

Wymaga Node.js 24. Nie wymaga instalowania paczek npm.

## Struktura

```text
activio-club-concept/
├── index.html
├── mockup/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── feedback.js
│   ├── vendor/
│   └── .htaccess
├── docs/
│   ├── activio_business_concept.md
│   ├── activio_technical_concept.md
│   └── activio_marketplace_research.md
└── assets/
```

## Uruchomienie chronione hasłem

```bash
cd /home/bartek/Desktop/activio-club-concept
ACTIVIO_DEMO_PASSWORD='własne-mocne-hasło' ./scripts/serve-protected.sh
```

Otwórz:

```text
http://127.0.0.1:8080/
```

Serwer pokazuje własny formularz logowania, działający również w osadzonych przeglądarkach i bocznych panelach, które nie wyświetlają systemowego okna HTTP Basic Auth. Login: `activio`. Hasło pochodzi wyłącznie ze zmiennej środowiskowej i nie jest zapisywane w repozytorium.

Po poprawnym logowaniu serwer ustawia podpisane, niedostępne dla JavaScript cookie sesyjne na maksymalnie 7 dni. Restart procesu unieważnia wcześniejsze sesje. Basic Auth pozostaje obsługiwany dla skryptów i narzędzi raportowych. Formularz ogranicza liczbę błędnych prób logowania z jednego adresu.

`ACTIVIO_TRUST_PROXY=true` należy ustawiać wyłącznie wtedy, gdy serwer jest osiągalny przez kontrolowany reverse proxy, jak Tailscale Funnel lub Traefik z `compose.yml`. W przeciwnym razie limiter korzysta z adresu bezpośredniego połączenia.

Router chroni wszystkie zasoby, w tym dokumenty Markdown i obrazy dostępne bezpośrednimi adresami. Nie należy zastępować go formularzem hasła działającym wyłącznie w JavaScript.

Opcjonalnie można zmienić login i port:

```bash
ACTIVIO_DEMO_USER='demo' \
ACTIVIO_DEMO_PASSWORD='własne-mocne-hasło' \
ACTIVIO_DEMO_PORT=8090 \
./scripts/serve-protected.sh
```

`ACTIVIO_DEMO_HOST=0.0.0.0` jest potrzebne tylko w kontenerze lub przy świadomym wystawieniu portu w sieci. Domyślnie serwer nasłuchuje bezpiecznie wyłącznie na `127.0.0.1`.

## Uwagi użytkowników

Przycisk „Uwagi” pozwala:

- wskazać dowolny element lub zaznaczony tekst;
- dodać komentarz i automatyczny screenshot;
- zobaczyć pinezki na właściwych ekranach;
- odpowiadać i zmieniać status: nowa, w realizacji, rozwiązana, odrzucona.

Widok „Historia zmian” odczytuje tę samą bazę, pomija uwagi odrzucone i pokazuje przy każdej uwadze działania wdrożeniowe. Zwykła odpowiedź i wykonane działanie są odrębnymi typami wpisu, dlatego pytanie w dyskusji nie jest prezentowane jako zrealizowana poprawka.

Zdarzenia są append-only: aplikacja dopisuje nowe wpisy, nie aktualizuje ani nie usuwa wcześniejszych. Dane nie znajdują się w repozytorium mockupu, dlatego zmiana, publikacja lub podmiana jego plików ich nie kasuje.

Domyślne miejsce:

```text
/home/bartek/Desktop/activio-club-feedback/
├── feedback-events.sqlite
└── screenshots/
```

Można je zmienić przez `ACTIVIO_FEEDBACK_DIR`. Ten katalog należy osobno backupować i nie umieszczać w katalogu publicznym.

Odczyt otwartych uwag dla zespołu lub Codex:

```bash
node scripts/feedback-report.mjs
node scripts/feedback-report.mjs --status all
node scripts/feedback-report.mjs --view marketplace
node scripts/feedback-report.mjs --json
```

Test magazynu uwag:

```bash
node --test tests/feedback-store.test.mjs
node --test tests/server-auth.test.mjs
```

System jest przeznaczony dla zaproszonych recenzentów znających wspólne hasło. Podpis autora jest deklaratywny, a nie potwierdzony osobnym kontem użytkownika.

## Publikacja

Cały projekt, łącznie z dodatkiem technicznym i researchem, może być udostępniony przez tunel do chronionego serwera.

Najprostszy wariant tymczasowy:

1. uruchomić `scripts/serve-protected.sh`;
2. skierować Cloudflare Quick Tunnel na `http://127.0.0.1:8080`;
3. udostępnić adres HTTPS, login i hasło.

Dla stałego hostingu potrzebny jest proces Node z trwałym wolumenem na bazę i screenshoty, np. mały VPS za Cloudflare Tunnel/Access. Sam Cloudflare Pages nie obsłuży zapisu uwag. `robots.txt` i `noindex` ograniczają indeksowanie, ale nie zastępują uwierzytelnienia.

Na maszynie Ubuntu projekt może działać jako restartowalna usługa za obecnym Traefikiem:

```bash
cp .env.example .env
# ustawić mocne hasło w .env
docker compose up -d
```

`compose.yml` montuje kod tylko do odczytu, a trwałe dane zapisuje w sąsiednim `activio-club-feedback`.

### Tymczasowy adres publiczny

Najprostszy sposób udostępnienia prototypu osobom poza Tailscale:

```bash
./scripts/share-public.sh
```

Skrypt uruchamia Cloudflare Quick Tunnel i pokazuje losowy adres `https://…trycloudflare.com`. Nie trzeba mieć konta Cloudflare. Terminal musi pozostać otwarty; `Ctrl+C` wyłącza publiczny dostęp. Przy następnym uruchomieniu adres będzie inny.

Publiczny adres nadal wymaga loginu i hasła z `.env`. Do stałego adresu potrzebny jest nazwany Cloudflare Tunnel albo zwykły hosting procesu Node z trwałym wolumenem.

### Stały adres publiczny przez Tailscale Funnel

Kontener udostępnia serwer wyłącznie lokalnie na `127.0.0.1:18080`. Tailscale Funnel publikuje ten port pod stałym adresem HTTPS:

```text
https://bkt-44-parobek.tailf5aee2.ts.net/
```

Status tunelu:

```bash
tailscale funnel status
```

Ponowne włączenie tunelu:

```bash
tailscale funnel --bg http://127.0.0.1:18080
```

Funnel zapewnia publiczny dostęp bez konta Tailscale. Formularz logowania aplikacji nadal chroni prototyp.

## Źródła

- `mockup/` — klikalny prototyp;
- `docs/activio_business_concept.md` — kanoniczny materiał dla biznesu wraz z założeniami produktu;
- `docs/activio_technical_concept.md` — kanoniczny materiał dla IT;
- `docs/activio_marketplace_research.md` — źródła i research wspierające decyzje.

Mockup jest warstwą prezentacji. Nie jest niezależnym źródłem zasad biznesowych ani technicznych.

Biblioteka `html2canvas` 1.4.1 jest dołączona lokalnie na licencji MIT i służy wyłącznie do tworzenia screenshotów uwag.
