import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wrench,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  IndianRupee,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
} from "lucide-react";

import api from "../services/api";
import toast from "react-hot-toast";

const Maintenance = () => {
  const [maintenance, setMaintenance] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);

  const [formData, setFormData] = useState({
    vehicleId: "",
    serviceType: "",
    serviceDate: "",
    cost: "",
    status: "scheduled",
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchMaintenance();
    fetchVehicles();
  }, []);

  /* ================= FETCH ================= */

  const fetchMaintenance = async () => {
    try {
      setLoading(true);

      const res = await api.get("/maintenance");

      setMaintenance(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch maintenance");
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles");

      setVehicles(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        vehicleId: formData.vehicleId,
        serviceType: formData.serviceType,
        serviceDate: formData.serviceDate,
        cost: Number(formData.cost),
        status: formData.status,
      };

      // ✅ UPDATE EXISTING MAINTENANCE
      if (editingMaintenance) {
        await api.put(
          `/maintenance/${editingMaintenance._id}`,
          payload
        );

        toast.success(
          "Maintenance Updated Successfully"
        );
      }

      // ✅ CREATE NEW MAINTENANCE
      else {
        await api.post("/maintenance", payload);

        toast.success(
          "Maintenance Added Successfully"
        );
      }

      fetchMaintenance();

      closeModal();

    } catch (err) {
      console.error(err.response?.data || err.message);

      toast.error(
        err.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete maintenance record?"))
      return;

    try {
      await api.delete(`/maintenance/${id}`);

      toast.success("Deleted successfully");

      fetchMaintenance();

    } catch (error) {
      toast.error("Delete failed");
    }
  };

  /* ================= EDIT ================= */

  const handleEdit = (item) => {
    setEditingMaintenance(item);

    setFormData({
      vehicleId: item.vehicleId?._id || "",
      serviceType: item.serviceType || "",
      serviceDate:
        item.serviceDate?.slice(0, 10) || "",
      cost: item.cost || "",
      status: item.status || "scheduled",
    });

    setShowModal(true);
  };

  /* ================= RESET ================= */

  const closeModal = () => {
    setShowModal(false);

    setEditingMaintenance(null);

    setFormData({
      vehicleId: "",
      serviceType: "",
      serviceDate: "",
      cost: "",
      status: "scheduled",
    });
  };

  /* ================= HELPERS ================= */

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";

      case "in_progress":
        return "bg-blue-100 text-blue-700";

      case "overdue":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} />;

      case "in_progress":
        return <Clock size={16} />;

      case "overdue":
        return <AlertTriangle size={16} />;

      default:
        return <Calendar size={16} />;
    }
  };

  /* ================= FILTER ================= */

  const filteredMaintenance = maintenance.filter(
    (item) => {
      const vehicleNo =
        item.vehicleId?.vehicleNumber?.toLowerCase() ||
        "";

      const matchesSearch =
        vehicleNo.includes(
          searchTerm.toLowerCase()
        ) ||
        item.serviceType
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" ||
        item.status === filterStatus;

      return matchesSearch && matchesFilter;
    }
  );

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="h-14 w-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* ================= HEADER ================= */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Maintenance
          </h1>

          <p className="text-gray-500 mt-1">
            Manage vehicle maintenance records
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              closeModal();
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-md"
          >
            <Plus size={18} />
            Schedule Maintenance
          </button>
        )}
      </div>

      {/* ================= SEARCH + FILTER ================= */}

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-3 relative">
          <Search
            className="absolute left-4 top-3.5 text-gray-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Search by vehicle or service..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value)
          }
          className="px-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="scheduled">
            Scheduled
          </option>
          <option value="in_progress">
            In Progress
          </option>
          <option value="completed">
            Completed
          </option>
        </select>
      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">
                  Vehicle
                </th>

                <th className="px-6 py-4 text-left font-semibold">
                  Service Type
                </th>

                <th className="px-6 py-4 text-left font-semibold">
                  Date
                </th>

                <th className="px-6 py-4 text-left font-semibold">
                  Cost
                </th>

                <th className="px-6 py-4 text-left font-semibold">
                  Status
                </th>

                {isAdmin && (
                  <th className="px-6 py-4 text-center font-semibold">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredMaintenance.length > 0 ? (
                filteredMaintenance.map(
                  (item, index) => (
                    <motion.tr
                      key={item._id}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.05,
                      }}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      {/* VEHICLE */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-xl">
                            <Wrench
                              size={18}
                              className="text-blue-600"
                            />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {item.vehicleId
                                ?.vehicleNumber ||
                                "N/A"}
                            </p>

                            <p className="text-sm text-gray-500">
                              Fleet Vehicle
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* SERVICE */}
                      <td className="px-6 py-5">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {item.serviceType}
                        </span>
                      </td>

                      {/* DATE */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar size={16} />

                          {new Date(
                            item.serviceDate
                          ).toLocaleDateString()}
                        </div>
                      </td>

                      {/* COST */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1 font-semibold text-green-600">
                          <IndianRupee size={16} />

                          {item.cost}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {getStatusIcon(
                            item.status
                          )}

                          {item.status.replace(
                            "_",
                            " "
                          )}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      {isAdmin && (
                        <td className="px-6 py-5">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() =>
                                handleEdit(item)
                              }
                              className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-xl transition"
                            >
                              <Edit size={18} />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  item._id
                                )
                              }
                              className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-xl transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-14 text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-gray-100 p-4 rounded-full">
                        <Wrench
                          size={30}
                          className="text-gray-400"
                        />
                      </div>

                      <p className="text-lg font-medium">
                        No Maintenance Records Found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL ================= */}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingMaintenance
                  ? "Edit Maintenance"
                  : "Schedule Maintenance"}
              </h2>

              <button
                onClick={closeModal}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* VEHICLE */}
              <select
                value={formData.vehicleId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vehicleId: e.target.value,
                  })
                }
                className="w-full border border-gray-200 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">
                  Select Vehicle
                </option>

                {vehicles.map((v) => (
                  <option
                    key={v._id}
                    value={v._id}
                  >
                    {v.vehicleNumber}
                  </option>
                ))}
              </select>

              {/* SERVICE */}
              <select
                value={formData.serviceType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    serviceType:
                      e.target.value,
                  })
                }
                className="w-full border border-gray-200 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">
                  Service Type
                </option>

                <option>
                  Oil Change
                </option>

                <option>
                  Tire Replacement
                </option>

                <option>
                  Brake Service
                </option>

                <option>
                  Engine Tune-up
                </option>
              </select>

              {/* DATE */}
              <input
                type="date"
                value={formData.serviceDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    serviceDate:
                      e.target.value,
                  })
                }
                className="w-full border border-gray-200 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              {/* COST */}
              <input
                type="number"
                placeholder="Enter Cost"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cost: e.target.value,
                  })
                }
                className="w-full border border-gray-200 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              {/* STATUS */}
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value,
                  })
                }
                className="w-full border border-gray-200 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="scheduled">
                  Scheduled
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="completed">
                  Completed
                </option>
              </select>

              {/* BUTTONS */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  {editingMaintenance
                    ? "Update"
                    : "Save"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;