from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from typing import List
import logging
from app.database import get_db
from app.models import User, UserFavorite, WeatherAlert
from app.schemas import (
    UserRegister, UserResponse, Token, UserLogin, UserProfileUpdate,
    UserFavoriteCreate, UserFavoriteResponse, WeatherAlertCreate, WeatherAlertResponse
)
from app.services.auth_service import auth_service, get_current_user

router = APIRouter(prefix="/auth", tags=["authentication"])
logger = logging.getLogger(__name__)

@router.post("/register", response_model=UserResponse)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    # Verifica se usuário já existe
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este endereço de e-mail já está cadastrado."
        )
        
    hashed_pwd = auth_service.get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        temperature_unit="C",
        theme="dark"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    logger.info(f"Registered new user: {db_user.email}")
    return db_user

@router.post("/login", response_model=Token)
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not auth_service.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = auth_service.create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name
    if profile_in.favorite_city is not None:
        current_user.favorite_city = profile_in.favorite_city
    if profile_in.temperature_unit is not None:
        current_user.temperature_unit = profile_in.temperature_unit
    if profile_in.theme is not None:
        current_user.theme = profile_in.theme
        
    # Alertas limites
    if profile_in.alert_temp_above is not None:
        current_user.alert_temp_above = profile_in.alert_temp_above
    if profile_in.alert_humidity_below is not None:
        current_user.alert_humidity_below = profile_in.alert_humidity_below
    if profile_in.alert_rain_above is not None:
        current_user.alert_rain_above = profile_in.alert_rain_above
    if profile_in.alert_wind_above is not None:
        current_user.alert_wind_above = profile_in.alert_wind_above
    if profile_in.alert_risk_level is not None:
        current_user.alert_risk_level = profile_in.alert_risk_level
        
    db.commit()
    db.refresh(current_user)
    return current_user

# --- FAVORITOS ---

@router.get("/favorites", response_model=List[UserFavoriteResponse])
def list_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(UserFavorite).filter(UserFavorite.user_id == current_user.id).all()

@router.post("/favorites", response_model=UserFavoriteResponse)
def add_favorite(
    favorite_in: UserFavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verifica se já está favoritado
    exists = db.query(UserFavorite).filter(
        UserFavorite.user_id == current_user.id,
        UserFavorite.city_name == favorite_in.city_name
    ).first()
    if exists:
        raise HTTPException(
            status_code=400,
            detail="Esta cidade já está na sua lista de favoritos."
        )
        
    db_fav = UserFavorite(
        user_id=current_user.id,
        city_name=favorite_in.city_name,
        latitude=favorite_in.latitude,
        longitude=favorite_in.longitude,
        state=favorite_in.state,
        country=favorite_in.country
    )
    db.add(db_fav)
    db.commit()
    db.refresh(db_fav)
    return db_fav

@router.delete("/favorites/{id}")
def delete_favorite(
    id: int = Path(..., description="ID do favorito"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_fav = db.query(UserFavorite).filter(
        UserFavorite.id == id,
        UserFavorite.user_id == current_user.id
    ).first()
    if not db_fav:
        raise HTTPException(status_code=404, detail="Cidade favorita não encontrada.")
        
    db.delete(db_fav)
    db.commit()
    return {"status": "success", "message": "Cidade removida dos favoritos."}

# --- ALERTAS ---

@router.get("/alerts", response_model=List[WeatherAlertResponse])
def list_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alerts = db.query(WeatherAlert).filter(WeatherAlert.user_id == current_user.id).order_by(WeatherAlert.created_at.desc()).all()
    
    # Marca como lidos
    if alerts:
        for a in alerts:
            a.is_read = True
        db.commit()
        
    return alerts


@router.post("/alerts", response_model=WeatherAlertResponse)
def create_alert(
    alert_in: WeatherAlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_alert = WeatherAlert(
        user_id=current_user.id,
        city_name=alert_in.city_name,
        alert_type=alert_in.alert_type,
        alert_value=alert_in.alert_value,
        measured_value=alert_in.measured_value,
        message=alert_in.message,
        is_read=False
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

