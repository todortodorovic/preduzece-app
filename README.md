# Inventar - Aplikacija za praćenje prodaje komponenti

Jednostavna aplikacija za praćenje stanja kompjuterskih komponenti na skladištu i evidenciju prodaje.

## Karakteristike

- ✅ Praćenje trenutnog stanja artikala
- ✅ Evidencija prodatih artikala
- ✅ Automatsko računanje vremena prodaje (u danima)
- ✅ Pregled profita za svaki prodat artikal
- ✅ Jednostavan interfejs
- ✅ Lokalna SQLite baza podataka (ne zahteva instalaciju)

## Pokretanje aplikacije

### Brzo pokretanje (preporučeno) ⚡

#### 1. Prva instalacija

```bash
npm run install:all
```

#### 2. Pokretanje aplikacije

```bash
npm start
```

Ova jedna komanda pokreće i backend i frontend istovremeno!

### 3. Pristup aplikaciji

Otvori browser i idi na: <http://localhost:3000>

---

### Alternativno pokretanje (manuelno)

Ako želiš da pokreneš backend i frontend odvojeno:

#### Terminal 1 - Backend

```bash
cd backend
npm install  # samo prvi put
npm start
```

#### Terminal 2 - Frontend

```bash
cd frontend
npm install  # samo prvi put
npm run dev
```

## Kako koristiti aplikaciju

### Dodavanje novog artikla

1. Na tabu "Trenutno stanje" popuni formu:
   - Izaberi kategoriju (RAM, Procesor, Matična ploča, itd.)
   - Upiši pun naziv artikla (npr. "Kingston 8GB DDR4 3200MHz")
   - Upiši nabavnu cenu u dinarima
   - Datum kupovine se automatski postavlja na današnji dan
2. Klikni "Dodaj artikal"

### Prodaja artikla

1. U tabeli "Trenutno stanje" nađi artikal koji želiš da prodaš
2. Klikni dugme "Prodaj"
3. U modalnom prozoru upiši prodajnu cenu
4. Klikni "Potvrdi prodaju"
5. Artikal će automatski biti premešten u tab "Prodati artikli" sa svim podacima:
   - Datum prodaje (automatski današnji dan)
   - Vreme za koje je prodat (broj dana od kupovine do prodaje)
   - Profit (razlika između prodajne i nabavne cene)

### Pregled prodatih artikala

1. Klikni na tab "Prodati artikli"
2. Ovde vidiš sve prodate artikle sa kompletnim podacima uključujući:
   - Nabavnu i prodajnu cenu
   - Profit (zeleno ako je pozitivan, crveno ako je negativan)
   - Datum kupovine i prodaje
   - Vreme potrebno za prodaju u danima

### Brisanje artikala

- Možeš obrisati artikal klikom na dugme "Obriši" (dostupno i za artikle na stanju i za prodate)
- Brisanje je trajno - aplikacija će tražiti potvrdu

## Tehnologije

- **Backend:** Node.js, Express, SQLite (better-sqlite3)
- **Frontend:** React, Vite
- **Styling:** Vanilla CSS

## Napomene

- Svi podaci se čuvaju lokalno u SQLite bazi podataka (`backend/inventar.db`)
- Aplikacija radi potpuno offline nakon instalacije
- Baza se automatski kreira pri prvom pokretanju
- Cene se formatiraju kao srpski dinari (RSD)
