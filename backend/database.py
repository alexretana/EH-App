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
            results = cursor.fetchall()
            # Convert UUID objects to strings
            for row in results:
                for key, value in row.items():
                    # Handle direct UUID values
                    if hasattr(value, '__class__') and value.__class__.__name__ == 'UUID':
                        row[key] = str(value)
                    # Handle UUIDs in arrays
                    elif isinstance(value, list):
                        row[key] = self._convert_uuids_in_list(value)
                    # Handle UUIDs in other iterables
                    elif hasattr(value, '__iter__') and not isinstance(value, (str, bytes, dict)):
                        try:
                            row[key] = self._convert_uuids_in_list(list(value))
                        except (TypeError, AttributeError):
                            # If conversion fails, leave as is
                            pass
            return results
    
    def _convert_uuids_in_list(self, items):
        """Helper method to convert UUIDs in a list to strings"""
        return [
            str(item) if hasattr(item, '__class__') and item.__class__.__name__ == 'UUID' else item
            for item in items
        ]
    
    def execute_insert(self, query: str, params: tuple = None) -> str:
        conn = self.connect()
        with conn.cursor(row_factory=dict_row) as cursor:
            cursor.execute(query, params)
            conn.commit()
            result = cursor.fetchone()
            return str(result["id"]) if result and "id" in result else None
    
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