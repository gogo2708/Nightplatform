const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('Auth middleware - JWT_SECRET presente:', !!JWT_SECRET);
  console.log('Auth middleware - JWT_SECRET length:', JWT_SECRET ? JWT_SECRET.length : 0);
  console.log('Auth middleware - Token presente:', !!token);
  console.log('Auth middleware - Token length:', token ? token.length : 0);
  
  if (!token) {
    return res.status(401).json({ message: 'Token mancante' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Auth middleware - Errore JWT:', err.message);
      return res.status(403).json({ message: 'Token non valido' });
    }
    console.log('Auth middleware - Token valido per user:', user.userId);
    req.user = user;
    next();
  });
}; 