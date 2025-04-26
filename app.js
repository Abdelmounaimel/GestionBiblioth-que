require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const ejsLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');

// Middleware d'authentification
const { checkAuth, checkRole } = require('./middleware/auth');

const app = express();

// Configuration de la session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(methodOverride('_method'));

// Configuration EJS
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.set('layout', 'layouts/layout');

// Middleware pour rendre la session disponible dans toutes les vues
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Routes d'authentification
app.use('/', require('./routes/auth'));

// Routes protégées pour l'admin
app.use('/admin', checkAuth, checkRole('admin'), require('./routes/admin'));

// Routes protégées pour l'étudiant
app.use('/etudiant', checkAuth, checkRole('etudiant'), require('./routes/etudiant'));

// Routes publiques pour les livres
app.use('/livres', require('./routes/livres'));

// Routes protégées pour les emprunts
app.use('/emprunts', checkAuth, require('./routes/emprunts'));

// Connexion MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/bibliotheque_db', {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => console.log('Connecté à MongoDB - Base de données: bibliotheque_db'))
.catch(err => {
    console.error('Erreur de connexion à MongoDB:', err);
    process.exit(1);
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).render('error', { 
        message: 'Page non trouvée' 
    });
});

// Gestion des erreurs 500
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        message: 'Une erreur est survenue' 
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Le port ${PORT} est déjà utilisé. Tentative avec le port ${PORT + 1}...`);
        const newPort = PORT + 1;
        app.listen(newPort, () => {
            console.log(`Serveur démarré sur le port ${newPort}`);
        }).on('error', (err) => {
            console.error('Erreur du serveur:', err);
            process.exit(1);
        });
    } else {
        console.error('Erreur du serveur:', err);
        process.exit(1);
    }
});