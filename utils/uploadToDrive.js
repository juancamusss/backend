// backend/utils/uploadToDrive.js (modificado)
const fs = require('fs')
const { google } = require('googleapis')
require('dotenv').config({ path: '.env' })

const KEYFILEPATH = 'backend/google-service-account.json'
const SCOPES = ['https://www.googleapis.com/auth/drive']

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
})

const drive = google.drive({ version: 'v3', auth })

const uploadFileToDrive = async (file) => {
  console.log('📦 Archivo recibido en uploadFileToDrive:', file)
  
  // Determinar si es un archivo de audio
  const isAudio = file.mimetype.startsWith('audio/')
  
  const fileMetadata = {
    name: file.originalname,
    parents: [process.env.DRIVE_FOLDER_ID],
  }

  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path),
  }

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id,webContentLink',
  })

  // Hacer el archivo público con la configuración adecuada
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  })

  // Configurar el archivo para el acceso directo a contenido media
  if (isAudio) {
    // Para archivos de audio, aseguramos que se pueda acceder al contenido directamente
    await drive.files.update({
      fileId: response.data.id,
      requestBody: {
        contentHints: {
          indexableText: 'audio player compatible',
        },
        // Asegurar que el archivo sea accesible como medio
        viewersCanCopyContent: true,
      },
    })
  }

  // Eliminar el archivo local temporal
  fs.unlinkSync(file.path)

  // Para archivos de audio, retornar una URL de reproducción directa
  if (isAudio) {
    // Google Drive URL para reproducción directa
    const directStreamUrl = `https://docs.google.com/uc?export=open&id=${response.data.id}`
    return directStreamUrl
  }

  // Para otros tipos de archivos, usar la URL estándar
  const publicUrl = `https://drive.google.com/uc?id=${response.data.id}`
  return publicUrl
}

module.exports = uploadFileToDrive