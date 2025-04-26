const express = require('express');
const router = express.Router();
const Livre = require('../models/livreModel');
const Emprunt = require('../models/empruntModel');

// Middleware de vérification de session
const checkSession = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).render('error', { 
            message: 'Vous devez être connecté pour accéder à cette page' 
        });
    }
    next();
};

// Appliquer le middleware à toutes les routes
router.use(checkSession);

// Dashboard Étudiant
router.get('/dashboard', async (req, res) => {
    try {
        // Récupérer les emprunts en cours
        const empruntsEnCours = await Emprunt.find({
            etudiant: req.session.userId,
            statut: 'en_cours'
        })
        .populate('livre')
        .sort({ dateEmprunt: -1 });

        // Récupérer les livres disponibles
        const livresDisponibles = await Livre.find({ disponible: true })
            .sort({ titre: 1 })
            .limit(5);

        res.render('etudiant/dashboard', { 
            empruntsEnCours: empruntsEnCours || [],
            livresDisponibles: livresDisponibles || []
        });
    } catch (error) {
        console.error('Erreur dashboard étudiant:', error);
        res.render('error', { 
            message: 'Une erreur est survenue lors du chargement du tableau de bord' 
        });
    }
});

// Liste des emprunts de l'étudiant
router.get('/emprunts', async (req, res) => {
    try {
        const emprunts = await Emprunt.find({ etudiant: req.session.userId })
            .populate('livre')
            .sort({ dateEmprunt: -1 });

        res.render('etudiant/emprunts', { emprunts });
    } catch (error) {
        console.error('Erreur liste des emprunts:', error);
        res.render('error', { 
            message: 'Une erreur est survenue lors du chargement de vos emprunts' 
        });
    }
});

// Emprunter un livre
router.post('/emprunter/:id', async (req, res) => {
    try {
        // Vérifier si l'utilisateur est connecté
        if (!req.session.userId) {
            console.error('Session utilisateur non trouvée');
            return res.status(401).render('error', { 
                message: 'Vous devez être connecté pour emprunter un livre' 
            });
        }

        const livre = await Livre.findById(req.params.id);
        
        if (!livre) {
            console.error(`Livre non trouvé avec l'ID: ${req.params.id}`);
            return res.status(404).render('error', { 
                message: 'Livre non trouvé' 
            });
        }

        if (!livre.disponible) {
            console.error(`Livre ${livre.titre} non disponible`);
            return res.status(400).render('error', { 
                message: 'Ce livre n\'est pas disponible pour l\'emprunt' 
            });
        }

        // Vérifier si l'étudiant n'a pas déjà emprunté ce livre
        const empruntExistant = await Emprunt.findOne({
            livre: livre._id,
            etudiant: req.session.userId,
            statut: 'en_cours'
        });

        if (empruntExistant) {
            console.error(`L'étudiant a déjà emprunté ce livre`);
            return res.status(400).render('error', { 
                message: 'Vous avez déjà emprunté ce livre' 
            });
        }

        // Créer un nouvel emprunt
        const dateEmprunt = new Date();
        const dateRetourPrevu = new Date();
        dateRetourPrevu.setDate(dateRetourPrevu.getDate() + 14); // 14 jours d'emprunt

        const nouvelEmprunt = new Emprunt({
            livre: livre._id,
            etudiant: req.session.userId,
            dateEmprunt: dateEmprunt,
            dateRetourPrevu: dateRetourPrevu,
            statut: 'en_cours'
        });

        await nouvelEmprunt.save();

        // Mettre à jour le statut du livre
        livre.disponible = false;
        await livre.save();

        // Rediriger vers la liste des emprunts
        res.redirect('/etudiant/emprunts');
    } catch (error) {
        console.error('Erreur détaillée lors de l\'emprunt:', error);
        res.status(500).render('error', { 
            message: 'Une erreur est survenue lors de l\'emprunt du livre: ' + error.message 
        });
    }
});

module.exports = router;
