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

  // ✅ SINGLE SOURCE OF TRUTH
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
    e.preventDefault(); // ✅ STOP PAGE RELOAD

    try {
      await api.post("/maintenance", {
        vehicleId: formData.vehicleId,
        serviceType: formData.serviceType,
        serviceDate: formData.serviceDate,
        cost: Number(formData.cost),
        status: formData.status,
      });

      toast.success("✅ Maintenance Added");
      fetchMaintenance();
      closeModal();
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete maintenance record?")) return;

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
  const filteredMaintenance = maintenance.filter((item) => {
    const vehicleNo = item.vehicleId?.vehicleNumber?.toLowerCase() || "";

    const matchesSearch =
      vehicleNo.includes(searchTerm.toLowerCase()) ||
      item.serviceType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Maintenance</h1>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2"
          >
            <Plus size={18} />
            Schedule Maintenance
          </button>
        )}
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-3 border rounded-xl w-full"
      />

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3">Vehicle</th>
              <th className="p-3">Service</th>
              <th className="p-3">Date</th>
              <th className="p-3">Cost</th>
              <th className="p-3">Status</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {filteredMaintenance.map((item) => (
              <tr key={item._id} className="border-t">
                <td>{item.vehicleId?.vehicleNumber}</td>
                <td>{item.serviceType}</td>
                <td>
                  {new Date(item.serviceDate).toLocaleDateString()}
                </td>
                <td>₹ {item.cost}</td>
                <td>{item.status.replace("_", " ")}</td>

                {isAdmin && (
                  <td className="flex gap-2">
                    <button onClick={() => handleEdit(item)}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(item._id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl mb-4">Schedule Maintenance</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* VEHICLE */}
              <select
                value={formData.vehicleId}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleId: e.target.value })
                }
                className="w-full border p-3 rounded"
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.vehicleNumber}
                  </option>
                ))}
              </select>

              {/* SERVICE */}
              <select
                value={formData.serviceType}
                onChange={(e) =>
                  setFormData({ ...formData, serviceType: e.target.value })
                }
                className="w-full border p-3 rounded"
                required
              >
                <option value="">Service Type</option>
                <option>Oil Change</option>
                <option>Tire Replacement</option>
                <option>Brake Service</option>
              </select>

              {/* DATE */}
              <input
                type="date"
                value={formData.serviceDate}
                onChange={(e) =>
                  setFormData({ ...formData, serviceDate: e.target.value })
                }
                className="w-full border p-3 rounded"
                required
              />

              {/* COST */}
              <input
                type="number"
                placeholder="Cost"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: e.target.value })
                }
                className="w-full border p-3 rounded"
                required
              />

              {/* STATUS */}
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full border p-3 rounded"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-1/2 bg-gray-200 p-2 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-1/2 bg-blue-600 text-white p-2 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;