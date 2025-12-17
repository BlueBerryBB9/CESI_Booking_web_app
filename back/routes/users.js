const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const User = require("../models/user");

// 1. GET /api/users (Get all users - Admin only)
router.get("/", adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ dateCreation: -1 });
    res.status(200).json({
      status: 200,
      message: "Liste des utilisateurs",
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Erreur serveur",
      error: err.message,
    });
  }
});

// 2. GET /api/users/:id (Get a specific user)
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "Utilisateur introuvable",
      });
    }
    res.status(200).json({
      status: 200,
      message: "Utilisateur trouvé",
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Erreur serveur",
      error: err.message,
    });
  }
});

// 3. PUT /api/users/:id (Update a user)
router.put("/:id", auth, async (req, res) => {
  try {
    // Empêcher la modification de l'email et du password via cette route
    delete req.body.email;
    delete req.body.password;
    delete req.body._id;

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "Utilisateur introuvable",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Utilisateur mis à jour",
      data: user,
    });
  } catch (err) {
    res.status(400).json({
      status: 400,
      message: "Erreur lors de la mise à jour",
      error: err.message,
    });
  }
});

// 4. DELETE /api/users/:id (Delete a user - Admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "Utilisateur introuvable",
      });
    }
    res.status(200).json({
      status: 200,
      message: "Utilisateur supprimé",
      data: user,
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
