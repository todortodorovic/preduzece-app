import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api';

const KATEGORIJE = [
  'RAM',
  'Procesor',
  'Matična ploča',
  'Grafička karta',
  'Napajanje',
  'Kučište',
  'SSD',
  'HDD',
  'Cooler',
  'Ostalo'
];

function App() {
  const [activeTab, setActiveTab] = useState('stanje');
  const [artikliStanje, setArtikliStanje] = useState([]);
  const [artikliProdati, setArtikliProdati] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedArtikal, setSelectedArtikal] = useState(null);
  const [prodajnaCena, setProdajnaCena] = useState('');
  const [editArtikal, setEditArtikal] = useState(null);

  // Filteri i sortiranje
  const [filterKategorijaStanje, setFilterKategorijaStanje] = useState('Sve');
  const [filterKategorijaProdati, setFilterKategorijaProdati] = useState('Sve');
  const [sortStanje, setSortStanje] = useState('datum_desc');
  const [sortProdati, setSortProdati] = useState('datum_prodaje_desc');

  const [noviArtikal, setNoviArtikal] = useState({
    kategorija: 'RAM',
    naziv: '',
    nabavna_cena: '',
    ocekivana_cena: ''
  });

  useEffect(() => {
    fetchArtikliStanje();
    fetchArtikliProdati();
  }, []);

  const fetchArtikliStanje = async () => {
    try {
      const response = await fetch(`${API_URL}/artikli/stanje`);
      const data = await response.json();
      setArtikliStanje(data);
    } catch (error) {
      console.error('Greška pri učitavanju artikala:', error);
    }
  };

  const fetchArtikliProdati = async () => {
    try {
      const response = await fetch(`${API_URL}/artikli/prodati`);
      const data = await response.json();
      setArtikliProdati(data);
    } catch (error) {
      console.error('Greška pri učitavanju prodatih artikala:', error);
    }
  };

  const handleDodajArtikal = async (e) => {
    e.preventDefault();
    try {
      // Pripremi podatke - konvertuj prazne stringove u null za brojeve
      const podaci = {
        kategorija: noviArtikal.kategorija,
        naziv: noviArtikal.naziv,
        nabavna_cena: parseFloat(noviArtikal.nabavna_cena),
        ocekivana_cena: noviArtikal.ocekivana_cena ? parseFloat(noviArtikal.ocekivana_cena) : null
      };

      const response = await fetch(`${API_URL}/artikli`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(podaci),
      });

      if (response.ok) {
        setNoviArtikal({
          kategorija: 'RAM',
          naziv: '',
          nabavna_cena: '',
          ocekivana_cena: ''
        });
        fetchArtikliStanje();
      }
    } catch (error) {
      console.error('Greška pri dodavanju artikla:', error);
    }
  };

  const handleObrisiArtikal = async (id) => {
    if (window.confirm('Da li ste sigurni da želite obrisati ovaj artikal?')) {
      try {
        const response = await fetch(`${API_URL}/artikli/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchArtikliStanje();
          fetchArtikliProdati();
        }
      } catch (error) {
        console.error('Greška pri brisanju artikla:', error);
      }
    }
  };

  const handleProdajArtikal = (artikal) => {
    setSelectedArtikal(artikal);
    setProdajnaCena('');
    setShowModal(true);
  };

  const handlePotvrdiProdaju = async () => {
    if (!prodajnaCena || prodajnaCena <= 0) {
      alert('Unesite validnu prodajnu cenu');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/artikli/${selectedArtikal.id}/prodaj`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prodajna_cena: parseFloat(prodajnaCena) }),
      });

      if (response.ok) {
        setShowModal(false);
        setSelectedArtikal(null);
        setProdajnaCena('');
        fetchArtikliStanje();
        fetchArtikliProdati();
      }
    } catch (error) {
      console.error('Greška pri prodaji artikla:', error);
    }
  };

  const handleEditArtikal = (artikal) => {
    setEditArtikal({
      id: artikal.id,
      kategorija: artikal.kategorija,
      naziv: artikal.naziv,
      nabavna_cena: artikal.nabavna_cena,
      ocekivana_cena: artikal.ocekivana_cena || '',
      prodat: artikal.prodat,
      prodajna_cena: artikal.prodajna_cena || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const podaci = {
        kategorija: editArtikal.kategorija,
        naziv: editArtikal.naziv,
        nabavna_cena: parseFloat(editArtikal.nabavna_cena),
        ocekivana_cena: editArtikal.ocekivana_cena ? parseFloat(editArtikal.ocekivana_cena) : null,
        prodajna_cena: editArtikal.prodajna_cena ? parseFloat(editArtikal.prodajna_cena) : null
      };

      const response = await fetch(`${API_URL}/artikli/${editArtikal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(podaci),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditArtikal(null);
        fetchArtikliStanje();
        fetchArtikliProdati();
      }
    } catch (error) {
      console.error('Greška pri ažuriranju artikla:', error);
    }
  };

  const formatCena = (cena) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cena);
  };

  // Filtriraj i sortiraj artikle na stanju
  const filteredStanje = artikliStanje
    .filter(artikal => filterKategorijaStanje === 'Sve' || artikal.kategorija === filterKategorijaStanje)
    .sort((a, b) => {
      switch (sortStanje) {
        case 'nabavna_asc':
          return a.nabavna_cena - b.nabavna_cena;
        case 'nabavna_desc':
          return b.nabavna_cena - a.nabavna_cena;
        case 'datum_asc':
          return new Date(a.datum_kupovine) - new Date(b.datum_kupovine);
        case 'datum_desc':
          return new Date(b.datum_kupovine) - new Date(a.datum_kupovine);
        default:
          return 0;
      }
    });

  // Filtriraj i sortiraj prodate artikle
  const filteredProdati = artikliProdati
    .filter(artikal => filterKategorijaProdati === 'Sve' || artikal.kategorija === filterKategorijaProdati)
    .sort((a, b) => {
      switch (sortProdati) {
        case 'nabavna_asc':
          return a.nabavna_cena - b.nabavna_cena;
        case 'nabavna_desc':
          return b.nabavna_cena - a.nabavna_cena;
        case 'prodajna_asc':
          return a.prodajna_cena - b.prodajna_cena;
        case 'prodajna_desc':
          return b.prodajna_cena - a.prodajna_cena;
        case 'datum_kupovine_asc':
          return new Date(a.datum_kupovine) - new Date(b.datum_kupovine);
        case 'datum_kupovine_desc':
          return new Date(b.datum_kupovine) - new Date(a.datum_kupovine);
        case 'datum_prodaje_asc':
          return new Date(a.datum_prodaje) - new Date(b.datum_prodaje);
        case 'datum_prodaje_desc':
          return new Date(b.datum_prodaje) - new Date(a.datum_prodaje);
        default:
          return 0;
      }
    });

  return (
    <div className="container">
      <h1>Inventar - Prodaja komponenti</h1>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'stanje' ? 'active' : ''}`}
          onClick={() => setActiveTab('stanje')}
        >
          Trenutno stanje
        </button>
        <button
          className={`tab ${activeTab === 'prodati' ? 'active' : ''}`}
          onClick={() => setActiveTab('prodati')}
        >
          Prodati artikli
        </button>
      </div>

      {activeTab === 'stanje' && (
        <>
          <div className="forma">
            <h2>Dodaj novi artikal</h2>
            <form onSubmit={handleDodajArtikal}>
              <div className="forma-grid">
                <div className="forma-group">
                  <label>Kategorija</label>
                  <select
                    value={noviArtikal.kategorija}
                    onChange={(e) => setNoviArtikal({ ...noviArtikal, kategorija: e.target.value })}
                    required
                  >
                    {KATEGORIJE.map(kat => (
                      <option key={kat} value={kat}>{kat}</option>
                    ))}
                  </select>
                </div>
                <div className="forma-group">
                  <label>Naziv</label>
                  <input
                    type="text"
                    value={noviArtikal.naziv}
                    onChange={(e) => setNoviArtikal({ ...noviArtikal, naziv: e.target.value })}
                    placeholder="Npr. Kingston 8GB DDR4 3200MHz"
                    required
                  />
                </div>
                <div className="forma-group">
                  <label>Nabavna cena (EUR)</label>
                  <input
                    type="number"
                    value={noviArtikal.nabavna_cena}
                    onChange={(e) => setNoviArtikal({ ...noviArtikal, nabavna_cena: e.target.value })}
                    placeholder="5000"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="forma-group">
                  <label>Očekivana cena (EUR)</label>
                  <input
                    type="number"
                    value={noviArtikal.ocekivana_cena}
                    onChange={(e) => setNoviArtikal({ ...noviArtikal, ocekivana_cena: e.target.value })}
                    placeholder="8000"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Dodaj artikal</button>
            </form>
          </div>

          <div className="filter-sort-container">
            <div className="forma-group">
              <label>Filtriraj po kategoriji</label>
              <select value={filterKategorijaStanje} onChange={(e) => setFilterKategorijaStanje(e.target.value)}>
                <option value="Sve">Sve kategorije</option>
                {KATEGORIJE.map(kat => (
                  <option key={kat} value={kat}>{kat}</option>
                ))}
              </select>
            </div>
            <div className="forma-group">
              <label>Sortiraj po</label>
              <select value={sortStanje} onChange={(e) => setSortStanje(e.target.value)}>
                <option value="datum_desc">Datum kupovine (novo → staro)</option>
                <option value="datum_asc">Datum kupovine (staro → novo)</option>
                <option value="nabavna_desc">Nabavna cena (visoka → niska)</option>
                <option value="nabavna_asc">Nabavna cena (niska → visoka)</option>
              </select>
            </div>
          </div>

          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Kategorija</th>
                  <th>Naziv</th>
                  <th>Nabavna cena</th>
                  <th>Očekivana cena</th>
                  <th>Datum kupovine</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {filteredStanje.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                      Nema artikala na stanju
                    </td>
                  </tr>
                ) : (
                  filteredStanje.map((artikal) => (
                    <tr key={artikal.id}>
                      <td>
                        <span className="kategorija-badge">{artikal.kategorija}</span>
                      </td>
                      <td>{artikal.naziv}</td>
                      <td className="cena">{formatCena(artikal.nabavna_cena)}</td>
                      <td className="cena">{artikal.ocekivana_cena ? formatCena(artikal.ocekivana_cena) : '-'}</td>
                      <td>{artikal.datum_kupovine}</td>
                      <td>
                        <div className="akcije">
                          <button
                            className="btn btn-success"
                            onClick={() => handleProdajArtikal(artikal)}
                          >
                            Prodaj
                          </button>
                          <button
                            className="btn btn-warning"
                            onClick={() => handleEditArtikal(artikal)}
                          >
                            Izmeni
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleObrisiArtikal(artikal.id)}
                          >
                            Obriši
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'prodati' && (
        <>
          <div className="filter-sort-container">
            <div className="forma-group">
              <label>Filtriraj po kategoriji</label>
              <select value={filterKategorijaProdati} onChange={(e) => setFilterKategorijaProdati(e.target.value)}>
                <option value="Sve">Sve kategorije</option>
                {KATEGORIJE.map(kat => (
                  <option key={kat} value={kat}>{kat}</option>
                ))}
              </select>
            </div>
            <div className="forma-group">
              <label>Sortiraj po</label>
              <select value={sortProdati} onChange={(e) => setSortProdati(e.target.value)}>
                <option value="datum_prodaje_desc">Datum prodaje (novo → staro)</option>
                <option value="datum_prodaje_asc">Datum prodaje (staro → novo)</option>
                <option value="datum_kupovine_desc">Datum kupovine (novo → staro)</option>
                <option value="datum_kupovine_asc">Datum kupovine (staro → novo)</option>
                <option value="nabavna_desc">Nabavna cena (visoka → niska)</option>
                <option value="nabavna_asc">Nabavna cena (niska → visoka)</option>
                <option value="prodajna_desc">Prodajna cena (visoka → niska)</option>
                <option value="prodajna_asc">Prodajna cena (niska → visoka)</option>
              </select>
            </div>
          </div>

          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Kategorija</th>
                  <th>Naziv</th>
                  <th>Nabavna cena</th>
                  <th>Očekivana cena</th>
                  <th>Prodajna cena</th>
                  <th>Profit</th>
                  <th>Datum kupovine</th>
                  <th>Datum prodaje</th>
                  <th>Vreme prodaje (dana)</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {filteredProdati.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '40px' }}>
                      Nema prodatih artikala
                    </td>
                  </tr>
                ) : (
                  filteredProdati.map((artikal) => {
                    const profit = artikal.prodajna_cena - artikal.nabavna_cena;
                    return (
                      <tr key={artikal.id}>
                        <td>
                          <span className="kategorija-badge">{artikal.kategorija}</span>
                        </td>
                        <td>{artikal.naziv}</td>
                        <td className="cena">{formatCena(artikal.nabavna_cena)}</td>
                        <td className="cena">{artikal.ocekivana_cena ? formatCena(artikal.ocekivana_cena) : '-'}</td>
                        <td className="cena">{formatCena(artikal.prodajna_cena)}</td>
                        <td className={profit >= 0 ? 'profit-pozitivan' : 'profit-negativan'}>
                          {formatCena(profit)}
                        </td>
                        <td>{artikal.datum_kupovine}</td>
                        <td>{artikal.datum_prodaje}</td>
                        <td>{artikal.vreme_prodaje_dana}</td>
                        <td>
                          <div className="akcije">
                            <button
                              className="btn btn-warning"
                              onClick={() => handleEditArtikal(artikal)}
                            >
                              Izmeni
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleObrisiArtikal(artikal.id)}
                            >
                              Obriši
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Prodaja artikla</h3>
            <p><strong>Naziv:</strong> {selectedArtikal?.naziv}</p>
            <p><strong>Nabavna cena:</strong> {formatCena(selectedArtikal?.nabavna_cena)}</p>
            <div className="forma-group" style={{ marginTop: '20px' }}>
              <label>Prodajna cena (EUR)</label>
              <input
                type="number"
                value={prodajnaCena}
                onChange={(e) => setProdajnaCena(e.target.value)}
                placeholder="10000"
                min="0"
                step="0.01"
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Odustani
              </button>
              <button className="btn btn-success" onClick={handlePotvrdiProdaju}>
                Potvrdi prodaju
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editArtikal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Izmeni artikal</h3>
            <div className="forma-group" style={{ marginTop: '20px' }}>
              <label>Kategorija</label>
              <select
                value={editArtikal.kategorija}
                onChange={(e) => setEditArtikal({ ...editArtikal, kategorija: e.target.value })}
              >
                {KATEGORIJE.map(kat => (
                  <option key={kat} value={kat}>{kat}</option>
                ))}
              </select>
            </div>
            <div className="forma-group" style={{ marginTop: '15px' }}>
              <label>Naziv</label>
              <input
                type="text"
                value={editArtikal.naziv}
                onChange={(e) => setEditArtikal({ ...editArtikal, naziv: e.target.value })}
                placeholder="Naziv artikla"
              />
            </div>
            <div className="forma-group" style={{ marginTop: '15px' }}>
              <label>Nabavna cena (EUR)</label>
              <input
                type="number"
                value={editArtikal.nabavna_cena}
                onChange={(e) => setEditArtikal({ ...editArtikal, nabavna_cena: e.target.value })}
                placeholder="50.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="forma-group" style={{ marginTop: '15px' }}>
              <label>Očekivana cena (EUR)</label>
              <input
                type="number"
                value={editArtikal.ocekivana_cena}
                onChange={(e) => setEditArtikal({ ...editArtikal, ocekivana_cena: e.target.value })}
                placeholder="80.00"
                min="0"
                step="0.01"
              />
            </div>
            {editArtikal.prodat === 1 && (
              <div className="forma-group" style={{ marginTop: '15px' }}>
                <label>Prodajna cena (EUR)</label>
                <input
                  type="number"
                  value={editArtikal.prodajna_cena}
                  onChange={(e) => setEditArtikal({ ...editArtikal, prodajna_cena: e.target.value })}
                  placeholder="100.00"
                  min="0"
                  step="0.01"
                />
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                Odustani
              </button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>
                Sačuvaj izmene
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
