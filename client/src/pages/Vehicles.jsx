import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Truck,
  Plus,
  Search,
  Edit,
  Trash2,
  Fuel,
  Calendar,
  MapPin,
  X,
  Gauge,
  IndianRupee,
} from "lucide-react";

import api from "../services/api";
import toast from "react-hot-toast";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [formData, setFormData] = useState({
    vehicleNumber: "",
    type: "truck",
    model: "",
    capacity: "",
    fuelLevel: 100,
    fuelType: "diesel",
    mileage: "",
    fuelPrice: "",
    status: "active",
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vehicles");
      setVehicles(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleNumber: "",
      type: "truck",
      model: "",
      capacity: "",
      fuelLevel: 100,
      fuelType: "diesel",
      mileage: "",
      fuelPrice: "",
      status: "active",
    });

    setEditingVehicle(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  /* ================= UPDATED HANDLE EDIT ================= */
  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);

    setFormData({
      vehicleNumber: vehicle.vehicleNumber ?? "",
      type: vehicle.type ?? "truck",
      model: vehicle.model ?? "",
      capacity: vehicle.capacity ?? "",
      fuelLevel: vehicle.fuelLevel ?? 100,
      fuelType: vehicle.fuelType ?? "diesel",
      mileage: vehicle.mileage ?? "",

      fuelPrice:
        vehicle.fuelPrice !== undefined &&
        vehicle.fuelPrice !== null
          ? String(vehicle.fuelPrice)
          : "",

      status: vehicle.status ?? "active",
    });

    setShowModal(true);
  };

  /* ================= UPDATED HANDLE SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        vehicleNumber: formData.vehicleNumber.trim(),
        type: formData.type,
        model: formData.model.trim(),
        capacity: Number(formData.capacity),
        fuelLevel: Number(formData.fuelLevel),
        fuelType: formData.fuelType,
        mileage: Number(formData.mileage),
        fuelPrice: parseFloat(formData.fuelPrice),
        status: formData.status,
      };

      if (isNaN(payload.fuelPrice)) {
        return toast.error("Enter valid fuel price");
      }

      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle._id}`, payload);
        toast.success("Vehicle updated successfully");
      } else {
        await api.post("/vehicles", payload);
        toast.success("Vehicle added successfully");
      }

      await fetchVehicles();
      closeModal();
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vehicle?")) return;

    try {
      await api.delete(`/vehicles/${id}`);
      toast.success("Vehicle deleted");
      fetchVehicles();
    } catch {
      toast.error("Delete failed");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "idle":
        return "bg-yellow-100 text-yellow-700";
      case "maintenance":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const search = searchTerm.toLowerCase();

    const matchSearch =
      vehicle.vehicleNumber?.toLowerCase().includes(search) ||
      vehicle.model?.toLowerCase().includes(search);

    const matchFilter =
      filterStatus === "all" ||
      vehicle.status === filterStatus;

    return matchSearch && matchFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-4xl font-bold text-gray-800">
          Vehicles
        </h1>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-3 bg-blue-600 text-white rounded-xl flex items-center gap-2"
          >
            <Plus size={18} />
            Add Vehicle
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative">
          <Search
            size={18}
            className="absolute top-4 left-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value)
          }
          className="px-4 py-3 rounded-xl border bg-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="idle">Idle</option>
          <option value="maintenance">
            Maintenance
          </option>
        </select>
      </div>

      {filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-10 text-center text-gray-500">
          No Vehicles Found
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle._id}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.05,
              }}
              className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition"
            >
              <div className="flex justify-between items-start mb-5">
                <div className="flex gap-3">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Truck className="text-blue-600" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {vehicle.vehicleNumber}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {vehicle.model}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    vehicle.status
                  )}`}
                >
                  {vehicle.status}
                </span>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  Type: {vehicle.type}
                </div>

                <div className="flex items-center gap-2">
                  <Truck size={16} />
                  Capacity: {vehicle.capacity}
                </div>

                <div className="flex items-center gap-2">
                  <Fuel size={16} />
                  Fuel: {vehicle.fuelLevel}%
                </div>

                <div className="flex items-center gap-2">
                  <Gauge size={16} />
                  Mileage: {vehicle.mileage} km/l
                </div>

                <div className="flex items-center gap-2">
                  <IndianRupee size={16} />
                  Fuel Price: ₹
                  {vehicle.fuelPrice || 0}/L
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  Added:{" "}
                  {new Date(
                    vehicle.createdAt ||
                      Date.now()
                  ).toLocaleDateString()}
                </div>
              </div>

              {isAdmin && (
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    onClick={() =>
                      handleEdit(vehicle)
                    }
                    className="py-2 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(vehicle._id)
                    }
                    className="py-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <motion.div
            initial={{
              scale: 0.9,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingVehicle
                  ? "Edit Vehicle"
                  : "Add Vehicle"}
              </h2>

              <button onClick={closeModal}>
                <X />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Vehicle Number"
                required
                value={formData.vehicleNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vehicleNumber:
                      e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              />

              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              >
                <option value="truck">
                  Truck
                </option>
                <option value="van">Van</option>
                <option value="car">Car</option>
              </select>

              <input
                type="text"
                placeholder="Model"
                required
                value={formData.model}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    model: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              />

              <input
                type="number"
                placeholder="Capacity"
                required
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity:
                      e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              />

              <input
                type="number"
                placeholder="Fuel Level %"
                value={formData.fuelLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fuelLevel:
                      e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              />

              <select
                value={formData.fuelType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fuelType:
                      e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              >
                <option value="diesel">
                  Diesel
                </option>
                <option value="petrol">
                  Petrol
                </option>
                <option value="cng">CNG</option>
              </select>

              <input
                type="number"
                placeholder="Mileage (km/l)"
                required
                value={formData.mileage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mileage:
                      e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              />

              <input
                type="number"
                step="0.01"
                placeholder="Fuel Price Per Liter"
                required
                value={formData.fuelPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fuelPrice:
                      e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              />

              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status:
                      e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              >
                <option value="active">
                  Active
                </option>
                <option value="idle">
                  Idle
                </option>
                <option value="maintenance">
                  Maintenance
                </option>
              </select>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="py-3 rounded-xl bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="py-3 rounded-xl bg-blue-600 text-white"
                >
                  {editingVehicle
                    ? "Update"
                    : "Add"}{" "}
                  Vehicle
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;