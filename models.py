from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base


#データベースのtodosテーブルの構造を定義
class Todo(Base):
    __tablename__ = "todos"  #テーブル名

    id = Column(Integer, primary_key=True, index=True) 
    title = Column(String, nullable=False)             #タイトル(空は禁止)
    description = Column(String, nullable=True)        #詳細(空もOK)
    is_completed = Column(Boolean, default=False)      #完了フラグ, 初期値はFalse(未完了)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)  #作成日時, デフォルトで現在の日時を設定