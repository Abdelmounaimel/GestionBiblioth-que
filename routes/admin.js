const express = require('express');
const router = express.Router();
const Livre = require('../models/livreModel');
const Emprunt = require('../models/empruntModel');
const User = require('../models/userModel');

// Dashboard Admin
router.get('/dashboard', async (req, res) => {
    try {
        const livresCount = await Livre.countDocuments();
        const empruntsCount = await Emprunt.countDocuments();
        const etudiantsCount = await User.countDocuments({ role: 'etudiant' });
        
        // Récupérer les derniers emprunts
        const derniersEmprunts = await Emprunt.find()
            .populate('livre')
            .populate('etudiant')
            .sort({ dateEmprunt: -1 })
            .limit(5);

        // Récupérer les derniers livres
        const derniersLivres = await Livre.find()
            .sort({ _id: -1 })
            .limit(5);

        res.render('admin/dashboard', { 
            livresCount, 
            empruntsCount, 
            etudiantsCount,
            derniersEmprunts,
            derniersLivres,
            session: req.session
        });
    } catch (error) {
        console.error('Erreur dashboard:', error);
        res.status(500).render('error', {
            message: 'Une erreur est survenue',
            session: req.session
        });
    }
});

// Liste des étudiants
router.get('/etudiants', async (req, res) => {
    try {
        const etudiants = await User.find({ role: 'etudiant' }).sort({ nom: 1 });
        res.render('admin/etudiants', { 
            etudiants,
            session: req.session
        });
    } catch (error) {
        console.error('Erreur liste étudiants:', error);
        res.status(500).render('error', {
            message: 'Une erreur est survenue',
            session: req.session
        });
    }
});

// Liste des emprunts
router.get('/emprunts', async (req, res) => {
    try {
        const emprunts = await Emprunt.find()
            .populate('livre')
            .populate('etudiant')
            .sort({ dateEmprunt: -1 });
        res.render('admin/emprunts', { 
            emprunts,
            session: req.session
        });
    } catch (error) {
        console.error('Erreur liste emprunts:', error);
        res.status(500).render('error', {
            message: 'Une erreur est survenue',
            session: req.session
        });
    }
});

// Liste des livres
router.get('/livres', async (req, res) => {
    try {
        const livres = await Livre.find().sort({ titre: 1 });
        res.render('admin/livres', { 
            livres,
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

// Formulaire d'ajout de livre
router.get('/livres/add', (req, res) => {
    res.render('admin/add-livre', {
        session: req.session
    });
});

// Ajouter un livre
router.post('/livres', async (req, res) => {
    try {
        const newLivre = new Livre({
            ...req.body,
            disponible: req.body.disponible === 'on'
        });
        await newLivre.save();
        res.redirect('/admin/livres');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'Une erreur est survenue lors de l\'ajout du livre',
            session: req.session
        });
    }
});

// Formulaire de modification d'un livre
router.get('/livres/edit/:id', async (req, res) => {
    try {
        const livre = await Livre.findById(req.params.id);
        if (!livre) {
            return res.status(404).render('error', {
                message: 'Livre non trouvé',
                session: req.session
            });
        }
        res.render('admin/edit-livre', {
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

// Modifier un livre
router.put('/livres/:id', async (req, res) => {
    try {
        const livre = await Livre.findById(req.params.id);
        if (!livre) {
            return res.status(404).render('error', {
                message: 'Livre non trouvé',
                session: req.session
            });
        }

        livre.titre = req.body.titre;
        livre.auteur = req.body.auteur;
        livre.categorie = req.body.categorie;
        livre.description = req.body.description;
        livre.nombreExemplaires = req.body.nombreExemplaires;
        livre.disponible = req.body.disponible === 'on';

        await livre.save();
        res.redirect('/admin/livres');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'Une erreur est survenue lors de la modification du livre',
            session: req.session
        });
    }
});

// Supprimer un livre
router.delete('/livres/:id', async (req, res) => {
    try {
        const livre = await Livre.findById(req.params.id);
        if (!livre) {
            return res.status(404).render('error', {
                message: 'Livre non trouvé',
                session: req.session
            });
        }

        // Vérifier s'il y a des emprunts en cours pour ce livre
        const empruntsEnCours = await Emprunt.exists({
            livre: req.params.id,
            statut: { $in: ['en_cours', 'en_retard'] }
        });

        if (empruntsEnCours) {
            return res.status(400).render('error', {
                message: 'Impossible de supprimer ce livre car il est actuellement emprunté',
                session: req.session
            });
        }

        await livre.deleteOne();
        res.redirect('/admin/livres');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            message: 'Une erreur est survenue lors de la suppression du livre',
            session: req.session
        });
    }
});

module.exports = router;