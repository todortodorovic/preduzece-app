import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'inventar.db');

let db;

async function initDatabase() {
  const SQL = await initSqlJs();

  // Učitaj postojeću bazu ili kreiraj novu
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Kreiranje tabele za artikle
  db.run(`
    CREATE TABLE IF NOT EXISTS artikli (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kategorija TEXT NOT NULL,
      naziv TEXT NOT NULL,
      nabavna_cena REAL NOT NULL,
      ocekivana_cena REAL,
      datum_kupovine TEXT NOT NULL,
      kolicina INTEGER DEFAULT 1,
      prodat INTEGER DEFAULT 0,
      datum_prodaje TEXT,
      prodajna_cena REAL,
      vreme_prodaje_dana INTEGER
    )
  `);

  // Dodaj kolonu ocekivana_cena ako ne postoji (za postojeće baze)
  try {
    db.run('ALTER TABLE artikli ADD COLUMN ocekivana_cena REAL');
  } catch (e) {
    // Kolona već postoji, ignoriši grešku
  }

  // Dodaj kolonu kolicina ako ne postoji (za postojeće baze)
  try {
    db.run('ALTER TABLE artikli ADD COLUMN kolicina INTEGER DEFAULT 1');
  } catch (e) {
    // Kolona već postoji, ignoriši grešku
  }

  saveDatabase();
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function getDb() {
  return db;
}

export { initDatabase, getDb, saveDatabase };
