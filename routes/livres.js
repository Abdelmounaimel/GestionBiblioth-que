const express = require('express');
const router = express.Router();
const Livre = require('../models/livreModel');

// Liste des livres
router.get('/', async (req, res) => {
    const livres = await Livre.find();
    res.render('livres/index', { livres });
});

module.exports = router;
