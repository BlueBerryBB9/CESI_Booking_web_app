const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); 
const User = require("../models/User");

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
        id: user.id,
        role: user.role // Utile pour savoir si c'est un admin plus tard
      }
    };

    // 2. On signe le token
    jwt.sign(
      payload,
      "secret_jwt_temporaire", 
      { expiresIn: '24h' }, // Le token expire dans 24h
      (err, token) => {
        if (err) throw err;
        
        // 3. On renvoie le token au Frontend
        res.status(201).json({
          msg: "Inscription réussie !",
          token: token, //  React va stocker le token
          user: { id: newUser._id },
        });
      }
    );

    res.status(201).json({ msg: "Inscription réussie !", userId: newUser._id });
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
        role: user.role // Utile pour savoir si c'est un admin plus tard
      }
    };

    // 2. On signe le token
    jwt.sign(
      payload,
      "secret_jwt_temporaire", 
      { expiresIn: '24h' }, // Le token expire dans 24h
      (err, token) => {
        if (err) throw err;
        
        // 3. On renvoie le token au Frontend
        res.json({
          msg: "Connexion OK",
          token: token, //  React va stocker le token
          user: { id: user._id },
        });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;