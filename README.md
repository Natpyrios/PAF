# PAF

Mała strona do oceniania filmów i seriali oglądanych ze znajomymi.

## Dodawanie wpisów

Wszystko siedzi w [arkuszu Google](https://docs.google.com/spreadsheets/d/1CuHfluEd-9hVun6ANAeK41lNx949Aa_j0YVzWbgGIY8/edit). Wypełnij wiersz:

| kolumna       | co tam wpisać |
|---------------|---------------|
| **B — Dysk**   | `Bajki i Anime` lub `Filmy i Seriale` — mapuje się na literę dysku (`P` / `Q`) dla przycisku "Zobacz" |
| **D — Seria**  | nazwa folderu na dysku (przycisk "Zobacz" kopiuje ścieżkę do schowka, wklej w pasku adresu Eksploratora) |
| **E — Nazwa**  | tytuł bez roku (to też nazwa pliku okładki) |
| **F — Rok**    | `2024` lub zakres `2003-2004` |
| **G — Odc**    | liczba odcinków |
| **H — Język**  | flaga + ścieżka, np. `🇬🇧 Angielski - PL Lektor`; `/` oddziela ścieżki |
| **J — Długość**| czas trwania `1:55:25` |
| **K — Jakość** | `480p` / `720p` / `1080p` |
| **L — Typ**    | rozszerzenie `.mp4` / `.mkv` |
| **M — GB**     | rozmiar pliku, np. `3,98` |
| **O — Ocena**  | `0`–`5` (puste = "Brak") |
| **P — wiek**   | `7+`, `12+`, `16+`, `18+`, `3+` lub puste |
| **Q — Tagi**   | po przecinku, np. `Dramat, Historyczny` |
| **R — Rodzaj** | `Film` / `Serial` / `Anime` / `Dokument` / `Stream` |
| **S — Opis**   | dłuższy opis pokazywany w modalu po kliknięciu kafelka |

Kliknij **"Pobierz dane"** w lewym panelu żeby od razu zaciągnąć zmiany — bez tego cache trzyma się godziny. Kolejność wierszy w arkuszu = kolejność wyświetlania.

## Okładki

Pliki leżą w folderze `cover/`. Nazwa pliku = `Nazwa` z arkusza (kolumna E, bez roku), z czyszczeniem znaków których nie wolno używać:

- `:` → ` -`
- `/` i `\` → spacja
- `<>"|?*` → wycięte
- zbędne spacje zbite do jednej

Przykład: `Asterix i Obelix: Imperium Smoka` → `cover/Asterix i Obelix - Imperium Smoka.jpeg`

Strona próbuje szukać rozszerzeń w kolejności `.jpeg → .jpg → .png → .webp`, a na końcu fallbackuje na `cover/placeholder.jpg` — wystarczy wrzucić plik w którymkolwiek formacie, a dla wpisów bez własnej okładki pokaże się placeholder.
