# ACTIVIO — klikalny prototyp

Statyczny prototyp do rozmowy o zakresie produktu. Nie jest implementacją ani finalnym brandingiem.

## Uruchomienie

Z katalogu głównego projektu:

```text
ACTIVIO_DEMO_PASSWORD='własne-mocne-hasło' ./scripts/serve-protected.sh
```

Następnie:

```text
http://127.0.0.1:8080/mockup/
```

## Scenariusz klienta

1. Strona główna ACTIVIO.
2. Oferta B2B albo program ACTIVIO Club.
3. Wspólny Sklep i filtry kategorii lub klubu.
4. Sklep KS Stal Pleszew.
5. Personalizacja produktu.
6. Mieszany koszyk dwóch klubów.
7. Checkout.
8. Potwierdzenie i podział wynagrodzenia klubów.

## Scenariusz klubu

1. Pulpit.
2. Oferta i ustalanie cen powyżej minimum ACTIVIO.
3. Pozycje zamówień.
4. Księga rozliczeń.

## Dokumentacja w prototypie

Widok „O projekcie” rozdziela materiały według odbiorcy:

1. koncepcja biznesowa — model, wartość, role, ceny, rozliczenia, ryzyka i pilot;
2. założenia produktu — rozdział tego samego dokumentu biznesowego;
3. dodatek techniczny — architektura, integracje, dane, bezpieczeństwo i testy wyłącznie dla IT.

Treść jest pobierana z dwóch kanonicznych plików w sąsiednim katalogu `docs/`: biznesowego i technicznego. Widok „Założenia produktu” otwiera właściwy rozdział dokumentu biznesowego.

Renderer dokumentów wymaga uruchomienia przez HTTP. Przy otwarciu samego `index.html` z dysku przeglądarka może zablokować pobranie plików Markdown.

Router chroni hasłem cały projekt, łącznie z bezpośrednimi adresami dokumentów i obrazów.

Przycisk „Założenia ekranu” wyjaśnia decyzje ukryte pod każdym widokiem. Lewy panel pozwala przejść bezpośrednio do dowolnego ekranu i dokumentu.

## Zbieranie uwag

Przycisk „Uwagi” otwiera panel recenzji. Recenzent wybiera „Wskaż fragment strony”, klika element albo zaznacza tekst i dodaje komentarz. Do uwagi może zostać dołączony screenshot z obramowaniem wskazanego miejsca.

Odpowiedź pod uwagą może zostać oznaczona jako wykonane działanie. Takie wpisy są wyróżnione w panelu i trafiają do sekcji „Podjęte działania” na stronie „Historia zmian”. Zwykłe odpowiedzi pozostają częścią dyskusji. Odrzucone uwagi nie są pokazywane w publicznej historii.

Każda uwaga ma kilka kotwic: identyfikator elementu, selektor, treść i położenie. Po zmianie mockupu system próbuje ponownie odnaleźć element. Nierozpoznana kotwica nie usuwa komentarza — uwaga i screenshot nadal są dostępne w panelu.

Uwagi zapisuje chroniony serwer, nie pliki statyczne. Nie należy uruchamiać recenzji przez zwykły serwer plików, bo panel nie zapisze danych.

## Aktualność prototypu

Katalog ma nagłówki `Cache-Control: no-store`, więc HTML, CSS i JavaScript nie powinny być przechowywane w cache przeglądarki. Górny pasek pokazuje czas najnowszej modyfikacji monitorowanych plików.

Przycisk `↻`:

- zachowuje otwarty widok po `#`,
- dodaje unikalny parametr `fresh`,
- wymusza ponowne pobranie prototypu.

Mockup sprawdza `Last-Modified` i `ETag` plików HTML, CSS, obu plików JS oraz dwóch dokumentów Markdown co 30 sekund i po powrocie do karty. Gdy wykryje zmianę, przycisk pokazuje „Nowa wersja”.

## Co testować z użytkownikami

- czy kupujący rozumie, kto jest sprzedawcą,
- czy rozumie jedną paczkę i termin najwolniejszego produktu,
- czy wie, jaka kwota przypada klubowi,
- czy potwierdzenie personalizacji jest wystarczająco wyraźne,
- czy administrator klubu odróżnia sprzedaż od swojej należności,
- czy księga korekt budzi zaufanie,
- jakich danych zamówienia klub naprawdę potrzebuje,
- których funkcji brakuje do podpisania pilotażu.

## Dane demonstracyjne

Nazwy bazowych produktów, parametry i zdjęcia pochodzą z aktualnej oferty [activio.pl](https://www.activio.pl/) za zgodą użytkownika. Publiczne ceny w prototypie są przykładowymi cenami detalicznymi ustalonymi przez kluby, a nie kopią cennika B2B.

Kopie używanych zdjęć znajdują się w `assets/products`, dlatego prototyp nie zależy od dostępności strony źródłowej. Przed wdrożeniem produkcyjnym materiały trzeba przenieść do zarządzanego magazynu plików wraz z prawami, opisem alternatywnym, wersją i historią wycofania.
