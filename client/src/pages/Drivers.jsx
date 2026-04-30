import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Star,
} from "lucide-react";

const API =
  "https://fleet-management-api-599u.onrender.com/api";

const Drivers = () => {
  const [drivers, setDrivers] =
    useState([]);

  const [vehicles, setVehicles] =
    useState([]);

  const [showModal, setShowModal] =
    useState(false);

  const [editingDriver, setEditingDriver] =
    useState(null);

  const token =
    localStorage.getItem("token");

  const emptyForm = {
    name: "",
    phone: "",
    licenseNumber: "",
    assignedVehicle: "",
    rating: 5,
  };

  const [form, setForm] =
    useState(emptyForm);

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, []);

  /* ================= FETCH DRIVERS ================= */

  const fetchDrivers = async () => {
    try {
      const res = await axios.get(
        `${API}/drivers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDrivers(res.data);
    } catch (error) {
      toast.error(
        "Failed to load drivers"
      );
    }
  };

  /* ================= FETCH VEHICLES ================= */

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(
        `${API}/vehicles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setVehicles(res.data);
    } catch (error) {
      toast.error(
        "Failed to load vehicles"
      );
    }
  };

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  /* ================= OPEN ADD ================= */

  const openAddModal = () => {
    setEditingDriver(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  /* ================= OPEN EDIT ================= */

  const handleEdit = (driver) => {
    setEditingDriver(driver);

    setForm({
      name:
        driver.name || "",
      phone:
        driver.phone || "",
      licenseNumber:
        driver.licenseNumber ||
        "",

      assignedVehicle:
        driver.assignedVehicle?._id ||
        "",

      rating:
        driver.rating || 5,
    });

    setShowModal(true);
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name:
          form.name.trim(),
        phone:
          form.phone.trim(),
        licenseNumber:
          form.licenseNumber.trim(),

        assignedVehicle:
          form.assignedVehicle ||
          null,

        rating:
          Number(
            form.rating
          ) || 5,
      };

      if (editingDriver) {
        await axios.put(
          `${API}/drivers/${editingDriver._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success(
          "Driver updated successfully"
        );
      } else {
        await axios.post(
          `${API}/drivers`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success(
          "Driver added successfully"
        );
      }

      setShowModal(false);
      setEditingDriver(null);
      setForm(emptyForm);

      fetchDrivers();
    } catch (error) {
      toast.error(
        error?.response?.data
          ?.message ||
          "Something went wrong"
      );
    }
  };

  /* ================= DELETE ================= */

  const handleDelete =
    async (id) => {
      try {
        await axios.delete(
          `${API}/drivers/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success(
          "Driver deleted"
        );

        fetchDrivers();
      } catch {
        toast.error(
          "Delete failed"
        );
      }
    };

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-bold">
          Drivers
        </h1>

        <button
          onClick={
            openAddModal
          }
          className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Driver
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">
                Name
              </th>

              <th className="p-4 text-left">
                Phone
              </th>

              <th className="p-4 text-left">
                License
              </th>

              <th className="p-4 text-left">
                Vehicle
              </th>

              <th className="p-4 text-left">
                Rating
              </th>

              <th className="p-4 text-left">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {drivers.map(
              (driver) => (
                <tr
                  key={
                    driver._id
                  }
                  className="border-t"
                >
                  <td className="p-4">
                    {
                      driver.name
                    }
                  </td>

                  <td className="p-4">
                    {
                      driver.phone
                    }
                  </td>

                  <td className="p-4">
                    {
                      driver.licenseNumber
                    }
                  </td>

                  <td className="p-4">
                    {driver
                      .assignedVehicle
                      ?.vehicleNumber ||
                      "N/A"}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-1 text-yellow-500 font-semibold">
                      <Star
                        size={
                          16
                        }
                      />
                      {driver.rating ||
                        5}
                    </div>
                  </td>

                  <td className="p-4 flex gap-3">
                    <button
                      onClick={() =>
                        handleEdit(
                          driver
                        )
                      }
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
                          driver._id
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
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <form
            onSubmit={
              handleSubmit
            }
            className="bg-white w-full max-w-2xl rounded-2xl p-8 space-y-5 relative"
          >
            <button
              type="button"
              onClick={() =>
                setShowModal(
                  false
                )
              }
              className="absolute top-5 right-5"
            >
              <X />
            </button>

            <h2 className="text-4xl font-bold">
              {editingDriver
                ? "Edit Driver"
                : "Add Driver"}
            </h2>

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full p-4 border rounded-xl"
              value={
                form.name
              }
              onChange={
                handleChange
              }
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              className="w-full p-4 border rounded-xl"
              value={
                form.phone
              }
              onChange={
                handleChange
              }
              required
            />

            <input
              type="text"
              name="licenseNumber"
              placeholder="License Number"
              className="w-full p-4 border rounded-xl"
              value={
                form.licenseNumber
              }
              onChange={
                handleChange
              }
              required
            />

            <select
              name="assignedVehicle"
              className="w-full p-4 border rounded-xl"
              value={
                form.assignedVehicle
              }
              onChange={
                handleChange
              }
            >
              <option value="">
                Select Vehicle
              </option>

              {vehicles.map(
                (vehicle) => (
                  <option
                    key={
                      vehicle._id
                    }
                    value={
                      vehicle._id
                    }
                  >
                    {
                      vehicle.vehicleNumber
                    }{" "}
                    -{" "}
                    {
                      vehicle.type
                    }
                  </option>
                )
              )}
            </select>

            <select
              name="rating"
              className="w-full p-4 border rounded-xl"
              value={
                form.rating
              }
              onChange={
                handleChange
              }
            >
              <option value="5">
                ⭐⭐⭐⭐⭐ (5)
              </option>
              <option value="4">
                ⭐⭐⭐⭐ (4)
              </option>
              <option value="3">
                ⭐⭐⭐ (3)
              </option>
              <option value="2">
                ⭐⭐ (2)
              </option>
              <option value="1">
                ⭐ (1)
              </option>
            </select>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() =>
                  setShowModal(
                    false
                  )
                }
                className="p-4 bg-gray-200 rounded-xl"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="p-4 bg-blue-600 text-white rounded-xl"
              >
                {editingDriver
                  ? "Update Driver"
                  : "Add Driver"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Drivers;