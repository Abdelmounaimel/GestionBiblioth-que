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
        const { nom, prenom, username, email, classe, password, confirmPassword } = req.body;

        // Vérifier si les mots de passe correspondent
        if (password !== confirmPassword) {
            return res.render('auth/register', { 
                error: 'Les mots de passe ne correspondent pas',
                nom,
                prenom,
                username,
                email,
                classe
            });
        }

        // Vérifier si l'email existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('auth/register', { 
                error: 'Cet email est déjà utilisé',
                nom,
                prenom,
                username,
                email,
                classe
            });
        }

        // Vérifier si le nom d'utilisateur existe déjà
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.render('auth/register', { 
                error: 'Ce nom d\'utilisateur est déjà utilisé',
                nom,
                prenom,
                username,
                email,
                classe
            });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer un nouvel utilisateur
        const newUser = new User({
            nom,
            prenom,
            username,
            email,
            classe,
            password: hashedPassword,
            role: 'etudiant'
        });

        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.render('auth/register', { 
            error: 'Une erreur est survenue lors de l\'inscription',
            nom: req.body.nom,
            prenom: req.body.prenom,
            username: req.body.username,
            email: req.body.email,
            classe: req.body.classe
        });
    }
});

// Déconnexion
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;