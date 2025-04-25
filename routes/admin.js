const express = require('express');
const router = express.Router();
const Livre = require('../models/livreModel');

// Dashboard Admin
router.get('/dashboard', async (req, res) => {
    const livresCount = await Livre.countDocuments();
    const empruntsCount = await Emprunt.countDocuments();
    const etudiantsCount = await User.countDocuments({ role: 'etudiant' });
    
    res.render('admin/dashboard', { 
        livresCount, 
        empruntsCount, 
        etudiantsCount 
    });
});

// Gestion des livres
router.get('/livres', async (req, res) => {
    const livres = await Livre.find();
    res.render('admin/livres', { livres });
});

// Ajouter livre
router.get('/livres/add', (req, res) => {
    res.render('admin/add-livre');
});

router.post('/livres', async (req, res) => {
    try {
        const newLivre = new Livre(req.body);
        await newLivre.save();
        res.redirect('/admin/livres');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/livres/add');
    }
});

module.exports = router;