const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/.env.local" });

// Inscription (POST /api/auth/register)
router.post("/register", async (req, res) => {
  try {
    const { nom, email, password } = req.body;

    if (!nom || !email || !password) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: "Email déjà pris" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ nom, email, password: hashedPassword });
    await newUser.save();

    // --- AJOUT JWT ---

    // 1. On prépare les infos à mettre dans le badge (Payload)
    const payload = {
      user: {
        id: newUser.id,
        role: newUser.role, // Utile pour savoir si c'est un admin plus tard
      },
    };

    // 2. On signe le token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" }, // Le token expire dans 24h
      (err, token) => {
        if (err) throw err;

        // 3. On renvoie le token au Frontend
        res.status(201).json({
          msg: "Inscription réussie !",
          token: token, //  React va stocker le token
          user: {
            id: newUser._id,
            nom: newUser.nom,
            email: newUser.email,
            role: newUser.role,
          },
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connexion (POST /api/auth/login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Utilisateur inconnu" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Mot de passe incorrect" });

    // --- AJOUT JWT ---

    // 1. On prépare les infos à mettre dans le badge (Payload)
    const payload = {
      user: {
        id: user.id,
        role: user.role, // Utile pour savoir si c'est un admin plus tard
      },
    };

    // 2. On signe le token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" }, // Le token expire dans 24h
      (err, token) => {
        if (err) throw err;

        // 3. On renvoie le token au Frontend
        res.json({
          msg: "Connexion OK",
          token: token, //  React va stocker le token
          user: {
            id: user._id,
            nom: user.nom,
            email: user.email,
            role: user.role,
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Pas de token, accès refusé" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
