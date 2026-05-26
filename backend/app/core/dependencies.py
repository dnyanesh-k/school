# Backward-compatible re-exports — auth logic lives in app/core/auth.py
from app.core.auth import get_current_user, security

__all__ = ["get_current_user", "security"]
