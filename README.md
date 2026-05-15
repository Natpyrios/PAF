# PAF

Mała strona do oceniania filmów i seriali oglądanych ze znajomymi.

## Dodawanie wpisów

Wszystko siedzi w [arkuszu Google](https://docs.google.com/spreadsheets/d/1CuHfluEd-9hVun6ANAeK41lNx949Aa_j0YVzWbgGIY8/edit). Wypełnij wiersz:

| kolumna       | co tam wpisać |
|---------------|---------------|
| **B — Dysk**   | `Bajki i Anime` lub `Filmy i Seriale` |
| **D — Seria**  | nazwa folderu na dysku |
| **E — Nazwa**  | tytuł bez roku |
| **F — Rok**    | `2024` lub zakres `2003-2004` |
| **G — Odc**    | liczba odcinków |
| **H — Język**  | flaga + ścieżka, np. `🇬🇧 Angielski - PL Lektor` |
| **J — Długość**| czas trwania `1:55:25` |
| **K — Jakość** | `480p` / `720p` / `1080p` |
| **L — Typ**    | `.mp4` / `.mkv` |
| **M — GB**     | rozmiar pliku, np. `3,98` |
| **O — Ocena**  | `0`–`5` (puste = "Brak") |
| **P — wiek**   | `7+`, `12+`, `16+`, `18+`, `3+` lub puste |
| **Q — Tagi**   | po przecinku, np. `Dramat, Historyczny` |
| **R — Rodzaj** | `Film` / `Serial` / `Anime` / `Dokument` / `Stream` |
| **S — Opis**   | dłuższy opis pokazywany po kliknięciu kafelka |

Kliknij **"Pobierz dane"** w panelu filtrów żeby od razu zaciągnąć zmiany. Kolejność wierszy w arkuszu = kolejność wyświetlania.

## Okładki

Wrzuć plik do folderu `cover/`. Nazwa pliku = `Nazwa` z arkusza, ewentualnie z rokiem na końcu. Obsługiwane rozszerzenia: `.jpeg`, `.jpg`, `.png`, `.webp`.

Przykład: dla wpisu `Asterix i Obelix: Imperium Smoka` zapisz okładkę jako `cover/Asterix i Obelix - Imperium Smoka.jpg` (dwukropek zamień na `-`).

Jeśli dwa wpisy mają tę samą nazwę (np. dwa filmy `Gladiator` z różnych lat), dorzuć rok do nazwy pliku: `Gladiator 2001.jpg`, `Gladiator 2024.jpg`. Bez tego oba wpisy użyją wspólnej `Gladiator.jpg`.

Brak okładki = wyświetli się `cover/placeholder.jpg`.
