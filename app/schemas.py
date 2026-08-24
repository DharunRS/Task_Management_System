from pydantic import BaseModel, Field, model_validator
from typing import Optional
from datetime import datetime
from app.models import PriorityEnum

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    priority: PriorityEnum = Field(...)  # Mandatory
    status: Optional[str] = "pending"
    start_time: datetime = Field(...)   # Mandatory
    end_time: datetime = Field(...)     # Mandatory

    @model_validator(mode='after')
    def validate_task_dates(self):
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValueError("end_time must be later than start_time")
        return self

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    status: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True