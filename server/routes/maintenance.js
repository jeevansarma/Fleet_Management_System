// server/routes/maintenance.js
// 🔥 FULL FINAL FILE (GET + POST + PUT + DELETE)
// Replace entire maintenance.js file

const express = require("express");
const router = express.Router();
const Maintenance = require("../models/Maintenance");
const { auth } = require("../middleware/auth");

/* ================= GET ================= */
router.get("/", auth, async (req, res) => {
  try {
    const data = await Maintenance.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= ADD ================= */
router.post("/", auth, async (req, res) => {
  try {
    const data = await Maintenance.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ================= UPDATE ================= */
/* 🔥 THIS WAS MISSING */
router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

/* ================= DELETE ================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    await Maintenance.findByIdAndDelete(req.params.id);

    res.json({
      message: "Deleted Successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;