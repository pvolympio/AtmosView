import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db, Base

# Setup temporary test SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test.db"):
        try:
            os.remove("./test.db")
        except Exception:
            pass

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "version": "5.0.0"}

def test_auth_flow():
    # 1. Register User
    register_payload = {
        "email": "tester@atmosview.com",
        "password": "testpassword123",
        "full_name": "Tester Atmos"
    }
    response = client.post("/api/auth/register", json=register_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "tester@atmosview.com"
    assert data["full_name"] == "Tester Atmos"
    assert "id" in data

    # 2. Register Duplicate Email (should fail)
    response = client.post("/api/auth/register", json=register_payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Este endereço de e-mail já está cadastrado."

    # 3. Login incorrect password
    login_payload = {
        "email": "tester@atmosview.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401

    # 4. Login correct password
    login_payload["password"] = "testpassword123"
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    login_data = response.json()
    assert "access_token" in login_data
    assert login_data["token_type"] == "bearer"
    token = login_data["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    # 5. Get current user profile
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "tester@atmosview.com"

    # 6. Update Profile and Set Alerts
    update_payload = {
        "full_name": "Tester Atmos V5",
        "temperature_unit": "F",
        "alert_temp_above": 38.5,
        "alert_humidity_below": 25.0,
        "alert_risk_level": "Crítico"
    }
    response = client.put("/api/auth/profile", json=update_payload, headers=headers)
    assert response.status_code == 200
    updated_data = response.json()
    assert updated_data["full_name"] == "Tester Atmos V5"
    assert updated_data["temperature_unit"] == "F"
    assert updated_data["alert_temp_above"] == 38.5
    assert updated_data["alert_humidity_below"] == 25.0
    assert updated_data["alert_risk_level"] == "Crítico"


def test_favorites_and_alerts_flow():
    # Login to get token
    login_payload = {
        "email": "tester@atmosview.com",
        "password": "testpassword123"
    }
    response = client.post("/api/auth/login", json=login_payload)
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Get favorites (should be empty)
    response = client.get("/api/auth/favorites", headers=headers)
    assert response.status_code == 200
    assert response.json() == []

    # 2. Add a Favorite
    fav_payload = {
        "city_name": "Campinas",
        "latitude": -22.9,
        "longitude": -47.06,
        "state": "São Paulo",
        "country": "Brasil"
    }
    response = client.post("/api/auth/favorites", json=fav_payload, headers=headers)
    assert response.status_code == 200
    fav_data = response.json()
    assert fav_data["city_name"] == "Campinas"
    fav_id = fav_data["id"]

    # 3. Add duplicate favorite (should fail)
    response = client.post("/api/auth/favorites", json=fav_payload, headers=headers)
    assert response.status_code == 400

    # 4. Get favorites (should have 1 item)
    response = client.get("/api/auth/favorites", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1

    # 5. Create a Weather Alert
    alert_payload = {
        "city_name": "Campinas",
        "alert_type": "temperature",
        "alert_value": 35.0,
        "measured_value": 37.5,
        "message": "Alerta de temperatura crítica de 37.5°C registrada em Campinas."
    }
    response = client.post("/api/auth/alerts", json=alert_payload, headers=headers)
    assert response.status_code == 200
    alert_data = response.json()
    assert alert_data["city_name"] == "Campinas"
    assert alert_data["alert_value"] == 35.0
    assert alert_data["measured_value"] == 37.5
    assert not alert_data["is_read"]

    # 6. List alerts (should mark as read and return list)
    response = client.get("/api/auth/alerts", headers=headers)
    assert response.status_code == 200
    alerts_list = response.json()
    assert len(alerts_list) == 1
    assert alerts_list[0]["city_name"] == "Campinas"
    assert alerts_list[0]["is_read"] is True

    # 7. Delete Favorite
    response = client.delete(f"/api/auth/favorites/{fav_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

    # 8. Verify favorites is empty again
    response = client.get("/api/auth/favorites", headers=headers)
    assert response.json() == []


def test_reports_generation():
    # Test generation of report with mock dashboard data
    report_payload = {
        "city": "Campinas",
        "report_type": "dashboard",
        "period": "Tempo Real",
        "data": {
            "summary": "Condições climáticas estáveis em Campinas.",
            "current": {
                "temperature": 24.5,
                "apparent_temperature": 25.0,
                "relative_humidity": 60.0,
                "surface_pressure": 1012.0,
                "wind_speed": 12.0,
                "precipitation": 0.0,
                "weather_code": 0
            },
            "risk": {
                "score": 2.0,
                "nivel": "Baixo",
                "recomendacoes": ["Nenhuma ação necessária."]
            }
        }
    }
    response = client.post("/api/reports/generate", json=report_payload)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "attachment; filename=atmosview_relatorio_dashboard_campinas.pdf" in response.headers["content-disposition"]
    assert len(response.content) > 0
