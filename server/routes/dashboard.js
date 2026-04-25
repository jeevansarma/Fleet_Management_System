const express = require("express");
const router = express.Router();

const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");
const Driver = require("../models/Driver");
const Maintenance = require("../models/Maintenance");
const { auth } = require("../middleware/auth");

router.get("/stats", auth, async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments();

    const activeTrips = await Trip.countDocuments({
      status: { $in: ["in progress", "ongoing", "active"] }
    });

    const availableDrivers = await Driver.countDocuments({
      status: { $in: ["available", "active"] }
    });

    const maintenancePending = await Maintenance.countDocuments({
      status: { $in: ["pending", "in progress"] }
    });

    const completedTrips = await Trip.countDocuments({
      status: "completed"
    });

    const totalTrips = await Trip.countDocuments();

    const completionRate =
      totalTrips > 0
        ? Math.round((completedTrips / totalTrips) * 100)
        : 0;

    const vehicles = await Vehicle.find();

let fuelCost = 0;

for (const v of vehicles) {
  console.log(v.vehicleNumber, v.mileage, v.fuelPrice);

  const mileage = Number(v.mileage) || 1;
  const fuelPrice = Number(v.fuelPrice) || 0;

  fuelCost += (100 / mileage) * fuelPrice;
}

fuelCost = Math.round(fuelCost);
console.log("TOTAL FUEL COST =", fuelCost);
console.log("Vehicles:", vehicles);

    res.json({
      totalVehicles,
      activeTrips,
      availableDrivers,
      maintenancePending,
      fuelCost,
      completionRate
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Dashboard failed" });
  }
});

module.exports = router;