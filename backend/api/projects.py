from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from models import Project, ProjectCreate, ProjectUpdate
from database import db

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("/", response_model=List[Project])
def get_projects():
    """Get all projects"""
    query = """
    SELECT id, name, description, status, start_date, end_date, is_active, is_validated,
           time_estimate_months, time_estimation_validated, expansion_horizon, milestone_granularity,
           created_at, updated_at
    FROM projects
    ORDER BY created_at DESC
    """
    try:
        projects = db.execute_query(query)
        return projects
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{project_id}", response_model=Project)
def get_project(project_id: str):
    """Get a specific project by ID"""
    query = """
    SELECT id, name, description, status, start_date, end_date, is_active, is_validated,
           time_estimate_months, time_estimation_validated, expansion_horizon, milestone_granularity,
           created_at, updated_at
    FROM projects
    WHERE id = %s
    """
    try:
        projects = db.execute_query(query, (project_id,))
        if not projects:
            raise HTTPException(status_code=404, detail="Project not found")
        return projects[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Project)
def create_project(project: ProjectCreate):
    """Create a new project"""
    query = """
    INSERT INTO projects (name, description, status, start_date, end_date, is_active, is_validated,
                         time_estimate_months, time_estimation_validated, expansion_horizon, milestone_granularity)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING id, name, description, status, start_date, end_date, is_active, is_validated,
              time_estimate_months, time_estimation_validated, expansion_horizon, milestone_granularity,
              created_at, updated_at
    """
    try:
        result = db.execute_insert(query, (
            project.name, project.description, project.status, project.start_date, project.end_date,
            project.is_active, project.is_validated, project.time_estimate_months,
            project.time_estimation_validated, project.expansion_horizon, project.milestone_granularity
        ))
        return get_project(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{project_id}", response_model=Project)
def update_project(project_id: str, project: ProjectUpdate):
    """Update an existing project"""
    # First check if project exists
    get_project(project_id)
    
    # Build dynamic update query
    update_fields = []
    values = []
    
    if project.name is not None:
        update_fields.append("name = %s")
        values.append(project.name)
    if project.description is not None:
        update_fields.append("description = %s")
        values.append(project.description)
    if project.status is not None:
        update_fields.append("status = %s")
        values.append(project.status)
    if project.start_date is not None:
        update_fields.append("start_date = %s")
        values.append(project.start_date)
    if project.end_date is not None:
        update_fields.append("end_date = %s")
        values.append(project.end_date)
    if project.is_active is not None:
        update_fields.append("is_active = %s")
        values.append(project.is_active)
    if project.is_validated is not None:
        update_fields.append("is_validated = %s")
        values.append(project.is_validated)
    if project.time_estimate_months is not None:
        update_fields.append("time_estimate_months = %s")
        values.append(project.time_estimate_months)
    if project.time_estimation_validated is not None:
        update_fields.append("time_estimation_validated = %s")
        values.append(project.time_estimation_validated)
    if project.expansion_horizon is not None:
        update_fields.append("expansion_horizon = %s")
        values.append(project.expansion_horizon)
    if project.milestone_granularity is not None:
        update_fields.append("milestone_granularity = %s")
        values.append(project.milestone_granularity)
    
    if not update_fields:
        return get_project(project_id)
    
    update_fields.append("updated_at = CURRENT_TIMESTAMP")
    values.append(project_id)
    
    query = f"""
    UPDATE projects
    SET {', '.join(update_fields)}
    WHERE id = %s
    """
    
    try:
        db.execute_update(query, values)
        return get_project(project_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{project_id}")
def delete_project(project_id: str):
    """Delete a project"""
    # First check if project exists
    get_project(project_id)
    
    query = "DELETE FROM projects WHERE id = %s"
    try:
        db.execute_delete(query, (project_id,))
        return {"message": "Project deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{project_id}/goals")
def get_project_goals(project_id: str):
    """Get all goals for a specific project"""
    query = """
    SELECT g.*, 
           (SELECT COUNT(*) FROM tasks WHERE goal_id = g.id) as task_count,
           (SELECT COUNT(*) FROM tasks WHERE goal_id = g.id AND status = 'Done') as completed_tasks
    FROM goals g
    WHERE g.project_id = %s
    ORDER BY g.created_at ASC
    """
    try:
        goals = db.execute_query(query, (project_id,))
        return goals
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))