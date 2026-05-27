# Backward-compatible re-exports — auth logic lives in app/core/auth.py
from app.core.auth import (
    require_institute_admin,
    require_institute_user,
    require_platform_admin,
    require_roles,
)
from app.core.roles import Role

require_institute_staff = require_roles(Role.INSTITUTE_ADMIN, Role.TEACHER)

__all__ = [
    "require_roles",
    "require_platform_admin",
    "require_institute_admin",
    "require_institute_staff",
    "require_institute_user",
]
