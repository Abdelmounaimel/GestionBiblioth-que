const express = require('express');
const router = express.Router();
const Livre = require('../models/livreModel');

// Liste des livres
router.get('/', async (req, res) => {
    try {
        const livres = await Livre.find();
        res.render('livres/index', { 
            livres,
            session: req.session
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'Une erreur est survenue lors du chargement des livres',
            session: req.session
        });
    }
});

module.exports = router;
