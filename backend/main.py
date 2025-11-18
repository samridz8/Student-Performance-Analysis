"""
Main FastAPI Backend Server
============================
Handles student records, performance prediction, and admin authentication
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
import base64
import tempfile
import os

# Import database functions
from student_operations import (
    add_student,
    get_all_students,
    get_student_by_usn,
    get_student_profile_picture,
    update_student,
    delete_student,
    search_students_by_name
)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= REQUEST/RESPONSE MODELS =============

class StudentCreate(BaseModel):
    usn: str
    name: str
    age: int
    profile_picture_base64: Optional[str] = None

class AdminLogin(BaseModel):
    email: str
    password: str

class StudentLogin(BaseModel):
    usn: str
    password: str

class PredictionInput(BaseModel):
    attendance: float
    internal: float
    assignment: float

# ============= ADMIN ENDPOINTS =============

# Hardcoded admin credentials (in production, use proper authentication)
ADMIN_CREDENTIALS = {
    "admin@example.com": "admin123",
    "test@test.com": "password"
}

# Hardcoded student credentials and data (in production, fetch from database)
STUDENT_DATA = {
    "1CR23AD106": {
        "password": "student123",
        "name": "Samridh Hada",
        "usn": "1CR23AD106",
        "age": 20,
        "profile_picture": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%237c3aed' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='32' fill='white'%3ESH%3C/text%3E%3C/svg%3E",
        "subjects": [
            {
                "name": "Data Structures",
                "code": "CS301",
                "attendance": 85,
                "internal": 22,
                "assignment": 23,
                "totalClasses": 40
            },
            {
                "name": "Operating Systems",
                "code": "CS302",
                "attendance": 90,
                "internal": 20,
                "assignment": 21,
                "totalClasses": 40
            },
            {
                "name": "Database Management",
                "code": "CS303",
                "attendance": 78,
                "internal": 18,
                "assignment": 19,
                "totalClasses": 40
            },
            {
                "name": "Computer Networks",
                "code": "CS304",
                "attendance": 92,
                "internal": 24,
                "assignment": 24,
                "totalClasses": 40
            },
            {
                "name": "Software Engineering",
                "code": "CS305",
                "attendance": 88,
                "internal": 21,
                "assignment": 22,
                "totalClasses": 40
            }
        ]
    },
    "1CR23AD107": {
        "password": "student123",
        "name": "Rahul Kumar",
        "usn": "1CR23AD107",
        "age": 21,
        "profile_picture": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%2310b981' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='32' fill='white'%3ERK%3C/text%3E%3C/svg%3E",
        "subjects": [
            {
                "name": "Data Structures",
                "code": "CS301",
                "attendance": 92,
                "internal": 24,
                "assignment": 24,
                "totalClasses": 40
            },
            {
                "name": "Operating Systems",
                "code": "CS302",
                "attendance": 88,
                "internal": 22,
                "assignment": 23,
                "totalClasses": 40
            },
            {
                "name": "Database Management",
                "code": "CS303",
                "attendance": 85,
                "internal": 21,
                "assignment": 22,
                "totalClasses": 40
            },
            {
                "name": "Computer Networks",
                "code": "CS304",
                "attendance": 90,
                "internal": 23,
                "assignment": 24,
                "totalClasses": 40
            },
            {
                "name": "Software Engineering",
                "code": "CS305",
                "attendance": 87,
                "internal": 20,
                "assignment": 21,
                "totalClasses": 40
            }
        ]
    },
    "1CR23AD108": {
        "password": "student123",
        "name": "Priya Sharma",
        "usn": "1CR23AD108",
        "age": 19,
        "profile_picture": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23f59e0b' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='32' fill='white'%3EPS%3C/text%3E%3C/svg%3E",
        "subjects": [
            {
                "name": "Data Structures",
                "code": "CS301",
                "attendance": 95,
                "internal": 25,
                "assignment": 25,
                "totalClasses": 40
            },
            {
                "name": "Operating Systems",
                "code": "CS302",
                "attendance": 93,
                "internal": 24,
                "assignment": 24,
                "totalClasses": 40
            },
            {
                "name": "Database Management",
                "code": "CS303",
                "attendance": 91,
                "internal": 23,
                "assignment": 24,
                "totalClasses": 40
            },
            {
                "name": "Computer Networks",
                "code": "CS304",
                "attendance": 94,
                "internal": 25,
                "assignment": 25,
                "totalClasses": 40
            },
            {
                "name": "Software Engineering",
                "code": "CS305",
                "attendance": 96,
                "internal": 24,
                "assignment": 25,
                "totalClasses": 40
            }
        ]
    }
}

@app.post("/admin/login")
async def admin_login(credentials: AdminLogin):
    """Admin login endpoint"""
    email = credentials.email
    password = credentials.password
    
    if email in ADMIN_CREDENTIALS and ADMIN_CREDENTIALS[email] == password:
        return {
            "success": True,
            "message": "Login successful",
            "email": email
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid email or password")

# ============= STUDENT ENDPOINTS =============

@app.post("/student/login")
async def student_login(credentials: StudentLogin):
    """Student login endpoint"""
    usn = credentials.usn.upper()
    password = credentials.password
    
    if usn in STUDENT_DATA and STUDENT_DATA[usn]["password"] == password:
        student_info = STUDENT_DATA[usn].copy()
        student_info.pop("password")  # Don't send password back
        return {
            "success": True,
            "message": "Login successful",
            "student": student_info
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid USN or password")

@app.get("/student/performance/{usn}")
async def get_student_performance(usn: str):
    """Get student performance data"""
    usn = usn.upper()
    
    if usn in STUDENT_DATA:
        student_info = STUDENT_DATA[usn].copy()
        student_info.pop("password")
        return {
            "success": True,
            "student": student_info
        }
    else:
        raise HTTPException(status_code=404, detail="Student not found")

# ============= STUDENT REGISTRATION ENDPOINTS =============

@app.post("/students")
async def create_student(student: StudentCreate):
    """Create a new student"""
    
    # Handle profile picture if provided
    picture_path = None
    if student.profile_picture_base64:
        try:
            # Decode base64 and save temporarily
            picture_data = base64.b64decode(student.profile_picture_base64)
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
            temp_file.write(picture_data)
            temp_file.close()
            picture_path = temp_file.name
        except Exception as e:
            print(f"Error processing image: {e}")
    
    student_id = add_student(
        student.usn,
        student.name,
        student.age,
        picture_path
    )
    
    # Clean up temp file
    if picture_path and os.path.exists(picture_path):
        try:
            os.unlink(picture_path)
        except:
            pass
    
    if student_id is None:
        raise HTTPException(status_code=400, detail="Student with this USN already exists")
    
    return {
        "success": True,
        "message": "Student created successfully",
        "id": student_id,
        "usn": student.usn
    }

@app.get("/students")
async def list_students():
    """Get all students"""
    students = get_all_students()
    
    return {
        "success": True,
        "total": len(students),
        "students": [
            {
                "id": s[0],
                "usn": s[1],
                "name": s[2],
                "age": s[3],
                "created_at": s[4]
            }
            for s in students
        ]
    }

@app.get("/students/{usn}")
async def get_student(usn: str):
    """Get a specific student by USN"""
    student = get_student_by_usn(usn)
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return {
        "success": True,
        "student": {
            "id": student[0],
            "usn": student[1],
            "name": student[2],
            "age": student[3],
            "created_at": student[4]
        }
    }

@app.delete("/students/{usn}")
async def remove_student(usn: str):
    """Delete a student"""
    success = delete_student(usn)
    
    if not success:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return {"success": True, "message": "Student deleted successfully"}

# ============= PREDICTION ENDPOINT (Your existing one) =============

@app.post("/predict")
async def predict_performance(data: PredictionInput):
    """Predict student performance"""
    # Simple prediction logic (replace with your actual model)
    score = (data.attendance * 0.4 + data.internal * 2 + data.assignment * 2)
    
    if score >= 75:
        risk_level = "Low"
    elif score >= 50:
        risk_level = "Medium"
    else:
        risk_level = "High"
    
    return {
        "predicted_score": round(score, 2),
        "risk_level": risk_level,
        "attendance": data.attendance,
        "internal": data.internal,
        "assignment": data.assignment
    }

# ============= HEALTH CHECK =============

@app.get("/")
async def root():
    return {
        "message": "Student Performance API",
        "status": "running",
        "endpoints": [
            "/admin/login",
            "/students",
            "/predict"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
