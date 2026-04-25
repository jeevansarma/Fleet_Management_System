// server/routes/reports.js

const express = require("express");
const Trip = require("../models/Trip");
const Maintenance = require("../models/Maintenance");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const { auth } = require("../middleware/auth");

const router = express.Router();

/* =====================================================
   HELPERS
===================================================== */
function getStartDate(range) {
  const now = new Date();

  switch (range) {
    case "7d":
      return new Date(
        now.getTime() -
          7 * 24 * 60 * 60 * 1000
      );

    case "30d":
      return new Date(
        now.getTime() -
          30 * 24 * 60 * 60 * 1000
      );

    case "90d":
      return new Date(
        now.getTime() -
          90 * 24 * 60 * 60 * 1000
      );

    case "1y":
      return new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );

    default:
      return new Date(
        now.getTime() -
          30 * 24 * 60 * 60 * 1000
      );
  }
}

/* =====================================================
   FUEL EXPENSE REPORT
===================================================== */
router.get(
  "/fuel-expenses",
  auth,
  async (req, res) => {
    try {
      const { range = "30d" } =
        req.query;

      const startDate =
        getStartDate(range);

      const vehicles =
        await Vehicle.find({
          createdAt: {
            $gte: startDate,
          },
        });

      let totalCost = 0;

      vehicles.forEach((v) => {
        const mileage =
          Number(v.mileage) || 1;

        const fuelPrice =
          Number(v.fuelPrice) || 0;

        const estimatedDistance = 100;

        totalCost +=
          (estimatedDistance /
            mileage) *
          fuelPrice;
      });

      const month =
        new Date()
          .toISOString()
          .slice(0, 7);

      res.json([
        {
          month,
          expense:
            Math.round(totalCost),
          fuelConsumed:
            Math.round(
              totalCost / 90
            ),
          trips:
            await Trip.countDocuments(),
        },
      ]);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          "Failed to load fuel report",
      });
    }
  }
);

/* =====================================================
   MAINTENANCE REPORT
===================================================== */
router.get(
  "/maintenance-costs",
  auth,
  async (req, res) => {
    try {
      const { range = "30d" } =
        req.query;

      const startDate =
        getStartDate(range);

      const data =
        await Maintenance.aggregate([
          {
            $match: {
              createdAt: {
                $gte: startDate,
              },
            },
          },
          {
            $group: {
              _id: {
                year: {
                  $year:
                    "$createdAt",
                },
                month: {
                  $month:
                    "$createdAt",
                },
              },
              totalCost: {
                $sum: "$cost",
              },
              count: {
                $sum: 1,
              },
            },
          },
        ]);

      const formatted =
        data.map((item) => ({
          month: `${item._id.year}-${String(
            item._id.month
          ).padStart(2, "0")}`,
          cost: item.totalCost,
          services:
            item.count,
        }));

      res.json(formatted);
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to load maintenance report",
      });
    }
  }
);

/* =====================================================
   VEHICLE UTILIZATION
===================================================== */
router.get(
  "/vehicle-utilization",
  auth,
  async (req, res) => {
    try {
      const totalVehicles =
        await Vehicle.countDocuments();

      const activeTrips =
        await Trip.countDocuments({
          status:
            "in progress",
        });

      const fleetUsage =
        totalVehicles > 0
          ? Math.round(
              (activeTrips /
                totalVehicles) *
                100
            )
          : 0;

      const vehicles =
        await Vehicle.find();

      const data =
        vehicles.map((v) => ({
          vehicle:
            v.vehicleNumber,
          model: v.model,
          utilization:
            fleetUsage,
          trips:
            activeTrips,
        }));

      res.json(data);
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to load utilization",
      });
    }
  }
);

/* =====================================================
   DRIVER PERFORMANCE
===================================================== */
router.get(
  "/driver-performance",
  auth,
  async (req, res) => {
    try {
      const drivers =
        await Driver.find();

      const result =
        await Promise.all(
          drivers.map(
            async (driver) => {
              const totalTrips =
                await Trip.countDocuments(
                  {
                    assignedDriver:
                      driver._id,
                    status:
                      "completed",
                  }
                );

              return {
                driver:
                  driver.name,
                trips:
                  totalTrips,
                rating:
                  totalTrips > 0
                    ? 5
                    : 0,
                avgFuelEfficiency:
                  0,
              };
            }
          )
        );

      res.json(result);
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to load driver report",
      });
    }
  }
);

/* =====================================================
   DELIVERY STATUS
===================================================== */
router.get(
  "/delivery-status",
  auth,
  async (req, res) => {
    try {
      const stats =
        await Trip.aggregate([
          {
            $group: {
              _id: "$status",
              count: {
                $sum: 1,
              },
            },
          },
        ]);

      const total =
        stats.reduce(
          (sum, s) =>
            sum + s.count,
          0
        );

      const data =
        stats.map((s) => ({
          name: s._id,
          value: s.count,
          percentage:
            total > 0
              ? Math.round(
                  (s.count /
                    total) *
                    100
                )
              : 0,
        }));

      res.json(data);
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to load status report",
      });
    }
  }
);

/* =====================================================
   EXPORT REPORT
===================================================== */
router.get(
  "/export",
  auth,
  async (req, res) => {
    try {
      const vehicles =
        await Vehicle.find();

      res.json({
        success: true,
        data: vehicles,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Export failed",
      });
    }
  }
);

module.exports = router;