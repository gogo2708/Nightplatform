const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

// Recupera tutti i messaggi di una chat
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name surname avatar')
      .sort({ sentAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Errore recupero messaggi', error: err.message });
  }
};

// Invia un messaggio in una chat
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Testo obbligatorio' });
    const sender = req.user.userId;
    // Verifica che la chat esista e che l'utente sia partecipante
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(sender)) {
      return res.status(403).json({ message: 'Non autorizzato' });
    }
    const message = new Message({ chat: chatId, sender, text });
    await message.save();
    // Aggiorna lastMessage nella chat
    chat.lastMessage = message._id;
    await chat.save();
    await message.populate('sender', 'name surname avatar');
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Errore invio messaggio', error: err.message });
  }
}; 