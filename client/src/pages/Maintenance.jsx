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
      console.log(error);
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
      if (editingMaintenance) {
        await api.put(
          `/maintenance/${editingMaintenance._id}`,
          formData
        );
        toast.success("Maintenance updated");
      } else {
        await api.post("/maintenance", formData);
        toast.success("Maintenance scheduled");
      }

      fetchMaintenance();
      closeModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
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
      vehicleId: item.vehicleId || "",
      serviceType: item.serviceType || "",
      serviceDate: item.serviceDate?.slice(0, 10) || "",
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
  const getVehicleNumber = (id) => {
    const vehicle = vehicles.find((v) => v._id === id);
    return vehicle?.vehicleNumber || "Unknown";
  };

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
        return <CheckCircle size={18} />;
      case "in_progress":
        return <Clock size={18} />;
      case "overdue":
        return <AlertTriangle size={18} />;
      default:
        return <Calendar size={18} />;
    }
  };

  /* ================= FILTER ================= */
  const filteredMaintenance = maintenance.filter(
    (item) => {
      const vehicleNo = getVehicleNumber(item.vehicleId)
        .toLowerCase();

      const matchesSearch =
        vehicleNo.includes(searchTerm.toLowerCase()) ||
        item.serviceType
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" ||
        item.status === filterStatus;

      return matchesSearch && matchesFilter;
    }
  );

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Maintenance
        </h1>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Schedule Maintenance
          </button>
        )}
      </div>

      {/* SEARCH + FILTER */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-3 relative">
          <Search
            className="absolute top-3.5 left-3 text-gray-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Search maintenance..."
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
          <option value="scheduled">
            Scheduled
          </option>
          <option value="in_progress">
            In Progress
          </option>
          <option value="completed">
            Completed
          </option>
          <option value="overdue">
            Overdue
          </option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 text-left">
                  Vehicle
                </th>
                <th className="px-6 py-4 text-left">
                  Service
                </th>
                <th className="px-6 py-4 text-left">
                  Date
                </th>
                <th className="px-6 py-4 text-left">
                  Cost
                </th>
                <th className="px-6 py-4 text-left">
                  Status
                </th>

                {isAdmin && (
                  <th className="px-6 py-4 text-left">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredMaintenance.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-gray-500"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                filteredMaintenance.map(
                  (item, index) => (
                    <motion.tr
                      key={item._id}
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.05,
                      }}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Wrench
                            size={18}
                            className="text-gray-400"
                          />
                          {getVehicleNumber(
                            item.vehicleId
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {item.serviceType}
                      </td>

                      <td className="px-6 py-4">
                        {new Date(
                          item.serviceDate
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <IndianRupee
                            size={16}
                          />
                          {item.cost}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm inline-flex items-center gap-2 ${getStatusColor(
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

                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                handleEdit(
                                  item
                                )
                              }
                              className="text-blue-600"
                            >
                              <Edit
                                size={
                                  18
                                }
                              />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  item._id
                                )
                              }
                              className="text-red-600"
                            >
                              <Trash2
                                size={
                                  18
                                }
                              />
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
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
            className="bg-white rounded-2xl w-full max-w-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingMaintenance
                  ? "Edit Maintenance"
                  : "Schedule Maintenance"}
              </h2>

              <button onClick={closeModal}>
                <X />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <select
                required
                value={formData.vehicleId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vehicleId:
                      e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
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

              <select
                required
                value={
                  formData.serviceType
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    serviceType:
                      e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
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

              <input
                type="date"
                required
                value={
                  formData.serviceDate
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    serviceDate:
                      e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              />

              <input
                type="number"
                required
                placeholder="Cost"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cost: e.target.value,
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
                <option value="scheduled">
                  Scheduled
                </option>
                <option value="in_progress">
                  In Progress
                </option>
                <option value="completed">
                  Completed
                </option>
                <option value="overdue">
                  Overdue
                </option>
              </select>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="py-3 bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="py-3 bg-blue-600 text-white rounded-xl"
                >
                  {editingMaintenance
                    ? "Update"
                    : "Schedule"}
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