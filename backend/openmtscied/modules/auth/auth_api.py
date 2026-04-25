"""认证 API 路由"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from slowapi import Limiter
from slowapi.util import get_remote_address
import os

router = APIRouter()

# 创建限流器实例 - 根据环境调整限制
APP_ENV = os.getenv("APP_ENV", "development")
if APP_ENV == "production":
    LOGIN_RATE_LIMIT = "5/minute"
    REGISTER_RATE_LIMIT = "3/minute"
else:
    # 开发/测试环境放宽限制
    LOGIN_RATE_LIMIT = "100/minute"
    REGISTER_RATE_LIMIT = "50/minute"

limiter = Limiter(key_func=get_remote_address)

# JWT 配置 - 生产环境必须设置 SECRET_KEY
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise EnvironmentError(
        "SECRET_KEY 环境变量未设置！\n"
        "请在 .env.local 文件中配置强密钥。\n"
        "生成方法: python -c \"import secrets; print(secrets.token_urlsafe(32))\""
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 默认7天

# 密码哈希上下文 - 使用 bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Mock 用户数据 (实际应连接数据库)
MOCK_USERS = {
    "admin": {
        "id": 1,
        "username": "admin",
        "email": "3936318150@qq.com",
        "password_hash": pwd_context.hash("12345678"),  # 使用 bcrypt 哈希
        "role": "admin"
    },
    "3936318150@qq.com": {
        "id": 1,
        "username": "admin",
        "email": "3936318150@qq.com",
        "password_hash": pwd_context.hash("12345678"),  # 使用 bcrypt 哈希
        "role": "admin"
    }
}

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: Optional[str] = None

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """生成密码哈希"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """创建JWT访问令牌"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(OAuth2PasswordBearer(tokenUrl="login"))) -> dict:
    """获取当前用户（通过JWT token）"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = MOCK_USERS.get(username)
    if user is None:
        raise credentials_exception
    return user

@router.post("/login", response_model=Token)
@limiter.limit(LOGIN_RATE_LIMIT)  # 动态速率限制
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    """用户登录"""
    user = MOCK_USERS.get(form_data.username)
    
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 创建JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserResponse)
@limiter.limit(REGISTER_RATE_LIMIT)  # 动态速率限制
async def register(request: Request, user_data: UserRegister):
    """用户注册"""
    # 检查用户名是否已存在
    for key, user in MOCK_USERS.items():
        if user["username"] == user_data.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名已存在"
            )
        if user["email"] == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已被注册"
            )
    
    # 生成新用户ID
    existing_ids = [u["id"] for u in MOCK_USERS.values()]
    new_id = max(existing_ids) + 1 if existing_ids else 1
    
    # 创建新用户
    new_user = {
        "id": new_id,
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": get_password_hash(user_data.password),
        "role": "user"
    }
    
    # 添加到Mock用户数据
    MOCK_USERS[user_data.username] = new_user
    MOCK_USERS[user_data.email] = new_user
    
    return UserResponse(**new_user)

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """获取当前用户信息"""
    return UserResponse(**current_user)

@router.put("/me/profile", response_model=UserResponse)
async def update_profile(
    profile_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """更新用户个人资料"""
    # 在Mock数据中更新用户信息
    username = current_user["username"]
    user = MOCK_USERS.get(username)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 更新字段
    if profile_data.full_name is not None:
        user["full_name"] = profile_data.full_name
    if profile_data.avatar_url is not None:
        user["avatar_url"] = profile_data.avatar_url
    if profile_data.bio is not None:
        user["bio"] = profile_data.bio
    if profile_data.phone is not None:
        user["phone"] = profile_data.phone
    if profile_data.location is not None:
        user["location"] = profile_data.location
    if profile_data.website is not None:
        user["website"] = profile_data.website
    
    MOCK_USERS[username] = user
    MOCK_USERS[current_user["email"]] = user
    
    return UserResponse(**user)

@router.post("/me/password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user)
):
    """修改密码"""
    username = current_user["username"]
    user = MOCK_USERS.get(username)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 验证旧密码
    if not verify_password(password_data.old_password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="旧密码错误"
        )
    
    # 更新密码
    user["password_hash"] = get_password_hash(password_data.new_password)
    MOCK_USERS[username] = user
    MOCK_USERS[current_user["email"]] = user
    
    return {"message": "密码修改成功"}
