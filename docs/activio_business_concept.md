# ACTIVIO CLUB — koncepcja biznesowa

Status: materiał do decyzji biznesowych, nie specyfikacja wdrożeniowa  
Data: 27 lipca 2026
Prototyp: [mockup/index.html](../mockup/index.html)  
Założenia produktu: [rozdział dokumentu](#zalozenia-produktu)  
Dodatek dla IT: [docs/activio_technical_concept.md](activio_technical_concept.md)  
Research regulacyjny: [docs/activio_marketplace_research.md](activio_marketplace_research.md)

## 1. Streszczenie

ACTIVIO łączy usługi produkcyjne dla klubów, program partnerski ACTIVIO Club i wspólny Market. W ramach ACTIVIO Club klub otrzymuje własny sklep, ofertę, panel wyników i rozliczenia, a ACTIVIO odpowiada za sprzedaż, produkcję, płatność, obsługę klienta, pakowanie i wysyłkę.

Sprzedaż konsumencka jest dostępna na dwa sposoby:

1. przez sklep konkretnego klubu;
2. przez wspólny Market ACTIVIO zawierający produkty klubów i dopuszczone produkty własne.

Poniższe założenia są roboczym punktem wyjścia do pilotażu. Szczegóły i otwarte decyzje rozwijają kolejne rozdziały.

## 2. Architektura oferty ACTIVIO

Strona główna ACTIVIO prowadzi do trzech odrębnych usług:

1. **Oferta** — aktualny katalog druku i gadżetów kierowany do klubów sportowych. Produkt prowadzi do zapytania lub zamówienia B2B.
2. **Kluby / ACTIVIO Club** — program partnerski, lista klubów i wejścia do ich oficjalnych sklepów.
3. **Sklep** — e-commerce z produktami wszystkich klubów oraz dopuszczonymi produktami własnymi ACTIVIO.

Produkty ze Sklepu ACTIVIO i oficjalnych sklepów klubowych korzystają z jednego koszyka. Oferta B2B ma osobną ścieżkę zapytania lub zamówienia i nie miesza się z koszykiem konsumenckim.

## Założenia produktu

1. ACTIVIO jest formalnym sprzedawcą. Klub otrzymuje wynagrodzenie partnerskie zgodne z umową.
2. Sklep klubu i wspólny Market ACTIVIO pokazują te same produkty klubowe, a nie dwa niezależne katalogi.
3. Sklep obejmuje kluby ACTIVIO i dopuszczone produkty własne; Npack, Naklejkon i pozostałe marki Booklet są poza nim.
4. Jeden koszyk może zawierać produkty wielu klubów, a kupujący płaci raz.
5. Produkty wielu klubów są domyślnie wysyłane jedną paczką z jednego centrum realizacji.
6. Klub nie utrzymuje magazynu, nie produkuje, nie pakuje i nie obsługuje wysyłki.
7. Klub wybiera produkty z katalogu ACTIVIO, zatwierdza projekt i ustala cenę detaliczną.
8. Cena klubu nie może być niższa od minimum określonego przez ACTIVIO dla produktu, wariantu i personalizacji.
9. ACTIVIO zatwierdza produkt, projekt i cenę przed publikacją.
10. Wynagrodzenie właściwego klubu jest przypisane do każdej sprzedanej pozycji.
11. Warunki obowiązujące w chwili zakupu pozostają częścią historii zamówienia i rozliczenia.
12. Wynagrodzenie klubu staje się dostępne po dostarczeniu i zakończeniu ustalonego okresu bezpieczeństwa.
13. Klub widzi dane potrzebne do oceny sprzedaży i identyfikacji produktu, ale nie pełne dane kupującego.
14. Katalog i lista producentów są kontrolowane przez ACTIVIO; klub nie dodaje własnych dostawców ani dowolnych towarów.

Historia pozycji zachowuje klub, produkt, wariant, personalizację, zaakceptowany projekt, cenę klienta, obowiązujące minimum, wynagrodzenie klubu, podatek i ilość. Późniejsza zmiana ceny, projektu lub umowy nie zmienia wcześniejszego zamówienia.

Każde założenie wymaga potwierdzenia biznesowego, prawnego albo operacyjnego przed pilotażem.

## 3. Problem, który rozwiązujemy

Kluby przyjmują zamówienia przez wiadomości, telefony, arkusze i kartki. Powoduje to:

- pomyłki w rozmiarach, numerach i nazwiskach;
- brak aktualnej oferty i cen;
- konieczność zbierania przedpłat;
- magazynowanie lub zamawianie całych partii;
- ręczne pakowanie i wysyłkę;
- trudne rozliczanie sprzedaży;
- brak danych o zainteresowaniu produktami.

ACTIVIO CLUB zamienia ten proces w stały, samoobsługowy kanał sprzedaży.

## 4. Wartość dla klubu

> Oficjalny sklep klubowy bez magazynu, produkcji, pakowania i obsługi wysyłek. Klub wybiera ofertę, ustala ceny, promuje sklep i otrzymuje przejrzyste rozliczenie każdej sprzedaży.

Klub otrzymuje:

- własną witrynę i adres;
- produkty z herbem i identyfikacją klubu;
- możliwość personalizacji;
- sprzedaż bez zakupu towaru na magazyn;
- panel oferty, cen, wyników i rozliczeń;
- obsługę produkcji, płatności, dostawy i reklamacji przez ACTIVIO;
- wynagrodzenie od sprzedaży zgodne z umową.

## 5. Wartość dla kupującego

> Oficjalne produkty klubowe, wykonywane na zamówienie, dostępne w jednym prostym zakupie.

Kupujący może:

- znaleźć klub albo produkt;
- wybrać rozmiar, numer, nazwisko lub inną dopuszczoną personalizację;
- połączyć w koszyku produkty kilku klubów;
- zapłacić raz;
- śledzić jedno zamówienie;
- zobaczyć, jaka kwota z zakupu przypada klubowi.

## 6. Jeden sklep, wiele witryn klubowych

Sklep klubu i wspólny Market ACTIVIO nie są oddzielnymi biznesami ani kopiami oferty. Ten sam produkt klubowy może być znaleziony:

- w witrynie klubu;
- w kategorii Sklepu ACTIVIO;
- w wynikach wyszukiwania;
- przez bezpośredni link z mediów społecznościowych.

Sklep obejmuje produkty klubów ACTIVIO oraz dopuszczone produkty własne ACTIVIO. Npack, Naklejkon i inne marki Booklet pozostają poza nim.

## 7. Kto jest sprzedawcą

### Przyjęty model: ACTIVIO

- klient kupuje od ACTIVIO;
- ACTIVIO pobiera płatność i wystawia dokument sprzedaży;
- ACTIVIO odpowiada za produkt, termin, dostawę, zwrot i reklamację;
- klub udostępnia markę, promuje sklep i otrzymuje umowne wynagrodzenie;
- jedno zamówienie może obejmować produkty wielu klubów.

Ten wariant upraszcza doświadczenie klienta i odpowiedzialność za realizację, ale przenosi na ACTIVIO pełne obowiązki sprzedawcy.

### Model wykluczony: klub jako sprzedawca

Jeżeli kluby miałyby sprzedawać własne produkty, wystawiać dokumenty klientowi lub odpowiadać za realizację, powstałby model wielu sprzedawców. Oznaczałby osobne umowy w koszyku, dodatkową weryfikację klubów, podział płatności i znacznie szersze obowiązki platformy.

Nie zakładamy tego wariantu. ACTIVIO pozostaje sprzedawcą, a kluby partnerami.

### Decyzje wymagające potwierdzenia

Prawnik i księgowy powinni potwierdzić:

- stronę umowy z konsumentem;
- podstawę wynagrodzenia klubu;
- sposób dokumentowania rozliczeń;
- zasady komunikowania „wsparcia klubu”;
- obowiązki informacyjne, podatkowe i raportowe.

## 8. Ceny i wynagrodzenie klubu

### Zasada cenowa

Klub sam ustala publiczną cenę produktu. ACTIVIO określa minimalną dopuszczalną cenę dla każdego produktu, wariantu i rodzaju personalizacji.

Cena minimalna ma pokrywać:

- produkcję;
- personalizację;
- opakowanie i obsługę;
- płatność;
- ryzyko błędów i reklamacji;
- minimalną marżę ACTIVIO.

Klub nie może opublikować ceny niższej od minimum. Jeżeli ACTIVIO podnosi minimum, klub dostaje czas na zmianę ceny; oferta pozostająca poniżej minimum zostaje wstrzymana.

### Wynagrodzenie klubu

Do decyzji pozostają dwa modele:

1. klub otrzymuje różnicę między ceną sprzedaży a ustalonym minimum;
2. klub otrzymuje osobno ustaloną kwotę lub procent, a minimum wyłącznie chroni rentowność.

Na pilotaż warto rozważyć stałą kwotę za sprzedaną sztukę. Jest najłatwiejsza do zrozumienia, pokazania kupującemu i rozliczenia z klubem.

### Brutto, netto i status VAT klubu

Wszystkie ceny pokazywane kupującemu w Markecie ACTIVIO i sklepach klubowych są cenami brutto.

Wynagrodzenie partnerskie klubu jest ustalane jako kwota netto:

- klub będący czynnym podatnikiem VAT wystawia fakturę VAT i otrzymuje kwotę brutto, czyli wynagrodzenie netto powiększone o VAT;
- klub niebędący podatnikiem VAT wystawia dokument bez VAT i otrzymuje kwotę netto.

Panel musi pokazywać osobno podstawę netto, VAT oraz kwotę brutto do wypłaty. Status VAT i wymagany dokument są danymi umowy klubu. Księgowy powinien potwierdzić dokumenty i moment powstania obowiązku podatkowego przed pilotażem.

W pilotażu nie obsługujemy kuponów, kodów rabatowych, promocji cenowych ani przekreślonych cen. Cena listingu może zostać zmieniona przez klub, ale zawsze pozostaje ceną regularną i nie niższą od minimum ACTIVIO.

Trzeba jeszcze jednoznacznie ustalić:

- kiedy sprzedaż staje się należna do wypłaty;
- co dzieje się po zwrocie, reklamacji lub obciążeniu zwrotnym.

## 9. Role i odpowiedzialności

### Klub

- zawiera umowę i potwierdza prawo do marki;
- przekazuje herb, materiały i dane organizacji;
- wybiera produkty;
- ustala ceny powyżej minimum;
- zatwierdza wygląd oferty;
- promuje sklep;
- obserwuje wyniki i rozliczenia.

### ACTIVIO

- prowadzi katalog i kalkulację cen minimalnych;
- przygotowuje oraz zatwierdza produkty i grafiki;
- publikuje sklepy;
- obsługuje sprzedaż, płatności i klienta;
- produkuje, pakuje i wysyła;
- obsługuje wyjątki, zwroty i reklamacje;
- przygotowuje rozliczenia i wypłaty.

### Kupujący

- wybiera oraz sprawdza personalizację;
- akceptuje cenę, termin i warunki produktu;
- płaci ACTIVIO;
- zgłasza problemy do ACTIVIO.

## 10. Panel klubu

### Pulpit

- sprzedaż produktów klubu;
- liczba sprzedanych pozycji;
- wynagrodzenie oczekujące, dostępne, wypłacone i skorygowane;
- najlepiej sprzedające się produkty;
- trend sprzedaży;
- następna wypłata i ważne alerty.

### Oferta i ceny

- katalog produktów dostępnych dla klubu;
- status przygotowania i publikacji;
- cena minimalna ACTIVIO;
- cena detaliczna ustalana przez klub;
- prognozowane wynagrodzenie klubu;
- podgląd sklepu i akceptacja grafiki;
- widoczność sezonowa.

### Zamówienia

Klub widzi tylko swoje produkty, ich personalizację, wartość, status i wpływ na rozliczenie. Nie otrzymuje domyślnie adresu, telefonu ani pełnego koszyka kupującego.

### Rozliczenia

- każda sprzedaż, korekta i wypłata jako osobny zapis;
- powiązanie kwoty z konkretną pozycją;
- saldo oczekujące i dostępne;
- zestawienie okresowe;
- status wypłaty i dokument rozliczeniowy.

## 11. Zakres MVP

### W pilotażu

- Polska i PLN;
- ACTIVIO jako jeden sprzedawca;
- 3–5 klubów;
- Market ACTIVIO i sklepy klubowe na jednej domenie;
- wspólny koszyk i jedna płatność;
- jedna paczka z jednego centrum realizacji;
- gościnny zakup;
- katalog kontrolowany przez ACTIVIO;
- brak kuponów, rabatów i promocji cenowych;
- ceny ustalane przez kluby powyżej minimum;
- tekstowa personalizacja: rozmiar, numer, imię lub nazwisko;
- panel klubu: pulpit, oferta, zamówienia i rozliczenia;
- miesięczne wypłaty zatwierdzane przez ACTIVIO;
- ręczna obsługa wyjątków.

### Poza pilotażem

- kluby jako samodzielni sprzedawcy;
- automatyczny podział płatności;
- wiele centrów realizacji;
- wiele walut i sprzedaż zagraniczna;
- zdjęcia klientów na produktach;
- zaawansowany kreator graficzny;
- aplikacja mobilna;
- własne domeny klubów;
- program lojalnościowy.

Towary i dostawcy wprowadzani dowolnie przez kluby nie są wariantem przyszłościowym. ACTIVIO może rozszerzać katalog wyłącznie o produkty własne lub produkty zatwierdzonych dodatkowych producentów.

## 12. Główne procesy

### Uruchomienie klubu

Umowa → weryfikacja organizacji → prawa do marki → materiały → wybór produktów → projekty → akceptacja → publikacja → promocja.

### Zakup

Market ACTIVIO lub sklep klubu → produkt → personalizacja → koszyk → dostawa i płatność → produkcja → wysyłka → rozliczenie.

### Zwrot lub reklamacja

Zgłoszenie → określenie przyczyny → poprawka, ponowna produkcja albo zwrot → odpowiednia korekta rozliczenia.

## 13. Mieszany koszyk — decyzje operacyjne

Wspólny koszyk jest dużą wartością, ale wymaga uzgodnienia:

- czy cała paczka czeka na najwolniejszy produkt;
- co robimy, gdy jednej pozycji nie da się wykonać;
- jak rozliczamy częściowy zwrot;
- kto ponosi koszt błędu w personalizacji;
- co dzieje się z rozliczeniem po reklamacji;
- jak obsługujemy zamówienia w toku po zawieszeniu klubu.

Na MVP rekomendowana jest jedna paczka i jasna informacja, że termin zależy od najwolniejszego produktu.

## 14. Produkty, personalizacja i marka

ACTIVIO prowadzi katalog bazowy. Klub wybiera z niego produkty, zamiast samodzielnie definiować dowolne technologie i materiały.

Każdy produkt katalogowy wskazuje producenta zatwierdzonego przez ACTIVIO. Nowego producenta i jego produkty może wprowadzić operator ACTIVIO; klub może jedynie wybrać produkt udostępniony w katalogu.

Początkowy katalog ma cztery kategorie:

1. odzież klubowa;
2. gadżety i upominki;
3. torby i akcesoria;
4. naklejki i magnesy.

Odzież klubowa obejmuje między innymi bluzy, koszulki i czapki z oferty ACTIVIO. Nie zakładamy sprzedaży strojów meczowych ani treningowych, ponieważ kluby korzystają z własnych marek wyposażenia sportowego.

Przed publikacją należy potwierdzić:

- prawa do herbu, zdjęć, fontów i innych materiałów;
- wygląd produktu i zakres personalizacji;
- jakość plików produkcyjnych;
- cenę oraz termin;
- oznaczenia i informacje wymagane dla danego produktu.

Na MVP najlepiej ograniczyć personalizację do tekstu i kontrolowanych wartości. Zdjęcia klientów, zwłaszcza osób małoletnich, powinny pozostać poza zakresem.

## 15. Zwroty i reklamacje

Produkt wykonany według indywidualnego wyboru może podlegać innym zasadom odstąpienia niż produkt standardowy, ale nadal podlega reklamacji. Informacja dla klienta musi być jasna przed płatnością.

Proces powinien odróżniać:

- błąd wpisany przez klienta;
- błąd konfiguracji lub projektu;
- błąd produkcji;
- uszkodzenie w transporcie;
- niezgodność albo problem bezpieczeństwa.

Każda przyczyna wymaga ustalonej odpowiedzialności, czasu reakcji i skutku dla wynagrodzenia klubu.

## 16. Dane i zaufanie

Klub powinien widzieć dane potrzebne do oceny sprzedaży i identyfikacji produktu, ale nie pełne dane kupującego.

Do ustalenia:

- jakie dane są widoczne w panelu i eksporcie;
- kto w klubie ma dostęp do oferty, finansów i członków zespołu;
- jak długo przechowujemy personalizację i pliki;
- jak raportujemy małe grupy, aby nie identyfikować kupujących;
- jak informujemy o użyciu danych i prawach konsumenta.

## 17. Ryzyka biznesowe

| Ryzyko | Odpowiedź |
|---|---|
| Niejasne, kto sprzedaje | Jeden sprzedawca i spójna komunikacja w całym zakupie |
| Cena nie pokrywa pełnego kosztu | Minimum liczone dla pojedynczej produkcji na zamówienie |
| Klub oczekuje innej wypłaty | Widoczna reguła i rozliczenie każdej pozycji |
| Błąd personalizacji | Podgląd, potwierdzenie klienta i jasna odpowiedzialność |
| Wygasają prawa do herbu | Terminy licencji, przypomnienia i możliwość wstrzymania oferty |
| Jeden produkt blokuje paczkę | Jasna obietnica terminu i procedura wyjątku |
| Dużo sprzedaży bez marży | Pomiar pełnej marży po produkcji, obsłudze i reklamacjach |
| Spór po zwrocie lub reklamacji | Korekta przypisana do konkretnej pozycji i umowna procedura |

## 18. Mierniki pilotażu

- liczba klubów gotowych podpisać umowę;
- czas od umowy do uruchomienia sklepu;
- liczba aktywnych produktów;
- konwersja Sklepu ACTIVIO i sklepów klubowych;
- średnia wartość koszyka;
- udział koszyków wieloklubowych;
- marża po pełnych kosztach;
- wartość wynagrodzeń klubów;
- terminowość produkcji i wypłat;
- odsetek błędów, zwrotów i reklamacji;
- liczba wyjątków wymagających ręcznej obsługi;
- powroty kupujących.

Sam obrót nie wystarczy. Pilot ma potwierdzić jednocześnie popyt, rentowność i wykonalność operacyjną.

## 19. Plan walidacji

### Etap 0 — decyzje

- prawnik i księgowy potwierdzają model sprzedaży i rozliczeń;
- produkcja wycenia 10–15 produktów wraz z odpadem i poprawkami;
- rozmowy z pięcioma klubami;
- test mockupu z administratorami klubów i kupującymi;
- ręczna symulacja zamówień, zwrotów i wypłat;
- wybór czterech prostych produktów pilotażowych.

### Etap 1 — zamknięty pilot

- 3–5 klubów;
- ograniczony katalog;
- ręczna publikacja i wypłaty;
- cotygodniowe uzgodnienie finansów;
- rejestr wszystkich wyjątków.

### Etap 2 — automatyzacja

Dopiero po dwóch poprawnych cyklach rozliczeniowych rozszerzamy katalog, onboarding, dokumenty, wypłaty, SEO i mechanizmy sezonowe.

## 20. Rejestr decyzji biznesowych

| Decyzja | Rekomendacja | Status |
|---|---|---|
| Sprzedawca | ACTIVIO | przyjęte; do potwierdzenia prawnego |
| Strona główna | Oferta / Kluby / Sklep / Koszyk | przyjęte |
| Market ACTIVIO | produkty klubów i dopuszczone produkty własne | przyjęte |
| Mieszany koszyk | tak, jedna paczka w MVP | do potwierdzenia operacyjnego |
| Cena detaliczna | ustala klub | przyjęte |
| Dolna granica ceny | minimum ACTIVIO | przyjęte |
| Kupony i rabaty | brak w MVP | przyjęte |
| Rozszerzanie katalogu | wyłącznie ACTIVIO i zatwierdzeni producenci | przyjęte |
| Wynagrodzenie klubu | osobno dla każdej pozycji | wymagane |
| Reguła wynagrodzenia | stała kwota na sztukę w pilotażu | do decyzji |
| Wypłata | miesięczna po okresie bezpieczeństwa | do decyzji księgowej |
| Zdjęcia klientów | poza MVP | rekomendacja |
| Kluby jako sprzedawcy | poza MVP | rekomendacja |

## 21. Pytania na pierwsze spotkanie

1. Za co dokładnie klub otrzymuje pieniądze?
2. Jak dokumentujemy rozliczenie z klubem?
3. Czy klub otrzymuje różnicę ponad minimum, stałą kwotę czy procent?
4. Czy klient widzi dokładną kwotę przypadającą klubowi?
5. Kiedy środki stają się dostępne?
6. Czy wszystkie produkty powstają i jadą z jednego miejsca?
7. Co robimy, gdy jeden produkt opóźnia całą paczkę?
8. Jakie personalizacje dopuszczamy w pilotażu?
9. Kto ponosi koszt błędu klienta, produkcji i reklamacji?
10. Kto w klubie zatwierdza markę, ceny i rachunek?
11. Jakie dane kupującego naprawdę są potrzebne klubowi?
12. Jaki wynik po dwóch cyklach oznacza „skalujemy”?

## 22. Gotowość do pilotażu

Przed pełnym wdrożeniem potrzebujemy:

- prawnego potwierdzenia modelu ACTIVIO jako sprzedawcy;
- wzoru umowy z klubem;
- zatwierdzonej zasady ceny i wynagrodzenia;
- polityki zwrotów i reklamacji;
- potwierdzonego modelu dostawy;
- katalogu i pełnej kalkulacji pierwszych produktów;
- zasad użycia marki oraz danych;
- dwóch lub trzech klubów gotowych do pilotażu;
- uzgodnionych mierników sukcesu.
