"""
OpenMTSciEd 用户认证 API
提供 JWT Token -based 认证
"""

from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
import jwt
import os

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

# JWT 配置
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change_me_in_production_use_long_random_string")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 模拟用户数据库（实际应使用 PostgreSQL）
fake_users_db = {
    "testuser": {
        "username": "testuser",
        "email": "test@example.com",
        "hashed_password": "fake_hashed_password",  # 实际应使用 bcrypt
        "full_name": "Test User",
        "disabled": False,
    }
}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


class Token(BaseModel):
    """Token 响应模型"""
    access_token: str
    token_type: str
    expires_in: int


class TokenData(BaseModel):
    """Token 数据模型"""
    username: Optional[str] = None


class User(BaseModel):
    """用户模型"""
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None


class UserInDB(User):
    """数据库中的用户模型"""
    hashed_password: str


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码（简化版，实际应使用 bcrypt）"""
    # TODO: 使用 passlib 和 bcrypt
    return plain_password == "password123"  # 仅用于演示


def get_user(username: str) -> Optional[UserInDB]:
    """获取用户"""
    if username in fake_users_db:
        user_dict = fake_users_db[username]
        return UserInDB(**user_dict)
    return None


def authenticate_user(username: str, password: str) -> Optional[UserInDB]:
    """认证用户"""
    user = get_user(username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """创建 JWT Access Token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """获取当前用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    用户登录获取 Token
    
    - **username**: 用户名
    - **password**: 密码
    
    返回 JWT Access Token
    """
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    获取当前用户信息
    
    需要提供有效的 Bearer Token
    """
    return current_user


@router.post("/register")
async def register_user(username: str, email: str, password: str, full_name: Optional[str] = None):
    """
    注册用户（简化版）
    
    - **username**: 用户名（唯一）
    - **email**: 邮箱
    - **password**: 密码
    - **full_name**: 全名（可选）
    """
    # 检查用户是否已存在
    if username in fake_users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # TODO: 实际应哈希密码并存储到数据库
    fake_users_db[username] = {
        "username": username,
        "email": email,
        "hashed_password": password,  # 实际应使用 bcrypt.hash()
        "full_name": full_name or username,
        "disabled": False,
    }
    
    return {"message": "User registered successfully", "username": username}
