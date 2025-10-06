from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum
import uuid

# Enums
class ProjectStatus(str, Enum):
    PLANNING_PHASE = "Planning Phase"
    ACTIVE = "Active"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class GoalStatus(str, Enum):
    NOT_STARTED = "Not started"
    ACTIVE = "Active"
    DONE = "Done"
    CANCELLED = "Cancelled"

class TaskStatus(str, Enum):
    NOT_STARTED = "Not started"
    ACTIVE = "Active"
    DONE = "Done"
    CANCELLED = "Cancelled"

class PriorityLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class EffortLevel(str, Enum):
    SMALL = "Small"
    MEDIUM = "Medium"
    LARGE = "Large"

class ExpansionHorizon(str, Enum):
    ONE_WEEK = "1 Week"
    TWO_WEEKS = "2 Weeks"
    THREE_WEEKS = "3 Weeks"

class MilestoneGranularity(str, Enum):
    MONTHLY = "Monthly"
    QUARTERLY = "Quarterly"
    MONTHLY_QUARTERLY = "Monthly&Quarterly"

class GoalScope(str, Enum):
    MONTHLY = "Monthly"
    QUARTERLY = "Quarterly"
    WEEKLY_MILESTONE = "Weekly-Milestone"

class TaskType(str, Enum):
    NETWORK = "Network"
    DEBUG = "Debug"
    REVIEW = "Review"
    DEVELOP = "Develop"
    MARKETING = "Marketing"
    PROVISION = "Provision"
    RESEARCH = "Research"

# Base Models
class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.PLANNING_PHASE
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: bool = False
    is_validated: bool = False
    time_estimate_months: Optional[int] = Field(None, gt=0)
    time_estimation_validated: bool = False
    expansion_horizon: Optional[ExpansionHorizon] = None
    milestone_granularity: Optional[MilestoneGranularity] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None
    is_validated: Optional[bool] = None
    time_estimate_months: Optional[int] = Field(None, gt=0)
    time_estimation_validated: Optional[bool] = None
    expansion_horizon: Optional[ExpansionHorizon] = None
    milestone_granularity: Optional[MilestoneGranularity] = None

class Project(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GoalBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: GoalStatus = GoalStatus.NOT_STARTED
    scope: Optional[GoalScope] = None
    success_criteria: Optional[str] = None
    due_date: Optional[date] = None
    project_id: str
    parent_goal_id: Optional[str] = None

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[GoalStatus] = None
    scope: Optional[GoalScope] = None
    success_criteria: Optional[str] = None
    due_date: Optional[date] = None
    parent_goal_id: Optional[str] = None

class Goal(GoalBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.NOT_STARTED
    task_type: Optional[TaskType] = None
    priority: Optional[PriorityLevel] = None
    effort_level: Optional[EffortLevel] = None
    time_estimate_minutes: Optional[int] = Field(None, gt=0)
    due_date: Optional[date] = None
    date_completed: Optional[date] = None
    week_start_date: Optional[date] = None
    assignee: Optional[str] = None
    goal_id: str

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    task_type: Optional[TaskType] = None
    priority: Optional[PriorityLevel] = None
    effort_level: Optional[EffortLevel] = None
    time_estimate_minutes: Optional[int] = Field(None, gt=0)
    due_date: Optional[date] = None
    date_completed: Optional[date] = None
    week_start_date: Optional[date] = None
    assignee: Optional[str] = None

class Task(TaskBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            # Convert UUID to string
            'UUID': lambda v: str(v)
        }

class KnowledgeBaseBase(BaseModel):
    document_name: str = Field(..., min_length=1, max_length=255)
    content: Optional[str] = None
    ai_summary: Optional[str] = None
    link_citations: Optional[List[str]] = None

class KnowledgeBaseCreate(KnowledgeBaseBase):
    related_projects: Optional[List[str]] = None
    related_goals: Optional[List[str]] = None
    related_tasks: Optional[List[str]] = None

class KnowledgeBaseUpdate(BaseModel):
    document_name: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None
    ai_summary: Optional[str] = None
    link_citations: Optional[List[str]] = None

class KnowledgeBase(KnowledgeBaseBase):
    id: str
    date_added: date
    created_at: datetime
    updated_at: datetime
    related_entities: Optional[List[str]] = None
    related_entity_ids: Optional[List[str]] = None
    entity_types: Optional[List[str]] = None

    class Config:
        from_attributes = True