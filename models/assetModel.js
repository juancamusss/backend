const mongoose = require('mongoose')

const assetSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    type: {
      type: String,
      required: [true, 'Please specify the asset type'],
      enum: ['2D', '3D', 'audio', 'video', 'code', 'other'],
    },
    previewImage: {
      type: String, // URL a Google Drive o similar
      required: true,
    },
    assetUrl: {
      type: String, // Enlace de descarga
      required: true,
    },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      }
    ],
    images: {
      type: [String], // Array de URLs
      validate: [arrayLimit, '{PATH} excede el límite de 5 imágenes'],
    },
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        value: { type: Number, required: true, min: 1, max: 5 },
      },
    ],
  },
  
  {
    timestamps: true,
  }
)

function arrayLimit(val) {
  return val.length <= 5;
}

module.exports = mongoose.model('Asset', assetSchema)
