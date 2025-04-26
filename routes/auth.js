const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

// Page de connexion
router.get('/login', (req, res) => {
    res.render('auth/login', { error: null });
});

// Traitement de la connexion
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Recherche de l'utilisateur par username
        const user = await User.findOne({ 
            $or: [
                { username: username },
                { email: username }
            ]
        });

        if (!user) {
            return res.render('auth/login', { 
                error: 'Nom d\'utilisateur ou mot de passe incorrect' 
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.render('auth/login', { 
                error: 'Nom d\'utilisateur ou mot de passe incorrect' 
            });
        }

        req.session.userId = user._id;
        req.session.role = user.role;

        if (user.role === 'admin') {
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/etudiant/dashboard');
        }
    } catch (error) {
        console.error(error);
        res.render('auth/login', { 
            error: 'Une erreur est survenue' 
        });
    }
});

// Page d'inscription
router.get('/register', (req, res) => {
    res.render('auth/register', { error: null });
});

// Traitement de l'inscription
router.post('/register', async (req, res) => {
    try {
        const { nom, email, password, classe } = req.body;
        
        // Vérifier si l'email existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('auth/register', { 
                error: 'Cet email est déjà utilisé' 
            });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer un nouvel utilisateur
        const user = new User({
            nom,
            email,
            password: hashedPassword,
            classe,
            role: 'etudiant'
        });

        await user.save();
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.render('auth/register', { 
            error: 'Une erreur est survenue lors de l\'inscription' 
        });
    }
});

// Déconnexion
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;