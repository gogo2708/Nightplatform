const mongoose = require('mongoose');
const Talent = require('./models/Talent');
const Category = require('./models/Category');

mongoose.connect('mongodb://localhost:27017/nighttalent')
  .then(async () => {
    try {
      // Trova l'ID della categoria 'Artisti e Performer'
      const artistiCategory = await Category.findOne({ name: 'Artisti e Performer' });
      console.log('Categoria Artisti e Performer ID:', artistiCategory?._id);
      
      if (!artistiCategory) {
        console.error('Categoria "Artisti e Performer" non trovata');
        return;
      }
      
      // Aggiorna il profilo di George
      const result = await Talent.findOneAndUpdate(
        { 'user.name': 'George' },
        { categories: [artistiCategory._id] },
        { new: true }
      ).populate('user', 'name surname').populate('categories', 'name');
      
      console.log('Profilo aggiornato:', result);
      mongoose.connection.close();
    } catch (err) {
      console.error('Errore:', err);
      mongoose.connection.close();
    }
  })
  .catch(console.error); 