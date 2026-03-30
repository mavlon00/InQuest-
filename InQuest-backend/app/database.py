"""
Database connection and session management module.

This module configures SQLAlchemy 2.0+ with asyncio support for asynchronous
database operations. It provides session management, database initialization,
and utilities for creating/dropping tables.
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from typing import AsyncGenerator
from config import settings

# Create the declarative base for all ORM models
Base = declarative_base()

# Create async SQLAlchemy engine with connection pooling
# NOTE: Engine creation is wrapped in lazy initialization to prevent hanging on startup
engine = None

def _get_engine():
    """Lazy initialization of database engine."""
    global engine
    if engine is None:
        engine_kwargs = {
            "echo": settings.SQLALCHEMY_ECHO,
            "future": True,
        }
        
        # SQLite doesn't support these connection pool arguments
        if not settings.DATABASE_URL.startswith("sqlite"):
            engine_kwargs["pool_pre_ping"] = True
            engine_kwargs["pool_size"] = 20
            engine_kwargs["max_overflow"] = 10
            
        engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)
    return engine

# Create async session factory
AsyncSessionLocal = None

def _get_session_factory():
    """Lazy initialization of session factory."""
    global AsyncSessionLocal
    if AsyncSessionLocal is None:
        AsyncSessionLocal = async_sessionmaker(
            _get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
            autocommit=False,
        )
    return AsyncSessionLocal


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency provider for FastAPI routes to get a database session.
    
    Yields:
        AsyncSession: An asynchronous SQLAlchemy session.
        
    Example:
        @app.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(Item))
            return result.scalars().all()
    """
    async with _get_session_factory()() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize the database by creating all tables defined in Base.metadata.
    
    This should be called during application startup in development/testing.
    In production, use Alembic migrations instead.
    """
    engine_ = _get_engine()
    async with engine_.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def drop_db() -> None:
    """
    Drop all tables defined in Base.metadata.
    
    WARNING: This is destructive and should only be used in development/testing.
    Never use in production.
    """
    engine_ = _get_engine()
    async with engine_.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def close_db() -> None:
    """
    Close the database engine and all connections.
    
    Should be called during application shutdown.
    """
    engine_ = _get_engine()
    await engine_.dispose()
