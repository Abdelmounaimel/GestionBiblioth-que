const express = require('express');
const router = express.Router();
const Livre = require('../models/livreModel');
const Emprunt = require('../models/empruntModel');

// Dashboard Étudiant
router.get('/dashboard', async (req, res) => {
    try {
        const empruntsEnCours = await Emprunt.find({
            etudiant: req.session.userId,
            statut: { $in: ['en_cours', 'en_retard'] }
        }).populate('livre');

        const livresDisponibles = await Livre.find({
            disponible: true
        });

        res.render('etudiant/dashboard', {
            empruntsEnCours,
            livresDisponibles,
            session: req.session
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'Une erreur est survenue lors du chargement du tableau de bord',
            session: req.session
        });
    }
});

module.exports = router;
