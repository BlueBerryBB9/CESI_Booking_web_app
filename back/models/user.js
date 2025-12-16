const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
    {
        nom: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},               // Note : Stockage mdp crypté
        role: {type: String, default: 'client'},                // Client ou Admin
        dateCreation: {type: Date, default: Date.now}
    }
);

module.exports = mongoose.model('User', UserSchema);