const axios = require('axios');

const API = 'http://localhost:4000/api';

async function test() {
  try {
    // 1. Recupero categorie
    const catRes = await axios.get(`${API}/categories`);
    console.log('Categorie:', catRes.data.map(c => c.name));

    // 2. Registrazione utente
    const user = {
      name: 'Test',
      surname: 'User',
      email: `testuser${Date.now()}@mail.com`,
      password: 'testpassword123'
    };
    const regRes = await axios.post(`${API}/auth/register`, user);
    console.log('Registrazione:', regRes.data.message);

    // 3. Login utente
    const loginRes = await axios.post(`${API}/auth/login`, {
      email: user.email,
      password: user.password
    });
    console.log('Login token:', loginRes.data.token ? 'OK' : 'NO');
    const token = loginRes.data.token;

    // 4. Recupero profilo utente
    const meRes = await axios.get(`${API}/user/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Profilo utente:', meRes.data.email);

    // 5. Creazione profilo talent
    const talentRes = await axios.post(`${API}/talents`, {
      categories: [catRes.data[0]._id],
      bio: 'Sono un talent di test',
      priceRange: { min: 100, max: 200 },
      location: 'Milano',
      gallery: []
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Talent creato:', talentRes.data._id);

    // 6. Ricerca talenti
    const searchRes = await axios.get(`${API}/talents?location=Milano`);
    console.log('Talenti trovati:', searchRes.data.length);

    console.log('TUTTI I TEST SONO ANDATI A BUON FINE!');
  } catch (err) {
    if (err.response) {
      console.error('Errore API:', err.response.data);
    } else {
      console.error('Errore:', err.message);
    }
    process.exit(1);
  }
  process.exit();
}

test(); 