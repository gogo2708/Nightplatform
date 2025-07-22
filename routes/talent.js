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

// Debug: aggiorna categoria di George
router.get('/debug/update-george', async (req, res) => {
  try {
    const Category = require('../models/Category');
    
    // Trova l'ID della categoria 'Artisti e Performer'
    const artistiCategory = await Category.findOne({ name: 'Artisti e Performer' });
    console.log('Categoria Artisti e Performer ID:', artistiCategory?._id);
    
    if (!artistiCategory) {
      return res.status(404).json({ message: 'Categoria "Artisti e Performer" non trovata' });
    }
    
    // Aggiorna il profilo di George
    const result = await Talent.findOneAndUpdate(
      { 'user.name': 'George' },
      { categories: [artistiCategory._id] },
      { new: true }
    ).populate('user', 'name surname').populate('categories', 'name');
    
    console.log('Profilo George aggiornato:', result);
    res.json({ message: 'Profilo George aggiornato', result });
  } catch (err) {
    console.error('Errore aggiornamento George:', err);
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

// Debug: aggiorna tutti i talenti con macro-categorie
router.get('/debug/update-all-categories', async (req, res) => {
  try {
    const Category = require('../models/Category');
    const { getMacroCategories } = require('../utils/categoryMapper');
    
    const allTalents = await Talent.find().populate('categories', 'name');
    const updatedTalents = [];
    
    for (const talent of allTalents) {
      const allCategoryIds = new Set();
      
      // Aggiungi le categorie esistenti (senza duplicati)
      talent.categories.forEach(cat => allCategoryIds.add(cat._id));
      
      // Espandi con le macro-categorie
      for (const category of talent.categories) {
        const macroCategories = getMacroCategories(category.name);
        for (const macroCategoryName of macroCategories) {
          const macroCategory = await Category.findOne({ name: macroCategoryName });
          if (macroCategory) {
            allCategoryIds.add(macroCategory._id);
          }
        }
      }
      
      // Aggiorna il talent
      const expandedCategories = Array.from(allCategoryIds);
      const updatedTalent = await Talent.findByIdAndUpdate(
        talent._id,
        { categories: expandedCategories },
        { new: true }
      ).populate('user', 'name surname').populate('categories', 'name');
      
      updatedTalents.push(updatedTalent);
      console.log(`Talent ${updatedTalent.user?.name} aggiornato con categorie:`, updatedTalent.categories.map(c => c.name));
    }
    
    res.json({ 
      message: `${updatedTalents.length} talenti aggiornati con macro-categorie`, 
      talents: updatedTalents 
    });
  } catch (err) {
    console.error('Errore aggiornamento categorie:', err);
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

// Debug: pulisci duplicati nelle categorie
router.get('/debug/clean-duplicates', async (req, res) => {
  try {
    const allTalents = await Talent.find().populate('categories', 'name');
    const updatedTalents = [];
    
    for (const talent of allTalents) {
      // Rimuovi duplicati dalle categorie
      const uniqueCategories = [];
      const seenIds = new Set();
      
      talent.categories.forEach(cat => {
        if (!seenIds.has(cat._id.toString())) {
          seenIds.add(cat._id.toString());
          uniqueCategories.push(cat._id);
        }
      });
      
      // Aggiorna il talent
      const updatedTalent = await Talent.findByIdAndUpdate(
        talent._id,
        { categories: uniqueCategories },
        { new: true }
      ).populate('user', 'name surname').populate('categories', 'name');
      
      updatedTalents.push(updatedTalent);
      console.log(`Talent ${updatedTalent.user?.name} pulito con categorie:`, updatedTalent.categories.map(c => c.name));
    }
    
    res.json({ 
      message: `${updatedTalents.length} talenti puliti dai duplicati`, 
      talents: updatedTalents 
    });
  } catch (err) {
    console.error('Errore pulizia duplicati:', err);
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

// Ricerca talenti con filtri
router.get('/', async (req, res) => {
  try {
    const { category, location, name } = req.query;
    console.log('=== DEBUG FILTRO CATEGORIE ===');
    console.log('QUERY PARAMS:', { category, location, name });
    console.log('URL COMPLETA:', req.url);
    console.log('HEADERS:', req.headers);
    
    let filter = {};
    if (category) {
      // Gestione gerarchia categorie
      const Category = require('../models/Category');
      const selectedCategory = await Category.findById(category);
      console.log('CATEGORIA SELEZIONATA:', selectedCategory?.name);
      
      if (selectedCategory?.name === 'Artisti e Performer') {
        // Se è "Artisti e Performer", includi anche le sottocategorie come "DJ"
        const subCategories = await Category.find({ 
          name: { $in: ['DJ', 'Cantante', 'Musicista', 'Attore', 'Danzatore'] }
        });
        const categoryIds = [category, ...subCategories.map(c => c._id)];
        filter.categories = { $in: categoryIds };
        console.log('FILTRO MACRO-CATEGORIA - Include sottocategorie:', categoryIds);
      } else {
        filter.categories = category;
        console.log('FILTRO CATEGORIA APPLICATO:', category);
      }
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
    
    // Funzione per espandere le categorie con le macro-categorie
    const expandCategories = async (categoryIds) => {
      const Category = require('../models/Category');
      const { getMacroCategories } = require('../utils/categoryMapper');
      
      const allCategoryIds = new Set();
      
      for (const categoryId of categoryIds) {
        const category = await Category.findById(categoryId);
        if (category) {
          allCategoryIds.add(category._id);
          const macroCategories = getMacroCategories(category.name);
          for (const macroCategoryName of macroCategories) {
            const macroCategory = await Category.findOne({ name: macroCategoryName });
            if (macroCategory) {
              allCategoryIds.add(macroCategory._id);
            }
          }
        }
      }
      
      return Array.from(allCategoryIds);
    };
    
    if (talent) {
      // Aggiorna
      const expandedCategories = categories ? await expandCategories(categories) : talent.categories;
      talent.categories = expandedCategories;
      talent.bio = bio || talent.bio;
      talent.priceRange = priceRange || talent.priceRange;
      talent.location = location || talent.location;
      talent.gallery = gallery || talent.gallery;
      await talent.save();
      return res.json(talent);
    } else {
      // Crea nuovo profilo talent
      const expandedCategories = categories ? await expandCategories(categories) : [];
      talent = new Talent({
        user: req.user.userId,
        categories: expandedCategories,
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