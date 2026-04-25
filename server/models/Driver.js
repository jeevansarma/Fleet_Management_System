const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true,
  },

  phone: {
    type: String,
    required: true,
    trim: true,
  },

  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  // ✅ FIXED OBJECTID RELATION
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    default: null,
  },

  // ✅ RATING
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },

  status: {
    type: String,
    enum: ["Available", "Busy", "On Leave"],
    default: "Available",
  },

  licenseExpiry: {
    type: Date,
    default: new Date("2030-12-31"),
  },
},
{
  timestamps: true,
}
);

module.exports = mongoose.model(
  "Driver",
  driverSchema
);