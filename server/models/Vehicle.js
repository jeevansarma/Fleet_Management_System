const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
{
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
  },

  type: {
    type: String,
    enum: ["truck", "van", "car"],
    default: "truck",
  },

  model: {
    type: String,
    required: true,
  },

  capacity: {
    type: Number,
    required: true,
  },

  fuelLevel: {
    type: Number,
    default: 100,
  },

  fuelType: {
    type: String,
    enum: ["diesel", "petrol", "cng"],
    default: "diesel",
  },

  mileage: {
    type: Number,
    default: 0,
  },

  /* ✅ IMPORTANT */
  fuelPrice: {
    type: Number,
    default: 0,
  },

  status: {
    type: String,
    enum: ["active", "idle", "maintenance"],
    default: "active",
  },
},
{ timestamps: true }
);

module.exports = mongoose.model(
  "Vehicle",
  vehicleSchema
);