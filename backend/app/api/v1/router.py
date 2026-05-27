"""
API v1 routes.

PUBLIC:     POST /auth/register, POST /auth/login
PROTECTED:  everything else — see app/core/auth.py
"""

from fastapi import APIRouter, Depends

from app.api.v1 import (
    admin,
    admissions,
    attendance,
    auth,
    classes,
    dashboard,
    fees,
    holidays,
    installments,
    students,
    subjects,
    tests,
    users,
)
from app.core.auth import require_institute_admin, require_institute_user, require_platform_admin

# Router-level auth — catches any endpoint that forgets Depends(...)
INSTITUTE_AUTH = [Depends(require_institute_user)]
INSTITUTE_ADMIN_AUTH = [Depends(require_institute_admin)]
ADMIN_AUTH = [Depends(require_platform_admin)]

v1_router = APIRouter()

v1_router.include_router(auth.router)
v1_router.include_router(admin.router, dependencies=ADMIN_AUTH)
v1_router.include_router(users.router, dependencies=INSTITUTE_AUTH)
v1_router.include_router(students.router, dependencies=INSTITUTE_AUTH)
v1_router.include_router(admissions.router, dependencies=INSTITUTE_AUTH)
v1_router.include_router(classes.router, dependencies=INSTITUTE_AUTH)
v1_router.include_router(subjects.router, dependencies=INSTITUTE_AUTH)
v1_router.include_router(tests.router, dependencies=INSTITUTE_AUTH)
v1_router.include_router(attendance.router, dependencies=INSTITUTE_AUTH)
v1_router.include_router(holidays.router, dependencies=INSTITUTE_AUTH)
v1_router.include_router(dashboard.router, dependencies=INSTITUTE_AUTH)
v1_router.include_router(fees.router, dependencies=INSTITUTE_ADMIN_AUTH)
v1_router.include_router(installments.router, dependencies=INSTITUTE_ADMIN_AUTH)
