import sqlite3
from pathlib import Path

# Database file path
DB_FILE = Path(__file__).parent / "students.db"


def init_database():
    """Initialize the database and create tables if they don't exist"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Create students table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usn TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            profile_picture BLOB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create index on USN for faster lookups
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_usn ON students(usn)
    """)
    
    conn.commit()
    conn.close()
    print(f"Database initialized at {DB_FILE}")


def get_connection():
    """Get a database connection"""
    return sqlite3.connect(DB_FILE)


# Initialize database when module is imported
init_database()
