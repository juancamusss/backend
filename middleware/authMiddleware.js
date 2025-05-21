const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
    let token;
  
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        token = req.headers.authorization.split(' ')[1];
        console.log('Token recibido:', token); // Verifica el token recibido
  
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decodificado:', decoded); // Verifica el contenido del token
  
        // Obtener el usuario del token
        req.user = await User.findById(decoded.id).select('-password');
        console.log('Usuario autenticado en middleware:', req.user); // Verifica el usuario autenticado
  
        next();
      } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error('No autorizado, token fallido');
      }
    }
  
    if (!token) {
      res.status(401);
      throw new Error('No autorizado, no hay token');
    }
  });

module.exports = { protect };