import { useState } from "react";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    alert(`${isLogin ? "Login" : "Register"} as ${form.role}`);
  };

  return (
    <div className="loginPage">
      <div className="loginBox">

        <h1>FleetPro</h1>
        <p>Fleet Management System</p>

        {!isLogin && (
          <>
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter Full Name"
              onChange={handleChange}
            />
          </>
        )}

        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          onChange={handleChange}
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          onChange={handleChange}
        />

        <label>Select Role</label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button onClick={handleSubmit}>
          {isLogin ? "Login" : "Register"}
        </button>

        <p
          className="switchText"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "No account? Register"
            : "Already have account? Login"}
        </p>

      </div>
    </div>
  );
}

export default App;