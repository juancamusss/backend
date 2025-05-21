const asyncHandler = require('express-async-handler')
const Asset = require('../models/assetModel')
const diacritics = require('diacritics'); // Instala esta librería con `npm install diacritics`


// @desc    Get all assets
// @route   GET /api/assets
// @access  Public
const getAssets = asyncHandler(async (req, res) => {
  const assets = await Asset.find()
  res.status(200).json(assets)
})

// @desc    Create asset
// @route   POST /api/assets
// @access  Private
const createAsset = asyncHandler(async (req, res) => {
  const { title, description, type, previewImage, assetUrl, images } = req.body;

  if (!title || !description || !type || !previewImage || !assetUrl) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

  // Validar que el array de imágenes no exceda el límite de 5
  if (images && images.length > 5) {
    res.status(400);
    throw new Error('You can upload a maximum of 5 images for the carousel');
  }

  const asset = await Asset.create({
    user: req.user.id,
    title,
    description,
    type,
    previewImage,
    assetUrl,
    images, // Guardar las imágenes del carrusel
  });

  res.status(201).json(asset);
});

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private
const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id)

  if (!asset) {
    res.status(404)
    throw new Error('Asset not found')
  }

  if (asset.user.toString() !== req.user.id) {
    res.status(401)
    throw new Error('Not authorized')
  }

  await asset.deleteOne()

  res.status(200).json({ id: req.params.id })
})

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private
const updateAsset = asyncHandler(async (req, res) => {
  console.log('Datos recibidos en el backend:', req.body); // Depuración
  console.log('ID del asset:', req.params.id); // Depuración

  const { images } = req.body;

  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }

  if (asset.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Validar que el array de imágenes no exceda el límite de 5
  if (images && images.length > 5) {
    res.status(400);
    throw new Error('You can upload a maximum of 5 images for the carousel');
  }

  const updated = await Asset.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  console.log('Asset actualizado:', updated); // Depuración
  res.status(200).json(updated);
});

// @desc    Get one asset
// @route   GET /api/assets/:id
// @access  Public
const getAssetById = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id)
    .populate('user', 'name') // autor
    .populate('comments.user', 'name profileImage') // usuario que hizo el comentario;

  if (!asset) {
    res.status(404);
    throw new Error('Asset no encontrado');
  }

  res.json(asset); // Incluye el campo `images` automáticamente
});

const getUserAssets = asyncHandler(async (req, res) => {
  console.log('Usuario autenticado:', req.user); // Verifica el usuario autenticado
  const assets = await Asset.find({ user: req.user.id }); // Filtrar por el usuario autenticado
  console.log('Assets encontrados:', assets); // Verifica los assets encontrados
  res.status(200).json(assets);
});

const comentarAsset = asyncHandler(async (req, res) => {
  const { text } = req.body
  const asset = await Asset.findById(req.params.id)

  if (!asset) {
    res.status(404)
    throw new Error('Asset not found')
  }

  const nuevoComentario = {
    user: req.user._id,
    text,
  }

  asset.comments.push(nuevoComentario)
  await asset.save()

  res.status(201).json(asset.comments)
})

// @desc    Buscar assets por título, descripción y nombre del usuario
// @route   GET /api/assets/search
// @access  Public
const searchAssets = asyncHandler(async (req, res) => {
  const query = req.query.q; // Obtiene el término de búsqueda de la query string

  if (!query) {
    res.status(400);
    throw new Error('No se proporcionó un término de búsqueda');
  }

  try {
    // Elimina acentos del término de búsqueda
    const normalizedQuery = diacritics.remove(query).toLowerCase();

    // Obtiene todos los assets y realiza un populate para incluir el nombre del usuario
    const results = await Asset.find()
      .populate('user', 'name') // Obtiene el nombre del usuario
      .lean(); // Convierte los documentos a objetos JavaScript simples

    // Filtra los resultados buscando coincidencias en título, descripción o nombre del usuario
    const filteredResults = results.filter((asset) => {
      const normalizedTitle = diacritics.remove(asset.title || '').toLowerCase();
      const normalizedDescription = diacritics.remove(asset.description || '').toLowerCase();
      const normalizedUserName = diacritics.remove(asset.user?.name || '').toLowerCase();

      return (
        normalizedTitle.includes(normalizedQuery) ||
        normalizedDescription.includes(normalizedQuery) ||
        normalizedUserName.includes(normalizedQuery)
      );
    });

    res.status(200).json(filteredResults);
  } catch (error) {
    console.error('Error al buscar assets:', error);
    res.status(500).json({ message: 'Error al buscar assets' });
  }
});


const rateAsset = asyncHandler(async (req, res) => {
  const { value } = req.body;
  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }

  const existingRating = asset.ratings.find(
    (rating) => rating.user.toString() === req.user.id
  );

  if (existingRating) {
    res.status(400);
    throw new Error('You have already rated this asset');
  }

  asset.ratings.push({ user: req.user.id, value });
  await asset.save();

  res.status(201).json(asset);
});


module.exports = {
  getAssets,
  createAsset,
  deleteAsset,
  updateAsset,
  getAssetById,
  comentarAsset,
  getUserAssets,
  searchAssets,
  rateAsset,
}
