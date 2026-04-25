const express = require("express");
const router = express.Router();

const Trip = require("../models/Trip");
const Vehicle = require("../models/Vehicle");
const { auth } = require("../middleware/auth");

/* ================= GET ALL TRIPS ================= */
router.get("/", auth, async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("assignedDriver", "name rating")
      .populate("assignedVehicle", "vehicleNumber type")
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= PRICE CALCULATOR ================= */
const calculatePrice = (distance, vehicleType) => {
  const km = Number(distance) || 0;

  let rate = 15;

  if (vehicleType === "car") rate = 18;
  if (vehicleType === "van") rate = 22;
  if (vehicleType === "truck") rate = 30;

  return km * rate;
};

/* ================= ADD TRIP ================= */
router.post("/", auth, async (req, res) => {
  try {
    const {
      source,
      destination,
      date,
      distance,
      assignedDriver,
      assignedVehicle,
      status,
      driverRating,
    } = req.body;

    const vehicle = await Vehicle.findById(assignedVehicle);

    const price = calculatePrice(
      distance,
      vehicle?.type || "car"
    );

    const trip = await Trip.create({
      source,
      destination,
      date,
      distance,
      assignedDriver,
      assignedVehicle,
      status: status || "scheduled",
      driverRating: driverRating || 5,
      price,
    });

    res.status(201).json({
      message: "Trip added successfully",
      trip,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* ================= UPDATE TRIP ================= */
router.put("/:id", auth, async (req, res) => {
  try {
    const {
      source,
      destination,
      date,
      distance,
      assignedDriver,
      assignedVehicle,
      status,
      driverRating,
    } = req.body;

    const vehicle = await Vehicle.findById(assignedVehicle);

    const price = calculatePrice(
      distance,
      vehicle?.type || "car"
    );

    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      {
        source,
        destination,
        date,
        distance,
        assignedDriver,
        assignedVehicle,
        status,
        driverRating,
        price,
      },
      { new: true }
    );

    res.json({
      message: "Trip updated successfully",
      trip,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* ================= DELETE ================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    await Trip.findByIdAndDelete(req.params.id);

    res.json({
      message: "Trip deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;