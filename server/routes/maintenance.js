const express = require("express");
const router = express.Router();

const Maintenance = require("../models/Maintenance");
const Vehicle = require("../models/Vehicle");

const { auth } = require("../middleware/auth");

/* ================= GET ALL ================= */
router.get("/", auth, async (req, res) => {
  try {
    const data = await Maintenance.find()
      .populate("vehicleId", "vehicleNumber")
      .sort({ createdAt: -1 });

    res.status(200).json(data);
  } catch (error) {
    console.log("GET Maintenance Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

/* ================= ADD MAINTENANCE ================= */
router.post("/", auth, async (req, res) => {
  try {
    console.log("Incoming Data:", req.body);

    const { vehicleId, serviceType, serviceDate, cost, status } = req.body;

    /* ================= VALIDATION ================= */

    if (!vehicleId) {
      return res.status(400).json({
        message: "Vehicle is required",
      });
    }

    if (!serviceType) {
      return res.status(400).json({
        message: "Service type is required",
      });
    }

    if (!serviceDate) {
      return res.status(400).json({
        message: "Service date is required",
      });
    }

    if (!cost) {
      return res.status(400).json({
        message: "Cost is required",
      });
    }

    /* ================= CHECK VEHICLE EXISTS ================= */

    const vehicleExists = await Vehicle.findById(vehicleId);

    if (!vehicleExists) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    /* ================= CREATE ================= */

    const maintenance = new Maintenance({
      vehicleId,
      serviceType,
      serviceDate,
      cost,
      status: status || "scheduled",
    });

    await maintenance.save();

    const populatedMaintenance = await Maintenance.findById(
      maintenance._id,
    ).populate("vehicleId", "vehicleNumber");

    res.status(201).json(populatedMaintenance);
  } catch (error) {
    console.log("POST Maintenance Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

/* ================= UPDATE ================= */
router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    ).populate("vehicleId", "vehicleNumber");

    res.status(200).json(updated);
  } catch (error) {
    console.log("UPDATE Maintenance Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

/* ================= DELETE ================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    await Maintenance.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Deleted Successfully",
    });
  } catch (error) {
    console.log("DELETE Maintenance Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
