from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from typing import List, Optional, Dict, Any
from models import KnowledgeBase, KnowledgeBaseCreate, KnowledgeBaseUpdate
from database import db
import json

router = APIRouter(prefix="/knowledge", tags=["knowledge"])

@router.get("/")
def get_knowledge_items():
    """Get all knowledge base items"""
    query = """
    SELECT kb.id, kb.document_name, kb.content, kb.ai_summary, kb.date_added,
           kb.link_citations, kb.created_at, kb.updated_at
    FROM knowledge_base kb
    ORDER BY kb.updated_at DESC
    """
    try:
        items = db.execute_query(query)
        # Convert datetime objects to ISO strings
        for item in items:
            for key, value in item.items():
                if hasattr(value, 'isoformat'):
                    item[key] = value.isoformat()
        return Response(content=json.dumps(items), media_type="application/json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{knowledge_id}")
def get_knowledge_item(knowledge_id: str):
    """Get a specific knowledge base item by ID"""
    query = """
    SELECT kb.id, kb.document_name, kb.content, kb.ai_summary, kb.date_added,
           kb.link_citations, kb.created_at, kb.updated_at
    FROM knowledge_base kb
    WHERE kb.id = %s
    """
    try:
        items = db.execute_query(query, (knowledge_id,))
        if not items:
            raise HTTPException(status_code=404, detail="Knowledge base item not found")
        # Convert datetime objects to ISO strings
        item = items[0]
        for key, value in item.items():
            if hasattr(value, 'isoformat'):
                item[key] = value.isoformat()
        return Response(content=json.dumps(item), media_type="application/json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
def create_knowledge_item(item: KnowledgeBaseCreate):
    """Create a new knowledge base item"""
    # First insert the knowledge base item
    kb_query = """
    INSERT INTO knowledge_base (document_name, content, ai_summary, link_citations)
    VALUES (%s, %s, %s, %s)
    RETURNING id, document_name, content, ai_summary, date_added, link_citations, created_at, updated_at
    """
    
    try:
        # Convert list to array for PostgreSQL
        citations = item.link_citations if item.link_citations else []
        
        kb_id = db.execute_insert(kb_query, (
            item.document_name, item.content, item.ai_summary, citations
        ))
        
        # Now insert references if provided
        if item.related_projects:
            for project_id in item.related_projects:
                ref_query = """
                INSERT INTO knowledge_base_references (knowledge_base_id, entity_type, entity_id)
                VALUES (%s, 'project', %s)
                """
                db.execute_insert(ref_query, (kb_id, project_id))
        
        if item.related_goals:
            for goal_id in item.related_goals:
                ref_query = """
                INSERT INTO knowledge_base_references (knowledge_base_id, entity_type, entity_id)
                VALUES (%s, 'goal', %s)
                """
                db.execute_insert(ref_query, (kb_id, goal_id))
        
        if item.related_tasks:
            for task_id in item.related_tasks:
                ref_query = """
                INSERT INTO knowledge_base_references (knowledge_base_id, entity_type, entity_id)
                VALUES (%s, 'task', %s)
                """
                db.execute_insert(ref_query, (kb_id, task_id))
        
        return get_knowledge_item(kb_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{knowledge_id}")
def update_knowledge_item(knowledge_id: str, item: KnowledgeBaseUpdate):
    """Update an existing knowledge base item"""
    # First check if item exists
    get_knowledge_item(knowledge_id)
    
    # Build dynamic update query
    update_fields = []
    values = []
    
    if item.document_name is not None:
        update_fields.append("document_name = %s")
        values.append(item.document_name)
    if item.content is not None:
        update_fields.append("content = %s")
        values.append(item.content)
    if item.ai_summary is not None:
        update_fields.append("ai_summary = %s")
        values.append(item.ai_summary)
    if item.link_citations is not None:
        update_fields.append("link_citations = %s")
        values.append(item.link_citations)
    
    if not update_fields:
        return get_knowledge_item(knowledge_id)
    
    update_fields.append("updated_at = CURRENT_TIMESTAMP")
    values.append(knowledge_id)
    
    query = f"""
    UPDATE knowledge_base
    SET {', '.join(update_fields)}
    WHERE id = %s
    """
    
    try:
        db.execute_update(query, values)
        return get_knowledge_item(knowledge_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{knowledge_id}")
def delete_knowledge_item(knowledge_id: str):
    """Delete a knowledge base item"""
    # First check if item exists
    get_knowledge_item(knowledge_id)
    
    # References will be automatically deleted due to ON DELETE CASCADE
    query = "DELETE FROM knowledge_base WHERE id = %s"
    try:
        db.execute_delete(query, (knowledge_id,))
        return {"message": "Knowledge base item deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/project/{project_id}")
def get_project_knowledge(project_id: str):
    """Get all knowledge base items related to a specific project"""
    query = """
    SELECT kb.id, kb.document_name, kb.content, kb.ai_summary, kb.date_added,
           kb.link_citations, kb.created_at, kb.updated_at
    FROM knowledge_base kb
    JOIN knowledge_base_references kbr ON kb.id = kbr.knowledge_base_id
    WHERE kbr.entity_type = 'project' AND kbr.entity_id = %s
    ORDER BY kb.updated_at DESC
    """
    try:
        items = db.execute_query(query, (project_id,))
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/goal/{goal_id}")
def get_goal_knowledge(goal_id: str):
    """Get all knowledge base items related to a specific goal"""
    query = """
    SELECT kb.id, kb.document_name, kb.content, kb.ai_summary, kb.date_added,
           kb.link_citations, kb.created_at, kb.updated_at
    FROM knowledge_base kb
    JOIN knowledge_base_references kbr ON kb.id = kbr.knowledge_base_id
    WHERE kbr.entity_type = 'goal' AND kbr.entity_id = %s
    ORDER BY kb.updated_at DESC
    """
    try:
        items = db.execute_query(query, (goal_id,))
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/task/{task_id}")
def get_task_knowledge(task_id: str):
    """Get all knowledge base items related to a specific task"""
    query = """
    SELECT kb.id, kb.document_name, kb.content, kb.ai_summary, kb.date_added,
           kb.link_citations, kb.created_at, kb.updated_at
    FROM knowledge_base kb
    JOIN knowledge_base_references kbr ON kb.id = kbr.knowledge_base_id
    WHERE kbr.entity_type = 'task' AND kbr.entity_id = %s
    ORDER BY kb.updated_at DESC
    """
    try:
        items = db.execute_query(query, (task_id,))
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))