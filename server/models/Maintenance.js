const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    serviceType: {
      type: String,
      required: true,
    },

    serviceDate: {
      type: Date,
      required: true,
    },

    cost: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Maintenance",
  maintenanceSchema
);