// backend/routes/proxyRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

// Ruta para servir como proxy a archivos de Google Drive
router.get('/stream/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        
        if (!fileId) {
            return res.status(400).json({ message: 'ID de archivo no proporcionado' });
        }
        
        // URL para descargar desde Google Drive
        const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        
        // Hacer una solicitud a Google Drive para obtener el archivo
        const response = await axios({
            method: 'get',
            url: driveUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36'
            }
        });

        // Establecer las cabeceras apropiadas para streaming de audio
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache');
        
        // Enviar el stream al cliente
        response.data.pipe(res);
    } catch (error) {
        console.error('Error en el proxy de streaming:', error);
        res.status(500).json({ message: 'Error al acceder al archivo' });
    }
});

// Ruta para servir como proxy a archivos de video de Google Drive
router.get('/stream-video/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;

        if (!fileId) {
            return res.status(400).json({ message: 'ID de archivo no proporcionado' });
        }

        // URL para descargar desde Google Drive
        const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

        // Hacer una solicitud a Google Drive para obtener el archivo
        const response = await axios({
            method: 'get',
            url: driveUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36'
            }
        });

        // Establecer las cabeceras apropiadas para streaming de video
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache');

        // Enviar el stream al cliente
        response.data.pipe(res);
    } catch (error) {
        console.error('Error en el proxy de streaming de video:', error);
        res.status(500).json({ message: 'Error al acceder al archivo' });
    }
});

// Ruta para probar si un archivo es accesible
router.get('/check/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        
        if (!fileId) {
            return res.status(400).json({ message: 'ID de archivo no proporcionado' });
        }
        
        // URL para verificar el archivo en Google Drive
        const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        
        // Hacer una solicitud HEAD para verificar si el archivo existe y es accesible
        await axios({
            method: 'head',
            url: driveUrl,
            timeout: 5000, // 5 segundos de timeout
        });
        
        // Si llegamos aquí, el archivo existe y es accesible
        res.json({ 
            success: true, 
            message: 'Archivo accesible',
            streamUrl: `/api/proxy/stream/${fileId}` 
        });
    } catch (error) {
        console.error('Error al verificar archivo:', error);
        res.status(404).json({ 
            success: false,
            message: 'Archivo no accesible o no encontrado' 
        });
    }
});

module.exports = router;