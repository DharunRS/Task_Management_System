from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app import schemas, models
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
def create_new_task(
    task: schemas.TaskCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Duplicate Title check (case-insensitive) for the current user
    existing_task = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        func.lower(models.Task.title) == func.lower(task.title.strip())
    ).first()

    if existing_task:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f'There is already a task with the title "{existing_task.title}". Please choose a different title.'
        )

    db_task = models.Task(**task.model_dump(), user_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/", response_model=List[schemas.TaskResponse])
def read_all_tasks(
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Task).filter(models.Task.user_id == current_user.id)
    
    # Priority filtering
    if priority and priority != "all":
        query = query.filter(models.Task.priority == priority)
        
    # Search by Title
    if search:
        query = query.filter(models.Task.title.ilike(f"%{search.strip()}%"))
        
    return query.order_by(models.Task.start_time.asc()).all()

@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_existing_task(
    task_id: int, 
    task: schemas.TaskUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    # If title is being modified, ensure it does not duplicate another task
    if task.title and task.title.strip().lower() != db_task.title.lower():
        duplicate_check = db.query(models.Task).filter(
            models.Task.user_id == current_user.id,
            func.lower(models.Task.title) == func.lower(task.title.strip()),
            models.Task.id != task_id
        ).first()
        if duplicate_check:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f'Another task already exists with the title "{duplicate_check.title}".'
            )

    update_data = task.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
        
    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/{task_id}", status_code=status.HTTP_200_OK)
def remove_task(
    task_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    db.delete(db_task)
    db.commit()
    return {"message": f"Task with id {task_id} deleted successfully"}