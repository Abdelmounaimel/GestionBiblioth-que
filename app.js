require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const ejsLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose'); // Ajout de l'import manquant
const connectDB = require('./models/db');

console.log('Démarrage de l\'application...');

const app = express();

// Configuration de la session
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'un_secret_temporaire',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 heures
    }
};

// En production, utilisez un cookie secure si HTTPS
if (app.get('env') === 'production') {
    app.set('trust proxy', 1);
    sessionConfig.cookie.secure = true;
}

app.use(session(sessionConfig));
console.log('Configuration de la session terminée');

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(methodOverride('_method'));

// Middleware pour rendre la session disponible dans tous les templates
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});
console.log('Configuration des middlewares terminée');

// Configuration EJS
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.set('layout', 'layouts/layout');
app.set('views', path.join(__dirname, 'views'));
console.log('Configuration EJS terminée');

// Routes
app.get('/', (req, res) => {
    if (req.session.userId) {
        if (req.session.role === 'admin') {
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/etudiant/dashboard');
        }
    } else {
        res.redirect('/login');
    }
});

// Routes d'authentification
app.use('/', require('./routes/auth'));

// Routes protégées pour l'admin
app.use('/admin', require('./middleware/auth').checkAuth, require('./middleware/auth').checkRole('admin'), require('./routes/admin'));

// Routes protégées pour l'étudiant
app.use('/etudiant', require('./middleware/auth').checkAuth, require('./middleware/auth').checkRole('etudiant'), require('./routes/etudiant'));

// Routes publiques pour les livres
app.use('/livres', require('./routes/livres'));

// Routes protégées pour les emprunts
app.use('/emprunts', require('./middleware/auth').checkAuth, require('./routes/emprunts'));

console.log('Configuration des routes terminée');

// Connexion MongoDB et démarrage du serveur
console.log('Tentative de connexion à MongoDB...');
connectDB()
    .then(() => {
        // Gestion des erreurs 404
        app.use((req, res) => {
            console.log('404 - Route non trouvée:', req.url);
            res.status(404).render('error', { 
                message: 'Page non trouvée',
                session: req.session
            });
        });

        // Gestion des erreurs 500
        app.use((err, req, res, next) => {
            console.error('Erreur serveur:', err);
            res.status(500).render('error', { 
                message: 'Une erreur est survenue',
                session: req.session
            });
        });

        const PORT = process.env.PORT || 8080; // Changé à 8080 comme port par défaut pour Azure
        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Erreur de connexion à MongoDB:', err);
        // Ne pas quitter le processus en production
        if (process.env.NODE_ENV === 'production') {
            console.error('Application continuée malgré l\'erreur de connexion à MongoDB');
        } else {
            process.exit(1);
        }
    });