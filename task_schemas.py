from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# タスクの作成と更新に使用するスキーマ
class TodoBase(BaseModel):
    #タイトル(必須)
    title: str    
    #詳細(任意)                      
    description: Optional[str] = None   

# ユーザがタスクを作成するときに送ってくる形
class TodoCreate(TodoBase):
    pass   #新しく作る時はタイトルと詳細があればよい→BaseのままでOK

# レスポンス用スキーマには
# タスクスキーマを継承して、さらにIDと完了フラグを追加する
class TodoResponse(TodoBase):
    id: int  
    #完了フラグ
    is_completed: bool  
    created_at: datetime  #タスクの作成日時を追加
    class Config:
        from_attributes = True  #ORMモデルをPydanticモデルに変換するための設定