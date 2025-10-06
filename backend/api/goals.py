from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from models import Goal, GoalCreate, GoalUpdate
from database import db

router = APIRouter(prefix="/goals", tags=["goals"])

@router.get("/", response_model=List[Goal])
def get_goals():
    """Get all goals"""
    query = """
    SELECT id, name, description, status, scope, success_criteria, due_date, project_id, parent_goal_id, created_at, updated_at
    FROM goals
    ORDER BY created_at DESC
    """
    try:
        goals = db.execute_query(query)
        return goals
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{goal_id}", response_model=Goal)
def get_goal(goal_id: str):
    """Get a specific goal by ID"""
    query = """
    SELECT id, name, description, status, scope, success_criteria, due_date, project_id, parent_goal_id, created_at, updated_at
    FROM goals
    WHERE id = %s
    """
    try:
        goals = db.execute_query(query, (goal_id,))
        if not goals:
            raise HTTPException(status_code=404, detail="Goal not found")
        return goals[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Goal)
def create_goal(goal: GoalCreate):
    """Create a new goal"""
    # Validate that if it's a weekly milestone, it has a parent goal
    if goal.scope == "Weekly-Milestone" and not goal.parent_goal_id:
        raise HTTPException(status_code=400, detail="Weekly milestones must have a parent goal")
    
    query = """
    INSERT INTO goals (name, description, status, scope, success_criteria, due_date, project_id, parent_goal_id)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING id, name, description, status, scope, success_criteria, due_date, project_id, parent_goal_id, created_at, updated_at
    """
    try:
        result = db.execute_insert(query, (
            goal.name, goal.description, goal.status, goal.scope, goal.success_criteria,
            goal.due_date, goal.project_id, goal.parent_goal_id
        ))
        return get_goal(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{goal_id}", response_model=Goal)
def update_goal(goal_id: str, goal: GoalUpdate):
    """Update an existing goal"""
    # First check if goal exists
    get_goal(goal_id)
    
    # Build dynamic update query
    update_fields = []
    values = []
    
    if goal.name is not None:
        update_fields.append("name = %s")
        values.append(goal.name)
    if goal.description is not None:
        update_fields.append("description = %s")
        values.append(goal.description)
    if goal.status is not None:
        update_fields.append("status = %s")
        values.append(goal.status)
    if goal.scope is not None:
        update_fields.append("scope = %s")
        values.append(goal.scope)
    if goal.success_criteria is not None:
        update_fields.append("success_criteria = %s")
        values.append(goal.success_criteria)
    if goal.due_date is not None:
        update_fields.append("due_date = %s")
        values.append(goal.due_date)
    if goal.parent_goal_id is not None:
        update_fields.append("parent_goal_id = %s")
        values.append(goal.parent_goal_id)
    
    if not update_fields:
        return get_goal(goal_id)
    
    update_fields.append("updated_at = CURRENT_TIMESTAMP")
    values.append(goal_id)
    
    query = f"""
    UPDATE goals
    SET {', '.join(update_fields)}
    WHERE id = %s
    """
    
    try:
        db.execute_update(query, values)
        return get_goal(goal_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{goal_id}")
def delete_goal(goal_id: str):
    """Delete a goal"""
    # First check if goal exists
    get_goal(goal_id)
    
    query = "DELETE FROM goals WHERE id = %s"
    try:
        db.execute_delete(query, (goal_id,))
        return {"message": "Goal deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{goal_id}/tasks")
def get_goal_tasks(goal_id: str):
    """Get all tasks for a specific goal"""
    query = """
    SELECT t.*, 
           (SELECT ARRAY_AGG(dep.name) FROM task_dependencies td 
            JOIN tasks dep ON td.depends_on_task_id = dep.id 
            WHERE td.task_id = t.id) as dependencies
    FROM tasks t
    WHERE t.goal_id = %s
    ORDER BY t.created_at ASC
    """
    try:
        tasks = db.execute_query(query, (goal_id,))
        return tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/project/{project_id}/hierarchy")
def get_project_goals_hierarchy(project_id: str):
    """Get goals for a project in hierarchical structure"""
    query = """
    WITH RECURSIVE goal_hierarchy AS (
        -- Base case: top-level goals (no parent)
        SELECT 
            g.id, g.name, g.description, g.status, g.scope, g.success_criteria, 
            g.due_date, g.project_id, g.parent_goal_id, g.created_at, g.updated_at,
            0 as level,
            ARRAY[g.id] as path
        FROM goals g
        WHERE g.project_id = %s AND g.parent_goal_id IS NULL
        
        UNION ALL
        
        -- Recursive case: child goals
        SELECT 
            g.id, g.name, g.description, g.status, g.scope, g.success_criteria, 
            g.due_date, g.project_id, g.parent_goal_id, g.created_at, g.updated_at,
            gh.level + 1,
            gh.path || g.id
        FROM goals g
        JOIN goal_hierarchy gh ON g.parent_goal_id = gh.id
        WHERE g.project_id = %s
    )
    SELECT 
        gh.*,
        (SELECT COUNT(*) FROM tasks WHERE goal_id = gh.id) as task_count,
        (SELECT COUNT(*) FROM tasks WHERE goal_id = gh.id AND status = 'Done') as completed_tasks
    FROM goal_hierarchy gh
    ORDER BY path, level;
    """
    try:
        goals = db.execute_query(query, (project_id, project_id))
        return goals
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/parent/{parent_goal_id}/children")
def get_child_goals(parent_goal_id: str):
    """Get all child goals of a specific parent goal"""
    query = """
    SELECT g.*, 
           (SELECT COUNT(*) FROM tasks WHERE goal_id = g.id) as task_count,
           (SELECT COUNT(*) FROM tasks WHERE goal_id = g.id AND status = 'Done') as completed_tasks
    FROM goals g
    WHERE g.parent_goal_id = %s
    ORDER BY g.created_at ASC
    """
    try:
        goals = db.execute_query(query, (parent_goal_id,))
        return goals
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))