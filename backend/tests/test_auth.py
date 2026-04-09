import pytest


@pytest.mark.asyncio
async def test_login_success(client):
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "change-me"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "wrong"},
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_login_wrong_email(client):
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.com", "password": "change-me"},
    )
    assert res.status_code == 401
