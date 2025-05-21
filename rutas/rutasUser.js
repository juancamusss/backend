const express = require('express')
const router = express.Router()
const { updateUser } = require('../controllers/userController');
const {registerUser,
    loginUser,
    getMe
} = require('../controllers/userController')


const { protect } = require('../middleware/authMiddleware') 


router.post('/', registerUser)
router.post('/login', loginUser)
router.get('/me', protect, getMe)
router.put('/me', protect, updateUser)

module.exports = router