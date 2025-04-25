const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

// Connexion à MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/bibliotheque_db', {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(async () => {
    console.log('Connecté à MongoDB');
    
    try {
        // Vérifier si l'admin existe déjà
        const adminExists = await User.findOne({ email: 'admin@biblio.com' });
        
        if (!adminExists) {
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
        } else {
            console.log('Le compte administrateur existe déjà');
        }
    } catch (error) {
        console.error('Erreur lors de la création du compte admin:', error);
    }
    
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('Connexion MongoDB fermée');
    process.exit(0);
})
.catch(err => {
    console.error('Erreur de connexion à MongoDB:', err);
    process.exit(1);
}); 