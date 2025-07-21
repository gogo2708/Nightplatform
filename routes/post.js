const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Talent = require('../models/Talent');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { upload } = require('../utils/cloudinary');

// Crea un nuovo post (talent autenticato)
router.post('/', auth, async (req, res) => {
  try {
    const { content, images } = req.body;
    // Trova il profilo talent dell'utente
    const talent = await Talent.findOne({ user: req.user.userId });
    if (!talent) return res.status(403).json({ message: 'Solo i talenti possono pubblicare post' });
    const post = new Post({ talent: talent._id, content, images });
    await post.save();
    // Popola talent (user e categories) per la risposta
    await post.populate({
      path: 'talent',
      populate: [
        { path: 'user', select: 'name surname avatar' },
        { path: 'categories', select: 'name' }
      ]
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Errore creazione post', error: err.message });
  }
});

// Endpoint per upload media (immagine o video)
router.post('/upload', upload.single('media'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Nessun file caricato' });
  res.json({ url: req.file.path });
});

// Recupera tutti i post di un talento
router.get('/talent/:talentId', async (req, res) => {
  try {
    const posts = await Post.find({ talent: req.params.talentId })
      .populate({
        path: 'talent',
        populate: [
          { path: 'user', select: 'name surname avatar' },
          { path: 'categories', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 });
    // Mapping: se una categoria è un ID, la sostituisco con un oggetto { name: 'ID' }
    posts.forEach(post => {
      if (post.talent && Array.isArray(post.talent.categories)) {
        post.talent.categories = post.talent.categories.map(c =>
          typeof c === 'object' && c !== null && c.name ? c : { name: c.toString() }
        );
      }
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Errore recupero post', error: err.message });
  }
});

// Recupera tutti i post (feed pubblico)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate({
        path: 'talent',
        populate: [
          { path: 'user', select: 'name surname avatar' },
          { path: 'categories', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 });
    // Mapping: se una categoria è un ID, la sostituisco con un oggetto { name: 'ID' }
    posts.forEach(post => {
      if (post.talent && Array.isArray(post.talent.categories)) {
        post.talent.categories = post.talent.categories.map(c =>
          typeof c === 'object' && c !== null && c.name ? c : { name: c.toString() }
        );
      }
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Errore recupero feed', error: err.message });
  }
});

// Aggiungi un commento a un post
router.post('/:postId/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'Utente non trovato' });
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post non trovato' });
    post.comments.push({ user: user._id, text });
    await post.save();
    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ message: 'Errore aggiunta commento', error: err.message });
  }
});

// Recupera i commenti di un post
router.get('/:postId/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate('comments.user', 'name surname avatar');
    if (!post) return res.status(404).json({ message: 'Post non trovato' });
    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ message: 'Errore recupero commenti', error: err.message });
  }
});

// Metti like a un post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post non trovato' });
    if (!post.likes.includes(req.user.userId)) {
      post.likes.push(req.user.userId);
      await post.save();
    }
    await post.populate({
      path: 'talent',
      populate: [
        { path: 'user', select: 'name surname avatar' },
        { path: 'categories', select: 'name' }
      ]
    });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Errore like', error: err.message });
  }
});
// Togli like a un post
router.delete('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post non trovato' });
    post.likes = post.likes.filter(uid => uid.toString() !== req.user.userId);
    await post.save();
    await post.populate({
      path: 'talent',
      populate: [
        { path: 'user', select: 'name surname avatar' },
        { path: 'categories', select: 'name' }
      ]
    });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Errore unlike', error: err.message });
  }
});

module.exports = router; 