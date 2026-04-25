// server/routes/auth.js
// ✅ FINAL UPDATED AUTH FILE
// Signup user can choose Admin or User role

const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const User = require("../models/User");
const { auth } = require("../middleware/auth");

const router = express.Router();

/* ===================================================
   REGISTER
=================================================== */
router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name is required"),

    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be minimum 6 characters"),

    body("role")
      .optional()
      .isIn(["admin", "user"])
      .withMessage("Role must be admin or user"),
  ],

  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        name,
        email,
        password,
        role,
      } = req.body;

      /* Check Existing User */
      const existingUser =
        await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          message: "User already exists",
        });
      }

      /* Selected Role */
      const selectedRole =
        role === "admin"
          ? "admin"
          : "user";

      /* Create User */
      const user = await User.create({
        name,
        email,
        password,
        role: selectedRole,
      });

      /* Token */
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET ||
          "secretkey",
        { expiresIn: "7d" }
      );

      res.status(201).json({
        message:
          "Registration successful",

        token,

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

/* ===================================================
   LOGIN
=================================================== */
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage(
        "Password required"
      ),
  ],

  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      const user =
        await User.findOne({
          email,
        }).select("+password");

      if (!user) {
        return res.status(401).json({
          message:
            "Invalid credentials",
        });
      }

      const isMatch =
        await user.comparePassword(
          password
        );

      if (!isMatch) {
        return res.status(401).json({
          message:
            "Invalid credentials",
        });
      }

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET ||
          "secretkey",
        { expiresIn: "7d" }
      );

      res.json({
        message:
          "Login successful",

        token,

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

/* ===================================================
   CURRENT USER
=================================================== */
router.get(
  "/me",
  auth,
  async (req, res) => {
    res.json(req.user);
  }
);

module.exports = router;