const express = require('express');
const router = express.Router();
const Talent = require('../models/Talent');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Ricerca talenti con filtri
router.get('/', async (req, res) => {
  try {
    const { category, location, name } = req.query;
    let filter = {};
    if (category) filter.categories = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (name) filter['user.name'] = { $regex: name, $options: 'i' };
    const talents = await Talent.find(filter)
      .populate('user', 'name surname avatar')
      .populate('categories', 'name')
      .lean(); // <-- AGGIUNTO .lean()
    // Mappa i dati per il frontend
    const mapped = talents.map(t => ({
      id: t._id,
      name: t.user?.name,
      avatar: t.user?.avatar,
      category: t.categories[0]?.name || (t.categories.length > 0 ? t.categories[0] : ''),
      categories: Array.isArray(t.categories) ? t.categories.map(c => typeof c === 'object' && c !== null ? c.name : c) : [],
      rating: t.rating,
      price: t.priceRange?.min,
      image: t.gallery?.[0] || t.user?.avatar,
      location: t.location,
      bio: t.bio,
      description: t.bio,
    }));
    console.log('RESPONSE TALENTS:', mapped); // <-- LOG DI DEBUG
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