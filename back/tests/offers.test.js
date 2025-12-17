const app = require('../index'); // Pointe vers index.js
const generateCrudTests = require('./utils/crudFactory');
const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// 1. Payload de Création (Doit respecter le Schema Mongoose)
const validOfferPayload = {
    type: "place",
    title: "Super Villa de Test",
    description: "Une villa incroyable pour les tests",
    price: 150,
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
    let authToken;

    beforeAll(async () => {
        // Clean test user
        await User.deleteMany({ email: 'offerstest@example.com' });
        
        // Create a test admin user
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await User.create({
            nom: 'Admin User',
            email: 'offerstest@example.com',
            password: hashedPassword,
            role: 'admin'
        });

        // Login to get token
        const loginRes = await request(app)
            .post('/auth/login')
            .send({ email: 'offerstest@example.com', password: 'password123' });
        authToken = loginRes.body.token;
    });

    // CORRECTION : J'ai ajouté le paramètre authToken
    generateCrudTests(app, '/offers', 'Offer', validOfferPayload, updateOfferPayload, () => authToken);
});