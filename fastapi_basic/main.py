from fastapi import FastAPI
import uvicorn
from dto import UserCreate, UserResponse

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}
# 경로 매개변수
# localhost:8000/users/1
# localhost:8000/users/2
# localhost:8000/users/aaa
# localhost:8000/users/1234
@app.get("/users/{user_id}")
def get_user(user_id: int):
    # 비즈니스로직 처리
    return {"user_id": user_id}

# 쿼리 매개변수
@app.get("/item")
def get_item(limit: int = 300): # 타입 힌트 추가
    # 비즈니스 로직처리
    result = limit + 200
    return {"result_1": result}

@app.post("/user_info", response_model=UserResponse)
def create_user(user: UserCreate):
    print(user)
    user_info = UserResponse(
        name=user.name,
        # UserCreate 에서 avatar_url을 HttpUrl 이기 때문에
        # type을 맞추기 위해 str() 형변환 함.
        avatar_url=str(user.avatar_url)
    )

    return user_info

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=9000,
        reload=True,
    )