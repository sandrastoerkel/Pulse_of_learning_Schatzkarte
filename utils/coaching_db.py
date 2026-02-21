"""
Coaching Database Functions
Simplified database access for coaching.db
"""

import sqlite3
import json
from datetime import datetime
from typing import Optional, Dict, List
import pandas as pd

from utils.database import get_connection

def create_student(student_code: str, class_name: str = None, notes: str = None) -> int:
    """Create new student record"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO students (student_code, class, notes)
            VALUES (?, ?, ?)
        """, (student_code, class_name, notes))
        
        student_id = cursor.lastrowid
        conn.commit()
        return student_id
    except Exception as e:
        print(f"Error creating student: {e}")
        return None
    finally:
        conn.close()

def get_student_by_id(student_id: int) -> Optional[Dict]:
    """Get student by ID"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM students WHERE id = ?
    """, (student_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        columns = ['id', 'student_code', 'class', 'school_year', 'created_date', 'notes', 'is_active']
        return dict(zip(columns, row))
    return None

def get_all_students(active_only: bool = True) -> pd.DataFrame:
    """Get all students as DataFrame

    Args:
        active_only: If True, only return active students (default: True)

    Returns:
        DataFrame with student data
    """
    conn = get_connection()
    cursor = conn.cursor()

    if active_only:
        cursor.execute("""
            SELECT * FROM students WHERE is_active = 1 ORDER BY student_code
        """)
    else:
        cursor.execute("""
            SELECT * FROM students ORDER BY student_code
        """)

    rows = cursor.fetchall()
    conn.close()

    columns = ['id', 'student_code', 'class', 'school_year', 'created_date', 'notes', 'is_active']

    # Return as DataFrame
    if rows:
        return pd.DataFrame(rows, columns=columns)
    else:
        return pd.DataFrame(columns=columns)

def search_students(search_term: str) -> pd.DataFrame:
    """Search students by code or class

    Args:
        search_term: Search string to match against student_code or class

    Returns:
        DataFrame with matching student data
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM students
        WHERE is_active = 1
        AND (student_code LIKE ? OR class LIKE ?)
        ORDER BY student_code
    """, (f"%{search_term}%", f"%{search_term}%"))

    rows = cursor.fetchall()
    conn.close()

    columns = ['id', 'student_code', 'class', 'school_year', 'created_date', 'notes', 'is_active']

    # Return as DataFrame
    if rows:
        return pd.DataFrame(rows, columns=columns)
    else:
        return pd.DataFrame(columns=columns)

def save_assessment(student_id: int, results_dict: Dict, notes: str = None) -> int:
    """Save assessment results"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Calculate some basic metrics
        responses = results_dict.get('item_responses', {})
        num_items = len(responses)
        
        # Simple risk assessment based on scale values
        risk_level = "mittel"  # Default
        
        cursor.execute("""
            INSERT INTO assessments 
            (student_id, assessment_date, results, risk_level, notes)
            VALUES (?, ?, ?, ?, ?)
        """, (
            student_id,
            datetime.now().isoformat(),
            json.dumps(results_dict),
            risk_level,
            notes
        ))
        
        assessment_id = cursor.lastrowid
        conn.commit()
        return assessment_id
    except Exception as e:
        print(f"Error saving assessment: {e}")
        return None
    finally:
        conn.close()

def get_latest_assessment(student_id: int) -> Optional[Dict]:
    """Get most recent assessment for student"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM assessments 
        WHERE student_id = ?
        ORDER BY assessment_date DESC
        LIMIT 1
    """, (student_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        columns = ['id', 'student_id', 'request_id', 'assessment_date', 
                  'results', 'quadrant', 'risk_level', 'performance_estimate', 'notes']
        return dict(zip(columns, row))
    return None

def get_all_assessments(student_id: int) -> List[Dict]:
    """Get all assessments for student"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM assessments 
        WHERE student_id = ?
        ORDER BY assessment_date DESC
    """, (student_id,))
    
    rows = cursor.fetchall()
    conn.close()
    
    columns = ['id', 'student_id', 'request_id', 'assessment_date', 
              'results', 'quadrant', 'risk_level', 'performance_estimate', 'notes']
    return [dict(zip(columns, row)) for row in rows]

def get_student_summary(student_id: int) -> Dict:
    """Get summary statistics for student"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Count assessments
    cursor.execute("""
        SELECT COUNT(*) FROM assessments WHERE student_id = ?
    """, (student_id,))
    total_assessments = cursor.fetchone()[0]
    
    # Count development plans
    cursor.execute("""
        SELECT COUNT(*) FROM development_plans 
        WHERE student_id = ? AND status = 'active'
    """, (student_id,))
    active_plans = cursor.fetchone()[0]
    
    # Get latest assessment date
    cursor.execute("""
        SELECT MAX(assessment_date) FROM assessments WHERE student_id = ?
    """, (student_id,))
    last_assessment = cursor.fetchone()[0]
    
    conn.close()
    
    return {
        'total_assessments': total_assessments,
        'active_plans': active_plans,
        'last_assessment': last_assessment
    }

def save_development_plan(student_id: int, assessment_id: int, 
                         interventions: Dict, goals: str = None) -> int:
    """Save development plan"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO development_plans
            (student_id, assessment_id, created_date, interventions, goals, status)
            VALUES (?, ?, ?, ?, ?, 'active')
        """, (
            student_id,
            assessment_id,
            datetime.now().isoformat(),
            json.dumps(interventions),
            goals
        ))
        
        plan_id = cursor.lastrowid
        conn.commit()
        return plan_id
    except Exception as e:
        print(f"Error saving development plan: {e}")
        return None
    finally:
        conn.close()

def log_progress(student_id: int, plan_id: int, activity_type: str, 
                content: str, outcome: str = None) -> int:
    """Log progress entry"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO progress_logs
            (student_id, plan_id, log_date, activity_type, content, outcome)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            student_id,
            plan_id,
            datetime.now().isoformat(),
            activity_type,
            content,
            outcome
        ))
        
        log_id = cursor.lastrowid
        conn.commit()
        return log_id
    except Exception as e:
        print(f"Error logging progress: {e}")
        return None
    finally:
        conn.close()

def init_database():
    """Initialize coaching database tables (CREATE TABLE IF NOT EXISTS)."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_code TEXT UNIQUE NOT NULL,
            class TEXT,
            school_year TEXT,
            created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            is_active INTEGER DEFAULT 1
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            request_id INTEGER,
            assessment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            results TEXT NOT NULL,
            quadrant TEXT,
            risk_level TEXT,
            performance_estimate REAL,
            notes TEXT,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS development_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            assessment_id INTEGER NOT NULL,
            created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            interventions TEXT NOT NULL,
            goals TEXT,
            status TEXT DEFAULT 'active',
            start_date DATE,
            target_end_date DATE,
            actual_end_date DATE,
            notes TEXT,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS progress_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            plan_id INTEGER,
            log_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            activity_type TEXT NOT NULL,
            content TEXT NOT NULL,
            outcome TEXT,
            reflection TEXT,
            created_by TEXT,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY (plan_id) REFERENCES development_plans(id) ON DELETE SET NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessment_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            selected_scales TEXT NOT NULL,
            assessment_type TEXT,
            survey_url TEXT,
            status TEXT DEFAULT 'pending',
            completed_date DATETIME,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        )
    """)

    conn.commit()
    conn.close()

# Initialize database on import
init_database()
