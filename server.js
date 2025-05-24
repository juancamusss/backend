const path = require('path')
const express = require('express')
const colors = require('colors')
const dotenv = require('dotenv').config()
const {errorHandler} = require('./middleware/errorMiddleware')
const connectDB = require('./config/db')
const audioRoutes = require('./rutas/audioRoutes')
const proxyRoutes = require('./rutas/proxyRoutes');
const cors = require('cors')


const port = process.env.PORT || 5000


connectDB()

const app = express()

app.use(cors({
  origin: 'https://voxelhubua2.netlify.app',
  credentials: true,
}))

//prueba  3




app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use('/api/users', require('./rutas/rutasUser'))
app.use('/api/assets', require('./rutas/rutasAsset'))
app.use('/api/drive', require('./rutas/rutaDrive'))
app.use('/api/audio', audioRoutes)
app.use('/api/proxy', proxyRoutes);

app.use(errorHandler)

app.listen(port, () => console.log(`Server is running on port ${port}`))
