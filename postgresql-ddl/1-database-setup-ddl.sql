-- Event Horizon Database Setup
-- Run these commands as PostgreSQL superuser

-- Create database (if not exists)
-- CREATE DATABASE event_horizon;

-- Connect to the database and enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUM types for better data integrity
CREATE TYPE project_status AS ENUM ('Planning Phase', 'Active', 'Completed', 'Cancelled');
CREATE TYPE goal_status AS ENUM ('Not started', 'Active', 'Done', 'Cancelled');
CREATE TYPE task_status AS ENUM ('Not started', 'Active', 'Done', 'Cancelled');
CREATE TYPE priority_level AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE effort_level AS ENUM ('Small', 'Medium', 'Large');
CREATE TYPE expansion_horizon AS ENUM ('1 Week', '2 Weeks', '3 Weeks');
CREATE TYPE milestone_granularity AS ENUM ('Monthly', 'Quarterly', 'Monthly&Quarterly');
CREATE TYPE goal_scope AS ENUM ('Monthly', 'Quarterly', 'Weekly-Milestone');
CREATE TYPE task_type AS ENUM ('Network', 'Debug', 'Review', 'Develop', 'Marketing', 'Provision', 'Research');