import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Truck, Eye, EyeOff, UserCog } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      /* ================= LOGIN ================= */
      if (isLogin) {
        const res = await login(formData.email, formData.password);

        const loggedUser =
          res?.user || JSON.parse(localStorage.getItem("user"));

        if (!loggedUser) {
          toast.error("User data not found");
          setLoading(false);
          return;
        }

        if (loggedUser.role !== formData.role) {
          toast.error(`This account is registered as ${loggedUser.role}`);
          setLoading(false);
          return;
        }

        toast.success("Login successful!");
        navigate("/");
      } else {

      /* ================= REGISTER ================= */
        await register(
          formData.name,
          formData.email,
          formData.password,
          formData.role,
        );

        toast.success("Registration successful! Please login.");

        setIsLogin(true);

        setFormData({
          name: "",
          email: "",
          password: "",
          role: "user",
        });
      }
    } catch (error) {
      console.log(error.response?.data);

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.msg ||
          "Signup failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-white/15 mx-auto flex items-center justify-center mb-4">
              <Truck className="text-white w-10 h-10" />
            </div>

            <h1 className="text-4xl font-bold text-white">FleetPro</h1>

            <p className="text-white/80 mt-2">Fleet Management System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="text-white block mb-1">Full Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-xl bg-white/80 outline-none"
                  placeholder="Enter full name"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-white block mb-1">Email</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-xl bg-white/80 outline-none"
                placeholder="Enter email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-white block mb-1">Password</label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-xl bg-white/80 outline-none"
                  placeholder="Enter password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Role Selection for BOTH Login + Signup */}
            <div>
              <label className="text-white block mb-1">
                {isLogin ? "Login As" : "Register As"}
              </label>

              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-white/80 text-black outline-none appearance-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>

                <UserCog
                  className="absolute right-4 top-4 text-gray-600"
                  size={18}
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-purple-700 font-bold py-3 rounded-xl hover:scale-[1.02] transition"
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          {/* Toggle */}
          <div className="text-center mt-6 text-white">
            <button onClick={() => setIsLogin(!isLogin)}>
              {isLogin
                ? "Don't have account? Sign Up"
                : "Already have account? Sign In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
