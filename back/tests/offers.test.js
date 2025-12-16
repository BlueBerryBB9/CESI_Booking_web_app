const app = require('../app');
const generateCrudTests = require('./utils/crudFactory');

// Données de test pour les Offres
const offerData = { title: "Offre Test", price: 100, description: "Description" };
const offerUpdate = { title: "Offre Mise à jour" };

// On lance la machine
generateCrudTests(app, '/offers', 'Offer', offerData, offerUpdate);