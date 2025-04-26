const express = require('express');
const router = express.Router();
const Livre = require('../models/livreModel');

// Liste des livres
router.get('/', async (req, res) => {
    try {
        const livres = await Livre.find()
            .sort({ titre: 1 });
        res.render('livres/index', { livres });
    } catch (error) {
        console.error('Erreur liste des livres:', error);
        res.render('error', { 
            message: 'Une erreur est survenue lors du chargement de la liste des livres' 
        });
    }
});

// Détails d'un livre
router.get('/:id', async (req, res) => {
    try {
        const livre = await Livre.findById(req.params.id);
        if (!livre) {
            return res.render('error', { 
                message: 'Livre non trouvé' 
            });
        }
        res.render('livres/details', { livre });
    } catch (error) {
        console.error('Erreur détails livre:', error);
        res.render('error', { 
            message: 'Une erreur est survenue lors du chargement des détails du livre' 
        });
    }
});

module.exports = router;
