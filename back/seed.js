// Script qui permet de remplir la base de donnée vide avec de fausse donnée

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

require("dotenv").config();

// 1. IMPORT DES MODÈLES
const User = require('./models/User'); 
const { Offer } = require('./models/Offer');
const { Booking } = require('./models/Booking');

// Récupération de l'URL (depuis .env ou en dur pour le test)
const uri = process.env.EXPRESS_URL;

const seedDB = async () => {
    try {
        await mongoose.connect(uri);
        console.log("Connexion Atlas OK...");

        // 2. NETTOYAGE (On vide tout)
        await User.deleteMany({});
        await Offer.deleteMany({});
        await Booking.deleteMany({});
        console.log("Base de données nettoyée.");

        // 3. CRÉATION USERS
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash("123456", salt);

        // On stocke les users créés dans une variable pour récupérer leur ID après
        const createdUsers = await User.insertMany([
            { nom: "Admin", email: "admin@test.com", password: hash, role: "admin" },
            { nom: "Client", email: "client@test.com", password: hash, role: "client" }
        ]);
        
        // On récupère l'ID de l'admin pour le mettre en "proprio" des offres
        const adminId = createdUsers[0]._id;
        const clientId = createdUsers[1]._id; // Le client fait les réservations
        
        console.log("Utilisateurs créés");

        // 4. CRÉATION DES OFFRES (Tout dans le modèle Offer)
        
        const offersData = [
            // --- Hôtels (Type: place) ---
            {
                type: "place",
                title: "Hôtel Negresco",
                description: "Luxe à Nice face à la mer",
                price: 300,
                ownerId: clientId, // Requis par ton schéma
                location: { city: "Nice", country: "France" },
                // Requis car type = place
                place: { 
                    address: "37 Promenade des Anglais", 
                    capacity: 2 
                }
            },
            {
                type: "place",
                title: "Camping des Flots",
                description: "Camping convivial et pas cher",
                price: 40,
                ownerId: clientId,
                location: { city: "Arcachon", country: "France" },
                place: { 
                    address: "Route des plages", 
                    capacity: 4 
                }
            },

            // --- Transports (Type: transportation) ---
            {
                type: "transportation", // Attention à l'orthographe (enum du schéma)
                title: "Vol Paris-NY",
                description: "Vol direct sans escale",
                price: 500,
                ownerId: clientId,
                location: { city: "New York", country: "USA" },
                // Requis car type = transportation
                transportation: { 
                    departure: "CDG - Paris", 
                    arrival: "JFK - New York", 
                    duration: 8 
                }
            },

            // --- Activités (Type: activity) ---
            {
                type: "activity",
                title: "Plongée sous-marine",
                description: "Nage avec les tortues",
                price: 50,
                ownerId: clientId,
                location: { city: "Basse-Terre", country: "Guadeloupe" },
                // Requis car type = activity
                activity: { 
                    schedule: new Date("2023-12-01T10:00:00"), 
                    difficulty: "medium" 
                }
            }
        ];


        const createdOffers = await Offer.insertMany(offersData);

        console.log("Offres créées avec succès !");

        // 5. CRÉATION DES RÉSERVATIONS
        // On crée des réservations pour le "Client" sur les offres qu'on vient de créer
        
        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

        await Booking.insertMany([
            {
                userId: clientId,
                offerId: createdOffers[0]._id, // Réserve le Negresco (Index 0)
                startDate: tomorrow,
                endDate: nextWeek,
                quantity: 1,
                totalPrice: createdOffers[0].price * 6, // 6 nuits (exemple simple)
                status: "confirmed"
            },
            {
                userId: clientId,
                offerId: createdOffers[2]._id, // Réserve le Vol (Index 2)
                startDate: nextWeek,
                endDate: nextWeek, // Vol aller simple même jour
                quantity: 2, // 2 billets
                totalPrice: createdOffers[2].price * 2,
                status: "pending"
            }
        ]);

        console.log("Réservations créées avec succès !");

        console.log("SEED TERMINÉ !");
        
        // J'ai retiré le mongoose.connection.close() ici car il est géré dans le finally

    } catch (err) {
        console.error("Erreur seed:", err);
        // Affiche le message d'erreur de validation précis si ça plante
        if (err.errors) {
            Object.keys(err.errors).forEach(key => {
                console.error(`Erreur sur ${key}: ${err.errors[key].message}`);
            });
        }
    } finally {
        // Cette partie s'exécute toujours, même en cas d'erreur
        await mongoose.connection.close();
        console.log("Connexion fermée.");
        process.exit(0);
    }
};

seedDB();