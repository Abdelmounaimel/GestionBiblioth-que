const express = require('express');
const router = express.Router();
const Emprunt = require('../models/empruntModel');

// Liste des emprunts
router.get('/', async (req, res) => {
    const emprunts = await Emprunt.find().populate('livre').populate('etudiant');
    res.render('emprunts/index', { emprunts });
});

module.exports = router;
