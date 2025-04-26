// Ajoutez l'import du modèle User
const User = require('../models/userModel');

// Middleware pour vérifier si l'utilisateur est connecté
const checkAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

// Middleware pour vérifier si l'utilisateur a le bon rôle
const checkRole = (role) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.session.userId);
            if (!user || user.role !== role) {
                return res.status(403).render('error', { 
                    message: 'Accès non autorisé' 
                });
            }
            next();
        } catch (error) {
            console.error('Erreur de vérification du rôle:', error);
            res.status(500).render('error', { 
                message: 'Une erreur est survenue lors de la vérification des autorisations' 
            });
        }
    };
};

module.exports = { checkAuth, checkRole };