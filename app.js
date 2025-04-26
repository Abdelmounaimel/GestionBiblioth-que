require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const ejsLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const connectDB = require('./models/db');

console.log('Démarrage de l\'application...');

const uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware d'authentification
const { checkAuth, checkRole } = require('./middleware/auth');

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
app.use('/admin', checkAuth, checkRole('admin'), require('./routes/admin'));

// Routes protégées pour l'étudiant
app.use('/etudiant', checkAuth, checkRole('etudiant'), require('./routes/etudiant'));

// Routes publiques pour les livres
app.use('/livres', require('./routes/livres'));

// Routes protégées pour les emprunts
app.use('/emprunts', checkAuth, require('./routes/emprunts'));

// Middleware pour gérer les erreurs 404
app.use((req, res) => {
    console.log('404 - Route non trouvée:', req.url);
    console.log('Session:', req.session);
    res.status(404).render('error', { 
        message: 'Page non trouvée',
        session: req.session
    });
});

console.log('Configuration des routes terminée');

// Connexion MongoDB et démarrage du serveur
console.log('Tentative de connexion à MongoDB...');
connectDB()
    .then(() => {
        // Gestion des erreurs 404
        app.use((req, res) => {
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

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Erreur de connexion à MongoDB:', err);
        process.exit(1);
    });