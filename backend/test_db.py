#!/usr/bin/env python3
"""
Simple test script to verify database connection
"""
import os
import sys
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

def test_database_connection():
    try:
        from database import db
        
        print("Testing database connection...")
        
        # Test a simple query
        result = db.execute_query("SELECT 1 as test")
        print(f"Database connection successful: {result}")
        
        # Test if tables exist
        tables_query = """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
        """
        tables = db.execute_query(tables_query)
        print(f"Tables in database: {[t['table_name'] for t in tables]}")
        
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

if __name__ == "__main__":
    success = test_database_connection()
    sys.exit(0 if success else 1)