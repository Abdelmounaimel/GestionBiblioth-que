const mongoose = require('mongoose');
const User = require('../models/userModel');

mongoose.connect('mongodb://127.0.0.1:27017/bibliotheque_db', {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(async () => {
    console.log('Connecté à MongoDB');
    
    try {
        const admin = await User.findOne({ username: 'admin' });
        if (admin) {
            console.log('Admin trouvé:');
            console.log('Username:', admin.username);
            console.log('Email:', admin.email);
            console.log('Role:', admin.role);
        } else {
            console.log('Admin non trouvé');
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
    
    await mongoose.connection.close();
    process.exit(0);
})
.catch(err => {
    console.error('Erreur de connexion à MongoDB:', err);
    process.exit(1);
}); 