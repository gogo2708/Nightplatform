const express = require('express');
const router = express.Router();
const Talent = require('../models/Talent');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Debug: mostra tutti i talenti (anche incompleti)
router.get('/debug/all', async (req, res) => {
  try {
    const allTalents = await Talent.find()
      .populate('user', 'name surname email')
      .lean();
    
    console.log('TUTTI I TALENTI NEL DATABASE:', allTalents.length);
    allTalents.forEach(t => {
      console.log('- User:', t.user?.name, 'Bio:', !!t.bio, 'Location:', !!t.location, 'Price:', t.priceRange?.min);
    });
    
    res.json(allTalents);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

// Ricerca talenti con filtri
router.get('/', async (req, res) => {
  try {
    const { category, location, name } = req.query;
    console.log('QUERY PARAMS:', { category, location, name });
    
    let filter = {};
    if (category) {
      filter.categories = category;
      console.log('FILTRO CATEGORIA APPLICATO:', category);
    }
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (name) filter['user.name'] = { $regex: name, $options: 'i' };
    
    // Filtra solo talenti con profili completi (hanno bio, location e prezzo)
    // Rimuoviamo temporaneamente il filtro per debug
    /*
    filter.$and = [
      { bio: { $exists: true, $ne: null, $ne: '' } },
      { location: { $exists: true, $ne: null, $ne: '' } },
      { 'priceRange.min': { $exists: true, $gt: 0 } }
    ];
    */
    
    const talents = await Talent.find(filter)
      .populate('user', 'name surname avatar')
      .populate('categories', 'name')
      .lean(); // <-- AGGIUNTO .lean()
    
    console.log('TALENTI TROVATI:', talents.length);
    console.log('FILTRO APPLICATO:', JSON.stringify(filter, null, 2));
    
    // Debug dettagliato di ogni talento
    talents.forEach((t, index) => {
      console.log(`TALENT ${index + 1}:`, {
        id: t._id,
        userName: t.user?.name,
        userSurname: t.user?.surname,
        bio: t.bio,
        location: t.location,
        priceRange: t.priceRange,
        categories: t.categories
      });
    });
    
    // Mappa i dati per il frontend
    const mapped = talents.map(t => ({
      id: t._id,
      name: t.user?.name || 'Nome non specificato',
      avatar: t.user?.avatar,
      category: t.categories[0]?.name || (t.categories.length > 0 ? t.categories[0] : ''),
      categories: Array.isArray(t.categories) ? t.categories.map(c => typeof c === 'object' && c !== null ? c.name : c) : [],
      rating: t.rating || 0,
      price: t.priceRange?.min || 0,
      image: t.gallery?.[0] || t.user?.avatar,
      location: t.location || 'Località non specificata',
      bio: t.bio,
      description: t.bio,
    }));
    console.log('RESPONSE TALENTS MAPPED:', mapped); // <-- LOG DI DEBUG
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

// Dettaglio talento
router.get('/:id', async (req, res) => {
  try {
    const talent = await Talent.findById(req.params.id).populate('user', 'name surname avatar').populate('categories', 'name');
    if (!talent) return res.status(404).json({ message: 'Talento non trovato' });
    res.json(talent);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

// Crea o aggiorna profilo talent (protetto)
router.post('/', auth, async (req, res) => {
  console.log('POST /api/talents', { body: req.body, user: req.user });
  try {
    const { categories, bio, priceRange, location, gallery } = req.body;
    let talent = await Talent.findOne({ user: req.user.userId });
    if (talent) {
      // Aggiorna
      talent.categories = categories || talent.categories;
      talent.bio = bio || talent.bio;
      talent.priceRange = priceRange || talent.priceRange;
      talent.location = location || talent.location;
      talent.gallery = gallery || talent.gallery;
      await talent.save();
      return res.json(talent);
    } else {
      // Crea nuovo profilo talent
      talent = new Talent({
        user: req.user.userId,
        categories,
        bio,
        priceRange,
        location,
        gallery
      });
      await talent.save();
      // Aggiorna ruolo utente
      await User.findByIdAndUpdate(req.user.userId, { role: 'talent' });
      return res.status(201).json(talent);
    }
  } catch (err) {
    console.error('Errore salvataggio profilo talent:', err);
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

// Aggiorna profilo talent esistente (protetto)
router.put('/profile', auth, async (req, res) => {
  console.log('PUT /api/talents/profile', { body: req.body, user: req.user });
  try {
    const { categories, bio, priceRange, location, gallery } = req.body;
    let talent = await Talent.findOne({ user: req.user.userId });
    
    if (!talent) {
      return res.status(404).json({ message: 'Profilo talent non trovato' });
    }
    
    // Aggiorna i campi forniti
    if (categories) talent.categories = categories;
    if (bio) talent.bio = bio;
    if (priceRange) talent.priceRange = priceRange;
    if (location) talent.location = location;
    if (gallery) talent.gallery = gallery;
    
    await talent.save();
    return res.json(talent);
  } catch (err) {
    console.error('Errore aggiornamento profilo talent:', err);
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

// Ottieni profilo talent dell'utente corrente (protetto)
router.get('/profile/me', auth, async (req, res) => {
  try {
    console.log('User from token:', req.user); // DEBUG
    const talent = await Talent.findOne({ user: req.user.userId })
      .populate('user', 'name surname email avatar')
      .populate('categories', 'name description icon');
    
    if (!talent) {
      return res.status(404).json({ message: 'Profilo talent non trovato' });
    }
    
    res.json(talent);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

module.exports = router; 