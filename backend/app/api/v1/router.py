from fastapi import APIRouter
from app.api.v1 import auth, students, admissions, classes, subjects, tests

v1_router = APIRouter()
v1_router.include_router(auth.router)
v1_router.include_router(students.router)
v1_router.include_router(admissions.router)
v1_router.include_router(classes.router)
v1_router.include_router(subjects.router)
v1_router.include_router(tests.router)
