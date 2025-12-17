const mongoose = require('mongoose');
const app = require('../index'); 
const generateCrudTests = require('./utils/crudFactory');
const { Offer } = require('../models/offer'); 

// 1. On définit les payloads en dehors, vides ou partiels pour l'instant.
// L'important est que ce soient des objets (const) qu'on pourra modifier.
const validBookingPayload = {
    offerId: null, // Sera rempli dans le beforeAll
    startDate: "2024-01-01",
    endDate: "2024-01-05",
    quantity: 2
};

const updateBookingPayload = {
    quantity: 5,
    status: "cancelled"
};

let testOfferId;

describe('Tests de Booking', () => {

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.EXPRESS_URL);
        }

        // Création de l'offre pré-requise
        const offer = await Offer.create({
            type: "place",
            title: "Offre pour Test Réservation",
            description: "Offre temporaire",
            price: 100,
            ownerId: new mongoose.Types.ObjectId(),
            place: { address: "Test Zone", capacity: 2 }
        });
        
        testOfferId = offer._id;
        
        // ASTUCE : On met à jour la propriété de l'objet existant !
        // Comme 'generateCrudTests' a reçu la référence vers cet objet, 
        // il verra cette modification au moment de l'exécution du test.
        validBookingPayload.offerId = testOfferId;
    });

    afterAll(async () => {
        if (testOfferId) {
            await Offer.findByIdAndDelete(testOfferId);
        }
        await mongoose.connection.close();
    });

    // 2. On appelle la factory DIRECTEMENT ici (pas dans un 'it')
    // Elle va générer ses propres 'describe' et 'it'
    generateCrudTests(app, '/bookings', 'Booking', validBookingPayload, updateBookingPayload);
});