from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from models import KnowledgeBase, KnowledgeBaseCreate, KnowledgeBaseUpdate
from database import db
import json
import logging
import uuid

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/knowledge", tags=["knowledge"])

@router.get("/")
def get_knowledge_items():
    """Get all knowledge base items"""
    query = """
    SELECT kb.id, kb.document_name, kb.ai_summary, kb.date_added,
           kb.link_citations, kb.related_entities, kb.related_entity_ids, 
           kb.entity_types, kb.created_at, kb.updated_at
    FROM knowledge_base_with_references kb
    ORDER BY kb.updated_at DESC
    """
    try:
        items = db.execute_query(query)
        # Convert datetime objects to ISO strings and UUIDs to strings
        for item in items:
            for key, value in item.items():
                if hasattr(value, 'isoformat'):
                    item[key] = value.isoformat()
                elif isinstance(value, uuid.UUID):
                    item[key] = str(value)
                elif isinstance(value, list):
                    # Handle UUIDs in arrays
                    item[key] = [str(v) if isinstance(v, uuid.UUID) else v for v in value]
        logger.info(f"Returning knowledge items: {json.dumps(items)}")
        return JSONResponse(content=items)
    except Exception as e:
        logger.error(f"Error getting knowledge items: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{knowledge_id}")
def get_knowledge_item(knowledge_id: str):
    """Get a specific knowledge base item by ID"""
    query = """
    SELECT kb.id, kb.document_name, kb.ai_summary, kb.date_added,
           kb.link_citations, kb.related_entities, kb.related_entity_ids, 
           kb.entity_types, kb.created_at, kb.updated_at
    FROM knowledge_base_with_references kb
    WHERE kb.id = %s
    """
    try:
        items = db.execute_query(query, (knowledge_id,))
        if not items:
            raise HTTPException(status_code=404, detail="Knowledge base item not found")
        # Convert datetime objects to ISO strings and UUIDs to strings
        item = items[0]
        for key, value in item.items():
            if hasattr(value, 'isoformat'):
                item[key] = value.isoformat()
            elif isinstance(value, uuid.UUID):
                item[key] = str(value)
            elif isinstance(value, list):
                # Handle UUIDs in arrays
                item[key] = [str(v) if isinstance(v, uuid.UUID) else v for v in value]
        logger.info(f"Returning knowledge item: {json.dumps(item)}")
        return JSONResponse(content=item)
    except Exception as e:
        logger.error(f"Error getting knowledge item: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
def create_knowledge_item(item: KnowledgeBaseCreate):
    """Create a new knowledge base item"""
    # First insert the knowledge base item
    kb_query = """
    INSERT INTO knowledge_base (document_name, content, ai_summary, link_citations)
    VALUES (%s, %s, %s, %s)
    RETURNING id
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
        logger.error(f"Error creating knowledge item: {str(e)}")
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
        logger.error(f"Error updating knowledge item: {str(e)}")
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
        logger.error(f"Error deleting knowledge item: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/project/{project_id}")
def get_project_knowledge(project_id: str):
    """Get all knowledge base items related to a specific project"""
    query = """
    SELECT kb.id, kb.document_name, kb.ai_summary, kb.date_added,
           kb.link_citations, kb.related_entities, kb.related_entity_ids, 
           kb.entity_types, kb.created_at, kb.updated_at
    FROM knowledge_base_with_references kb
    JOIN knowledge_base_references kbr ON kb.id = kbr.knowledge_base_id
    WHERE kbr.entity_type = 'project' AND kbr.entity_id = %s
    ORDER BY kb.updated_at DESC
    """
    try:
        items = db.execute_query(query, (project_id,))
        # Convert datetime objects to ISO strings and UUIDs to strings
        for item in items:
            for key, value in item.items():
                if hasattr(value, 'isoformat'):
                    item[key] = value.isoformat()
                elif isinstance(value, uuid.UUID):
                    item[key] = str(value)
                elif isinstance(value, list):
                    # Handle UUIDs in arrays
                    item[key] = [str(v) if isinstance(v, uuid.UUID) else v for v in value]
        return JSONResponse(content=items)
    except Exception as e:
        logger.error(f"Error getting project knowledge: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/goal/{goal_id}")
def get_goal_knowledge(goal_id: str):
    """Get all knowledge base items related to a specific goal"""
    query = """
    SELECT kb.id, kb.document_name, kb.ai_summary, kb.date_added,
           kb.link_citations, kb.related_entities, kb.related_entity_ids, 
           kb.entity_types, kb.created_at, kb.updated_at
    FROM knowledge_base_with_references kb
    JOIN knowledge_base_references kbr ON kb.id = kbr.knowledge_base_id
    WHERE kbr.entity_type = 'goal' AND kbr.entity_id = %s
    ORDER BY kb.updated_at DESC
    """
    try:
        items = db.execute_query(query, (goal_id,))
        # Convert datetime objects to ISO strings and UUIDs to strings
        for item in items:
            for key, value in item.items():
                if hasattr(value, 'isoformat'):
                    item[key] = value.isoformat()
                elif isinstance(value, uuid.UUID):
                    item[key] = str(value)
                elif isinstance(value, list):
                    # Handle UUIDs in arrays
                    item[key] = [str(v) if isinstance(v, uuid.UUID) else v for v in value]
        return JSONResponse(content=items)
    except Exception as e:
        logger.error(f"Error getting goal knowledge: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/task/{task_id}")
def get_task_knowledge(task_id: str):
    """Get all knowledge base items related to a specific task"""
    query = """
    SELECT kb.id, kb.document_name, kb.ai_summary, kb.date_added,
           kb.link_citations, kb.related_entities, kb.related_entity_ids, 
           kb.entity_types, kb.created_at, kb.updated_at
    FROM knowledge_base_with_references kb
    JOIN knowledge_base_references kbr ON kb.id = kbr.knowledge_base_id
    WHERE kbr.entity_type = 'task' AND kbr.entity_id = %s
    ORDER BY kb.updated_at DESC
    """
    try:
        items = db.execute_query(query, (task_id,))
        # Convert datetime objects to ISO strings and UUIDs to strings
        for item in items:
            for key, value in item.items():
                if hasattr(value, 'isoformat'):
                    item[key] = value.isoformat()
                elif isinstance(value, uuid.UUID):
                    item[key] = str(value)
                elif isinstance(value, list):
                    # Handle UUIDs in arrays
                    item[key] = [str(v) if isinstance(v, uuid.UUID) else v for v in value]
        return JSONResponse(content=items)
    except Exception as e:
        logger.error(f"Error getting task knowledge: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))