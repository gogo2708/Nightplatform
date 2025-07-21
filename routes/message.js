const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const messageController = require('../controllers/messageController');

// Recupera tutti i messaggi di una chat
router.get('/:chatId', auth, messageController.getMessages);
// Invia un messaggio in una chat
router.post('/:chatId', auth, messageController.sendMessage);

module.exports = router; 