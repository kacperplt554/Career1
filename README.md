# FOOTBALL LIFE – etap 1
Uruchomienie: otwórz `index.html` w przeglądarce (działa bez serwera) lub w folderze projektu: `python -m http.server 8080` → http://localhost:8080
Struktura: core/ (dom, storage=IndexedDB, state, router), data/ (dane), systems/ (logika bez DOM), ui/ (ekrany).
Nowy system = nowy plik w systems/ + wpis w index.html + gałąź w state.career. Nowy ekran = FL.router.register(...).
