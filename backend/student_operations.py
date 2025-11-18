"""
Student Database Operations Tutorial
=====================================

This file shows you how to perform CRUD operations (Create, Read, Update, Delete)
on the students database.
"""

import sqlite3
from database import get_connection, DB_FILE
import base64
from pathlib import Path


# ============= CREATE OPERATIONS =============

def add_student(usn, name, age, profile_picture_path=None):
    """
    Add a new student to the database
    
    Args:
        usn: Unique Student Number (like "1MS21CS001")
        name: Student's full name
        age: Student's age
        profile_picture_path: Path to image file (optional)
    
    Returns:
        The ID of the newly created student
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    # Read the image file if provided
    profile_pic_data = None
    if profile_picture_path:
        with open(profile_picture_path, 'rb') as f:
            profile_pic_data = f.read()
    
    try:
        cursor.execute("""
            INSERT INTO students (usn, name, age, profile_picture)
            VALUES (?, ?, ?, ?)
        """, (usn, name, age, profile_pic_data))
        
        conn.commit()
        student_id = cursor.lastrowid
        print(f"✅ Student added successfully! ID: {student_id}")
        return student_id
        
    except sqlite3.IntegrityError:
        print(f"❌ Error: Student with USN '{usn}' already exists!")
        return None
        
    finally:
        conn.close()


# ============= READ OPERATIONS =============

def get_all_students():
    """Get all students from the database (without images for speed)"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, usn, name, age, created_at 
        FROM students
        ORDER BY created_at DESC
    """)
    
    students = cursor.fetchall()
    conn.close()
    
    print(f"\n📚 Total students: {len(students)}")
    for student in students:
        print(f"  ID: {student[0]} | USN: {student[1]} | Name: {student[2]} | Age: {student[3]}")
    
    return students


def get_student_by_usn(usn):
    """Get a specific student by their USN"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, usn, name, age, created_at
        FROM students
        WHERE usn = ?
    """, (usn,))
    
    student = cursor.fetchone()
    conn.close()
    
    if student:
        print(f"\n👤 Found student:")
        print(f"   USN: {student[1]}")
        print(f"   Name: {student[2]}")
        print(f"   Age: {student[3]}")
        return student
    else:
        print(f"❌ No student found with USN: {usn}")
        return None


def get_student_profile_picture(usn, save_path=None):
    """
    Get a student's profile picture
    
    Args:
        usn: Student's USN
        save_path: Where to save the image (optional)
    
    Returns:
        The image data as bytes
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT profile_picture
        FROM students
        WHERE usn = ?
    """, (usn,))
    
    result = cursor.fetchone()
    conn.close()
    
    if result and result[0]:
        image_data = result[0]
        
        # Save to file if path provided
        if save_path:
            with open(save_path, 'wb') as f:
                f.write(image_data)
            print(f"✅ Profile picture saved to: {save_path}")
        
        return image_data
    else:
        print(f"❌ No profile picture found for USN: {usn}")
        return None


# ============= UPDATE OPERATIONS =============

def update_student(usn, name=None, age=None, profile_picture_path=None):
    """
    Update student information
    
    Args:
        usn: Student's USN (to identify which student)
        name: New name (optional)
        age: New age (optional)
        profile_picture_path: New image path (optional)
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    # Build the update query dynamically based on what's provided
    updates = []
    params = []
    
    if name:
        updates.append("name = ?")
        params.append(name)
    
    if age:
        updates.append("age = ?")
        params.append(age)
    
    if profile_picture_path:
        with open(profile_picture_path, 'rb') as f:
            image_data = f.read()
        updates.append("profile_picture = ?")
        params.append(image_data)
    
    if not updates:
        print("❌ No fields to update!")
        return False
    
    # Add USN to params for the WHERE clause
    params.append(usn)
    
    query = f"UPDATE students SET {', '.join(updates)} WHERE usn = ?"
    cursor.execute(query, params)
    
    conn.commit()
    rows_affected = cursor.rowcount
    conn.close()
    
    if rows_affected > 0:
        print(f"✅ Student {usn} updated successfully!")
        return True
    else:
        print(f"❌ No student found with USN: {usn}")
        return False


# ============= DELETE OPERATIONS =============

def delete_student(usn):
    """Delete a student from the database"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM students WHERE usn = ?", (usn,))
    
    conn.commit()
    rows_affected = cursor.rowcount
    conn.close()
    
    if rows_affected > 0:
        print(f"✅ Student {usn} deleted successfully!")
        return True
    else:
        print(f"❌ No student found with USN: {usn}")
        return False


# ============= SEARCH OPERATIONS =============

def search_students_by_name(name_pattern):
    """Search students by name (partial match)"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, usn, name, age
        FROM students
        WHERE name LIKE ?
        ORDER BY name
    """, (f"%{name_pattern}%",))
    
    students = cursor.fetchall()
    conn.close()
    
    print(f"\n🔍 Found {len(students)} students matching '{name_pattern}':")
    for student in students:
        print(f"  {student[1]} - {student[2]} (Age: {student[3]})")
    
    return students


# ============= EXAMPLE USAGE =============

if __name__ == "__main__":
    print("=" * 60)
    print("STUDENT DATABASE OPERATIONS TUTORIAL")
    print("=" * 60)
    
    # Example 1: Add students
    print("\n📝 Example 1: Adding students...")
    add_student("1MS21CS001", "Rahul Kumar", 20)
    add_student("1MS21CS002", "Priya Sharma", 19)
    add_student("1MS21CS003", "Amit Patel", 21)
    
    # Example 2: View all students
    print("\n" + "=" * 60)
    print("📝 Example 2: Viewing all students...")
    get_all_students()
    
    # Example 3: Search for a specific student
    print("\n" + "=" * 60)
    print("📝 Example 3: Searching for student by USN...")
    get_student_by_usn("1MS21CS001")
    
    # Example 4: Update student information
    print("\n" + "=" * 60)
    print("📝 Example 4: Updating student age...")
    update_student("1MS21CS001", age=21)
    
    # Example 5: Search by name
    print("\n" + "=" * 60)
    print("📝 Example 5: Searching students by name...")
    search_students_by_name("Priya")
    
    # Example 6: Delete a student
    print("\n" + "=" * 60)
    print("📝 Example 6: Deleting a student...")
    # delete_student("1MS21CS003")  # Uncomment to test
    
    print("\n" + "=" * 60)
    print("✅ Tutorial completed!")
    print(f"Database location: {DB_FILE}")
    print("=" * 60)
