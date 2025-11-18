# SQLite Database Tutorial for Student Records
## Complete Step-by-Step Guide

---

## 📚 What You'll Learn
- How to create a SQLite database
- Store student data (name, USN, age, profile picture)
- Perform CRUD operations (Create, Read, Update, Delete)
- Integrate with FastAPI

---

## 🎯 Step 1: Understanding the Database Structure

Your `database.py` file creates a table with this structure:

```
students table:
├── id (auto-incremented number)
├── usn (unique student number, like "1MS21CS001")
├── name (student's full name)
├── age (student's age)
├── profile_picture (image stored as binary data)
└── created_at (timestamp when record was created)
```

---

## 🚀 Step 2: Try It Out!

### Method 1: Run the Tutorial Script

```bash
cd /Users/samridz/hackathon/backend
python student_operations.py
```

This will:
- Create the database file `students.db`
- Add 3 sample students
- Show you all the operations in action

### Method 2: Use Python Interactively

```bash
cd /Users/samridz/hackathon/backend
python
```

Then type:

```python
from student_operations import *

# Add a student
add_student("1MS21CS001", "John Doe", 20)

# View all students
get_all_students()

# Find a specific student
get_student_by_usn("1MS21CS001")

# Update a student
update_student("1MS21CS001", age=21)

# Search by name
search_students_by_name("John")
```

---

## 📸 Step 3: Working with Profile Pictures

### Adding a Student with Profile Picture

```python
from student_operations import add_student

# Make sure you have an image file first
add_student(
    usn="1MS21CS001",
    name="Rahul Kumar", 
    age=20,
    profile_picture_path="/path/to/image.jpg"  # Change this to your image path
)
```

### Getting a Profile Picture

```python
from student_operations import get_student_profile_picture

# Save the profile picture to a file
get_student_profile_picture(
    usn="1MS21CS001",
    save_path="output_image.jpg"
)
```

---

## 🔧 Step 4: Common Operations Explained

### CREATE - Adding Students

```python
add_student(usn, name, age, profile_picture_path=None)
```
- **usn**: Unique ID (must be unique!)
- **name**: Full name as text
- **age**: Number
- **profile_picture_path**: Optional path to image

### READ - Getting Students

```python
# Get all students
get_all_students()

# Get one student by USN
get_student_by_usn("1MS21CS001")

# Search by name (partial match works!)
search_students_by_name("Rahul")
```

### UPDATE - Modifying Students

```python
# Update only the fields you want to change
update_student("1MS21CS001", name="New Name")
update_student("1MS21CS001", age=22)
update_student("1MS21CS001", name="New Name", age=22)
```

### DELETE - Removing Students

```python
delete_student("1MS21CS001")
```

---

## 🌐 Step 5: Using with FastAPI (Advanced)

If you want to add these endpoints to your existing FastAPI server:

1. **Look at your existing FastAPI file** (probably in `/Users/samridz/hackathon/backend/`)

2. **Import the functions** at the top:
```python
from student_operations import (
    add_student, get_all_students, get_student_by_usn
)
```

3. **Add endpoints** like this:
```python
@app.get("/students")
def list_all_students():
    students = get_all_students()
    return {"students": students}

@app.post("/students/add")
def create_new_student(usn: str, name: str, age: int):
    student_id = add_student(usn, name, age)
    return {"id": student_id, "message": "Student added"}
```

---

## 💡 Quick Reference

### File Structure
```
backend/
├── database.py              # Creates the database
├── student_operations.py    # Functions to use the database
├── fastapi_integration.py   # FastAPI example (optional)
└── students.db             # The actual database (created automatically)
```

### Important Notes

1. **USN must be unique** - You can't add two students with the same USN
2. **Images are stored as BLOB** - Binary data inside the database
3. **Database is created automatically** - Just import and use!
4. **The `.db` file is your database** - Back it up to keep your data safe

---

## 🎓 Practice Exercises

Try these to learn:

1. Add yourself as a student
2. Add 5 of your classmates
3. Search for students by name
4. Update one student's age
5. Delete a test student
6. Add a student with a profile picture

---

## 🆘 Troubleshooting

**Error: "Student with USN already exists"**
- USN must be unique. Use a different USN or delete the existing one first.

**Error: "No such file or directory"**
- Make sure you're in the `/Users/samridz/hackathon/backend` directory
- Check that the image path exists if adding a profile picture

**Database location**
- The database file is at: `/Users/samridz/hackathon/backend/students.db`
- You can open it with any SQLite browser tool

---

## 📖 Next Steps

1. Run `python student_operations.py` to see it in action
2. Try adding your own students in Python
3. Integrate with your FastAPI backend
4. Create a form in React to add students from the frontend

Happy coding! 🚀
