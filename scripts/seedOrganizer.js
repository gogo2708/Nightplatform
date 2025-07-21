const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nighttalent';

async function seed() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const email = 'luca.organizer@example.com';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Utente già esistente:', existing);
    process.exit(0);
  }
  const user = await User.create({
    name: 'Luca',
    surname: 'Organizer',
    email,
    password: await bcrypt.hash('testpassword', 10),
    role: 'user',
    avatar: 'https://via.placeholder.com/80'
  });
  console.log('Utente creato:', user);
  process.exit(0);
}
seed(); 
