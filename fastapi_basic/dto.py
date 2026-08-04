from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel, HttpUrl

# 요청 모델
class UserCreate(BaseModel):
    name: str
    password: str
    avatar_url: Optional[HttpUrl] = None

# 응답 모델
class UserResponse(BaseModel):
    name: str
    avatar_url: str