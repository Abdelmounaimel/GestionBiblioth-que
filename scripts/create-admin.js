const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

async function createAdmin() {
    try {
        // Connexion à MongoDB
        await mongoose.connect('mongodb://127.0.0.1:27017/bibliotheque_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connecté à MongoDB');

        // Vérifier si l'admin existe déjà
        const adminExists = await User.findOne({ email: 'admin@biblio.com' });
        
        if (adminExists) {
            console.log('Le compte administrateur existe déjà');
            console.log('Email: admin@biblio.com');
            console.log('Mot de passe: admin123');
        } else {
            // Créer l'administrateur
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const admin = new User({
                nom: 'Administrateur',
                email: 'admin@biblio.com',
                password: hashedPassword,
                role: 'admin',
                classe: 'Administration'
            });
            
            await admin.save();
            console.log('Compte administrateur créé avec succès');
            console.log('Email: admin@biblio.com');
            console.log('Mot de passe: admin123');
        }
    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        // Fermer la connexion
        await mongoose.connection.close();
        console.log('Connexion MongoDB fermée');
    }
}

// Exécuter la fonction
createAdmin(); 