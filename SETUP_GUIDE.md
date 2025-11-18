# Setup Instructions

## Backend Setup

1. **Install required Python packages:**
```bash
cd /Users/samridz/hackathon/backend
pip install fastapi uvicorn python-multipart
```

2. **Run the backend server:**
```bash
python main.py
```

The server will start at `http://127.0.0.1:8000`

## Frontend Setup

The frontend is already configured! Just make sure it's running:

```bash
cd /Users/samridz/hackathon/student-performance-frontend
npm start
```

## Features Implemented

### ✅ Requirement 1: Add Students to Database
- Fill in Name, USN, Age
- Upload profile picture (optional)
- Click "Add Student" button
- Data is saved to SQLite database at `/backend/students.db`

### ✅ Requirement 2: Admin Login Page
- New "🔐 Admin" tab added
- Login page with email/password
- Demo credentials:
  - Email: `admin@example.com`
  - Password: `admin123`
- After login, shows admin dashboard
- Session persists in browser

## Testing

1. **Test Student Registration:**
   - Go to "📝 Student Registration" tab
   - Enter student details
   - Click "Add Student"
   - Check database: `python -c "from student_operations import get_all_students; get_all_students()"`

2. **Test Admin Login:**
   - Go to "🔐 Admin" tab
   - Use demo credentials above
   - Should see admin dashboard

## API Endpoints

- `POST /students` - Add new student
- `GET /students` - Get all students
- `DELETE /students/{usn}` - Delete student
- `POST /admin/login` - Admin login
- `POST /predict` - Performance prediction

## Notes

- Backend must be running for features to work
- Student data persists in `students.db`
- Admin login uses localStorage for session persistence
