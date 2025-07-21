const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// Crea una chat tra due utenti
router.post('/', auth, chatController.createChat);
// Restituisce tutte le chat dell'utente autenticato
router.get('/', auth, chatController.getUserChats);

module.exports = router; 