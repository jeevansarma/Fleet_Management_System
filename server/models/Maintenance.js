// server/models/Maintenance.js
// 🔥 FINAL FIX = your model still has old enum values

const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
{
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true
  },

  vehicleNumber: {
    type: String,
    required: true
  },

  serviceType: {
    type: String,
    required: true
  },

  serviceDate: {
    type: Date,
    required: true
  },

  cost: {
    type: Number,
    required: true
  },

  // 🔥 FIXED STATUS ENUM
  status: {
    type: String,
    enum: [
      "Pending",
      "In Progress",
      "Completed"
    ],
    default: "Pending"
  }
},
{
  timestamps: true
});

module.exports = mongoose.model(
  "Maintenance",
  maintenanceSchema
);