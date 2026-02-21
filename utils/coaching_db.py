"""
Coaching Database Functions
Simplified database access for coaching (Supabase).
"""

import json
from datetime import datetime
from typing import Optional, Dict, List
import pandas as pd

from utils.database import get_db


def init_database():
    """Keine Initialisierung nötig — Tabellen existieren in Supabase."""
    pass


def create_student(student_code: str, class_name: str = None, notes: str = None) -> int:
    """Create new student record"""
    try:
        result = get_db().table("students").insert({
            "student_code": student_code,
            "class": class_name,
            "notes": notes
        }).execute()
        return result.data[0]["id"] if result.data else None
    except Exception as e:
        print(f"Error creating student: {e}")
        return None


def get_student_by_id(student_id: int) -> Optional[Dict]:
    """Get student by ID"""
    result = get_db().table("students").select("*").eq("id", student_id).execute()
    return result.data[0] if result.data else None


def get_all_students(active_only: bool = True) -> pd.DataFrame:
    """Get all students as DataFrame"""
    query = get_db().table("students").select("*").order("student_code")
    if active_only:
        query = query.eq("is_active", True)
    result = query.execute()

    if result.data:
        return pd.DataFrame(result.data)
    else:
        columns = ['id', 'student_code', 'class', 'school_year', 'created_date', 'notes', 'is_active']
        return pd.DataFrame(columns=columns)


def search_students(search_term: str) -> pd.DataFrame:
    """Search students by code or class"""
    result = get_db().table("students") \
        .select("*") \
        .eq("is_active", True) \
        .or_(f"student_code.ilike.%{search_term}%,class.ilike.%{search_term}%") \
        .order("student_code") \
        .execute()

    if result.data:
        return pd.DataFrame(result.data)
    else:
        columns = ['id', 'student_code', 'class', 'school_year', 'created_date', 'notes', 'is_active']
        return pd.DataFrame(columns=columns)


def save_assessment(student_id: int, results_dict: Dict, notes: str = None) -> int:
    """Save assessment results"""
    try:
        risk_level = "mittel"  # Default

        result = get_db().table("assessments").insert({
            "student_id": student_id,
            "assessment_date": datetime.now().isoformat(),
            "results": json.dumps(results_dict),
            "risk_level": risk_level,
            "notes": notes
        }).execute()

        return result.data[0]["id"] if result.data else None
    except Exception as e:
        print(f"Error saving assessment: {e}")
        return None


def get_latest_assessment(student_id: int) -> Optional[Dict]:
    """Get most recent assessment for student"""
    result = get_db().table("assessments") \
        .select("*") \
        .eq("student_id", student_id) \
        .order("assessment_date", desc=True) \
        .limit(1) \
        .execute()
    return result.data[0] if result.data else None


def get_all_assessments(student_id: int) -> List[Dict]:
    """Get all assessments for student"""
    result = get_db().table("assessments") \
        .select("*") \
        .eq("student_id", student_id) \
        .order("assessment_date", desc=True) \
        .execute()
    return result.data


def get_student_summary(student_id: int) -> Dict:
    """Get summary statistics for student"""
    db = get_db()

    # Count assessments
    assessments = db.table("assessments") \
        .select("id, assessment_date") \
        .eq("student_id", student_id) \
        .execute()

    total_assessments = len(assessments.data)
    last_assessment = max((a["assessment_date"] for a in assessments.data), default=None) if assessments.data else None

    # Count active development plans
    plans = db.table("development_plans") \
        .select("id") \
        .eq("student_id", student_id) \
        .eq("status", "active") \
        .execute()

    active_plans = len(plans.data)

    return {
        'total_assessments': total_assessments,
        'active_plans': active_plans,
        'last_assessment': last_assessment
    }


def save_development_plan(student_id: int, assessment_id: int,
                         interventions: Dict, goals: str = None) -> int:
    """Save development plan"""
    try:
        result = get_db().table("development_plans").insert({
            "student_id": student_id,
            "assessment_id": assessment_id,
            "created_date": datetime.now().isoformat(),
            "interventions": json.dumps(interventions),
            "goals": goals,
            "status": "active"
        }).execute()
        return result.data[0]["id"] if result.data else None
    except Exception as e:
        print(f"Error saving development plan: {e}")
        return None


def log_progress(student_id: int, plan_id: int, activity_type: str,
                content: str, outcome: str = None) -> int:
    """Log progress entry"""
    try:
        result = get_db().table("progress_logs").insert({
            "student_id": student_id,
            "plan_id": plan_id,
            "log_date": datetime.now().isoformat(),
            "activity_type": activity_type,
            "content": content,
            "outcome": outcome
        }).execute()
        return result.data[0]["id"] if result.data else None
    except Exception as e:
        print(f"Error logging progress: {e}")
        return None
