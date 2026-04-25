// server/routes/vehicles.js

const express = require("express");
const Vehicle = require("../models/Vehicle");
const { auth } = require("../middleware/auth");

const router = express.Router();

/* =========================================
   GET ALL VEHICLES
========================================= */
router.get("/", auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({
      createdAt: -1,
    });

    res.json(vehicles);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch vehicles",
    });
  }
});

/* =========================================
   GET SINGLE VEHICLE
========================================= */
router.get("/:id", auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(
      req.params.id
    );

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    res.json(vehicle);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch vehicle",
    });
  }
});

/* =========================================
   ADD VEHICLE
========================================= */
router.post("/", auth, async (req, res) => {
  try {
    const {
      vehicleNumber,
      type,
      model,
      capacity,
      fuelLevel,
      fuelType,
      mileage,
      fuelPrice,
      status,
    } = req.body;

    const existingVehicle =
      await Vehicle.findOne({
        vehicleNumber,
      });

    if (existingVehicle) {
      return res.status(400).json({
        message:
          "Vehicle number already exists",
      });
    }

    const vehicle = await Vehicle.create({
      vehicleNumber,
      type,
      model,
      capacity:
        Number(capacity) || 0,
      fuelLevel:
        Number(fuelLevel) || 0,
      fuelType,
      mileage:
        Number(mileage) || 0,
      fuelPrice:
        Number(fuelPrice) || 0,
      status,
    });

    res.status(201).json({
      message:
        "Vehicle added successfully",
      vehicle,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        "Failed to add vehicle",
    });
  }
});

/* =========================================
   UPDATE VEHICLE (FINAL FIX)
========================================= */
router.put("/:id", auth, async (req, res) => {
  try {
    const vehicle =
      await Vehicle.findById(
        req.params.id
      );

    if (!vehicle) {
      return res.status(404).json({
        message:
          "Vehicle not found",
      });
    }

    const {
      vehicleNumber,
      type,
      model,
      capacity,
      fuelLevel,
      fuelType,
      mileage,
      fuelPrice,
      status,
    } = req.body;

    if (
      vehicleNumber !== undefined
    )
      vehicle.vehicleNumber =
        vehicleNumber;

    if (type !== undefined)
      vehicle.type = type;

    if (model !== undefined)
      vehicle.model = model;

    if (
      capacity !== undefined
    )
      vehicle.capacity =
        Number(capacity);

    if (
      fuelLevel !== undefined
    )
      vehicle.fuelLevel =
        Number(fuelLevel);

    if (
      fuelType !== undefined
    )
      vehicle.fuelType =
        fuelType;

    if (
      mileage !== undefined
    )
      vehicle.mileage =
        Number(mileage);

    /* 🔥 FINAL IMPORTANT FIX */
    if (
      fuelPrice !== undefined
    ) {
      vehicle.fuelPrice =
        Number(fuelPrice);
    }

    if (
      status !== undefined
    )
      vehicle.status =
        status;

    await vehicle.save();

    res.json({
      message:
        "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        "Failed to update vehicle",
    });
  }
});

/* =========================================
   DELETE VEHICLE
========================================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    const vehicle =
      await Vehicle.findById(
        req.params.id
      );

    if (!vehicle) {
      return res.status(404).json({
        message:
          "Vehicle not found",
      });
    }

    await Vehicle.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Vehicle deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        "Failed to delete vehicle",
    });
  }
});

module.exports = router;