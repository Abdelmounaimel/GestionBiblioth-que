const mongoose = require('mongoose');

const livreSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: true
    },
    auteur: {
        type: String,
        required: true
    },
    categorie: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    nombreExemplaires: {
        type: Number,
        required: true,
        default: 1
    },
    disponible: {
        type: Boolean,
        default: true
    },
    dateAjout: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Livre', livreSchema);