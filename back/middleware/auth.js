<<<<<<< HEAD
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/.env" });

// Middleware: Vérifier que l'utilisateur est authentifié
const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Pas de token, accès refusé" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token invalide" });
  }
};

// Middleware: Vérifier que l'utilisateur est admin
const adminAuth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Pas de token, accès refusé" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.user.role !== "admin") {
      return res.status(403).json({ error: "Accès administrateur requis" });
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token invalide" });
  }
};

module.exports = { auth, adminAuth };
=======
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // --- BYPASS POUR LES TESTS ---
        // Si le bouchon de test (dans index.js) a déjà validé l'utilisateur,
        // on laisse passer sans vérifier le token.
        if (req.auth && req.auth.userId) {
            return next();
        }
        // -----------------------------

        // Vérifier si le header Authorization est présent
        if (!req.headers.authorization) {
            throw new Error('Token manquant !');
        }

        // 1. Récupérer le token
        const token = req.headers.authorization.split(' ')[1];
        
        // 2. Décoder le token
        const secret = process.env.JWT_SECRET || "RANDOM_TOKEN_SECRET"; 
        const decodedToken = jwt.verify(token, secret);
        
        // 3. Extraire l'ID utilisateur
        const userId = decodedToken.userId;
        
        // 4. Ajouter l'ID à la requête
        req.auth = {
            userId: userId
        };
        
        req.user = {
            id: userId
        };

        next();
    } catch (error) {
        res.status(401).json({ error: error.message || 'Requête non authentifiée !' });
    }
};
>>>>>>> 5a39512cfa48df7afeb2b40f8a95fa4eb9bf439d
