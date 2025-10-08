import express from 'express';
import cors from 'cors';
import { initDatabase, getDb, saveDatabase } from './database.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Dobavi sve artikle na stanju (neprodati)
app.get('/api/artikli/stanje', (_req, res) => {
  try {
    const db = getDb();
    const result = db.exec('SELECT * FROM artikli WHERE prodat = 0 ORDER BY datum_kupovine DESC');
    const artikli = result.length > 0 ? result[0].values.map(row => ({
      id: row[0],
      kategorija: row[1],
      naziv: row[2],
      nabavna_cena: row[3],
      ocekivana_cena: row[4],
      datum_kupovine: row[5],
      kolicina: row[6] || 1,
      prodat: row[7],
      datum_prodaje: row[8],
      prodajna_cena: row[9],
      vreme_prodaje_dana: row[10]
    })) : [];
    res.json(artikli);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dobavi sve prodate artikle
app.get('/api/artikli/prodati', (_req, res) => {
  try {
    const db = getDb();
    const result = db.exec('SELECT * FROM artikli WHERE prodat = 1 ORDER BY datum_prodaje DESC');
    const artikli = result.length > 0 ? result[0].values.map(row => ({
      id: row[0],
      kategorija: row[1],
      naziv: row[2],
      nabavna_cena: row[3],
      ocekivana_cena: row[4],
      datum_kupovine: row[5],
      kolicina: row[6] || 1,
      prodat: row[7],
      datum_prodaje: row[8],
      prodajna_cena: row[9],
      vreme_prodaje_dana: row[10]
    })) : [];
    res.json(artikli);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dodaj novi artikal
app.post('/api/artikli', (req, res) => {
  try {
    const db = getDb();
    const { kategorija, naziv, nabavna_cena, ocekivana_cena, kolicina } = req.body;
    const datum_kupovine = new Date().toISOString().split('T')[0];

    db.run(
      'INSERT INTO artikli (kategorija, naziv, nabavna_cena, ocekivana_cena, datum_kupovine, kolicina) VALUES (?, ?, ?, ?, ?, ?)',
      [kategorija, naziv, nabavna_cena, ocekivana_cena || null, datum_kupovine, kolicina || 1]
    );

    saveDatabase();

    const result = db.exec('SELECT last_insert_rowid()');
    const id = result[0].values[0][0];

    res.json({
      id,
      kategorija,
      naziv,
      nabavna_cena,
      ocekivana_cena,
      datum_kupovine,
      kolicina: kolicina || 1,
      prodat: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ažuriraj artikal
app.put('/api/artikli/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { kategorija, naziv, nabavna_cena, ocekivana_cena, prodajna_cena, kolicina } = req.body;

    db.run(
      'UPDATE artikli SET kategorija = ?, naziv = ?, nabavna_cena = ?, ocekivana_cena = ?, prodajna_cena = ?, kolicina = ? WHERE id = ?',
      [kategorija, naziv, nabavna_cena, ocekivana_cena || null, prodajna_cena || null, kolicina || 1, id]
    );

    saveDatabase();

    const updatedResult = db.exec('SELECT * FROM artikli WHERE id = ?', [id]);
    if (updatedResult.length === 0 || updatedResult[0].values.length === 0) {
      return res.status(404).json({ error: 'Artikal nije pronađen' });
    }

    const row = updatedResult[0].values[0];
    const updatedArtikal = {
      id: row[0],
      kategorija: row[1],
      naziv: row[2],
      nabavna_cena: row[3],
      ocekivana_cena: row[4],
      datum_kupovine: row[5],
      kolicina: row[6] || 1,
      prodat: row[7],
      datum_prodaje: row[8],
      prodajna_cena: row[9],
      vreme_prodaje_dana: row[10]
    };

    res.json(updatedArtikal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Označi artikal kao prodat
app.put('/api/artikli/:id/prodaj', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { prodajna_cena, kolicina_prodato } = req.body;
    const datum_prodaje = new Date().toISOString().split('T')[0];

    // Dobavi informacije o artiklu
    const result = db.exec('SELECT * FROM artikli WHERE id = ?', [id]);

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Artikal nije pronađen' });
    }

    const row = result[0].values[0];
    const kategorija = row[1];
    const naziv = row[2];
    const nabavna_cena = row[3];
    const ocekivana_cena = row[4];
    const datum_kupovine = row[5];
    const kolicina_trenutna = row[6] || 1;

    // Izračunaj broj dana
    const datumKupovine = new Date(datum_kupovine);
    const datumProdaje = new Date(datum_prodaje);
    const vreme_prodaje_dana = Math.floor((datumProdaje - datumKupovine) / (1000 * 60 * 60 * 24));

    const kolicinaProdato = kolicina_prodato || kolicina_trenutna;

    // Kreiraj nove zapise za svaku prodatu jedinicu
    for (let i = 0; i < kolicinaProdato; i++) {
      db.run(
        'INSERT INTO artikli (kategorija, naziv, nabavna_cena, ocekivana_cena, datum_kupovine, kolicina, prodat, datum_prodaje, prodajna_cena, vreme_prodaje_dana) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [kategorija, naziv, nabavna_cena, ocekivana_cena, datum_kupovine, 1, 1, datum_prodaje, prodajna_cena, vreme_prodaje_dana]
      );
    }

    // Ažuriraj količinu ili obriši ako je sve prodato
    const preostalaKolicina = kolicina_trenutna - kolicinaProdato;
    if (preostalaKolicina <= 0) {
      db.run('DELETE FROM artikli WHERE id = ?', [id]);
    } else {
      db.run('UPDATE artikli SET kolicina = ? WHERE id = ?', [preostalaKolicina, id]);
    }

    saveDatabase();

    res.json({ success: true, kolicina_prodato: kolicinaProdato });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obriši artikal
app.delete('/api/artikli/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    db.run('DELETE FROM artikli WHERE id = ?', [id]);
    saveDatabase();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inicijalizuj bazu i pokreni server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server pokrenut na http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('Greška pri inicijalizaciji baze:', error);
  process.exit(1);
});
