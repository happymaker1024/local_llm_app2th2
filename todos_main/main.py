from fastapi import FastAPI, Request, Form
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import uvicorn
import os

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

# http://127.0.0.1:8000/
@app.get("/")
async def home(request: Request):
    todos = 0
    return templates.TemplateResponse(
        request = request,
        name = "index.html",
        context={ "todos": todos}
    )

# http://127.0.0.1:8000/add    
@app.post("/add")
def add(request: Request, task: str = Form(...)):
    print(task)
    return task

# async def add(request: Request, task: str = Form(...), 
#               db_ss: Session = Depends(get_db)):
#     # 클라이언트에서 textarea에서 입력 데이터 넘어온것 확인
#     print(task)
#     # 클라이언트에서 넘어온 task를 Todo 객체로 생성
#     todo = models.Todo(task=task)
#     # 의존성 주입에서 처리함 Depends(get_db) : 엔진객체생성, 세션연결
#     # db 테이블에 task 저장하기
#     print(todo)
#     db_ss.add(todo)
#     # db에 실제 저장, commit
#     db_ss.commit()
#     # home 엔드포인함수로 제어권을 넘김
#     return RedirectResponse(url=app.url_path_for("home"), 
#                             status_code=status.HTTP_303_SEE_OTHER)    

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )