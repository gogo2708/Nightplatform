const Chat = require('../models/Chat');
const User = require('../models/User');

// Crea una chat tra due utenti (se non esiste già)
exports.createChat = async (req, res) => {
  try {
    const { userId } = req.body; // userId dell'altro partecipante
    if (!userId) return res.status(400).json({ message: 'userId obbligatorio' });
    const myId = req.user.userId;
    if (myId === userId) return res.status(400).json({ message: 'Non puoi chattare con te stesso' });
    // Cerca chat esistente
    let chat = await Chat.findOne({ participants: { $all: [myId, userId], $size: 2 } });
    if (!chat) {
      chat = new Chat({ participants: [myId, userId] });
      await chat.save();
    }
    await chat.populate('participants', 'name surname avatar');
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Errore creazione chat', error: err.message });
  }
};

// Restituisce tutte le chat dell'utente autenticato
exports.getUserChats = async (req, res) => {
  try {
    const myId = req.user.userId;
    const chats = await Chat.find({ participants: myId })
      .populate('participants', 'name surname avatar')
      .populate({ path: 'lastMessage', select: 'text sentAt read sender' })
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Errore recupero chat', error: err.message });
  }
}; 