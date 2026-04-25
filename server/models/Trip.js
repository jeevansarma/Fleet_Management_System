const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
{
  source: {
    type: String,
    required: [true, "Source location is required"],
    trim: true,
  },

  destination: {
    type: String,
    required: [true, "Destination is required"],
    trim: true,
  },

  date: {
    type: Date,
    required: [true, "Trip date is required"],
    default: Date.now,
  },

  status: {
    type: String,
    enum: ["scheduled", "in_progress", "completed", "cancelled"],
    default: "scheduled",
    lowercase: true,
  },

  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: [true, "Driver assignment is required"],
  },

  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: [true, "Vehicle assignment is required"],
  },

  cargo: {
    type: String,
    trim: true,
    default: "",
  },

  weight: {
    type: Number,
    min: [0, "Weight cannot be negative"],
    default: 0,
  },

  distance: {
    type: Number,
    min: [0, "Distance cannot be negative"],
    default: 0,
  },

  /* ✅ IMPORTANT FIX */
  price: {
    type: Number,
    default: 0,
  },

  /* ✅ Driver Rating */
  driverRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },

  estimatedDuration: {
    type: Number,
    min: [0, "Duration cannot be negative"],
    default: 0,
  },

  actualDuration: {
    type: Number,
    min: [0, "Duration cannot be negative"],
    default: 0,
  },

  fuelConsumed: {
    type: Number,
    min: [0, "Fuel consumed cannot be negative"],
    default: 0,
  },

  startTime: {
    type: Date,
  },

  endTime: {
    type: Date,
  },

  notes: {
    type: String,
    trim: true,
    default: "",
  },

  customer: {
    name: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
  },
},
{
  timestamps: true,
}
);

/* ================= INDEXES ================= */
tripSchema.index({ status: 1 });
tripSchema.index({ date: -1 });
tripSchema.index({ assignedDriver: 1 });
tripSchema.index({ assignedVehicle: 1 });

/* ================= VIRTUAL DURATION ================= */
tripSchema.virtual("calculatedDuration").get(function () {
  if (this.startTime && this.endTime) {
    return (
      (this.endTime - this.startTime) /
      (1000 * 60 * 60)
    );
  }
  return null;
});

/* ================= AUTO UPDATE STATS ================= */
tripSchema.pre("save", async function (next) {
  if (
    this.isModified("status") &&
    this.status === "completed"
  ) {
    try {
      await mongoose.model("Driver").findByIdAndUpdate(
        this.assignedDriver,
        {
          $inc: { totalTrips: 1 },
        }
      );

      if (this.distance) {
        await mongoose.model("Vehicle").findByIdAndUpdate(
          this.assignedVehicle,
          {
            $inc: { mileage: this.distance },
          }
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  next();
});

/* ================= SHOW VIRTUALS ================= */
tripSchema.set("toJSON", { virtuals: true });
tripSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model(
  "Trip",
  tripSchema
);