const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const uploadToDrive = require('../utils/uploadToDrive')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname)
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`
      cb(null, uniqueName)
    },
  })
  
  const upload = multer({ storage })
  

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const fileUrl = await uploadToDrive(req.file)
    res.status(200).json({ url: fileUrl })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error al subir a Google Drive' })
  }
})

module.exports = router
