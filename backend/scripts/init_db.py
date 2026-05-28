"""Create database tables for all registered models."""

import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.db.session import Base, engine
from app.models import (
    Admission,
    Attendance,
    AttendanceSubmission,
    Class,
    FeePlan,
    Holiday,
    Installment,
    Institute,
    PasswordResetOtp,
    Student,
    Subject,
    Test,
    TestScore,
    User,
)


async def init_db() -> None:
    async with engine.begin() as conn:
        # DROP ALL TABLES
        await conn.run_sync(Base.metadata.drop_all)

        # CREATE ALL TABLES
        await conn.run_sync(Base.metadata.create_all)

    await engine.dispose()

    print("Database reset successfully.")


if __name__ == "__main__":
    asyncio.run(init_db())