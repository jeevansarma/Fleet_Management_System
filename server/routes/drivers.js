// server/routes/drivers.js

const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const Driver = require("../models/Driver");
const { auth } = require("../middleware/auth");

/* =====================================
   GET ALL DRIVERS
===================================== */
router.get("/", auth, async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate(
        "assignedVehicle",
        "vehicleNumber type"
      )
      .sort({ createdAt: -1 });

    res.json(drivers);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =====================================
   ADD DRIVER
===================================== */
router.post("/", auth, async (req, res) => {
  try {
    const {
      name,
      phone,
      licenseNumber,
      assignedVehicle,
      rating,
      status,
    } = req.body;

    const driver =
      await Driver.create({
        name,
        phone,
        licenseNumber,

        assignedVehicle:
          assignedVehicle &&
          assignedVehicle !== ""
            ? new mongoose.Types.ObjectId(
                assignedVehicle
              )
            : null,

        rating:
          Number(rating) || 5,

        status:
          status || "Available",
      });

    const updated =
      await Driver.findById(
        driver._id
      ).populate(
        "assignedVehicle",
        "vehicleNumber type"
      );

    res.status(201).json(updated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =====================================
   UPDATE DRIVER
===================================== */
router.put("/:id", auth, async (req, res) => {
  try {
    const {
      name,
      phone,
      licenseNumber,
      assignedVehicle,
      rating,
      status,
    } = req.body;

    const updated =
      await Driver.findByIdAndUpdate(
        req.params.id,
        {
          name,
          phone,
          licenseNumber,

          assignedVehicle:
            assignedVehicle &&
            assignedVehicle !== ""
              ? new mongoose.Types.ObjectId(
                  assignedVehicle
                )
              : null,

          rating:
            Number(rating) || 5,

          status:
            status || "Available",
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "assignedVehicle",
        "vehicleNumber type"
      );

    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/* =====================================
   DELETE DRIVER
===================================== */
router.delete("/:id", auth, async (req, res) => {
  try {
    await Driver.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;