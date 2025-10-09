# Event Horizon Database Design

This folder contains the complete PostgreSQL database schema for the Event Horizon Planner application. The database is designed to support a hierarchical project planning system with projects, goals, tasks, and knowledge management.

## Database Architecture Overview

The Event Horizon database follows a hierarchical structure:
- **Projects** are the top-level containers
- **Goals** belong to projects and can have parent-child relationships
- **Tasks** belong to goals and can have dependencies on other tasks
- **Knowledge Base** stores documents that can be linked to any entity

## File Structure

### DDL Files (in execution order)

1. **1-database-setup-ddl.sql** - Database initialization
   - Creates the database (commented out)
   - Enables required extensions (pgcrypto)
   - Defines all ENUM types for data integrity

2. **2-core-tables-ddl.sql** - Core table definitions
   - Projects table with validation constraints
   - Goals table with hierarchical support
   - Tasks table with comprehensive fields
   - Task dependencies table with cycle prevention
   - Knowledge base and reference tables

3. **3-performance-indexes-ddl.sql** - Performance optimization
   - Primary relationship indexes
   - Status and date filtering indexes
   - Full-text search indexes
   - Composite indexes for common queries

4. **4-essential-triggers-ddl.sql** - Database automation
   - Automatic timestamp updates
   - Task dependency cycle prevention
   - Task auto-completion logic

5. **5-api-friendly-views-ddl.sql** - API convenience layer
   - Project dashboard with metrics
   - Task details with relationships
   - Goal progress tracking
   - Knowledge base with references

6. **6-stored-procedures-ddl.sql** - Business logic
   - Project creation with validation
   - Task dependency management
   - Task execution ordering
   - Project progress calculation
   - Cross-entity search

7. **7-sample-data-ddl.sql** - Sample data for testing
   - Example projects
   - Hierarchical goal structure
   - Task creation patterns

### Test Files

- **T1-database-connection-test.sql** - Basic connectivity tests
- **T2-triggers-constraints-test.sql** - Trigger and constraint validation
- **T3-views-procedures-test.sql** - Views and stored procedures testing

## Key Design Features

### Data Integrity
- **ENUM types** for consistent status values
- **CHECK constraints** for business rules
- **FOREIGN KEY constraints** with proper cascading
- **UNIQUE constraints** with deferrable options

### Performance Optimization
- **Strategic indexes** on all foreign keys and common query patterns
- **Partial indexes** for filtered queries
- **Full-text search** capabilities
- **Composite indexes** for complex queries

### Automation
- **Automatic timestamp management** with triggers
- **Task dependency cycle prevention**
- **Task status auto-completion** based on dates
- **Hierarchical data integrity**

### API-Friendly Design
- **Comprehensive views** for common API queries
- **Stored procedures** for complex operations
- **Search functionality** across all entities
- **Progress calculation** with metrics

## Entity Relationships

```
Projects (1) -----> (N) Goals
Goals (1) -----> (N) Tasks
Goals (1) -----> (N) Goals (self-reference for hierarchy)
Tasks (N) <-----> (N) Tasks (dependencies)
Knowledge Base (1) -----> (N) References
References (N) -----> (1) Projects/Goals/Tasks
```

## Implementation Instructions

### 1. Database Setup
```sql
-- Create the database (as superuser)
CREATE DATABASE event_horizon;

-- Connect to the database
\c event_horizon

-- Run the setup script
\i 1-database-setup-ddl.sql
```

### 2. Create Tables
```sql
-- Run in order
\i 2-core-tables-ddl.sql
\i 3-performance-indexes-ddl.sql
\i 4-essential-triggers-ddl.sql
\i 5-api-friendly-views-ddl.sql
\i 6-stored-procedures-ddl.sql
```

### 3. Add Sample Data (optional)
```sql
\i 7-sample-data-ddl.sql
```

### 4. Run Tests
```sql
-- Test basic functionality
\i T1-database-connection-test.sql

-- Test triggers and constraints
\i T2-triggers-constraints-test.sql

-- Test views and procedures
\i T3-views-procedures-test.sql
```

## Key Concepts

### Progressive Expansion
The database supports a "progressive expansion" methodology where:
- High-level goals are defined first (monthly/quarterly)
- Weekly milestones are created for the immediate horizon (2-4 weeks)
- Tasks are progressively expanded only for the current horizon
- Future work remains unexpanded until it enters the horizon

### Hierarchical Goals
Goals support a hierarchical structure:
- Strategic goals (monthly/quarterly)
- Weekly milestones (child of strategic goals)
- Tasks belong to weekly milestones
- Goals can have parent-child relationships

### Task Dependencies
Tasks can have dependencies on other tasks:
- Automatic cycle prevention
- Topological sorting for execution order
- Dependency tracking in both directions

### Knowledge Management
The knowledge base supports:
- Document storage with AI summaries
- Linking documents to any entity (project/goal/task)
- Full-text search across all content
- Citation tracking

## Performance Considerations

### Indexing Strategy
- All foreign keys are indexed
- Status fields have partial indexes
- Full-text search uses GIN indexes
- Common query patterns have composite indexes

### Query Optimization
- Views pre-join commonly needed data
- Stored procedures encapsulate complex logic
- Recursive CTEs handle hierarchical data
- Materialized views could be added for heavy reporting

### Scaling Considerations
- Partitioning could be added for large datasets
- Connection pooling recommended for high concurrency
- Regular maintenance for index statistics
- Archive strategy for completed projects

## Security Considerations

### Access Control
- Row-level security could be implemented
- Role-based access to different entity types
- Audit logging for sensitive operations

### Data Protection
- Sensitive data should be encrypted at rest
- PII should be masked in non-production environments
- Regular backups with point-in-time recovery

## Migration Strategy

### Version Control
- All DDL changes should be versioned
- Migration scripts should be idempotent
- Rollback procedures should be documented

### Deployment
- Use transaction blocks for atomic changes
- Test migrations in staging environment
- Monitor performance after deployments

## Troubleshooting

### Common Issues
1. **Dependency cycles**: Check for circular references in task_dependencies
2. **Date range errors**: Verify end_date >= start_date
3. **Enum type errors**: Ensure correct enum values are used
4. **Performance issues**: Check query plans and index usage

### Debugging Queries
```sql
-- Check for circular dependencies
WITH RECURSIVE dependency_path AS (
    SELECT task_id, depends_on_task_id, 1 as depth
    FROM task_dependencies
    UNION ALL
    SELECT dp.task_id, td.depends_on_task_id, dp.depth + 1
    FROM dependency_path dp
    JOIN task_dependencies td ON dp.depends_on_task_id = td.task_id
    WHERE dp.depth < 100
)
SELECT * FROM dependency_path WHERE task_id = depends_on_task_id;

-- Check query performance
EXPLAIN ANALYZE SELECT * FROM project_dashboard WHERE status = 'Active';
```

## Future Enhancements

### Potential Improvements
1. **Materialized views** for heavy reporting
2. **Partitioning** for large datasets
3. **Full-text search** with custom dictionaries
4. **Audit logging** for compliance
5. **Data archiving** for completed projects
6. **API rate limiting** at database level
7. **Connection pooling** configuration
8. **Read replicas** for reporting queries

### Integration Points
- n8n workflow integration
- External API synchronization
- Real-time notifications
- File storage integration
- Authentication system integration