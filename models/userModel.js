const moongoose = require('mongoose');

const userSchema = moongoose.Schema({
    name: {
        type: String,
        required: [true,'Por favor ingrese su nombre']
    },
    email: {
        type: String,
        required: [true,'Por favor ingrese su correo'],
        unique: true
    },
    password: {
        type: String,
        required: [true,'Por favor ingrese su contraseña']
    },
    profileImage: {
        type: String, // URL de la imagen subida a Google Drive
        required: false,
    },
    
    /*
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    }*/
},
{
    timestamps: true
})

module.exports = moongoose.model('User', userSchema)
