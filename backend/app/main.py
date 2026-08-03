"""
MessMate - FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.base import Base
from app.database.session import engine

# Import all models so they register with Base.metadata
from app.models import user, group, expense, contribution, meal, settlement  # noqa: F401

# Import all routers
from app.api import auth, users, groups, expenses, contributions, meals, settlements, dashboard


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="Manage grocery expenses, meal attendance, and monthly settlements for roommates.",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routers with matching API prefixes
    app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
    app.include_router(users.router, prefix="/api/users", tags=["users"])
    app.include_router(groups.router, prefix="/api/groups", tags=["groups"])
    app.include_router(expenses.router, prefix="/api/expenses", tags=["expenses"])
    app.include_router(contributions.router, prefix="/api/contributions", tags=["contributions"])
    app.include_router(meals.router, prefix="/api/meals", tags=["meals"])
    app.include_router(settlements.router, prefix="/api/settlements", tags=["settlements"])
    app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

    @app.on_event("startup")
    async def startup():
        """Create database tables on startup (dev only; use Alembic in prod)."""
        if settings.DEBUG:
            Base.metadata.create_all(bind=engine)

    @app.get("/", tags=["Health"])
    def health_check():
        return {
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "status": "healthy",
        }

    return app


app = create_app()
