const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require("dotenv").config({ path: ".env.local" });

const User = require('./models/user'); 
const { Offer } = require('./models/offer');
const { Booking } = require('./models/booking');

const uri = process.env.EXPRESS_URL;

// --- LES LISTES DE NOMS ---
const lotr = ["Frodon Sacquet", "Gandalf le Gris", "Aragorn", "Legolas", "Gimli", "Gollum", "Sauron", "Bilbon Sacquet"];
const starWars = ["Luke Skywalker", "Darth Vader", "Leia Organa", "Han Solo", "Yoda", "Obi-Wan Kenobi", "Chewbacca", "Kylo Ren"];
const harryPotter = ["Harry Potter", "Hermione Granger", "Ron Weasley", "Albus Dumbledore", "Severus Rogue", "Voldemort", "Hagrid"];
const marvel = ["Tony Stark", "Steve Rogers", "Peter Parker", "Thor Odinson", "Natasha Romanoff"];

// On mélange tout ce beau monde
const allCharacters = [...lotr, ...starWars, ...harryPotter, ...marvel];

// FONCTIONS UTILES
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const cities = [
    { city: "La Comté", country: "Terre du Milieu" },
    { city: "Tatooine", country: "Galaxie Lointaine" },
    { city: "Poudlard", country: "Écosse" },
    { city: "Paris", country: "France" },
    { city: "New York", country: "USA" },
    { city: "Mordor", country: "Terre du Milieu" },
    { city: "Coruscant", country: "Galaxie" }
];

const seedDB = async () => {
    try {
        await mongoose.connect(uri);
        console.log(" Connexion Atlas OK...");

        // 1. NETTOYAGE
        await User.deleteMany({});
        await Offer.deleteMany({});
        await Booking.deleteMany({});
        console.log(" Nettoyage terminé.");

        // 2. CRÉATION DES USERS (Vrais logins + Personnages)
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash("123456", salt);

        // A. Les comptes pour se connecter facilement
        const baseUsers = [
            { nom: "Admin System", email: "admin@test.com", password: hash, role: "admin" },
            { nom: "Martin (Client)", email: "client1@test.com", password: hash, role: "client" },
            { nom: "Aurélie (Client)", email: "client2@test.com", password: hash, role: "client" },
            { nom: "Anne Marie (Client)", email: "client3@test.com", password: hash, role: "client" },
            { nom: "Gilli (Client)", email: "client4@test.com", password: hash, role: "client" },
            { nom: "Anthony (Client)", email: "client5@test.com", password: hash, role: "client" }
        ];

        // B. Les personnages célèbres
        const characterUsers = allCharacters.map(name => {
            // Génère un email : "Frodon Sacquet" -> "frodon.sacquet@fantasy.com"
            const email = name.toLowerCase().replace(/ /g, '.') + "@fantasy.com";
            // Randomise un peu les rôles (certains deviennent proprios/admins)
            const role = Math.random() > 0.7 ? "admin" : "client"; 
            
            return {
                nom: name,
                email: email,
                password: hash, // Tout le monde a le mdp "123456"
                role: role
            };
        });

        // On insère tout le monde
        const allUsersCreated = await User.insertMany([...baseUsers, ...characterUsers]);
        console.log(` ${allUsersCreated.length} Utilisateurs créés (dont ${characterUsers.length} personnages).`);

        // On récupère l'ID de notre client principal pour les tests
        const mainClientId = allUsersCreated[1]._id; 

        // 3. CRÉATION DES OFFRES
        let offersData = [];

        // J'ai mis 150 offres pour avoir du choix !
        for (let i = 0; i < 150; i++) {
            const randomOwner = getRandomElement(allUsersCreated);
            const randomType = getRandomElement(["place", "transportation", "activity"]);
            const randomLoc = getRandomElement(cities);
            
            let newOffer = {
                type: randomType,
                price: getRandomInt(50, 2000),
                ownerId: randomOwner._id, // L'offre appartient à un personnage
                location: randomLoc
            };

            // Titres personnalisés selon le propriétaire
            const prefix = ["Maison de", "Vaisseau de", "Aventure avec", "Secret de", "Chez"];
            const titrage = `${getRandomElement(prefix)} ${randomOwner.nom}`;

            if (randomType === "place") {
                newOffer.title = `Logement : ${titrage}`;
                newOffer.description = `Venez dormir chez ${randomOwner.nom}. Ambiance garantie.`;
                newOffer.place = { address: "Rue de la Fantaisie", capacity: getRandomInt(2, 10) };
            } 
            else if (randomType === "transportation") {
                newOffer.title = `Voyage express avec ${randomOwner.nom}`;
                newOffer.description = "Beaucoup plus rapide que la lumière (ou pas).";
                newOffer.transportation = { departure: "Ici", arrival: "Là-bas", duration: getRandomInt(2, 24) };
            } 
            else {
                newOffer.title = `Activité : ${titrage}`;
                newOffer.description = `Une expérience inoubliable organisée par ${randomOwner.nom}.`;
                newOffer.activity = { schedule: new Date(), difficulty: getRandomElement(["easy", "medium", "hard"]) };
            }

            offersData.push(newOffer);
        }

        const createdOffers = await Offer.insertMany(offersData);
        console.log(` ${createdOffers.length} Offres générées.`);

        // 4. CRÉATION DES RÉSERVATIONS
        // Faisons en sorte que Gandalf réserve chez Dark Vador, etc.
        const bookingsData = [];

        for (let i = 0; i < 100; i++) {
            const booker = getRandomElement(allUsersCreated);
            const offer = getRandomElement(createdOffers);
            
            // Évitons qu'un perso réserve sa propre offre
            if (String(booker._id) === String(offer.ownerId)) continue;

            bookingsData.push({
                userId: booker._id,
                offerId: offer._id,
                startDate: new Date(),
                endDate: new Date(),
                quantity: 1,
                totalPrice: offer.price,
                status: getRandomElement(["pending", "confirmed", "cancelled"])
            });
        }

        // Ajoutons quelques réservations manuelles pour TON compte client pour que tu aies des données à voir
        const myBookings = [
            { userId: mainClientId, offerId: createdOffers[0]._id, status: "confirmed", totalPrice: 100, quantity: 1, startDate: new Date(), endDate: new Date() },
            { userId: mainClientId, offerId: createdOffers[1]._id, status: "pending", totalPrice: 500, quantity: 2, startDate: new Date(), endDate: new Date() }
        ];

        await Booking.insertMany([...bookingsData, ...myBookings]);
        console.log(`Réservations créées (Mélange de pop culture).`);

        console.log(" SEED FUN TERMINÉ !");

    } catch (err) {
        console.error(" Erreur seed:", err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

seedDB();