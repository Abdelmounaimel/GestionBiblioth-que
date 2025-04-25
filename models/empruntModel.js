const mongoose = require('mongoose');

const empruntSchema = new mongoose.Schema({
    livre: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Livre', 
        required: true 
    },
    etudiant: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    dateEmprunt: { 
        type: Date, 
        default: Date.now 
    },
    dateRetourPrevu: {
        type: Date,
        required: true
    },
    dateRetourEffectif: {
        type: Date
    },
    statut: { 
        type: String, 
        enum: ['en_attente', 'en_cours', 'retourne', 'en_retard'], 
        default: 'en_attente' 
    }
});

module.exports = mongoose.model('Emprunt', empruntSchema);