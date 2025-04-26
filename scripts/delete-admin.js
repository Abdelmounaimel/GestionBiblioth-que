const mongoose = require('mongoose');
const User = require('../models/userModel');

mongoose.connect('mongodb://127.0.0.1:27017/bibliotheque_db', {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(async () => {
    console.log('Connecté à MongoDB');
    
    try {
        // Supprimer l'utilisateur admin
        await User.deleteOne({ email: 'admin@biblio.com' });
        console.log('Ancien compte administrateur supprimé avec succès');
    } catch (error) {
        console.error('Erreur lors de la suppression du compte admin:', error);
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