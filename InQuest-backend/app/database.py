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
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.SQLALCHEMY_ECHO,
    future=True,
    pool_pre_ping=True,  # Test connections before using them
    pool_size=20,  # Connection pool size
    max_overflow=10,  # Maximum overflow connections
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


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
    async with AsyncSessionLocal() as session:
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
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def drop_db() -> None:
    """
    Drop all tables defined in Base.metadata.
    
    WARNING: This is destructive and should only be used in development/testing.
    Never use in production.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def close_db() -> None:
    """
    Close the database engine and all connections.
    
    Should be called during application shutdown.
    """
    await engine.dispose()
