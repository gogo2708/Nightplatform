require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nighttalent';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('NightTalent backend API is running!');
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

const categoryRoutes = require('./routes/category');
app.use('/api/categories', categoryRoutes);

const talentRoutes = require('./routes/talent');
app.use('/api/talents', talentRoutes);

const postRoutes = require('./routes/post');
app.use('/api/post', postRoutes);

const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

const messageRoutes = require('./routes/message');
app.use('/api/message', messageRoutes);

const Message = require('./models/Message');
const Chat = require('./models/Chat');

// --- Socket.IO integration ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Puoi restringere l'origine in produzione
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Nuova connessione Socket.IO:', socket.id);
  // Ricezione e salvataggio di un messaggio chat
  socket.on('chatMessage', async (data) => {
    // data: { chatId, senderId, text }
    try {
      const { chatId, senderId, text } = data;
      if (!chatId || !senderId || !text) return;
      // Crea e salva il messaggio
      const message = new Message({ chat: chatId, sender: senderId, text });
      await message.save();
      // Aggiorna lastMessage nella chat
      await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });
      // Popola sender per la risposta
      await message.populate('sender', 'name surname avatar');
      // Inoltra il messaggio a tutti i client
      io.emit('chatMessage', {
        _id: message._id,
        chat: chatId,
        sender: message.sender,
        text: message.text,
        sentAt: message.sentAt,
        read: message.read
      });
    } catch (err) {
      console.error('Errore salvataggio messaggio chat:', err);
    }
  });
  socket.on('disconnect', () => {
    console.log('Socket disconnesso:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 