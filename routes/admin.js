const express = require('express');
const router = express.Router();
const Livre = require('../models/livreModel');
const Emprunt = require('../models/empruntModel');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// Dashboard Admin
router.get('/dashboard', async (req, res) => {
    try {
        // Initialiser les compteurs
        let livresCount = 0;
        let empruntsCount = 0;
        let etudiantsCount = 0;
        let derniersEmprunts = [];
        let derniersLivres = [];

        // Récupérer les statistiques
        try {
            livresCount = await Livre.countDocuments();
        } catch (error) {
            console.error('Erreur comptage livres:', error);
        }

        try {
            empruntsCount = await Emprunt.countDocuments();
        } catch (error) {
            console.error('Erreur comptage emprunts:', error);
        }

        try {
            etudiantsCount = await User.countDocuments({ role: 'etudiant' });
        } catch (error) {
            console.error('Erreur comptage étudiants:', error);
        }

        // Récupérer les derniers emprunts
        try {
            derniersEmprunts = await Emprunt.find()
                .populate('livre')
                .populate('etudiant')
                .sort({ dateEmprunt: -1 })
                .limit(5);
        } catch (error) {
            console.error('Erreur récupération emprunts:', error);
        }

        // Récupérer les derniers livres
        try {
            derniersLivres = await Livre.find()
                .sort({ dateAjout: -1 })
                .limit(5);
        } catch (error) {
            console.error('Erreur récupération livres:', error);
        }
    
    res.render('admin/dashboard', { 
        livresCount, 
        empruntsCount, 
            etudiantsCount,
            derniersEmprunts,
            derniersLivres
        });
    } catch (error) {
        console.error('Erreur dashboard admin:', error);
        res.render('error', {
            message: 'Une erreur est survenue lors du chargement du tableau de bord'
        });
    }
});

// Gestion des livres
router.get('/livres', async (req, res) => {
    try {
    const livres = await Livre.find();
    res.render('admin/livres', { livres });
    } catch (error) {
        console.error('Erreur liste des livres:', error);
        res.render('error', {
            message: 'Une erreur est survenue lors du chargement de la liste des livres'
        });
    }
});

// Ajouter livre
router.get('/livres/add', (req, res) => {
    res.render('admin/add-livre');
});

router.post('/livres', async (req, res) => {
    try {
        const newLivre = new Livre({
            ...req.body,
            disponible: true,
            dateAjout: new Date()
        });
        await newLivre.save();
        res.redirect('/admin/livres');
    } catch (error) {
        console.error('Erreur ajout livre:', error);
        res.render('error', {
            message: 'Une erreur est survenue lors de l\'ajout du livre'
        });
    }
});

// Gestion des étudiants
router.get('/etudiants', async (req, res) => {
    try {
        const etudiants = await User.find({ role: 'etudiant' }).sort({ nom: 1 });
        res.render('admin/etudiants/index', { etudiants });
    } catch (error) {
        console.error('Erreur liste des étudiants:', error);
        res.render('error', { 
            message: 'Une erreur est survenue lors du chargement de la liste des étudiants' 
        });
    }
});

// Formulaire d'ajout d'étudiant
router.get('/etudiants/nouveau', (req, res) => {
    res.render('admin/etudiants/nouveau');
});

// Ajouter un étudiant
router.post('/etudiants', async (req, res) => {
    try {
        const { nom, prenom, email, username, password, classe } = req.body;

        // Vérifier si l'email ou le username existe déjà
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.render('admin/etudiants/nouveau', {
                error: 'Un utilisateur avec cet email ou ce nom d\'utilisateur existe déjà',
                formData: req.body
            });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer le nouvel étudiant
        const nouvelEtudiant = new User({
            nom,
            prenom,
            email,
            username,
            password: hashedPassword,
            classe,
            role: 'etudiant'
        });

        await nouvelEtudiant.save();
        res.redirect('/admin/etudiants');
    } catch (error) {
        console.error('Erreur création étudiant:', error);
        res.render('admin/etudiants/nouveau', {
            error: 'Une erreur est survenue lors de la création de l\'étudiant',
            formData: req.body
        });
    }
});

// Supprimer un étudiant
router.delete('/etudiants/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect('/admin/etudiants');
    } catch (error) {
        console.error('Erreur suppression étudiant:', error);
        res.render('error', { 
            message: 'Une erreur est survenue lors de la suppression de l\'étudiant' 
        });
    }
});

// Gestion des emprunts
router.get('/emprunts', async (req, res) => {
    try {
        const emprunts = await Emprunt.find()
            .populate('livre')
            .populate('etudiant')
            .sort({ dateEmprunt: -1 });
        res.render('admin/emprunts', { emprunts });
    } catch (error) {
        console.error('Erreur liste des emprunts:', error);
        res.render('error', { 
            message: 'Une erreur est survenue lors du chargement de la liste des emprunts' 
        });
    }
});

module.exports = router;