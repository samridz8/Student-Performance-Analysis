"""
FastAPI Integration for Student Database
=========================================

This shows how to integrate the SQLite database with your FastAPI backend.
Add these endpoints to your existing FastAPI application.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
import base64

# Import your database functions
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


# ============= REQUEST MODELS =============

class StudentCreate(BaseModel):
    usn: str
    name: str
    age: int
    profile_picture_base64: Optional[str] = None  # Base64 encoded image


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None


# ============= API ENDPOINTS =============

@app.post("/students")
async def create_student(student: StudentCreate):
    """Create a new student"""
    
    # Handle profile picture if provided
    picture_path = None
    if student.profile_picture_base64:
        # Decode base64 and save temporarily
        import tempfile
        picture_data = base64.b64decode(student.profile_picture_base64)
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
        temp_file.write(picture_data)
        temp_file.close()
        picture_path = temp_file.name
    
    student_id = add_student(
        student.usn,
        student.name,
        student.age,
        picture_path
    )
    
    if student_id is None:
        raise HTTPException(status_code=400, detail="Student with this USN already exists")
    
    return {
        "message": "Student created successfully",
        "id": student_id,
        "usn": student.usn
    }


@app.get("/students")
async def list_students():
    """Get all students"""
    students = get_all_students()
    
    return {
        "total": len(students),
        "students": [
            {
                
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
        "id": student[0],
        "usn": student[1],
        "name": student[2],
        "age": student[3],
        "created_at": student[4]
    }


@app.get("/students/{usn}/picture")
async def get_profile_picture(usn: str):
    """Get student's profile picture"""
    image_data = get_student_profile_picture(usn)
    
    if not image_data:
        raise HTTPException(status_code=404, detail="Profile picture not found")
    
    return Response(content=image_data, media_type="image/jpeg")


@app.put("/students/{usn}")
async def update_student_info(usn: str, student: StudentUpdate):
    """Update student information"""
    success = update_student(
        usn,
        name=student.name,
        age=student.age
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return {"message": "Student updated successfully"}


@app.delete("/students/{usn}")
async def remove_student(usn: str):
    """Delete a student"""
    success = delete_student(usn)
    
    if not success:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return {"message": "Student deleted successfully"}


@app.get("/students/search/{name}")
async def search_students(name: str):
    """Search students by name"""
    students = search_students_by_name(name)
    
    return {
        "total": len(students),
        "students": [
            {
                "id": s[0],
                "usn": s[1],
                "name": s[2],
                "age": s[3]
            }
            for s in students
        ]
    }



