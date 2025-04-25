const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = 'mongodb://127.0.0.1:27017';
    const dbName = 'bibliotheque_db';
    
    try {
        await mongoose.connect(`${uri}/${dbName}`);
        console.log('Connecté à MongoDB avec succès');
    } catch (error) {
        console.error('Erreur de connexion MongoDB:', error);
        console.error('Assurez-vous que MongoDB est en cours d\'exécution');
        process.exit(1);
    }
};

module.exports = connectDB;