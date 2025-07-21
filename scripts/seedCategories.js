require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

const MONGO_URI = process.env.MONGO_URI;

const categories = [
  'DJ',
  'Animatori',
  'Ballerine',
  'Performer',
  'Artisti',
  'Musicisti',
  'Vocalist',
  'Hostess',
  'Altro'
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    for (let i = 0; i < categories.length; i++) {
      const name = categories[i];
      await Category.updateOne(
        { name },
        { name, order: i },
        { upsert: true }
      );
    }
    console.log('Categorie inserite!');
    process.exit();
  } catch (err) {
    console.error('Errore seed:', err);
    process.exit(1);
  }
}

seed(); 