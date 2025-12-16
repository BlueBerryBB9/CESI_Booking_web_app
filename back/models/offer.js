const mongoose = require("mongoose");
const { Schema } = mongoose;

const OfferSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["place", "activity", "transportation"],
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: String,

    price: {
      type: Number,
      required: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    location: {
      city: String,
      country: String,
    },

    place: {
      address: String,
      capacity: Number,
    },

    activity: {
      schedule: Date,
      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
      },
    },

    transportation: {
      departure: String,
      arrival: String,
      duration: Number,
    },
  },
  { timestamps: true }
);

OfferSchema.pre("validate", function (next) {
  const type = this.type;
  if (type === "place" && (!this.place?.address || !this.place?.capacity)) {
    return next(new Error("Place data is required"));
  }
  if (
    type === "activity" &&
    (!this.activity?.schedule || !this.activity?.difficulty)
  ) {
    return next(new Error("Activity data is required"));
  }
  if (
    type === "transportation" &&
    (!this.transportation?.departure ||
      !this.transportation?.arrival ||
      !this.transportation?.duration)
  ) {
    return next(new Error("Transportation data is required"));
  }
  // Optional: clear unused objects
  if (type !== "place") this.place = undefined;
  if (type !== "activity") this.activity = undefined;
  if (type !== "transportation") this.transportation = undefined;

  next();
});

module.exports.Offer = mongoose.model("Offer", OfferSchema);
