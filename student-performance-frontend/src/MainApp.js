import React, { useState } from "react";
import StudentRegistration from "./StudentRegistration";
import StudentPortal from "./StudentPortal";
import Admin from "./Admin";
import "./styles.css";

export default function MainApp() {
  const [activeTab, setActiveTab] = useState("registration");

  return (
    <div>
      <div className="tabBar">
        <button
          className={`tab ${activeTab === "registration" ? "active" : ""}`}
          onClick={() => setActiveTab("registration")}
        >
          📝 Student Registration
        </button>
        <button
          className={`tab ${activeTab === "portal" ? "active" : ""}`}
          onClick={() => setActiveTab("portal")}
        >
          🎓 Student Portal
        </button>
        <button
          className={`tab adminTab ${activeTab === "admin" ? "active" : ""}`}
          onClick={() => setActiveTab("admin")}
        >
          🔐 Admin
        </button>
      </div>

      {activeTab === "registration" ? (
        <StudentRegistration />
      ) : activeTab === "portal" ? (
        <StudentPortal />
      ) : (
        <Admin />
      )}
    </div>
  );
}
