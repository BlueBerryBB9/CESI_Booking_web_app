const express = require("express");
const router = express.Router();

// Import du modèle Booking
const { Booking } = require("../models/booking");
// Import du modèle Offer pour vérifier le prix
const { Offer } = require("../models/offer");

// 1. GET /api/bookings (Récupérer toutes les réservations)
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "nom email")
      .populate("offerId")
      .sort({ createdAt: -1 });
    res.status(200).json({
      status: 200,
      message: "Liste des réservations",
      data: bookings,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Erreur serveur",
      error: err.message,
    });
  }
});

// 2. GET /api/bookings/:id (Détail d'une réservation)
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("userId", "nom email")
      .populate("offerId");
    if (!booking) {
      return res.status(404).json({
        status: 404,
        message: "Réservation introuvable",
      });
    }
    res.status(200).json({
      status: 200,
      message: "Réservation trouvée",
      data: booking,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Erreur serveur",
      error: err.message,
    });
  }
});

// 3. GET /api/bookings/user/:uid (Historique d'un utilisateur)
router.get("/user/:uid", async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.uid })
      .populate("offerId")
      .sort({ createdAt: -1 });
    res.status(200).json({
      status: 200,
      message: "Historique des réservations",
      data: bookings,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Erreur serveur",
      error: err.message,
    });
  }
});

// 4. POST /api/bookings (Créer une réservation)
router.post("/", async (req, res) => {
  try {
    const { userId, offerId, quantity = 1, startDate, endDate } = req.body;

    // A. Vérifier si l'offre existe
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({
        status: 404,
        message: "Offre introuvable",
      });
    }

    // B. Calculer le prix total
    let calculatedPrice = offer.price * quantity;

    // Si dates présentes, multiplier par le nombre de nuits
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = (end - start) / (1000 * 60 * 60 * 24);
      if (days > 0) {
        calculatedPrice = calculatedPrice * days;
      }
    }

    // C. Création
    const newBooking = new Booking({
      userId,
      offerId,
      startDate,
      endDate,
      quantity,
      totalPrice: calculatedPrice,
      status: "confirmed",
    });

    await newBooking.save();
    res.status(201).json({
      status: 201,
      message: "Réservation réussie",
      data: newBooking,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Erreur serveur",
      error: err.message,
    });
  }
});

// 5. PUT /api/bookings/:id (Mise à jour d'une réservation)
router.put("/:id", async (req, res) => {
  try {
    const { status, quantity, startDate, endDate } = req.body;

    // Récupérer la réservation existante
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        status: 404,
        message: "Réservation introuvable",
      });
    }

    // Recalculer le prix si quantité ou dates changent
    if (quantity || startDate || endDate) {
      const offer = await Offer.findById(booking.offerId);
      let calculatedPrice = (quantity || booking.quantity) * offer.price;

      if (startDate || endDate) {
        const start = new Date(startDate || booking.startDate);
        const end = new Date(endDate || booking.endDate);
        const days = (end - start) / (1000 * 60 * 60 * 24);
        if (days > 0) {
          calculatedPrice = calculatedPrice * days;
        }
      }

      booking.totalPrice = calculatedPrice;
    }

    // Mettre à jour les champs
    if (status) booking.status = status;
    if (quantity) booking.quantity = quantity;
    if (startDate) booking.startDate = startDate;
    if (endDate) booking.endDate = endDate;

    await booking.save();
    const updated = await booking.populate("offerId");

    res.status(200).json({
      status: 200,
      message: "Réservation mise à jour",
      data: updated,
    });
  } catch (err) {
    res.status(400).json({
      status: 400,
      message: "Erreur lors de la mise à jour",
      error: err.message,
    });
  }
});

// 6. DELETE /api/bookings/:id (Suppression d'une réservation)
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({
        status: 404,
        message: "Réservation introuvable",
      });
    }
    res.status(200).json({
      status: 200,
      message: "Réservation supprimée",
      data: booking,
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
