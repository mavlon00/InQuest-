
import sys
import os
from sqlalchemy import create_engine

# Add the current directory to sys.path to import app
sys.path.append(os.getcwd())

from config import settings
# Use sync driver for initialization
sync_url = settings.DATABASE_URL.replace("sqlite+aiosqlite", "sqlite")

from app.database import Base
# Import all models from __init__ to register them with Base.metadata
import app.models as models

def run_init():
    print(f"Initializing database at {sync_url}...")
    engine = create_engine(sync_url)
    Base.metadata.create_all(engine)
    print("Database initialized successfully.")

if __name__ == "__main__":
    run_init()
