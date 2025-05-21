// Nuevo archivo: backend/routes/audioRoutes.js
const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const uploadFileToDrive = require('../utils/uploadToDrive')
const multer = require('multer')
const path = require('path')

// Configuración de multer para archivos de audio
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  // Aceptar solo archivos de audio
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true)
  } else {
    cb(new Error('El archivo debe ser un audio'), false)
  }
}

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB límite
})

// Ruta para convertir una URL de Google Drive a un formato reproducible
router.post('/convert-url', protect, async (req, res) => {
  try {
    const { driveUrl } = req.body
    
    if (!driveUrl) {
      return res.status(400).json({ message: 'URL no proporcionada' })
    }
    
    // Extraer el ID del archivo de Google Drive
    const extractId = (url) => {
      const idRegex = /[-\w]{25,}/
      const match = url.match(idRegex)
      return match ? match[0] : null
    }
    
    const fileId = extractId(driveUrl)
    
    if (!fileId) {
      return res.status(400).json({ message: 'URL de Google Drive inválida' })
    }
    
    // Crear URL de reproducción directa
    const playbackUrl = `https://docs.google.com/uc?export=open&id=${fileId}`
    
    res.json({ playbackUrl })
  } catch (error) {
    console.error('Error al convertir URL:', error)
    res.status(500).json({ message: 'Error al procesar la URL' })
  }
})

module.exports = router