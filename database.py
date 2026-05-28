from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLiteデータベースのURL
SQLALCHEMY_DATABASE_URL = "sqlite:///./todo.db"

# データベースを動かすためのエンジンを作成
engine = create_engine(
    #SQLiteのみ必要な、スレッドの制限を解除するための引数
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# データベースとやり取りするセッションを作る
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# データベースのモデルクラスの基底クラスを作成
Base = declarative_base()