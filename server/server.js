const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ============================
   ENV CHECK
============================ */
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI missing");
  process.exit(1);
}

/* ============================
   MIDDLEWARE
============================ */

const allowedOrigins = [
  "http://localhost:5173",
  "https://fleetpro-zeta.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server / postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ============================
   ROOT ROUTE (IMPORTANT)
============================ */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Fleet API is running...",
    endpoints: [
      "/api/auth",
      "/api/trips",
      "/api/drivers",
      "/api/vehicles",
      "/api/maintenance",
      "/api/dashboard",
      "/api/reports",
    ],
  });
});

/* ============================
   HEALTH CHECK (OPTIONAL)
============================ */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

/* ============================
   ROUTES
============================ */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/vehicles", require("./routes/vehicles"));
app.use("/api/drivers", require("./routes/drivers"));
app.use("/api/trips", require("./routes/trips"));
app.use("/api/maintenance", require("./routes/maintenance"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/reports", require("./routes/reports"));

/* ============================
   404 HANDLER (LAST ONLY)
============================ */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ============================
   GLOBAL ERROR HANDLER
============================ */
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.message);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ============================
   DATABASE CONNECTION
============================ */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

/* ============================
   START SERVER
============================ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
