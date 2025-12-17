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
