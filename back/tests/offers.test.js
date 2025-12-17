const app = require('../index'); // Pointe vers index.js
const generateCrudTests = require('./utils/crudFactory');
const mongoose = require('mongoose');

// On génère un faux ID car le modèle exige un "ownerId" valide
const fakeOwnerId = new mongoose.Types.ObjectId();

// 1. Payload de Création (Doit respecter le Schema Mongoose)
const validOfferPayload = {
    type: "place",
    title: "Super Villa de Test",
    description: "Une villa incroyable pour les tests",
    price: 150,
    ownerId: fakeOwnerId, // Indispensable !
    place: {
        address: "10 rue des Tests, Paris",
        capacity: 5
    },
    // On met une location globale aussi car ça peut être utile
    location: {
        city: "Paris",
        country: "France"
    }
};

// 2. Payload de Modification
const updateOfferPayload = {
    title: "Super Villa Modifiée",
    price: 200
};

// 3. Lancement des tests
describe('CRUD Automatisé pour: Offer', () => {
    // CORRECTION : J'ai ajouté le paramètre 'Offer' en 3ème position
    generateCrudTests(app, '/offers', 'Offer', validOfferPayload, updateOfferPayload);
});