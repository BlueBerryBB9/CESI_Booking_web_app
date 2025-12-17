const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

require("dotenv").config({ path: ".env.local" });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// JWT Authentication Middleware
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.auth = decoded;
    } catch (err) {
      console.error("JWT verification failed:", err.message);
    }
  }
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
