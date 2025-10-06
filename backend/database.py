import os
import psycopg
from psycopg import sql
from psycopg.rows import dict_row
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/event_horizon")

class Database:
    def __init__(self):
        self.conn = None
    
    def connect(self):
        if not self.conn:
            self.conn = psycopg.connect(DATABASE_URL)
        return self.conn
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        conn = self.connect()
        with conn.cursor(row_factory=dict_row) as cursor:
            cursor.execute(query, params)
            return cursor.fetchall()
    
    def execute_insert(self, query: str, params: tuple = None) -> str:
        conn = self.connect()
        with conn.cursor(row_factory=dict_row) as cursor:
            cursor.execute(query, params)
            conn.commit()
            return str(cursor.fetchone()["id"]) if cursor.description else None
    
    def execute_update(self, query: str, params: tuple = None) -> bool:
        conn = self.connect()
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            conn.commit()
            return cursor.rowcount > 0
    
    def execute_delete(self, query: str, params: tuple = None) -> bool:
        conn = self.connect()
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            conn.commit()
            return cursor.rowcount > 0

# Create a singleton instance
db = Database()