const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

exports.register = async (req, res) => {
  try {
    const { name, surname, email, password, userType } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Tutti i campi obbligatori!' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email già registrata!' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Mappa userType a role
    let role = 'user';
    if (userType === 'talent') {
      role = 'talent';
    }
    
    const user = new User({ 
      name, 
      surname, 
      email, 
      password: hashedPassword,
      role: role
    });
    await user.save();
    
    // Genera token e restituisci dati utente come nel login
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ 
      message: 'Registrazione avvenuta con successo!',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        surname: user.surname,
        email: user.email, 
        userType: user.role, // Mappa role a userType per il frontend
        role: user.role 
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e password obbligatorie!' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenziali non valide!' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenziali non valide!' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        surname: user.surname,
        email: user.email, 
        userType: user.role, // Mappa role a userType per il frontend
        role: user.role 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Errore server', error: err.message });
  }
}; 