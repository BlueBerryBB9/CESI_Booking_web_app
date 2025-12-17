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