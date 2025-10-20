#!/usr/bin/env python3
"""
Modified Mock Data Generator for Event Horizon Database
This script generates mock data only for missing tables, respecting existing data.
"""

import os
import sys
import json
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any
import uuid

# Add the parent directory to Python path to import database module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import db


class MockDataGenerator:
    """Generate mock data for Event Horizon database"""
    
    def __init__(self):
        # Sample data for realistic content
        self.project_names = [
            "API Documentation Update",
            "Performance Optimization Initiative", 
            "Security Audit Implementation",
            "Mobile App Development",
            "Data Analytics Platform",
            "Customer Portal Enhancement",
            "Machine Learning Integration",
            "Cloud Infrastructure Migration"
        ]
        
        self.project_descriptions = [
            "Update all API documentation to reflect new database schema",
            "Improve application performance through optimization techniques",
            "Implement comprehensive security measures and audit trails",
            "Develop a mobile application for the Event Horizon platform",
            "Build a comprehensive data analytics platform",
            "Enhance the customer portal with new features",
            "Integrate machine learning capabilities",
            "Migrate infrastructure to cloud-based solutions"
        ]
        
        self.goal_names = [
            "Database Schema Implementation",
            "Data Migration Script",
            "Performance Analysis",
            "UI Component Development",
            "Security Assessment",
            "API Design",
            "Testing Framework Setup",
            "Documentation Update",
            "Week 1: Planning",
            "Week 2: Implementation",
            "Week 3: Testing",
            "Week 4: Deployment"
        ]
        
        self.task_names = [
            "Create DDL scripts",
            "Test database connection",
            "Implement core tables",
            "Create indexes",
            "Implement triggers",
            "Design API endpoints",
            "Write unit tests",
            "Update documentation",
            "Setup CI/CD pipeline",
            "Performance benchmarking",
            "Security review",
            "Code optimization",
            "User testing",
            "Deploy to staging",
            "Monitor performance"
        ]
        
        self.knowledge_documents = [
            {
                "name": "PostgreSQL Best Practices",
                "content": "# PostgreSQL Best Practices\n\n## Indexing Strategies\n- Create indexes on frequently queried columns\n- Use composite indexes for multi-column queries\n- Monitor index usage and remove unused indexes\n\n## Performance Optimization\n- Use EXPLAIN ANALYZE to analyze query performance\n- Implement connection pooling\n- Regularly update statistics with ANALYZE",
                "summary": "Comprehensive guide on PostgreSQL optimization including indexing strategies and performance tuning techniques."
            },
            {
                "name": "n8n Workflow Design Patterns",
                "content": "# n8n Workflow Design Patterns\n\n## Error Handling\n- Implement retry mechanisms for external API calls\n- Use error handling nodes to manage failures\n- Set up notifications for critical errors\n\n## Performance Optimization\n- Batch operations when possible\n- Use parallel execution for independent tasks\n- Implement caching for frequently accessed data",
                "summary": "Collection of design patterns and best practices for building efficient n8n workflows."
            },
            {
                "name": "Database Migration Guide",
                "content": "# Database Migration Guide\n\n## Planning Phase\n- Inventory all data sources\n- Map data relationships\n- Plan migration strategy\n\n## Execution Phase\n- Create backup of all data\n- Run migration in phases\n- Validate data integrity\n\n## Post-Migration\n- Update application connections\n- Monitor performance\n- Document new schema",
                "summary": "Step-by-step guide for planning and executing database migrations with minimal downtime."
            },
            {
                "name": "API Security Best Practices",
                "content": "# API Security Best Practices\n\n## Authentication\n- Implement OAuth 2.0 for secure authentication\n- Use JWT tokens for session management\n- Implement token refresh mechanisms\n\n## Authorization\n- Role-based access control (RBAC)\n- Principle of least privilege\n- Regular security audits",
                "summary": "Essential security practices for building secure and robust APIs."
            },
            {
                "name": "Frontend Performance Guide",
                "content": "# Frontend Performance Guide\n\n## Optimization Techniques\n- Code splitting and lazy loading\n- Image optimization and compression\n- Bundle size reduction\n\n## Monitoring\n- Performance metrics tracking\n- Real user monitoring (RUM)\n- Core Web Vitals optimization",
                "summary": "Comprehensive guide to optimizing frontend application performance."
            }
        ]
        
        # Enum values from the database schema
        self.project_statuses = ['Planning Phase', 'Active', 'Completed', 'Cancelled']
        self.goal_statuses = ['Not started', 'Active', 'Done', 'Cancelled']
        self.task_statuses = ['Not started', 'Active', 'Done', 'Cancelled']
        self.task_types = ['Network', 'Debug', 'Review', 'Develop', 'Marketing', 'Provision', 'Research']
        self.priority_levels = ['Low', 'Medium', 'High']
        self.effort_levels = ['Small', 'Medium', 'Large']
        self.expansion_horizons = ['1 Week', '2 Weeks', '3 Weeks']
        self.milestone_granularities = ['Monthly', 'Quarterly', 'Monthly&Quarterly']
        self.goal_scopes = ['Monthly', 'Quarterly', 'Weekly-Milestone']

    def get_existing_project_names(self):
        """Get list of existing project names to avoid duplicates"""
        try:
            result = db.execute_query("SELECT name FROM projects")
            return [row['name'] for row in result]
        except Exception as e:
            print(f"Error getting existing project names: {e}")
            return []

    def generate_projects(self, count: int = 3) -> List[str]:
        """Generate mock projects, avoiding duplicates"""
        print(f"Generating up to {count} projects...")
        
        project_ids = []
        existing_names = self.get_existing_project_names()
        available_names = [name for name in self.project_names if name not in existing_names]
        
        if not available_names:
            print("All project names are already used. Using generic names.")
            available_names = [f"New Project {i+1}" for i in range(min(count, 3))]
        
        today = datetime.now()
        actual_count = min(count, len(available_names))
        
        for i in range(actual_count):
            # Generate dates
            start_date = today - timedelta(days=random.randint(30, 90))
            end_date = start_date + timedelta(days=random.randint(60, 180))
            
            # Randomly select values
            name = available_names[i]
            description = random.choice(self.project_descriptions)
            status = random.choice(self.project_statuses)
            is_active = status == 'Active'
            is_validated = random.choice([True, False])
            time_estimate_months = random.randint(1, 12)
            time_estimation_validated = random.choice([True, False])
            expansion_horizon = random.choice(self.expansion_horizons)
            milestone_granularity = random.choice(self.milestone_granularities)
            
            query = """
            INSERT INTO projects (
                name, description, status, start_date, end_date, 
                is_active, is_validated, time_estimate_months, 
                time_estimation_validated, expansion_horizon, milestone_granularity
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """
            
            try:
                project_id = db.execute_insert(query, (
                    name, description, status, start_date.date(), end_date.date(),
                    is_active, is_validated, time_estimate_months,
                    time_estimation_validated, expansion_horizon, milestone_granularity
                ))
                project_ids.append(project_id)
                print(f"Created project: {name} (ID: {project_id})")
            except Exception as e:
                print(f"Error creating project: {e}")
        
        return project_ids

    def get_existing_projects(self) -> List[str]:
        """Get all existing project IDs"""
        try:
            result = db.execute_query("SELECT id FROM projects")
            return [row['id'] for row in result]
        except Exception as e:
            print(f"Error getting existing projects: {e}")
            return []

    def generate_goals(self, project_ids: List[str], goals_per_project: int = 3) -> List[str]:
        """Generate mock goals for projects"""
        print(f"Generating goals for {len(project_ids)} projects...")
        
        goal_ids = []
        today = datetime.now()
        
        for project_id in project_ids:
            # Generate parent goals first
            parent_goal_ids = []
            
            for i in range(goals_per_project):
                # Generate dates
                created_at = today - timedelta(days=random.randint(20, 60))
                due_date = created_at + timedelta(days=random.randint(30, 90))
                
                # Randomly select values
                name = random.choice(self.goal_names)
                description = f"Implement {name.lower()} for the project"
                status = random.choice(self.goal_statuses)
                scope = random.choice(self.goal_scopes)
                success_criteria = f"Successfully complete {name.lower()}"
                
                # 30% chance of being a parent goal
                is_parent = random.random() < 0.3
                
                query = """
                INSERT INTO goals (
                    name, description, status, scope, success_criteria, 
                    due_date, project_id, parent_goal_id
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """
                
                try:
                    goal_id = db.execute_insert(query, (
                        name, description, status, scope, success_criteria,
                        due_date.date(), project_id, None
                    ))
                    
                    if is_parent:
                        parent_goal_ids.append(goal_id)
                    
                    goal_ids.append(goal_id)
                    print(f"Created goal: {name} (ID: {goal_id})")
                except Exception as e:
                    print(f"Error creating goal: {e}")
            
            # Generate child goals for some parent goals
            for parent_id in parent_goal_ids:
                num_children = random.randint(1, 2)
                for i in range(num_children):
                    created_at = today - timedelta(days=random.randint(10, 30))
                    due_date = created_at + timedelta(days=random.randint(15, 45))
                    
                    name = random.choice(["Week 1: Planning", "Week 2: Implementation", "Week 3: Testing", "Week 4: Deployment"])
                    description = f"Complete {name.lower()} tasks"
                    status = random.choice(self.goal_statuses)
                    scope = "Weekly-Milestone"
                    success_criteria = f"All {name.lower()} tasks completed"
                    
                    query = """
                    INSERT INTO goals (
                        name, description, status, scope, success_criteria, 
                        due_date, project_id, parent_goal_id
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                    """
                    
                    try:
                        goal_id = db.execute_insert(query, (
                            name, description, status, scope, success_criteria,
                            due_date.date(), project_id, parent_id
                        ))
                        goal_ids.append(goal_id)
                        print(f"Created child goal: {name} (ID: {goal_id})")
                    except Exception as e:
                        print(f"Error creating child goal: {e}")
        
        return goal_ids

    def generate_tasks(self, goal_ids: List[str], tasks_per_goal: int = 3) -> List[str]:
        """Generate mock tasks for goals"""
        print(f"Generating tasks for {len(goal_ids)} goals...")
        
        task_ids = []
        today = datetime.now()
        
        for goal_id in goal_ids:
            for i in range(tasks_per_goal):
                # Generate dates
                created_at = today - timedelta(days=random.randint(5, 30))
                due_date = created_at + timedelta(days=random.randint(5, 30))
                
                # Randomly select values
                name = random.choice(self.task_names)
                description = f"Complete {name.lower()} for the goal"
                status = random.choice(self.task_statuses)
                task_type = random.choice(self.task_types)
                priority = random.choice(self.priority_levels)
                effort_level = random.choice(self.effort_levels)
                time_estimate_minutes = random.randint(30, 480)  # 30 mins to 8 hours
                
                # Set completion date if status is Done
                date_completed = None
                if status == 'Done':
                    date_completed = created_at + timedelta(days=random.randint(1, 10))
                
                query = """
                INSERT INTO tasks (
                    name, description, status, task_type, priority, effort_level,
                    time_estimate_minutes, due_date, date_completed, goal_id
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """
                
                try:
                    task_id = db.execute_insert(query, (
                        name, description, status, task_type, priority, effort_level,
                        time_estimate_minutes, due_date.date(), 
                        date_completed.date() if date_completed else None, goal_id
                    ))
                    task_ids.append(task_id)
                    print(f"Created task: {name} (ID: {task_id})")
                except Exception as e:
                    print(f"Error creating task: {e}")
        
        return task_ids

    def generate_task_dependencies(self, task_ids: List[str]):
        """Generate task dependencies"""
        print(f"Generating dependencies for {len(task_ids)} tasks...")
        
        # Create dependencies for about 30% of tasks
        num_dependencies = int(len(task_ids) * 0.3)
        
        for i in range(num_dependencies):
            if len(task_ids) < 2:
                break
                
            # Select random tasks
            task_id = random.choice(task_ids)
            depends_on_task_id = random.choice([t for t in task_ids if t != task_id])
            
            # Check if dependency already exists
            check_query = """
            SELECT id FROM task_dependencies 
            WHERE task_id = %s AND depends_on_task_id = %s
            """
            
            try:
                existing = db.execute_query(check_query, (task_id, depends_on_task_id))
                
                if not existing:
                    query = """
                    INSERT INTO task_dependencies (task_id, depends_on_task_id)
                    VALUES (%s, %s)
                    RETURNING id
                    """
                    
                    dep_id = db.execute_insert(query, (task_id, depends_on_task_id))
                    print(f"Created dependency: Task {task_id} depends on Task {depends_on_task_id}")
            except Exception as e:
                print(f"Error creating task dependency: {e}")

    def generate_knowledge_base(self, count: int = 5) -> List[str]:
        """Generate knowledge base documents"""
        print(f"Generating {count} knowledge base documents...")
        
        kb_ids = []
        today = datetime.now()
        
        for i in range(min(count, len(self.knowledge_documents))):
            doc = self.knowledge_documents[i]
            date_added = today - timedelta(days=random.randint(1, 30))
            
            query = """
            INSERT INTO knowledge_base (
                document_name, content, ai_summary, date_added
            ) VALUES (%s, %s, %s, %s)
            RETURNING id
            """
            
            try:
                kb_id = db.execute_insert(query, (
                    doc["name"], doc["content"], doc["summary"], date_added.date()
                ))
                kb_ids.append(kb_id)
                print(f"Created knowledge base: {doc['name']} (ID: {kb_id})")
            except Exception as e:
                print(f"Error creating knowledge base: {e}")
        
        return kb_ids

    def generate_knowledge_references(self, kb_ids: List[str], project_ids: List[str], 
                                    goal_ids: List[str], task_ids: List[str]):
        """Generate knowledge base references"""
        print("Generating knowledge base references...")
        
        # Create references for about 50% of knowledge base items
        for kb_id in kb_ids:
            if random.random() < 0.5:
                # Reference to projects
                if project_ids and random.random() < 0.7:
                    project_id = random.choice(project_ids)
                    query = """
                    INSERT INTO knowledge_base_references (knowledge_base_id, entity_type, entity_id)
                    VALUES (%s, 'project', %s)
                    """
                    try:
                        db.execute_update(query, (kb_id, project_id))
                        print(f"Created reference: KB {kb_id} -> Project {project_id}")
                    except Exception as e:
                        print(f"Error creating project reference: {e}")
                
                # Reference to goals
                if goal_ids and random.random() < 0.5:
                    goal_id = random.choice(goal_ids)
                    query = """
                    INSERT INTO knowledge_base_references (knowledge_base_id, entity_type, entity_id)
                    VALUES (%s, 'goal', %s)
                    """
                    try:
                        db.execute_update(query, (kb_id, goal_id))
                        print(f"Created reference: KB {kb_id} -> Goal {goal_id}")
                    except Exception as e:
                        print(f"Error creating goal reference: {e}")
                
                # Reference to tasks
                if task_ids and random.random() < 0.3:
                    task_id = random.choice(task_ids)
                    query = """
                    INSERT INTO knowledge_base_references (knowledge_base_id, entity_type, entity_id)
                    VALUES (%s, 'task', %s)
                    """
                    try:
                        db.execute_update(query, (kb_id, task_id))
                        print(f"Created reference: KB {kb_id} -> Task {task_id}")
                    except Exception as e:
                        print(f"Error creating task reference: {e}")

    def verify_data_integrity(self):
        """Verify that all data was created correctly"""
        print("\nVerifying data integrity...")
        
        tables = ['projects', 'goals', 'tasks', 'task_dependencies', 'knowledge_base', 'knowledge_base_references']
        
        for table in tables:
            try:
                count_query = f"SELECT COUNT(*) as count FROM {table}"
                result = db.execute_query(count_query)
                count = result[0]['count'] if result else 0
                print(f"{table}: {count} records")
            except Exception as e:
                print(f"Error counting {table}: {e}")
        
        # Check relationships
        try:
            # Check orphaned goals
            orphaned_goals = db.execute_query("""
                SELECT COUNT(*) as count FROM goals g 
                LEFT JOIN projects p ON g.project_id = p.id 
                WHERE p.id IS NULL
            """)
            print(f"Orphaned goals: {orphaned_goals[0]['count']}")
            
            # Check orphaned tasks
            orphaned_tasks = db.execute_query("""
                SELECT COUNT(*) as count FROM tasks t 
                LEFT JOIN goals g ON t.goal_id = g.id 
                WHERE g.id IS NULL
            """)
            print(f"Orphaned tasks: {orphaned_tasks[0]['count']}")
            
        except Exception as e:
            print(f"Error checking relationships: {e}")

    def generate_missing_data(self):
        """Generate missing mock data"""
        print("Starting missing mock data generation...")
        print("=" * 50)
        
        # Get existing projects
        project_ids = self.get_existing_projects()
        print(f"Found {len(project_ids)} existing projects")
        
        # Generate additional projects if needed (aim for at least 3 total)
        if len(project_ids) < 3:
            new_projects = self.generate_projects(3 - len(project_ids))
            project_ids.extend(new_projects)
        
        if not project_ids:
            print("No projects found. Cannot generate goals and tasks.")
            return False
        
        # Generate goals for all projects
        goal_ids = self.generate_goals(project_ids, 3)
        if not goal_ids:
            print("Failed to generate goals.")
            return False
        
        # Generate tasks for all goals
        task_ids = self.generate_tasks(goal_ids, 3)
        if not task_ids:
            print("Failed to generate tasks.")
            return False
        
        self.generate_task_dependencies(task_ids)
        
        # Generate knowledge base if empty
        kb_count = db.execute_query("SELECT COUNT(*) as count FROM knowledge_base")[0]['count']
        if kb_count == 0:
            kb_ids = self.generate_knowledge_base(5)
            if kb_ids:
                self.generate_knowledge_references(kb_ids, project_ids, goal_ids, task_ids)
        
        # Verify data integrity
        self.verify_data_integrity()
        
        print("=" * 50)
        print("Missing mock data generation completed successfully!")
        return True


def main():
    """Main function to run the mock data generator"""
    print("Event Horizon Missing Mock Data Generator")
    print("=" * 50)
    
    try:
        generator = MockDataGenerator()
        success = generator.generate_missing_data()
        
        if success:
            print("\n✅ Missing mock data generated successfully!")
            print("\nYou can now test the application with the generated data.")
        else:
            print("\n❌ Failed to generate missing mock data.")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n❌ Error during mock data generation: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()