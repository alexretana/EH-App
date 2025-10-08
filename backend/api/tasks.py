from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from models import Task, TaskCreate, TaskUpdate
from database import db

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/", response_model=List[Task])
def get_tasks():
    """Get all tasks"""
    query = """
    SELECT id, name, description, status, task_type, priority, effort_level, time_estimate_minutes,
           due_date, date_completed, week_start_date, assignee, goal_id, created_at, updated_at
    FROM tasks
    ORDER BY created_at DESC
    """
    try:
        tasks = db.execute_query(query)
        return tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{task_id}", response_model=Task)
def get_task(task_id: str):
    """Get a specific task by ID"""
    query = """
    SELECT id, name, description, status, task_type, priority, effort_level, time_estimate_minutes,
           due_date, date_completed, week_start_date, assignee, goal_id, created_at, updated_at
    FROM tasks
    WHERE id = %s
    """
    try:
        tasks = db.execute_query(query, (task_id,))
        if not tasks:
            raise HTTPException(status_code=404, detail="Task not found")
        return tasks[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Task)
def create_task(task: TaskCreate):
    """Create a new task"""
    query = """
    INSERT INTO tasks (name, description, status, task_type, priority, effort_level, time_estimate_minutes,
                      due_date, date_completed, week_start_date, assignee, goal_id)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING id, name, description, status, task_type, priority, effort_level, time_estimate_minutes,
              due_date, date_completed, week_start_date, assignee, goal_id, created_at, updated_at
    """
    try:
        result = db.execute_insert(query, (
            task.name, task.description, task.status, task.task_type, task.priority,
            task.effort_level, task.time_estimate_minutes, task.due_date, task.date_completed,
            task.week_start_date, task.assignee, task.goal_id
        ))
        return get_task(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{task_id}", response_model=Task)
def update_task(task_id: str, task: TaskUpdate):
    """Update an existing task"""
    # First check if task exists
    get_task(task_id)
    
    # Build dynamic update query
    update_fields = []
    values = []
    
    if task.name is not None:
        update_fields.append("name = %s")
        values.append(task.name)
    if task.description is not None:
        update_fields.append("description = %s")
        values.append(task.description)
    if task.status is not None:
        update_fields.append("status = %s")
        values.append(task.status)
        # If status is being set to 'Done', set date_completed
        if task.status == "Done":
            update_fields.append("date_completed = CURRENT_DATE")
    if task.task_type is not None:
        update_fields.append("task_type = %s")
        values.append(task.task_type)
    if task.priority is not None:
        update_fields.append("priority = %s")
        values.append(task.priority)
    if task.effort_level is not None:
        update_fields.append("effort_level = %s")
        values.append(task.effort_level)
    if task.time_estimate_minutes is not None:
        update_fields.append("time_estimate_minutes = %s")
        values.append(task.time_estimate_minutes)
    if task.due_date is not None:
        update_fields.append("due_date = %s")
        values.append(task.due_date)
    if task.date_completed is not None:
        update_fields.append("date_completed = %s")
        values.append(task.date_completed)
    if task.week_start_date is not None:
        update_fields.append("week_start_date = %s")
        values.append(task.week_start_date)
    if task.assignee is not None:
        update_fields.append("assignee = %s")
        values.append(task.assignee)
    
    if not update_fields:
        return get_task(task_id)
    
    update_fields.append("updated_at = CURRENT_TIMESTAMP")
    values.append(task_id)
    
    query = f"""
    UPDATE tasks
    SET {', '.join(update_fields)}
    WHERE id = %s
    """
    
    try:
        db.execute_update(query, values)
        return get_task(task_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{task_id}")
def delete_task(task_id: str):
    """Delete a task"""
    # First check if task exists
    get_task(task_id)
    
    query = "DELETE FROM tasks WHERE id = %s"
    try:
        db.execute_delete(query, (task_id,))
        return {"message": "Task deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{task_id}/status")
def update_task_status(task_id: str, status: str):
    """Update only the status of a task"""
    # First check if task exists
    get_task(task_id)
    
    # Validate status
    valid_statuses = ["Not started", "Active", "Done", "Cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    update_fields = ["status = %s", "updated_at = CURRENT_TIMESTAMP"]
    values = [status]
    
    # If status is being set to 'Done', set date_completed
    if status == "Done":
        update_fields.append("date_completed = CURRENT_DATE")
    elif status in ["Not started", "Active", "Cancelled"]:
        update_fields.append("date_completed = NULL")
    
    values.append(task_id)
    
    query = f"""
    UPDATE tasks
    SET {', '.join(update_fields)}
    WHERE id = %s
    """
    
    try:
        db.execute_update(query, values)
        return get_task(task_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/project/{project_id}")
def get_project_tasks(project_id: str):
    """Get all tasks for a specific project"""
    query = """
    SELECT t.*, g.name as goal_name, p.name as project_name
    FROM tasks t
    JOIN goals g ON t.goal_id = g.id
    JOIN projects p ON g.project_id = p.id
    WHERE p.id = %s
    ORDER BY t.created_at DESC
    """
    try:
        tasks = db.execute_query(query, (project_id,))
        return tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/goal/{goal_id}")
def get_goal_tasks(goal_id: str):
    """Get all tasks for a specific goal"""
    query = """
    SELECT t.*, g.name as goal_name, p.name as project_name
    FROM tasks t
    JOIN goals g ON t.goal_id = g.id
    JOIN projects p ON g.project_id = p.id
    WHERE g.id = %s
    ORDER BY t.created_at DESC
    """
    try:
        tasks = db.execute_query(query, (goal_id,))
        return tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active/projects")
def get_active_projects_tasks():
    """Get all tasks for active projects"""
    query = """
    SELECT t.*, g.name as goal_name, p.name as project_name
    FROM tasks t
    JOIN goals g ON t.goal_id = g.id
    JOIN projects p ON g.project_id = p.id
    WHERE p.is_active = true
    ORDER BY t.created_at DESC
    """
    try:
        tasks = db.execute_query(query)
        return tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active/goals")
def get_active_goals_tasks():
    """Get all tasks for active goals"""
    query = """
    SELECT t.*, g.name as goal_name, p.name as project_name
    FROM tasks t
    JOIN goals g ON t.goal_id = g.id
    JOIN projects p ON g.project_id = p.id
    WHERE g.status = 'Active'
    ORDER BY t.created_at DESC
    """
    try:
        tasks = db.execute_query(query)
        return tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active/weekly-milestones")
def get_active_weekly_milestone_tasks():
    """Get all tasks for active weekly milestones"""
    query = """
    SELECT t.*, g.name as goal_name, p.name as project_name
    FROM tasks t
    JOIN goals g ON t.goal_id = g.id
    JOIN projects p ON g.project_id = p.id
    WHERE g.scope = 'Weekly-Milestone' AND g.status = 'Active'
    ORDER BY t.created_at DESC
    """
    try:
        tasks = db.execute_query(query)
        return tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Temporarily comment out the problematic endpoint
# @router.get("/details/{task_id}")
# def get_task_details(task_id: str):
#     """Get detailed task information including dependencies"""
#     query = """
#     SELECT td.*
#     FROM task_details td
#     WHERE td.id = %s
#     """
#     try:
#         tasks = db.execute_query(query, (task_id,))
#         if not tasks:
#             raise HTTPException(status_code=404, detail="Task not found")
#         return tasks[0]
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))