import React, { useState } from "react";
import "./styles.css";

const STUDENT_LOGIN_URL = "http://127.0.0.1:8000/student/login";
const STUDENT_DATA_URL = "http://127.0.0.1:8000/student/performance";

export default function StudentPortal() {
  const [loginForm, setLoginForm] = useState({
    usn: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [expandedSubject, setExpandedSubject] = useState(null);

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
      const res = await fetch(STUDENT_LOGIN_URL, {
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
        text: "Login successful!",
      });
      setIsLoggedIn(true);
      setStudentData(data.student);
      
      // Store login state
      localStorage.setItem("studentLoggedIn", "true");
      localStorage.setItem("studentUSN", data.student.usn);
      localStorage.setItem("studentData", JSON.stringify(data.student));
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
    setStudentData(null);
    setLoginForm({ usn: "", password: "" });
    setMessage(null);
    setExpandedSubject(null);
    localStorage.removeItem("studentLoggedIn");
    localStorage.removeItem("studentUSN");
    localStorage.removeItem("studentData");
  };

  const toggleSubject = (subjectName) => {
    setExpandedSubject(expandedSubject === subjectName ? null : subjectName);
  };

  // Check if already logged in on component mount
  React.useEffect(() => {
    const loggedIn = localStorage.getItem("studentLoggedIn");
    const data = localStorage.getItem("studentData");
    if (loggedIn === "true" && data) {
      setIsLoggedIn(true);
      setStudentData(JSON.parse(data));
    }
  }, []);

  if (isLoggedIn && studentData) {
    const totalAttendance = studentData.subjects.reduce((sum, sub) => sum + sub.attendance, 0) / studentData.subjects.length;

    return (
      <div className="app">
        <div className="wrapper">
          <div className="leftCol">
            <div className="card">
              <div className="headerRow">
                <div className="studentHeader">
                  {studentData.profile_picture && (
                    <img 
                      src={studentData.profile_picture} 
                      alt="Profile" 
                      className="profilePic"
                    />
                  )}
                  <div>
                    <div className="title">{studentData.name}</div>
                    <div className="subtitle">USN: {studentData.usn}</div>
                  </div>
                </div>
                <button className="btnSecondary" onClick={handleLogout}>
                  Logout
                </button>
              </div>

              <div className="overallStats">
                <div className="statCard">
                  <div className="statLabel">Overall Attendance</div>
                  <div className="statValue">{totalAttendance.toFixed(1)}%</div>
                </div>
                <div className="statCard">
                  <div className="statLabel">Age</div>
                  <div className="statValue">{studentData.age}</div>
                </div>
              </div>

              <div className="subjectsSection">
                <h3>📚 Subject Performance</h3>
                
                {studentData.subjects.map((subject, index) => (
                  <div key={index} className="subjectCard">
                    <div 
                      className="subjectHeader"
                      onClick={() => toggleSubject(subject.name)}
                    >
                      <div className="subjectInfo">
                        <span className="subjectName">{subject.name}</span>
                        <span className="subjectCode">{subject.code}</span>
                      </div>
                      <div className="attendanceCircle">
                        <span className="attendanceValue">{subject.attendance}%</span>
                      </div>
                    </div>

                    {expandedSubject === subject.name && (
                      <div className="subjectDetails">
                        <div className="detailRow">
                          <span className="detailLabel">Internal Marks:</span>
                          <span className="detailValue">{subject.internal}/25</span>
                        </div>
                        <div className="detailRow">
                          <span className="detailLabel">Assignment Score:</span>
                          <span className="detailValue">{subject.assignment}/25</span>
                        </div>
                        <div className="detailRow">
                          <span className="detailLabel">Total Classes:</span>
                          <span className="detailValue">{subject.totalClasses || 40}</span>
                        </div>
                        <div className="detailRow">
                          <span className="detailLabel">Classes Attended:</span>
                          <span className="detailValue">
                            {Math.round((subject.attendance / 100) * (subject.totalClasses || 40))}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rightCol">
            <div className="card sideCard">
              <div className="title">Performance Summary</div>
              <div className="sideNote">
                <div className="summaryItem">
                  <span>Total Subjects:</span>
                  <strong>{studentData.subjects.length}</strong>
                </div>
                <div className="summaryItem">
                  <span>Avg Internal:</span>
                  <strong>
                    {(studentData.subjects.reduce((sum, s) => sum + s.internal, 0) / studentData.subjects.length).toFixed(1)}/25
                  </strong>
                </div>
                <div className="summaryItem">
                  <span>Avg Assignment:</span>
                  <strong>
                    {(studentData.subjects.reduce((sum, s) => sum + s.assignment, 0) / studentData.subjects.length).toFixed(1)}/25
                  </strong>
                </div>
              </div>
            </div>

            <div className="card sideCard">
              <div className="title">💡 Tips</div>
              <div className="sideNote">
                <p>Click on any subject's attendance percentage to view detailed performance metrics.</p>
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
                <div className="title">Student Login</div>
                <div className="subtitle">Access your performance dashboard</div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="loginForm">
              <div className="field">
                <label>USN (University Seat Number)</label>
                <input
                  type="text"
                  name="usn"
                  value={loginForm.usn}
                  onChange={handleInputChange}
                  placeholder="e.g. 1CR23AD106"
                  required
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
              USN: 1CR23AD106 (Samridh Hada)
              <br />
              USN: 1CR23AD107 (Rahul Kumar)
              <br />
              USN: 1CR23AD108 (Priya Sharma)
              <br />
              Password: student123 (for all)
            </div>
          </div>
        </div>

        <div className="rightCol">
          <div className="card sideCard">
            <div className="title">🎓 Student Portal</div>
            <div className="sideNote">
              <p>View your academic performance:</p>
              <ul>
                <li>Attendance tracking</li>
                <li>Internal marks</li>
                <li>Assignment scores</li>
                <li>Subject-wise breakdown</li>
              </ul>
            </div>
          </div>

          <div className="card sideCard">
            <div className="title">Need Help?</div>
            <div className="sideNote">
              <p>Contact your faculty advisor if you've forgotten your credentials.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
