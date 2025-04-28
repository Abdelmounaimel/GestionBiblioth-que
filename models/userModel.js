const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'etudiant'], default: 'etudiant' },
    classe: { type: String, required: true },
    dateInscription: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);