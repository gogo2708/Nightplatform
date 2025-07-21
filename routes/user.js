const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Ottieni profilo utente autenticato
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Utente non trovato' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

// Aggiorna profilo utente autenticato
router.put('/me', auth, async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) delete updates.password; // Non permettere update password qui
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Utente non trovato' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

// Cerca utente per email (senza auth, solo per test/demo)
router.get('/by-email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-password');
    if (!user) return res.status(404).json({ message: 'Utente non trovato' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

module.exports = router; 