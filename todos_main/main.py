from fastapi import Depends, FastAPI, Form, HTTPException, Request, status
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import uvicorn
import os
from database import engine, SessionLocal, Base
import models

# FastAPI() 객체 생성
app = FastAPI()

abs_path = os.path.dirname(os.path.realpath(__file__))

# print(abs_path)
# html 템플릿 폴더를 지정하여 jinja템플릿 객체 생성
# templates = Jinja2Templates(directory="templates")
templates = Jinja2Templates(directory=f"{abs_path}/templates")

# static 폴더(정적파일 폴더)를 app에 연결
# app.mount("/static", StaticFiles(directory=f"static"), name="static")
app.mount("/static", StaticFiles(directory=f"{abs_path}/static"), name="static")

# models에 정의한 모든 클래스, 연결한 DB엔진에 테이블로 생성
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db  # db 세션의 처리 끝날때까지 기다림
    finally:
        # 마지막에 무조건 닫음
        db.close()

# db table data read
# http://127.0.0.1:8000/
@app.get("/")
def home(request: Request, db_ss: Session = Depends(get_db)):
    # db 객체 생성, 세션연결하기 <- 의존성 주임으로 처리
    # 테이블 조회
    todos_r = db_ss.query(models.Todo).order_by(models.Todo.id.desc()).all()
    
    print(type(todos_r))
    # db 조회한 결과를 출력함
    for todo in todos_r:
        print(todo.id, todo.task, todo.completed)

    return templates.TemplateResponse(
        request = request,
        name = "index.html",
        context={ "todos": todos_r}
        )

# db table data create
# http://127.0.0.1:8000/add    
# @app.post("/add")
# def add(request: Request, task: str = Form(...)):
#     print(task)
#     return task
@app.post("/add")
def add(request: Request, task: str = Form(...), 
              db_ss: Session = Depends(get_db)):
    # 클라이언트에서 textarea에서 입력 데이터 넘어온것 확인
    print("클라이언트에서 넘어온 값", task)
    # 클라이언트에서 넘어온 task를 Todo 객체로 생성
    todo = models.Todo(task=task)
    # 의존성 주입에서 처리함 Depends(get_db) : 엔진객체생성, 세션연결
    # db 테이블에 task 저장하기
    print("Todo클래스의 객체인 todo의 task 값", todo.task)

    # db에 실제 저장
    db_ss.add(todo)

    # db테이블에 적용 commit <- 하나의 트렌젝션 종료
    db_ss.commit()
    # home 엔드포인함수로 제어권을 넘김
    return RedirectResponse(url=app.url_path_for("home"), 
                            status_code=status.HTTP_303_SEE_OTHER)    

# db table data update
# update를 위한 조회
@app.get("/edit/{todo_id}")
def edit(request: Request, 
         todo_id: int , 
         db_ss: Session = Depends(get_db)):
    # 요청 수정 처리
    todo = db_ss.query(models.Todo).filter(models.Todo.id==todo_id).first()
    print(todo.task)

    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    return templates.TemplateResponse(
        request=request,
        name = "edit.html",
        context = {"todo": todo}
    )

# update 실행
@app.post("/edit/{todo_id}")
def update(request: Request, 
                 todo_id: int, 
                 task: str = Form(...), 
                 completed: bool = Form(False), 
                 db: Session = Depends(get_db)):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    todo.task = task
    todo.completed = completed
    db.commit()
    return RedirectResponse(
        url=app.url_path_for("home"), 
        status_code=status.HTTP_303_SEE_OTHER)

# db table data delete
@app.post("/delete/{todo_id}")
def delete(request: Request, 
                 todo_id: int, 
                 db: Session = Depends(get_db)):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    db.delete(todo)
    db.commit()
    return RedirectResponse(
        url=app.url_path_for("home"), 
        status_code=status.HTTP_303_SEE_OTHER)

# uv run main.py 
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )