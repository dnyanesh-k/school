from enum import Enum


class Role(str, Enum):
    PLATFORM_ADMIN = "platform_admin"
    INSTITUTE_ADMIN = "institute_admin"
    TEACHER = "teacher"
    INDEPENDENT_STUDENT = "independent_student"


class InstituteStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    REJECTED = "rejected"
    SUSPENDED = "suspended"
