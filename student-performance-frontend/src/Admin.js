import React, { useState } from "react";
import "./styles.css";

const ADMIN_API_URL = "http://127.0.0.1:8000/admin/login";

export default function Admin() {
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(ADMIN_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      setMessage({
        type: "success",
        text: "Login successful! Welcome, Admin.",
      });
      setIsLoggedIn(true);
      setAdminEmail(data.email);
      
      // Store login state
      localStorage.setItem("adminLoggedIn", "true");
      localStorage.setItem("adminEmail", data.email);
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.message || "Invalid credentials. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdminEmail("");
    setLoginForm({ email: "", password: "" });
    setMessage(null);
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminEmail");
  };

  // Check if already logged in on component mount
  React.useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn");
    const email = localStorage.getItem("adminEmail");
    if (loggedIn === "true" && email) {
      setIsLoggedIn(true);
      setAdminEmail(email);
    }
  }, []);

  if (isLoggedIn) {
    return (
      <div className="app">
        <div className="wrapper">
          <div className="leftCol">
            <div className="card">
              <div className="headerRow">
                <div>
                  <div className="title">Admin Dashboard</div>
                  <div className="subtitle">Welcome, {adminEmail}</div>
                </div>
                <button className="btnSecondary" onClick={handleLogout}>
                  Logout
                </button>
              </div>

              <div className="adminContent">
                <div className="adminSection">
                  <h3>📊 System Overview</h3>
                  <div className="statGrid">
                    <div className="statCard">
                      <div className="statLabel">Total Students</div>
                      <div className="statValue">--</div>
                    </div>
                    <div className="statCard">
                      <div className="statLabel">Active Records</div>
                      <div className="statValue">--</div>
                    </div>
                    <div className="statCard">
                      <div className="statLabel">Predictions Made</div>
                      <div className="statValue">--</div>
                    </div>
                  </div>
                </div>

                <div className="adminSection">
                  <h3>🔧 Quick Actions</h3>
                  <div className="actionButtons">
                    <button className="actionBtn">View All Students</button>
                    <button className="actionBtn">Generate Reports</button>
                    <button className="actionBtn">System Settings</button>
                  </div>
                </div>

                <div className="adminSection">
                  <h3>📝 Recent Activity</h3>
                  <div className="activityList">
                    <div className="activityItem">
                      <span className="activityIcon">✅</span>
                      <span>System operational - All services running</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rightCol">
            <div className="card sideCard">
              <div className="title">Admin Access</div>
              <div className="sideNote">
                <p>You have full administrative privileges.</p>
                <ul>
                  <li>View all student records</li>
                  <li>Manage database</li>
                  <li>Generate reports</li>
                  <li>System configuration</li>
                </ul>
              </div>
            </div>

            <div className="card sideCard">
              <div className="title">System Status</div>
              <div className="sideNote">
                <div className="statusItem">
                  <span className="statusDot green"></span>
                  <span>Database: Online</span>
                </div>
                <div className="statusItem">
                  <span className="statusDot green"></span>
                  <span>API: Running</span>
                </div>
                <div className="statusItem">
                  <span className="statusDot green"></span>
                  <span>Storage: Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="wrapper">
        <div className="leftCol">
          <div className="card loginCard">
            <div className="headerRow">
              <div>
                <div className="title">Admin Login</div>
                <div className="subtitle">Enter your credentials to continue</div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="loginForm">
              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleInputChange}
                  placeholder="admin@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="actions">
                <button className="btnPrimary" type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>

              {message && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}
            </form>

            <div className="small tip">
              <strong>Demo Credentials:</strong>
              <br />
              Email: admin@example.com
              <br />
              Password: admin123
            </div>
          </div>
        </div>

        <div className="rightCol">
          <div className="card sideCard">
            <div className="title">🔐 Secure Access</div>
            <div className="sideNote">
              <p>Admin login provides access to:</p>
              <ul>
                <li>Student database management</li>
                <li>System analytics</li>
                <li>User management</li>
                <li>Reports & exports</li>
              </ul>
            </div>
          </div>

          <div className="card sideCard">
            <div className="title">Need Help?</div>
            <div className="sideNote">
              <p>Contact system administrator if you've forgotten your credentials.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
