const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

//@desc    Register a new user
//@route   POST /api/users
//@access  Public

const registerUser = async (req, res) => {
    const { name, email, password, profileImage } = req.body;
  
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Por favor, complete todos los campos' });
    }
  
    const userExists = await User.findOne({ email });
  
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }
  
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
  
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profileImage, // Guardar la URL de la imagen de perfil
    });
  
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Datos de usuario no válidos' });
    }
  };

//@desc   Authenticate a user
//@route  POST /api/users/login
//@access Public

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log('Datos recibidos:', { email, password });

  const user = await User.findOne({ email });
  console.log('Usuario encontrado:', user);

  if (user && (await bcrypt.compare(password, user.password))) {
    console.log('Contraseña correcta');
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      profileImage: user.profileImage,
    });
  } else {
    console.log('Credenciales inválidas');
    res.status(401).json({ message: 'Credenciales inválidas' });
  }
});

//@desc  Get user data
//@route GET /api/users/me
//@access Private

const getMe = asyncHandler(async (req, res) => {
    const {id, name, email} = await User.findById(req.user._id)

    res.status(200).json({
        id,
        name,
        email
    })

})


//@desc  Update user data
//@route PUT /api/users/me
//@access Private
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }

  const { name, email, profileImage, currentPassword, newPassword } = req.body;

  // Verificar la contraseña actual
  if (currentPassword && newPassword) {
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400);
      throw new Error('La contraseña actual es incorrecta');
    }

    // Actualizar la contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.profileImage = profileImage || user.profileImage;

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    profileImage: updatedUser.profileImage,
    token: generateToken(updatedUser.id),
  });
});


// Generate JWT

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}


module.exports = { registerUser, loginUser, getMe, updateUser }