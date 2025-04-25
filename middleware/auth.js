// Import du modèle User
const User = require('../models/userModel');

// Middleware pour vérifier si l'utilisateur est connecté
const checkAuth = (req, res, next) => {
    console.log('Session:', req.session);
    if (!req.session.userId) {
        console.log('Pas d\'utilisateur connecté, redirection vers login');
        return res.redirect('/login');
    }
    console.log('Utilisateur authentifié, userId:', req.session.userId);
    next();
};

// Middleware pour vérifier le rôle de l'utilisateur
const checkRole = (role) => {
    return async (req, res, next) => {
        try {
            console.log('Vérification du rôle:', role);
            console.log('Session userId:', req.session.userId);
            const user = await User.findById(req.session.userId);
            console.log('Utilisateur trouvé:', user ? user.role : 'non trouvé');
            
            if (!user || user.role !== role) {
                console.log('Accès refusé - Role requis:', role, 'Role utilisateur:', user ? user.role : 'aucun');
                return res.status(403).render('error', {
                    message: 'Accès non autorisé',
                    session: req.session
                });
            }
            console.log('Accès autorisé pour le rôle:', role);
            next();
        } catch (error) {
            console.error('Erreur de vérification du rôle:', error);
            return res.status(500).render('error', {
                message: 'Une erreur est survenue lors de la vérification des autorisations',
                session: req.session
            });
        }
    };
};

module.exports = { checkAuth, checkRole };