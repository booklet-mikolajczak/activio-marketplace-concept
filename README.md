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
│   ├── feedback.js          # nieaktywny kod legacy
│   ├── vendor/              # nieaktywne html2canvas legacy
│   └── .htaccess
├── lib/feedback-store.mjs   # odczyt archiwum legacy
├── scripts/feedback-report.mjs
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

Prototyp korzysta z uniwersalnego widgetu Website Feedback hostowanego poza tym repozytorium. Lokalny serwer wystawia tylko mały, konfigurowany bootstrap `/website-feedback-loader.js`; bez hosta nie ładuje żadnych zewnętrznych zasobów.

Konfiguracja publicznego prototypu:

```bash
ACTIVIO_DEMO_PASSWORD='własne-mocne-hasło' \
ACTIVIO_WEBSITE_FEEDBACK_HOST='https://system3.booklet.pl' \
ACTIVIO_WEBSITE_FEEDBACK_PROJECT_KEY='activio-storefornt' \
ACTIVIO_WEBSITE_FEEDBACK_VERSION='2026-08-05.2' \
ACTIVIO_WEBSITE_FEEDBACK_DEVELOPMENT=false \
./scripts/serve-protected.sh
```

Projekt `activio-storefornt` ma skonfigurowany produkcyjny origin
`https://bkt-44-parobek.tailf5aee2.ts.net`. Recenzent uruchamia panel linkiem zawierającym ważny
token `feedback-review` w fragmencie URL. Flaga developerska pozostaje wyłączona na publicznym
prototypie. Lokalny adres `127.0.0.1` nie jest originem tego projektu i sam nie uruchomi widgetu.

Uwagi, screenshoty, odpowiedzi, działania i statusy przechowuje centralny backend Website Feedback. Stary lokalny endpoint `/api/feedback` nie jest już wystawiany, a lokalny `html2canvas` nie jest ładowany.

Dotychczasowe lokalne dane nie są usuwane ani automatycznie mieszane z nowymi projektami. Pozostają archiwum w sąsiednim `activio-club-feedback/`; czytnik otwiera istniejącą bazę wyłącznie do odczytu i zgłasza błąd, gdy jej nie znajdzie:

```bash
node scripts/feedback-report.mjs --status all
node scripts/feedback-report.mjs --json
```

Inną lokalizację wskaż przez `ACTIVIO_FEEDBACK_DIR`. Jeśli obok bazy istnieją pliki
`feedback-events.sqlite-wal` i `feedback-events.sqlite-shm`, backup musi obejmować komplet trzech
plików. Przed kopiowaniem samej bazy należy najpierw wykonać kontrolowany checkpoint SQLite.

Pliki `mockup/feedback.js`, `mockup/vendor/` i magazyn w `lib/` są zachowane wyłącznie jako nieaktywny materiał legacy oraz czytnik archiwum. `index.html` ich nie ładuje, a serwer nie wystawia starego API.

## Publikacja

Cały projekt, łącznie z dodatkiem technicznym i researchem, może być udostępniony przez tunel do chronionego serwera.

Najprostszy wariant tymczasowy:

1. uruchomić `scripts/serve-protected.sh`;
2. skierować Cloudflare Quick Tunnel na `http://127.0.0.1:8080`;
3. udostępnić adres HTTPS, login i hasło.

Dla stałego hostingu potrzebny jest proces Node, np. mały VPS za Cloudflare Tunnel/Access. `robots.txt` i `noindex` ograniczają indeksowanie, ale nie zastępują uwierzytelnienia.

Na maszynie Ubuntu projekt może działać jako restartowalna usługa za obecnym Traefikiem:

```bash
cp .env.example .env
# ustawić mocne hasło w .env
docker compose up -d
```

`compose.yml` montuje kod tylko do odczytu i nie montuje archiwum legacy, ponieważ serwer go nie używa. Konfigurację Website Feedback podaj w `.env`.

### Tymczasowy adres publiczny

Najprostszy sposób udostępnienia prototypu osobom poza Tailscale:

```bash
./scripts/share-public.sh
```

Skrypt uruchamia Cloudflare Quick Tunnel i pokazuje losowy adres `https://…trycloudflare.com`. Nie trzeba mieć konta Cloudflare. Terminal musi pozostać otwarty; `Ctrl+C` wyłącza publiczny dostęp. Przy następnym uruchomieniu adres będzie inny.

Każdy nowy origin tunelu trzeba dodać do projektu Website Feedback przed uruchomieniem widgetu.
Do regularnych recenzji wygodniejszy jest stały origin, ponieważ polityka CORS celowo nie obsługuje
wildcardów.

Publiczny adres nadal wymaga loginu i hasła z `.env`. Do stałego adresu potrzebny jest nazwany Cloudflare Tunnel albo zwykły hosting procesu Node.

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
