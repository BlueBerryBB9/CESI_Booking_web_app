const mongoose = require("mongoose");
const { Schema } = mongoose;

const BookingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    offerId: {
      type: Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    startDate: Date,
    endDate: Date,

    quantity: { type: Number, default: 1 },
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports.Booking = mongoose.model("Booking", BookingSchema);
