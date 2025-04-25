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

// Liste des emprunts de l'étudiant
router.get('/mes-emprunts', async (req, res) => {
    try {
        const emprunts = await Emprunt.find({
            etudiant: req.session.userId
        }).populate('livre').sort({ dateEmprunt: -1 });

        res.render('etudiant/mes-emprunts', {
            emprunts,
            session: req.session
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'Une erreur est survenue',
            session: req.session
        });
    }
});

// Formulaire d'emprunt d'un livre
router.get('/emprunter/:livreId', async (req, res) => {
    try {
        const livre = await Livre.findById(req.params.livreId);
        if (!livre || !livre.disponible) {
            return res.status(404).render('error', {
                message: 'Livre non disponible',
                session: req.session
            });
        }

        res.render('etudiant/emprunter', {
            livre,
            session: req.session
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'Une erreur est survenue',
            session: req.session
        });
    }
});

// Traitement de l'emprunt
router.post('/emprunter/:livreId', async (req, res) => {
    try {
        const livre = await Livre.findById(req.params.livreId);
        if (!livre || !livre.disponible) {
            return res.status(404).render('error', {
                message: 'Livre non disponible',
                session: req.session
            });
        }

        // Vérifier si l'étudiant n'a pas déjà 3 emprunts en cours
        const empruntsEnCours = await Emprunt.countDocuments({
            etudiant: req.session.userId,
            statut: { $in: ['en_cours', 'en_retard'] }
        });

        if (empruntsEnCours >= 3) {
            return res.status(400).render('error', {
                message: 'Vous avez atteint la limite de 3 emprunts simultanés',
                session: req.session
            });
        }

        // Créer l'emprunt
        const dateRetourPrevu = new Date();
        dateRetourPrevu.setDate(dateRetourPrevu.getDate() + 14); // +14 jours

        const emprunt = new Emprunt({
            livre: livre._id,
            etudiant: req.session.userId,
            dateEmprunt: new Date(),
            dateRetourPrevu: dateRetourPrevu,
            statut: 'en_cours'
        });

        await emprunt.save();

        // Mettre à jour la disponibilité du livre
        livre.disponible = false;
        await livre.save();

        res.redirect('/etudiant/mes-emprunts');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'Une erreur est survenue lors de l\'emprunt',
            session: req.session
        });
    }
});

// Retourner un livre
router.post('/retourner/:empruntId', async (req, res) => {
    try {
        const emprunt = await Emprunt.findById(req.params.empruntId);
        if (!emprunt || emprunt.etudiant.toString() !== req.session.userId) {
            return res.status(404).render('error', {
                message: 'Emprunt non trouvé',
                session: req.session
            });
        }

        // Mettre à jour l'emprunt
        emprunt.statut = 'retourne';
        emprunt.dateRetourEffectif = new Date();
        await emprunt.save();

        // Rendre le livre disponible
        const livre = await Livre.findById(emprunt.livre);
        livre.disponible = true;
        await livre.save();

        res.redirect('/etudiant/mes-emprunts');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'Une erreur est survenue lors du retour',
            session: req.session
        });
    }
});

module.exports = router;
