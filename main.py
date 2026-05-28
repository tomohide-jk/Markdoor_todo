from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List

import models  
import task_schemas
import crud                
from database import engine, SessionLocal 


#データベースのテーブルを作成
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")


def get_db():
    db = SessionLocal()  #データベースセッションを作成
    try:
        yield db  #セッションを返す
    finally:
        db.close()  #セッションを閉じる

@app.get("/")
async def read_index():
    return FileResponse("index.html")  #ルートURLにアクセスしたときにindex.htmlを返す


# Create: タスクを新規作成するエンドポイント
@app.post("/tasks", response_model=task_schemas.TodoResponse)
async def create_task(task: task_schemas.TodoCreate, db: Session = Depends(get_db)):
    return crud.create_todo(db=db, todo=task)

# Read: タスクを全て取得するエンドポイント
@app.get("/tasks", response_model=List[task_schemas.TodoResponse])
async def read_tasks(db: Session = Depends(get_db)):
    return crud.get_todos(db=db)

# Update: タスクの完了フラグや詳細を更新するエンドポイント
@app.put("/tasks/{task_id}", response_model=task_schemas.TodoResponse)
async def update_task(task_id: int, task_update: task_schemas.TodoCreate, is_completed: bool = None, db: Session = Depends(get_db)):
    updated_task = crud.update_todo(db=db, todo_id=task_id, todo_update=task_update, is_completed=is_completed)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task

# Delete: タスクを削除するエンドポイント
@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int, db: Session = Depends(get_db)):
    success = crud.delete_todo(db=db, todo_id=task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"detail": "Task successfully deleted"}
