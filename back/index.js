const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config({ path: ".env.local" });

const app = express();

// Middleware
// CORS : Indispensable quand le Frontend (React) et le Backend ne sont pas sur le même port.
// Sans ça, le navigateur bloque la connexion par sécurité.
app.use(cors());
// JSON Parser : Permet au serveur de comprendre les données envoyées par le Frontend.
// Sans ça, 'req.body' serait vide quand on reçoit un formulaire.
app.use(express.json());

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
const usersRoutes = require("./routes/users");
const offerRoutes = require("./routes/offer");
const bookingRoutes = require("./routes/booking");

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
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
