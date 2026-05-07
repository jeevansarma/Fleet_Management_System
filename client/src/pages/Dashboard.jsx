import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Truck,
  MapPin,
  UserCheck,
  Wrench,
  Fuel,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeTrips: 0,
    availableDrivers: 0,
    maintenancePending: 0,
    fuelCost: 0,
    completionRate: 0,
    completedTrips: 0,
    totalTrips: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const [vehiclesRes, tripsRes, driversRes, maintenanceRes] =
        await Promise.all([
          api.get("/vehicles"),
          api.get("/trips"),
          api.get("/drivers"),
          api.get("/maintenance"),
        ]);

      const vehicles = vehiclesRes.data || [];
      const trips = tripsRes.data || [];
      const drivers = driversRes.data || [];
      const maintenance = maintenanceRes.data || [];

      const totalVehicles = vehicles.length;

      const activeTrips = trips.filter((trip) => {
        const status = trip.status?.toLowerCase().trim();

        return ["in progress", "in_progress", "ongoing", "active"].includes(
          status,
        );
      }).length;

      const completedTrips = trips.filter((trip) => {
        const status = trip.status?.toLowerCase().trim();
        return status === "completed";
      }).length;

      const totalTrips = trips.length;

      const availableDrivers = drivers.filter((driver) => {
        const status = driver.status?.toLowerCase().trim();

        return ["available", "active"].includes(status);
      }).length;

      const maintenancePending = maintenance.filter((item) => {
        const status = item.status?.toLowerCase().trim();

        return ["pending", "in progress", "in_progress"].includes(status);
      }).length;

      /* Fuel Cost */
      const fuelCost = vehicles.reduce((sum, v) => {
        const mileage = Number(v.mileage) || 1;
        const fuelPrice = Number(v.fuelPrice) || 0;

        return sum + (100 / mileage) * fuelPrice;
      }, 0);

      const completionRate =
        totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0;

      setStats({
        totalVehicles,
        activeTrips,
        availableDrivers,
        maintenancePending,
        fuelCost: Math.round(fuelCost),
        completionRate,
        completedTrips,
        totalTrips,
      });
    } catch (error) {
      console.log("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FIXED PROGRESS VALUES ================= */

  const tripProgress =
    stats.totalTrips > 0
      ? Math.round((stats.completedTrips / stats.totalTrips) * 100)
      : 0;

  const vehicleUtilization =
    stats.totalVehicles > 0
      ? Math.min(
          Math.round((stats.activeTrips / stats.totalVehicles) * 100),
          100,
        )
      : 0;

  const maintenanceLoad =
    stats.totalVehicles > 0
      ? Math.min(
          Math.round((stats.maintenancePending / stats.totalVehicles) * 100),
          100,
        )
      : 0;

  const cards = [
    {
      title: "Total Vehicles",
      value: stats.totalVehicles,
      icon: <Truck />,
      color: "bg-blue-500",
    },
    {
      title: "Active Trips",
      value: stats.activeTrips,
      icon: <MapPin />,
      color: "bg-green-500",
    },
    {
      title: "Available Drivers",
      value: stats.availableDrivers,
      icon: <UserCheck />,
      color: "bg-purple-500",
    },
    {
      title: "Maintenance Pending",
      value: stats.maintenancePending,
      icon: <Wrench />,
      color: "bg-orange-500",
    },
    {
      title: "Fuel Cost",
      value: `₹${stats.fuelCost}`,
      icon: <Fuel />,
      color: "bg-red-500",
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      icon: <CheckCircle />,
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-bold text-gray-800">Dashboard</h1>

        <div className="flex items-center gap-4">
          <p className="text-gray-500">
            Last Updated: {new Date().toLocaleTimeString()}
          </p>

          <button
            onClick={fetchDashboard}
            className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center mt-20">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            {cards.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center hover:shadow-xl transition"
              >
                <div>
                  <h2 className="text-gray-500 text-xl">{item.title}</h2>

                  <h1 className="text-5xl font-bold mt-3 text-gray-800">
                    {item.value}
                  </h1>
                </div>

                <div
                  className={`${item.color} w-16 h-16 rounded-full text-white flex justify-center items-center`}
                >
                  {item.icon}
                </div>
              </div>
            ))}
          </div>

          {/* OVERVIEW */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* LEFT */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-3xl font-bold mb-8">Monthly Overview</h2>

              <ProgressBar label="Trips Completed" value={tripProgress} />

              <ProgressBar
                label="Vehicle Utilization"
                value={vehicleUtilization}
              />

              <ProgressBar label="Maintenance Load" value={maintenanceLoad} />
            </div>

            {/* RIGHT */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-3xl font-bold mb-8">Quick Summary</h2>

              <div className="space-y-5 text-xl text-gray-700">
                <p>🚚 Vehicles Registered: {stats.totalVehicles}</p>

                <p>📍 Trips Running: {stats.activeTrips}</p>

                <p>👨‍✈️ Drivers Available: {stats.availableDrivers}</p>

                <p>🔧 Pending Maintenance: {stats.maintenancePending}</p>

                <p>⛽ Fuel Spend: ₹{stats.fuelCost}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ProgressBar = ({ label, value }) => (
  <div className="mb-8">
    <div className="flex justify-between mb-2 text-lg">
      <span>{label}</span>
      <span>{value}%</span>
    </div>

    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div
        className="bg-blue-500 h-4 rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(value, 100)}%`,
        }}
      ></div>
    </div>
  </div>
);

export default Dashboard;
