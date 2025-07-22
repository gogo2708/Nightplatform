const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// Crea una nuova prenotazione
router.post('/', auth, async (req, res) => {
  try {
    const data = req.body;
    data.user = req.user.userId;
    const booking = new Booking(data);
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

// Recupera le prenotazioni dell'utente autenticato (come cliente o talento)
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookings = await Booking.find({
      $or: [
        { user: userId },
        { talent: req.query.talentId || undefined }
      ].filter(Boolean)
    })
      .populate('talent', 'user')
      .populate('user', 'name surname email');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

// Recupera le richieste inviate dall'utente (come cliente)
router.get('/sent', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookings = await Booking.find({ user: userId })
      .populate('talent', 'name category location rating price')
      .populate('user', 'name surname email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

// Recupera le richieste ricevute dal talento
router.get('/received', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    // Prima trova il talent associato all'utente
    const Talent = require('../models/Talent');
    const talent = await Talent.findOne({ user: userId });
    if (!talent) {
      return res.status(404).json({ message: 'Talent non trovato per questo utente' });
    }
    
    const bookings = await Booking.find({ talent: talent._id })
      .populate('talent', 'name category location rating price')
      .populate('user', 'name surname email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

// Recupera dettaglio prenotazione
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('talent', 'user')
      .populate('user', 'name surname email');
    if (!booking) return res.status(404).json({ message: 'Prenotazione non trovata' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

// Aggiorna stato prenotazione
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Prenotazione non trovata' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
});

module.exports = router; 