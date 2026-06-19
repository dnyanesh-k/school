from typing import Optional

from pydantic import BaseModel, HttpUrl


class InstituteSettingsOut(BaseModel):
    drive_url: Optional[str] = None

    model_config = {"from_attributes": True}


class InstituteSettingsUpdate(BaseModel):
    drive_url: Optional[str] = None
