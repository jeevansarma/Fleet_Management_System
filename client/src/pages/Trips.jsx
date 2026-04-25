import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  Star,
} from "lucide-react";

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] =
    useState([]);
  const [vehicles, setVehicles] =
    useState([]);

  const [search, setSearch] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);
  const [editingTrip, setEditingTrip] =
    useState(null);

  const token =
    localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const isAdmin =
    user?.role === "admin";

  const canSchedule =
    user?.role === "admin" ||
    user?.role === "user";

  const emptyForm = {
    source: "",
    destination: "",
    distance: "",
    assignedDriver: "",
    assignedVehicle: "",
    status: "scheduled",
    driverRating: 5,
    price: 0,
  };

  const [form, setForm] =
    useState(emptyForm);

  useEffect(() => {
    fetchTrips();
    fetchDrivers();
    fetchVehicles();
  }, []);

  /* ================= FETCH ================= */

  const fetchTrips = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/trips",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTrips(res.data);
    } catch {
      toast.error(
        "Failed to load trips"
      );
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/drivers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDrivers(res.data);
    } catch {}
  };

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/vehicles",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setVehicles(res.data);
    } catch {}
  };

  /* ================= HELPERS ================= */

  const getVehicle = (id) =>
    vehicles.find(
      (v) => v._id === id
    );

  const calculatePrice = (
    vehicleId = form.assignedVehicle,
    distance = form.distance
  ) => {
    const vehicle =
      getVehicle(vehicleId);

    const km =
      Number(distance) || 0;

    if (!vehicle || km <= 0)
      return 0;

    let rate = 15;

    if (vehicle.type === "car")
      rate = 18;

    if (vehicle.type === "van")
      rate = 22;

    if (vehicle.type === "truck")
      rate = 35;

    return km * rate;
  };

  /* ================= INPUT ================= */

  const handleChange = (e) => {
    const { name, value } =
      e.target;

    const updated = {
      ...form,
      [name]: value,
    };

    updated.price =
      calculatePrice(
        updated.assignedVehicle,
        updated.distance
      );

    setForm(updated);
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        distance:
          Number(
            form.distance
          ) || 0,
        price:
          calculatePrice(),
      };

      if (editingTrip) {
        await axios.put(
          `http://localhost:5000/api/trips/${editingTrip._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success(
          "Trip updated"
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/trips",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success(
          "Trip added"
        );
      }

      setShowModal(false);
      setEditingTrip(null);
      setForm(emptyForm);

      fetchTrips();
    } catch {
      toast.error(
        "Something went wrong"
      );
    }
  };

  /* ================= EDIT ================= */

  const handleEdit = (trip) => {
    const driverId =
      trip.assignedDriver?._id ||
      trip.assignedDriver ||
      "";

    const vehicleId =
      trip.assignedVehicle?._id ||
      trip.assignedVehicle ||
      "";

    setEditingTrip(trip);

    setForm({
      source:
        trip.source || "",
      destination:
        trip.destination ||
        "",
      distance:
        trip.distance || "",
      assignedDriver:
        driverId,
      assignedVehicle:
        vehicleId,
      status:
        trip.status ||
        "scheduled",
      driverRating:
        trip.driverRating ||
        trip
          .assignedDriver
          ?.rating ||
        5,
      price:
        trip.price || 0,
    });

    setShowModal(true);
  };

  /* ================= DELETE ================= */

  const handleDelete =
    async (id) => {
      try {
        await axios.delete(
          `http://localhost:5000/api/trips/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success(
          "Trip deleted"
        );

        fetchTrips();
      } catch {
        toast.error(
          "Delete failed"
        );
      }
    };

  /* ================= FILTER ================= */

  const filteredTrips =
    trips.filter((trip) => {
      const route =
        `${trip.source} ${trip.destination}`.toLowerCase();

      const matchSearch =
        route.includes(
          search.toLowerCase()
        );

      const matchStatus =
        statusFilter === ""
          ? true
          : trip.status ===
            statusFilter;

      return (
        matchSearch &&
        matchStatus
      );
    });

  const badge = (status) => {
    if (
      status === "completed"
    )
      return "bg-green-100 text-green-700";

    if (
      status ===
      "in_progress"
    )
      return "bg-blue-100 text-blue-700";

    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex justify-between mb-8">
        <h1 className="text-5xl font-bold">
          Trips
        </h1>

        {canSchedule && (
          <button
            onClick={() => {
              setEditingTrip(
                null
              );
              setForm(
                emptyForm
              );
              setShowModal(
                true
              );
            }}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2"
          >
            <Plus size={18} />
            Add Trip
          </button>
        )}
      </div>

      {/* FILTER */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <input
          placeholder="Search trips..."
          className="p-4 border rounded-xl"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        <select
          className="p-4 border rounded-xl"
          value={
            statusFilter
          }
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
        >
          <option value="">
            All Status
          </option>

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

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">
                Route
              </th>

              <th className="p-4 text-left">
                Driver
              </th>

              <th className="p-4 text-left">
                Vehicle
              </th>

              <th className="p-4 text-left">
                Price
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              {isAdmin && (
                <th className="p-4 text-left">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {filteredTrips.map(
              (trip) => (
                <tr
                  key={
                    trip._id
                  }
                  className="border-t"
                >
                  <td className="p-4">
                    <div className="font-semibold">
                      {
                        trip.source
                      }
                    </div>
                    <div className="text-gray-500">
                      →
                      {
                        trip.destination
                      }
                    </div>
                  </td>

                  <td className="p-4">
                    <div>
                      {trip
                        .assignedDriver
                        ?.name ||
                        "N/A"}
                    </div>

                    <div className="flex items-center gap-1 text-yellow-500 text-sm">
                      <Star size={14} />
                      {trip.driverRating ||
                        trip
                          .assignedDriver
                          ?.rating ||
                        5}
                    </div>
                  </td>

                  <td className="p-4">
                    {trip
                      .assignedVehicle
                      ?.vehicleNumber ||
                      "N/A"}
                  </td>

                  <td className="p-4 font-bold text-green-600">
                    ₹
                    {trip.price ||
                      0}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full ${badge(
                        trip.status
                      )}`}
                    >
                      {
                        trip.status
                      }
                    </span>
                  </td>

                  {isAdmin && (
                    <td className="p-4 flex gap-3">
                      <button
                        onClick={() =>
                          handleEdit(
                            trip
                          )
                        }
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            trip._id
                          )
                        }
                        className="text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  )}
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
            className="bg-white w-full max-w-2xl rounded-2xl p-8 space-y-4"
          >
            <h2 className="text-4xl font-bold">
              {editingTrip
                ? "Edit Trip"
                : "Add Trip"}
            </h2>

            <input
              name="source"
              placeholder="Source"
              className="w-full p-4 border rounded-xl"
              value={
                form.source
              }
              onChange={
                handleChange
              }
              required
            />

            <input
              name="destination"
              placeholder="Destination"
              className="w-full p-4 border rounded-xl"
              value={
                form.destination
              }
              onChange={
                handleChange
              }
              required
            />

            <input
              name="distance"
              placeholder="Distance in KM"
              className="w-full p-4 border rounded-xl"
              value={
                form.distance
              }
              onChange={
                handleChange
              }
              required
            />

            <select
              name="assignedDriver"
              className="w-full p-4 border rounded-xl"
              value={
                form.assignedDriver
              }
              onChange={
                handleChange
              }
              required
            >
              <option value="">
                Select Driver
              </option>

              {drivers.map(
                (d) => (
                  <option
                    key={
                      d._id
                    }
                    value={
                      d._id
                    }
                  >
                    {
                      d.name
                    }{" "}
                    ⭐
                    {d.rating ||
                      5}
                  </option>
                )
              )}
            </select>

            <select
              name="assignedVehicle"
              className="w-full p-4 border rounded-xl"
              value={
                form.assignedVehicle
              }
              onChange={
                handleChange
              }
              required
            >
              <option value="">
                Select Vehicle
              </option>

              {vehicles.map(
                (v) => (
                  <option
                    key={
                      v._id
                    }
                    value={
                      v._id
                    }
                  >
                    {
                      v.vehicleNumber
                    }{" "}
                    -{" "}
                    {
                      v.type
                    }
                  </option>
                )
              )}
            </select>

            {isAdmin && (
              <select
                name="status"
                className="w-full p-4 border rounded-xl"
                value={
                  form.status
                }
                onChange={
                  handleChange
                }
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
            )}

            <div className="bg-gray-100 rounded-xl p-4 text-xl font-bold text-green-600">
              Trip Price: ₹
              {calculatePrice()}
            </div>

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
                {editingTrip
                  ? "Update"
                  : "Add Trip"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Trips;