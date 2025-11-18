import React, { useState } from "react";
import "./styles.css";

const STUDENT_API_URL = "http://127.0.0.1:8000/students";

export default function StudentRegistration() {
  const [studentForm, setStudentForm] = useState({
    name: "",
    usn: "",
    age: "",
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Convert image to base64 if exists
      let imageBase64 = null;
      if (profilePicture) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onloadend = () => {
            // Remove the "data:image/xxx;base64," prefix
            const base64 = reader.result.split(",")[1];
            resolve(base64);
          };
          reader.readAsDataURL(profilePicture);
        });
      }

      const payload = {
        usn: studentForm.usn,
        name: studentForm.name,
        age: parseInt(studentForm.age),
        profile_picture_base64: imageBase64,
      };

      const res = await fetch(STUDENT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to add student");
      }

      const data = await res.json();
      setMessage({
        type: "success",
        text: `Student ${data.usn} added successfully!`,
      });

      // Reset form
      setStudentForm({ name: "", usn: "", age: "" });
      setProfilePicture(null);
      setPreviewImage(null);
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.message || "Could not add student. Check backend connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="wrapper">
        <div className="leftCol">
          <div className="card">
            <div className="headerRow">
              <div>
                <div className="title">Student Registration</div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="formRow">
                <div className="field">
                  
                  <input
                    name="name"
                    value={studentForm.name}
                    onChange={handleInputChange}
                    placeholder="Enter Full Name"
                    required
                  />
                </div>

                <div className="field">
                  <input
                    name="usn"
                    value={studentForm.usn}
                    onChange={handleInputChange}
                    placeholder="Enter USN"
                    required
                  />
                </div>

                <div className="field">
                  <input
                    name="age"
                    type="number"
                    value={studentForm.age}
                    onChange={handleInputChange}
                    placeholder="Enter Age"
                    min="15"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div className="formRow">
                <div className="field fullWidth">
                  <label>Profile Picture (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="fileInput"
                  />
                  {previewImage && (
                    <div className="imagePreview">
                      <img src={previewImage} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className="actions">
                <button className="btnPrimary" type="submit" disabled={loading}>
                  {loading ? "Adding Student..." : "Add Student"}
                </button>
              </div>

              {message && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}
            </form>

            <div className="small tip">
              Fill in student details and optionally upload a profile picture.
            </div>
          </div>
        </div>

        <div className="rightCol">
          <div className="card sideCard">
            <div className="title">Instructions</div>
            <div className="sideNote">
              <p>📝 Enter student information:</p>
              <ul>
                <li>Full name</li>
                <li>USN</li>
                <li>Age</li>
                <li>Profile picture</li>
              </ul>
            
            </div>
          </div>

         
        </div>
      </div>
    </div>
  );
}
