from fastapi import APIRouter
from app.api.v1 import auth, students, admissions

v1_router = APIRouter()
v1_router.include_router(auth.router)
v1_router.include_router(students.router)
v1_router.include_router(admissions.router)