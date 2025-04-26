const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bibliotheque_db';
    
    try {
        // Options spécifiques pour Azure Cosmos DB
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: false, // Important pour Cosmos DB
            maxIdleTimeMS: 120000
        };
        
        await mongoose.connect(uri, options);
        console.log('Connecté à MongoDB/Cosmos DB avec succès');
    } catch (error) {
        console.error('Erreur de connexion MongoDB/Cosmos DB:', error);
        throw error; // Propager l'erreur pour la gestion dans app.js
    }
};

module.exports = connectDB;