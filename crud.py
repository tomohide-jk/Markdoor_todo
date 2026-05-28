from sqlalchemy.orm import Session
import models
import task_schemas

# Read: タスクを全て取得する関数
def get_todos(db: Session):
    return db.query(models.Todo).all()  #全てのタスクを取得して返す

# Create: タスクを新規作成する関数
def create_todo(db: Session, todo: task_schemas.TodoCreate):
    db_todo = models.Todo(title=todo.title, description=todo.description)
    db.add(db_todo)  #新しいタスクをデータベースに追加
    db.commit()      #変更を保存
    db.refresh(db_todo)  #新しいタスクのIDなどを更新
    return db_todo  #作成したタスクを返す

# Update: タスクの完了フラグや詳細を更新する関数
def update_todo(db: Session, todo_id: int, todo_update: task_schemas.TodoCreate, is_completed: bool = None):
    # 更新するタスクをIDで検索
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if db_todo:
        db_todo.title = todo_update.title  #タイトルを更新
        db_todo.description = todo_update.description  #詳細を更新
        if is_completed is not None:
            db_todo.is_completed = is_completed  #完了フラグを更新
    db.commit()  #変更を保存
    db.refresh(db_todo)  #更新されたタスクの情報を最新にする
    return db_todo  #更新したタスクを返す

# Delete: タスクを削除する関数
def delete_todo(db: Session, todo_id: int):
    # 削除するタスクをIDで検索
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if db_todo:
        db.delete(db_todo)  #タスクを削除
        db.commit()  #変更を保存
        return True  #削除成功
    return False  #削除するタスクが見つからなかった場合はFalseを返す