import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  const menuStyle = ({ isActive }) => ({
    padding: "12px 16px",
    borderRadius: "10px",
    textDecoration: "none",
    color: isActive ? "#fff" : "#334155",
    background: isActive ? "#4f46e5" : "transparent",
    fontWeight: 600,
    transition: "0.2s",
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "270px",
          background: "#ffffff",
          borderRight: "1px solid #e5e7eb",
          padding: "24px 18px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2
            style={{
              marginBottom: "28px",
              fontSize: "28px",
              color: "#111827",
            }}
          >
            FleetPro
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <NavLink to="/" style={menuStyle}>Dashboard</NavLink>

            {isAdmin ? (
              <>
                <NavLink to="/vehicles" style={menuStyle}>Vehicles</NavLink>
                <NavLink to="/drivers" style={menuStyle}>Drivers</NavLink>
                <NavLink to="/trips" style={menuStyle}>Trips</NavLink>
                <NavLink to="/maintenance" style={menuStyle}>Maintenance</NavLink>
                <NavLink to="/reports" style={menuStyle}>Reports</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/trips" style={menuStyle}>My Trips</NavLink>
                <NavLink to="/profile" style={menuStyle}>My Profile</NavLink>
              </>
            )}
          </div>
        </div>

        {/* User Card */}
        <div
          style={{
            padding: "16px",
            borderRadius: "14px",
            background: "#eef2ff",
          }}
        >
          <h4 style={{ margin: 0 }}>{user?.name}</h4>
          <p style={{ margin: "6px 0", color: "#475569" }}>{user?.email}</p>
          <span
            style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: "30px",
              background: "#4f46e5",
              color: "#fff",
              fontSize: "12px",
            }}
          >
            {user?.role}
          </span>

          <button
            onClick={handleLogout}
            style={{
              marginTop: "14px",
              width: "100%",
              padding: "10px",
              border: "none",
              borderRadius: "10px",
              background: "#ef4444",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Page */}
      <main style={{ flex: 1, padding: "28px" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;