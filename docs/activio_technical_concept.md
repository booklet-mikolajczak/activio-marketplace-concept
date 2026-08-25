# ACTIVIO CLUB — dodatek techniczny

Status: robocza rekomendacja dla zespołu IT, nie zatwierdzona specyfikacja  
Data: 24 lipca 2026  
Koncepcja biznesowa: [docs/activio_business_concept.md](activio_business_concept.md)  
Założenia produktu: [rozdział koncepcji biznesowej](activio_business_concept.md#zalozenia-produktu)  
Research regulacyjny: [docs/activio_marketplace_research.md](activio_marketplace_research.md)

## 1. Cel i odbiorca

Ten dokument zawiera wyłącznie warstwę techniczną: granice modułów, integrację z `ShopSystem`, model domenowy, bezpieczeństwo, obserwowalność, testy i plan wdrożenia.

Decyzje o sprzedawcy, umowach, cenach, rozliczeniach, obsłudze klienta i zakresie pilotażu są opisane w dokumentach biznesowych. Technika ma implementować zatwierdzone reguły, a nie je rozstrzygać.

## 2. Rekomendacja architektoniczna

Zbudować ACTIVIO jako nowy bounded context w obecnym `api.booklet`, z osobnym storefrontem i panelem partnera. Wykorzystać jeden sklep ACTIVIO w `ShopSystem` do koszyka, transakcji, płatności i zamówień.

Klub nie powinien być encją `ShopSystem\Shop` ani `ShopSystem\Offer`. Klub to domena ACTIVIO: partner, marka, witryna i beneficjent rozliczenia.

Na tym etapie nie wydzielać osobnego repozytorium. Wydzielenie rozważyć, gdy ACTIVIO będzie miało osobny zespół, cykl wdrożeń, infrastrukturę albo wymagania bezpieczeństwa.

## 3. Granice odpowiedzialności

```text
ACTIVIO Storefront          ACTIVIO Partner Panel       System/BOK
        │                            │                       │
        └─────────────── Activio application ───────────────┘
                                  │
          ┌───────────────────────┼────────────────────────┐
          │                       │                        │
    Club & storefront      Listing & rights       Partner settlement
    brand/club rollout     personalization        immutable ledger
          │                       │                        │
          └──────────── ShopSystem integration ────────────┘
                                  │
        ShopSystem Cart → Transaction → Payment → Order → Production/Shipment
```

- `Activio` zna kluby, prawa do marki, listingi, personalizację, reguły udziału, wdrożenie klubów i rozliczenia.
- `ShopSystem` zna jeden sklep ACTIVIO, klienta, koszyk, ceny transakcyjne, płatność i zamówienie.
- Produkcja otrzymuje tylko dane potrzebne do wykonania pozycji.
- Npack i Naklejkon nie znają pojęcia klubu.

Zależności: `Activio → publiczne moduły ShopSystem`. Bez zapytań do tabel ShopSystem i bez zależności rdzenia `ShopSystem → Activio`. Integracja przez jawne komendy, DTO, query i zdarzenia.

## 4. Integracja z obecnym ShopSystem

Kod posiada `Shop`, `SalesChannel`, `SalesChannelListing`, `Product`, `Cart`, `Transaction`, `Order`, płatność i produkcję. `Cart`, `Transaction` i `Order` mają jedno `shop_id`, dlatego potrzebny jest jeden `shop_id` ACTIVIO, a nie osobny sklep na klub.

Do sprawdzenia w spike'u:

- czy produkty różnych klubowych listingów przechodzą przez jeden koszyk;
- gdzie obecne reguły wymuszają wspólne `offer_id`;
- jak przenieść identyfikator listingu i wersję personalizacji przez `Cart → Transaction → Order`;
- gdzie najbezpieczniej utworzyć snapshot rozliczeniowy;
- jakie statusy płatności, produkcji, wysyłki i zwrotu emitują stabilne zdarzenia.

Wyjątek od reguły koszyka powinien być jawny i ograniczony do typu ACTIVIO.

`SalesChannel` opisuje ACTIVIO jako całość. Slug klubu jest kontekstem witryny i filtrem oferty, nie osobnym kanałem sprzedaży.

## 5. Proponowany układ kodu

```text
app/Activio/
    Club/
    ClubBrand/
    Catalog/
    ClubListing/
    Personalization/
    PartnerAccess/
    Settlement/
    Storefront/
    ShopSystemIntegration/

app-frontend/Activio/
    strona główna + Oferta + Kluby + Market ACTIVIO + sklep klubu + karta produktu + adapter checkoutu

app-frontend/ActivioPartner/
    panel klubu

app-frontend/System/
    operacyjne ekrany ACTIVIO dla BOK
```

Panel partnera może współdzielić infrastrukturę uwierzytelniania, ale musi mieć odrębne polityki i role. Współdzielenie shellu nie może powodować dostępu do paneli Npack, Naklejkon ani danych innych klubów.

## 6. Główne agregaty i encje

### `Club`

- identyfikator i slug;
- dane prawne oraz handlowe;
- status wdrożenia klubu i umowy;
- rachunek rozliczeniowy;
- konfiguracja witryny;
- użytkownicy oraz role.

### `ClubBrandAsset`

- typ i plik źródłowy;
- właściciel oraz podstawa praw;
- zakres, data rozpoczęcia i bezterminowy charakter licencji;
- trzy jawne role kolorów: `primary_dark`, `primary_light` i `additional`;
- wersja;
- status akceptacji i cofnięcia.

### `CatalogTemplate`

- `producer_id` wskazujący producenta zatwierdzonego przez ACTIVIO;
- produkt bazowy i warianty;
- kategoria: odzież klubowa, gadżety i upominki, torby i akcesoria albo naklejki i magnesy;
- galeria co najmniej dwóch wersjonowanych zdjęć produktu z kolejnością i tekstem alternatywnym;
- technologia oraz materiał;
- wersjonowany szablon graficzny i jego plik do pobrania;
- stały układ oraz mapowanie obszarów herbu, `primary_dark` i `primary_light`;
- cechy stałe, których nie wystawia się jako wariantów, np. matowe wykończenie Magnesu koszulki;
- wersjonowana cena minimalna;
- schemat personalizacji;
- czas produkcji;
- ograniczenia i oznaczenia.

### `Producer`

- nazwa, dane operacyjne i status zatwierdzenia;
- zakres udostępnionych produktów oraz technologii;
- wersjonowane terminy i warunki realizacji;
- status aktywny, zawieszony albo wycofany.

Producenta i `CatalogTemplate` tworzy wyłącznie operator ACTIVIO. Rola klubowa nie otrzymuje komend tworzenia producenta, produktu bazowego ani dowolnego towaru.

### `ClubListing`

- `club_id` i `catalog_template_id`;
- publiczny slug i treści;
- cena detaliczna;
- użyta wersja ceny minimalnej;
- projekt oraz pliki produkcyjne;
- źródło projektu: ACTIVIO albo plik klubu wykonany na szablonie;
- status kontroli zgodności projektu klubu z wersją szablonu;
- wersja reguły udziału klubu;
- status publikacji i daty aktywności.

### `PersonalizationSchema`

- wersjonowane pola, typy i długości;
- dozwolone znaki i wartości;
- walidacja serwerowa;
- koszt i wpływ na termin;
- mapa na obszar produkcyjny;
- tekst potwierdzenia klienta.

### `OrderItemClubSnapshot`

Tworzony w chwili zamówienia:

- order id i order item id;
- club id, nazwa i slug;
- club listing id i wersja;
- cena klienta brutto i netto, stawka oraz kwota VAT i ilość;
- cena minimalna oraz jej wersja;
- reguła udziału i wyliczona kwota wynagrodzenia klubu netto;
- status VAT klubu, kwota VAT i kwota brutto do wypłaty;
- personalizacja;
- rewizja projektu i plik produkcyjny;
- moment i źródło utworzenia.

### `ClubLedgerEntry`

- club id;
- typ: accrual, release, adjustment, payout, payout_failed;
- kwota ze znakiem i waluta;
- podstawa netto, VAT i kwota brutto dokumentu rozliczeniowego;
- status: pending, available, paid, reversed;
- order item id, reklamacja albo payout id;
- idempotency key;
- daty, actor, powód i poprzedzający wpis.

Wpisy są nieedytowalne. Błąd naprawia wpis przeciwny.

### `ClubPayoutRequest`

- klub, identyfikator i data zlecenia;
- snapshot kwoty dostępnego salda oraz identyfikatorów objętych wpisów ledgera;
- naliczenia i korekty włączone do wypłaty;
- status zlecenia i przelewu;
- typ dokumentu: faktura VAT albo rachunek;
- dokument i status zatwierdzenia;
- snapshot rachunku;
- identyfikator przelewu.

Nie modelować miesięcznego `SettlementPeriod` ani operacji zamykania okresu. Saldo jest ciągłą projekcją nieedytowalnego ledgera. Zlecenie wypłaty atomowo tworzy niezmienny snapshot dostępnych środków i rezerwuje objęte wpisy ledgera. Jeden wpis może należeć najwyżej do jednego aktywnego zlecenia; jego anulowanie albo ostateczne odrzucenie zwalnia rezerwację w audytowalnym zdarzeniu. Późniejsze naliczenia pozostają poza snapshotem i mogą wejść do następnej wypłaty. Zakres dat może służyć do filtrowania raportu, ale nie zmienia dostępności środków ani granic zlecenia.

## 7. Cena, minimum i snapshot

Warunek publikacji i checkoutu:

```text
sale_price >= effective_minimum_price
```

Minimum musi uwzględniać wariant, personalizację, kanał i datę obowiązywania. Walidację wykonać:

- przy publikacji;
- przy zmianie ceny;
- przed utworzeniem transakcji.

Zmiana minimum tworzy nową wersję. Nie zmienia ceny ani historii zamówień. Listing poniżej nowego minimum otrzymuje termin korekty i może zostać automatycznie wstrzymany.

Kwoty przechowywać jako integer w groszach z jawną walutą. Reguła udziału musi mieć wersję.

Kontekst ACTIVIO nie publikuje kuponów, rabatów ani promocji cenowych. Integracja z `ShopSystem` musi blokować ich zastosowanie do pozycji ACTIVIO, nawet jeśli sam `ShopSystem` obsługuje takie mechanizmy dla innych sklepów.

Snapshot pozycji jest jedynym źródłem historycznej ceny i rozliczenia. Nie przeliczamy starych zamówień z aktualnego listingu lub umowy.

## 8. Zdarzenia i rozliczenia

Rekomendowana sekwencja:

```text
PaymentConfirmed
  → ClubAccrualCreated: pending

OrderItemDelivered + safety period elapsed
  → ClubAccrualReleased: available

PayoutRequested
  → ClubPayoutRequestCreated: pending_review, ledger entries reserved

PayoutApproved + payout confirmed
  → ClubPayoutRecorded: paid

ReturnAccepted / ClaimAccepted / ChargebackReceived
  → ClubAdjustmentCreated
```

Każdy handler musi być idempotentny. Klucze powinny wynikać ze zdarzenia źródłowego, typu wpisu i pozycji zamówienia.

Nie aktualizować jednego pola salda jako źródła prawdy. Saldo jest sumą ledgera, ewentualnie wspieraną odbudowywalną projekcją.

Późny chargeback po wypłacie tworzy ujemną korektę bieżącego salda lub proces odzyskania należności zgodny z umową.

## 9. Mieszany koszyk

Techniczne przypadki wymagające modelu per pozycja:

- produkty różnych klubów;
- różne terminy produkcji;
- częściowy zwrot;
- ponowna produkcja bez nowej sprzedaży;
- anulowanie jednej pozycji;
- zawieszenie klubu po zakupie;
- cofnięcie zgody lub utrata praw do marki po zakupie;
- usunięcie lub zmiana listingu;
- rozdzielenie albo scalenie wysyłki w przyszłości.

Klub pobiera tylko pozycje należące do jego `club_id`. Nie otrzymuje pełnego zamówienia mieszanego.

## 10. Dostęp i izolacja danych

Role:

- owner: umowy, rachunek, członkowie, wypłaty;
- manager: oferta, treści, statystyki;
- accountant: rozliczenia i dokumenty;
- viewer: odczyt.

Wymagania:

- filtr `club_id` w każdym query partnera;
- polityki dostępu na poziomie akcji i zasobów;
- kwoty zarobku w panelu partnera domyślnie prezentowane brutto; netto i VAT dostępne w rozbiciu księgowym;
- zlecenie wypłaty jako osobny widok z wymaganym uploadem faktury albo rachunku;
- testy IDOR „klub A nie odczyta klubu B”;
- 2FA dla ownera;
- ponowne uwierzytelnienie przy zmianie rachunku;
- powiadomienie starego i nowego kontaktu;
- audyt odczytów eksportów, zmian finansowych i uprawnień;
- możliwość natychmiastowego zablokowania klubu i użytkownika.

Snowflake ID przekazywać do JavaScript wyłącznie jako string.

## 11. Prywatność, pliki i retencja

Oddzielić zakresy danych:

- klub nie otrzymuje danych dostawy;
- produkcja nie otrzymuje rozliczeń klubu;
- rozliczenia nie otrzymują treści personalizacji;
- statystyki nie ujawniają pojedynczych osób przy małych próbach.

Uploady:

- kontrola MIME i rozszerzenia;
- limity rozmiaru;
- skanowanie;
- prywatny storage;
- podpisane, krótkotrwałe URL;
- usuwanie metadanych;
- wersjonowanie i audyt;
- jawne źródło oraz prawa do materiału.

Projekt załączony przez klub musi wskazywać wersję `CatalogTemplate`, przejść te same kontrole MIME, skanowanie i wersjonowanie co pozostałe materiały oraz otrzymać decyzję operatora ACTIVIO. Upload nie może bezpośrednio ustawić aktywnego pliku produkcyjnego.

Osobne polityki retencji dla kont, zamówień, dokumentów księgowych, personalizacji, plików produkcyjnych, eksportów, logów bezpieczeństwa i materiałów klubowych.

## 12. Import katalogu ACTIVIO

`activio.pl` może być źródłem kontrolowanego importu początkowego, nie zależnością runtime.

Importer powinien:

- utworzyć stabilne `CatalogTemplate`;
- rozdzielić produkt, wariant, personalizację i próg ilościowy;
- skopiować obrazy do zarządzanego storage;
- zapisać źródło, prawa, alt i wersję;
- nie kopiować ceny B2B bezpośrednio jako minimum detalicznego;
- oznaczyć produkty wymagające minimalnego nakładu;
- wygenerować raport rekordów wymagających ręcznej decyzji.

Po imporcie katalog aktualizuje operator. Dodatkowy producent przechodzi zatwierdzenie ACTIVIO, a jego produkty są importowane lub wprowadzane do katalogu centralnego; klub nie tworzy własnego źródła katalogu.

## 13. Storefront, SEO i cache

- osobne URL dla strony głównej, Oferty, listy klubów, Sklepu ACTIVIO, klubu i produktu;
- stabilny slug klubu oraz listingu;
- canonicale eliminujące duplikację Market ACTIVIO/sklep klubu;
- metadata i dane strukturalne świadome sprzedawcy oraz klubu;
- sitemap dla aktywnych klubów i produktów;
- brak indeksowania szkiców i wstrzymanych ofert;
- cache key zawierający kontekst klubu, wersję ceny i publikacji;
- inwalidacja po zmianie ceny, praw, grafiki lub statusu;
- feature flags per klub i funkcję awaryjnego wstrzymania sprzedaży.
- polskie, zrozumiałe nazwy w każdym widoku publicznym i partnerskim; wewnętrzne kody uprawnień oraz integracji wyłącznie w audycie lub rozwijanych szczegółach technicznych;
- termin „wdrożenie klubu” zamiast „onboarding” w treściach interfejsu;
- bezterminowość licencji nie jest kolumną ani filtrem listingu; widoki prawne nadal pokazują dokument, datę rozpoczęcia i historię cofnięcia.

## 14. Obserwowalność i uzgodnienia

Metryki:

- różnica checkout → order snapshot;
- różnica order snapshot → ledger;
- suma ledgera → payout request → payout;
- zdarzenia odrzucone i ponowione;
- duplikaty idempotency key;
- czas od płatności do produkcji i dostawy;
- liczba listingów z ceną poniżej nowego minimum;
- błędy izolacji i odmowy autoryzacji;
- nieudane wypłaty.

Potrzebne okresowe joby uzgadniające oraz alert, gdy dowolna suma finansowa nie zgadza się co do grosza.

Logi muszą zawierać identyfikatory korelacyjne zamówienia, pozycji, klubu, wpisu ledgera i zlecenia wypłaty, bez ujawniania treści personalizacji.

## 15. Minimalny vertical slice

1. Jeden `shop_id` ACTIVIO.
2. Dwa kluby i po jednym listingu.
3. Dwa produkty w jednym koszyku.
4. Snapshot ceny, minimum, udziału, projektu i personalizacji per pozycja.
5. Płatność i zamówienie w `ShopSystem`.
6. Idempotentne naliczenia oczekujące.
7. Widok pozycji oraz ledgera ograniczony do klubu.
8. Zwolnienie naliczenia do salda dostępnego.
9. Zlecenie wypłaty przez klub z fakturą VAT albo rachunkiem.
10. Częściowa korekta jednej pozycji.
11. Uzgodnienie kwot checkout → order → ledger → payout request → payout.

To ma być spike potwierdzający granice, nie początek pełnej implementacji.

## 16. Testy obowiązkowe

- dwa kluby w jednym koszyku;
- klub A nie odczyta zasobu klubu B przez listę ani identyfikator;
- edycja listingu nie zmienia snapshotu zamówienia;
- minimum jest sprawdzane przy publikacji i checkoutcie;
- kupon lub rabat nie może zostać zastosowany do pozycji ACTIVIO;
- podwójny webhook tworzy jedno naliczenie;
- częściowy zwrot koryguje właściwą sztukę i klub;
- zwrot po wypłacie tworzy korektę, nie usuwa historii;
- zmiana rachunku wymaga właściwej roli i audytu;
- cofnięta zgoda lub utrata praw do marki blokuje nowe zakupy, nie historię;
- niepoprawna personalizacja jest odrzucana po stronie serwera;
- brak potwierdzenia personalizacji blokuje zakup;
- statusy produkcji mapują się na stabilne statusy klienta i klubu;
- krytyczne ścieżki działają z klawiatury i czytnikiem.

Po zmianach uruchamiać testy właściwych modułów, PHPCS i PHPStan zgodnie z zasadami repozytorium.

## 17. Wymagania niefunkcjonalne

- pełny audit log zmian finansowych, praw i uprawnień;
- idempotencja webhooków, naliczeń, korekt i wypłat;
- dostępność WCAG dla krytycznych ścieżek;
- brak danych osobowych w cache publicznym i logach;
- bezpieczne zamykanie sprzedaży per klub, produkt i cały ACTIVIO;
- odtwarzalność projekcji finansowych z wpisów źródłowych;
- migracje zgodne wstecznie;
- monitoring kolejek i zdarzeń;
- udokumentowane procedury ponowienia oraz ręcznej korekty.

## 18. Sekwencja wdrożenia

1. Audyt `ShopSystem` i spike mieszanego koszyka.
2. Zatwierdzenie granic i kontraktów integracyjnych.
3. Modele klubu, katalogu i listingu.
4. Storefront dwóch klubów.
5. Przeniesienie kontekstu ACTIVIO przez checkout i order.
6. Snapshot oraz ledger.
7. Izolowany panel klubu.
8. Zwroty, reklamacje i korekty.
9. Zlecenie wypłaty z snapshotem salda i ręczna weryfikacja ACTIVIO.
10. Obserwowalność, uzgodnienia i hardening.

Każdy etap powinien kończyć się działającym przepływem i testem integracyjnym, bez utrzymywania dwóch źródeł prawdy.

## 19. Rejestr decyzji technicznych

| Decyzja | Rekomendacja | Status |
|---|---|---|
| Repozytorium | obecne `api.booklet` | rekomendacja |
| Granica | nowy bounded context `Activio` | rekomendacja |
| Frontend | osobny storefront i panel partnera | rekomendacja |
| `ShopSystem\Shop` | jeden sklep ACTIVIO | do spike'u |
| Klub jako `Shop` | nie | rekomendacja |
| Klub jako `Offer` | nie | rekomendacja |
| Listing | domena ACTIVIO | rekomendacja |
| Projekt listingu | wersjonowany szablon; herb + `primary_dark` + `primary_light`; projekt ACTIVIO albo upload klubu do weryfikacji | wymagane |
| Kolory marki | `primary_dark`, `primary_light`, `additional` jako trzy różne pola | wymagane |
| Stałe cechy produktu | nie są wariantami; Magnes koszulka zawsze matowy | wymagane |
| Galeria Oferty B2B | co najmniej dwa oficjalne zdjęcia dla każdego produktu; activio.pl jako źródło referencyjne; główne zdjęcie otwiera dostępny lightbox z licznikiem i nawigacją | wymagane |
| Licencja | bezterminowa; bez czasu trwania w operacyjnych listach | wymagane |
| Język UI | polski; kody techniczne poza podstawową treścią | wymagane |
| Historia ceny i udziału | snapshot per pozycja | wymagane |
| Rozliczenia | nieedytowalny ledger i snapshot salda per zlecenie wypłaty; bez okresów miesięcznych | wymagane |
| Integracja | publiczne moduły, DTO, komendy i zdarzenia | rekomendacja |
| Idempotencja | per zdarzenie i pozycja | wymagane |
| Storage obrazów | zarządzany storage, nie hotlink w produkcji | wymagane |

## 20. Otwarte pytania techniczne

1. Która obecna reguła koszyka blokuje produkty z różnych `Offer`?
2. Czy standardowe produkty dwóch listingów przechodzą przez jeden `shop_id` bez zmiany rdzenia?
3. Gdzie zapisać stabilne metadata ACTIVIO na pozycji koszyka i zamówienia?
4. Które zdarzenie jest pewnym momentem utworzenia naliczenia?
5. Jak dziś modelowane są częściowy zwrot i ponowna produkcja?
6. Czy panel partnera może użyć istniejącego logowania bez rozszerzenia uprawnień?
7. Gdzie utrzymywać wersjonowane pliki produkcyjne?
8. Jak obecna integracja płatności obsługuje częściowe zwroty i chargebacki?
9. Jak mapować wewnętrzne statusy produkcji na uproszczony status klubu?
10. Jak uruchamiać job zwalniający środki i zapewnić jego idempotencję?
11. Jakie raporty księgowe i eksporty mogą użyć istniejących komponentów?
12. Czy istniejąca infrastruktura obsłuży osobną domenę, sitemapę i cache ACTIVIO?

## 21. Techniczna definicja gotowości

Pełna implementacja może ruszyć po:

- zatwierdzeniu biznesowej reguły ceny, udziału i korekt;
- pozytywnym spike'u mieszanego koszyka;
- uzgodnieniu kontraktów z `ShopSystem`;
- wskazaniu źródła prawdy dla ceny, personalizacji i rozliczenia;
- zaakceptowaniu modelu autoryzacji per klub;
- potwierdzeniu obsługi zwrotu i reklamacji per pozycja;
- przejściu testu kwot checkout → order → ledger → payout request → payout;
- decyzji o storage, retencji, monitoringu i procedurze awaryjnej.
