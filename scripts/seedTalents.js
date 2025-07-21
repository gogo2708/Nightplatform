require('dotenv').config();
const mongoose = require('mongoose');
const Talent = require('../models/Talent');
const Category = require('../models/Category');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

const mockTalents = [
  {
    name: 'Marco DJ',
    category: 'Artisti e Performer',
    rating: 4.8,
    price: 150,
    avatar: 'https://s7d9.scene7.com/is/image/minesafetyappliances/06-0007_Head-Protection-Testimonial-Page-Image?scl=1',
    location: 'Milano',
    experience: '5 anni',
    description: 'DJ professionista con esperienza in club e festival internazionali. Specializzato in musica elettronica e remix.',
    skills: ['Mixaggio', 'Remix', 'Live set', 'Sound design'],
    works: [
      'Tomorrowland 2023',
      'Resident DJ @ Club Milano',
      'Evento privato Ferrari 2022'
    ],
    social: {
      instagram: 'https://instagram.com/marcodj',
      facebook: 'https://facebook.com/marcodj',
      tiktok: 'https://tiktok.com/@marcodj'
    }
  },
  {
    name: 'Sofia Singer',
    category: 'Artisti e Performer',
    rating: 4.9,
    price: 200,
    avatar: 'https://via.placeholder.com/80',
    location: 'Roma',
    experience: '8 anni',
    description: 'Cantante pop e soul, disponibile per matrimoni, eventi aziendali e concerti. Voce potente e versatile.',
    skills: ['Canto pop', 'Canto soul', 'Live band', 'Songwriting'],
    works: [
      'Concerto Capodanno Roma 2024',
      'Matrimonio Villa Borghese',
      'Finalista The Voice 2021'
    ],
    social: {
      instagram: 'https://instagram.com/sofiasinger',
      facebook: 'https://facebook.com/sofiasinger',
      tiktok: 'https://tiktok.com/@sofiasinger'
    }
  },
  {
    name: 'Luca Sax',
    category: 'Ballo e Spettacolo',
    rating: 4.7,
    price: 120,
    avatar: 'https://via.placeholder.com/80',
    location: 'Napoli',
    experience: '3 anni',
    description: 'Sassofonista jazz e pop, disponibile per eventi privati e serate in locali. Collaborazioni con band locali.',
    skills: ['Sax alto', 'Jazz', 'Pop', 'Improvvisazione'],
    works: [
      'Jazz Night Napoli 2023',
      'Serata live @ Blue Note',
      'Collaborazione con Napoli Band'
    ],
    social: {
      instagram: 'https://instagram.com/lucasax',
      facebook: '',
      tiktok: ''
    }
  },
  {
    name: 'Elena Dancer',
    category: 'Ballo e Spettacolo',
    rating: 4.6,
    price: 180,
    avatar: 'https://via.placeholder.com/80',
    location: 'Firenze',
    experience: '6 anni',
    description: 'Ballerina professionista di danza moderna e contemporanea. Esperienza in spettacoli teatrali e TV.',
    skills: ['Danza moderna', 'Contemporanea', 'Coreografia'],
    works: [
      'Spettacolo Teatro Verdi',
      'Finalista Amici 2022',
      'Show TV Rai 2023'
    ],
    social: {
      instagram: '',
      facebook: 'https://facebook.com/elenadancer',
      tiktok: 'https://tiktok.com/@elenadancer'
    }
  },
  {
    name: 'Giulia Chef',
    category: 'Ristorazione',
    rating: 4.8,
    price: 90,
    avatar: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    location: 'Bologna',
    experience: '10 anni',
    description: 'Chef specializzata in cucina italiana e fusion, disponibile per eventi privati e catering.',
    skills: ['Cucina italiana', 'Fusion', 'Catering'],
    works: [
      'Catering matrimonio 2023',
      'Evento aziendale Ducati',
      'Show cooking TV'
    ],
    social: {
      instagram: 'https://instagram.com/giuliachef',
      facebook: '',
      tiktok: ''
    }
  },
  {
    name: 'Lorenzo Barman',
    category: 'Hospitality e Beverage',
    rating: 4.5,
    price: 70,
    avatar: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c',
    location: 'Torino',
    experience: '4 anni',
    description: 'Barman professionista per eventi, matrimoni e locali. Specializzato in cocktail creativi.',
    skills: ['Cocktail', 'Mixology', 'Eventi'],
    works: [
      'Evento Campari 2023',
      'Resident barman @ Club Torino',
      'Matrimonio Villa Reale'
    ],
    social: {
      instagram: '',
      facebook: '',
      tiktok: ''
    }
  },
  {
    name: 'Marta Tecnica',
    category: 'Tecnicə e Supporto Artistico',
    rating: 4.7,
    price: 110,
    avatar: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
    location: 'Genova',
    experience: '7 anni',
    description: 'Tecnica luci e audio per spettacoli teatrali e concerti. Esperta in installazioni e supporto tecnico.',
    skills: ['Luci', 'Audio', 'Installazioni'],
    works: [
      'Concerto Piazza De Ferrari',
      'Teatro Carlo Felice',
      'Festival della Scienza'
    ],
    social: {
      instagram: '',
      facebook: '',
      tiktok: ''
    }
  },
  {
    name: 'Alessio Sicurezza',
    category: 'Sicurezza e Logistica',
    rating: 4.4,
    price: 60,
    avatar: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    location: 'Verona',
    experience: '12 anni',
    description: 'Responsabile sicurezza e logistica per grandi eventi. Esperienza in gestione flussi e safety.',
    skills: ['Sicurezza', 'Logistica', 'Gestione eventi'],
    works: [
      'Arena di Verona',
      'Concerto Vasco Rossi',
      'Fiera Vinitaly'
    ],
    social: {
      instagram: '',
      facebook: '',
      tiktok: ''
    }
  },
  {
    name: 'Chiara Event Planner',
    category: 'Organizzatorə e Figure Creative',
    rating: 4.9,
    price: 130,
    avatar: 'https://images.unsplash.com/photo-1515378791036-46273834b3fb',
    location: 'Venezia',
    experience: '9 anni',
    description: 'Event planner e creativa per matrimoni, festival e eventi aziendali. Dalla progettazione alla realizzazione.',
    skills: ['Event planning', 'Creatività', 'Gestione team'],
    works: [
      'Carnevale di Venezia',
      'Festival del Cinema',
      'Evento aziendale Luxottica'
    ],
    social: {
      instagram: '',
      facebook: '',
      tiktok: ''
    }
  },
  {
    name: 'Davide DJ',
    category: 'Artisti e Performer',
    rating: 4.7,
    price: 160,
    avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
    location: 'Bari',
    experience: '7 anni',
    description: 'DJ versatile per eventi privati e club. Specializzato in house e dance anni 2000.',
    skills: ['Mixaggio', 'House', 'Dance 2000'],
    works: [
      'Summer Party Bari 2023',
      'Resident DJ @ Club Apulia',
      'Evento privato Maserati'
    ],
    social: {
      instagram: 'https://instagram.com/davidedj',
      facebook: '',
      tiktok: ''
    }
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // 1. Crea tutte le categorie se non esistono
    const uniqueCategories = [...new Set(mockTalents.map(t => t.category))];
    const categoryMap = {};
    for (const catName of uniqueCategories) {
      let cat = await Category.findOne({ name: catName });
      if (!cat) {
        cat = new Category({ name: catName, order: 99 });
        await cat.save();
        console.log(`Categoria creata: ${catName}`);
      }
      categoryMap[catName] = cat._id;
    }
    // 2. Crea i talenti associando la categoria giusta
    for (const t of mockTalents) {
      let user = await User.findOne({ email: `${t.name.toLowerCase().replace(/\s/g, '')}@mail.com` });
      if (!user) {
        user = new User({
          name: t.name,
          email: `${t.name.toLowerCase().replace(/\s/g, '')}@mail.com`,
          password: '$2b$10$abcdefghijklmnopqrstuv',
          avatar: t.avatar,
          role: 'talent',
        });
        await user.save();
      }
      const existingTalent = await Talent.findOne({ user: user._id });
      if (!existingTalent) {
        const talent = new Talent({
          user: user._id,
          categories: [categoryMap[t.category]],
          bio: t.description,
          priceRange: { min: t.price, max: t.price },
          location: t.location,
          gallery: [t.avatar],
          rating: t.rating,
          availability: [],
        });
        await talent.save();
      } else {
        // Aggiorna la categoria se mancante o errata
        existingTalent.categories = [categoryMap[t.category]];
        await existingTalent.save();
      }
    }
    console.log('Talenti inseriti!');
    process.exit();
  } catch (err) {
    console.error('Errore seed:', err);
    process.exit(1);
  }
}

seed(); 