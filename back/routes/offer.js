const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const { Offer } = require("../models/offer");

// 1. GET /api/offers (Récupérer tout + Filtres)
// Cette route reste publique (pas de 'auth') pour que tout le monde puisse voir les offres
router.get("/", async (req, res) => {
  try {
    const filter = {};

    // Filtre par ville (ex: ?city=Paris)
    if (req.query.city) {
      filter["location.city"] = new RegExp(req.query.city, "i");
    }
    // Filtre par type (ex: ?type=Place)
    if (req.query.type) {
      filter.type = req.query.type;
    }

    // .populate('ownerId') permet d'afficher le nom du créateur de l'offre
    const offers = await Offer.find(filter).populate("ownerId", "nom email");

    res.status(200).json({
      status: 200,
      message: "Liste des offres",
      data: offers,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Erreur serveur",
      error: err.message,
    });
  }
});

// 2. GET /api/offers/:id (Détail d'une offre)
// Publique aussi
router.get("/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "ownerId",
      "nom email"
    );
    if (!offer) {
      return res.status(404).json({
        status: 404,
        message: "Offre introuvable",
      });
    }
    res.status(200).json({
      status: 200,
      message: "Offre trouvée",
      data: offer,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Erreur serveur",
      error: err.message,
    });
  }
});

// 3. POST /api/offers (Création)
// PROTEGE : On ajoute 'auth' avant la fonction async
router.post("/", auth, async (req, res) => {
  try {
    // On supprime l'ID si jamais il est envoyé dans le body
    delete req.body._id;
    // On force le propriétaire de l'offre à être celui identifié par le Token
    req.body.ownerId = req.auth.userId;

    const newOffer = await Offer.create(req.body);
    res.status(201).json({
      status: 201,
      message: "Offre créée avec succès",
      data: newOffer,
    });
  } catch (err) {
    res.status(400).json({
      status: 400,
      message: "Erreur lors de la création",
      error: err.message,
    });
  }
});

// 4. PUT /api/offers/:id (Mise à jour)
// PROTEGE : Seul un utilisateur connecté peut modifier
router.put("/:id", auth, async (req, res) => {
  try {
    // --- CORRECTIF SÉCURITÉ ---
    // On empêche toute modification de l'ID, même si l'utilisateur l'envoie.
    // Cela évite que Mongoose ne plante avec une erreur 400.
    delete req.body._id; 
    // On force l'ownerId à rester celui du token (pour éviter le vol d'offre)
    req.body.ownerId = req.auth.userId; 
    // --------------------------

    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("ownerId", "nom email");

    if (!offer) {
      return res.status(404).json({
        status: 404,
        message: "Offre introuvable",
      });
    }
    res.status(200).json({
      status: 200,
      message: "Offre mise à jour",
      data: offer,
    });
  } catch (err) {
    res.status(400).json({
      status: 400,
      message: "Erreur lors de la mise à jour",
      error: err.message,
    });
  }
});

// 5. DELETE /api/offers/:id (Suppression)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res.status(404).json({
        status: 404,
        message: "Offre introuvable",
      });
    }
    res.status(200).json({
      status: 200,
      message: "Offre supprimée",
      data: offer,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Erreur serveur",
      error: err.message,
    });
  }
});

module.exports = router;