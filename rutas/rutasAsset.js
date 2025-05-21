const express = require('express');
const router = express.Router();
const {
  getAssets,
  createAsset,
  deleteAsset,
  updateAsset,
  getAssetById,
  comentarAsset,
  getUserAssets,
  searchAssets,
  rateAsset,
} = require('../controllers/assetController');

const { protect } = require('../middleware/authMiddleware');
router.get('/search', searchAssets);
router.get('/user', protect, getUserAssets); 
router.get('/:id', getAssetById)
router.route('/').get(getAssets).post(protect, createAsset);
router.route('/:id').put(protect, updateAsset).delete(protect, deleteAsset);
router.post('/:id/comment', protect, comentarAsset)
router.post('/:id/rate', protect, rateAsset) // Ruta para calificar un asset




module.exports = router;
