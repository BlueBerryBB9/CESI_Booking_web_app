const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const app = express();

// Middleware
// CORS : Indispensable quand le Frontend (React) et le Backend ne sont pas sur le même port.
// Sans ça, le navigateur bloque la connexion par sécurité.
app.use(cors());
// JSON Parser : Permet au serveur de comprendre les données envoyées par le Frontend.
// Sans ça, 'req.body' serait vide quand on reçoit un formulaire.
app.use(express.json());

// --- POUR TESTER ---
// Sans ça, la création d'offre plante car req.user n'existe pas.
// À SUPPRIMER plus tard quand le login Front sera fini.
app.use((req, res, next) => {
    req.user = {
        id: "694159a75f141ed09db037f3", 
        role: "admin"
    };
    next();
});

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.EXPRESS_URL);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

// Routes
const authRoutes = require("./routes/auth");
const offerRoutes = require("./routes/offer");
const bookingRoutes = require("./routes/booking");

app.use("/auth", authRoutes);
app.use("/offers", offerRoutes);
app.use("/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// Start server with async initialization
async function startServer() {
  await connectDB();
  // On ne lance le .listen que si ce n'est PAS un test
  if (require.main === module) {
      app.listen(8080, () => {
        console.log("Serveur lancé sur http://localhost:8080");
      });
  }
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

module.exports = app;