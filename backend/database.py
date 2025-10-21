import os
import psycopg
from psycopg import sql
from psycopg.rows import dict_row
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/event_horizon_prod")

APP_ENV = os.getenv("APP_ENV", "development")

logger.info(f"Database configuration for {APP_ENV} environment")

class Database:
    def __init__(self):
        self.conn = None
    
    def connect(self):
        if not self.conn:
            try:
                # Log the full DATABASE_URL for debugging (mask password)
                masked_url = DATABASE_URL.replace(DATABASE_URL.split(':')[2].split('@')[0], '***')
                logger.info(f"Attempting to connect to database with URL: {masked_url}")
                
                self.conn = psycopg.connect(DATABASE_URL)
                logger.info(f"Connected to database: {DATABASE_URL.split('@')[1]}")
                
                # Register the UUID loader for this connection
                from psycopg.adapt import Loader
                
                class UuidTextLoader(Loader):
                    def load(self, data):
                        if isinstance(data, memoryview):
                            return bytes(data).decode('utf-8')
                        return data.decode('utf-8')
                
                # Register the loader for the UUID type by name
                self.conn.adapters.register_loader("uuid", UuidTextLoader)
            except Exception as e:
                logger.error(f"Failed to connect to database: {e}")
                raise
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
            
            # Check if query has RETURNING clause by checking if we can fetch results
            try:
                result = cursor.fetchone()
                
                if result is None:
                    conn.rollback()
                    raise Exception(f"INSERT query must include RETURNING clause to get the inserted ID. Error: the last operation didn't produce records (command status: {cursor.statusmessage})")
                
                # Commit after successful fetch
                conn.commit()
                
                if "id" in result:
                    return str(result["id"])
                else:
                    raise Exception("INSERT query did not return an 'id' field")
            except Exception as e:
                conn.rollback()
                raise Exception(f"INSERT query must include RETURNING clause to get the inserted ID. Error: {str(e)}")
    
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