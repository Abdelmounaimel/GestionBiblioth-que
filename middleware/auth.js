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
    return (req, res, next) => {
        if (req.session.role !== role) {
            return res.status(403).render('error', { 
                message: 'Accès non autorisé' 
            });
        }
        next();
    };
};

module.exports = { checkAuth, checkRole };

module.exports = {
    checkAuth: (req, res, next) => {
        if (!req.session.userId) {
            return res.redirect('/login');
        }
        next();
    },

    checkRole: (role) => {
        return async (req, res, next) => {
            const user = await User.findById(req.session.userId);
            if (!user || user.role !== role) {
                return res.status(403).send('Accès interdit');
            }
            next();
        };
    }
};