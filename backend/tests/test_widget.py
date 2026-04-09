import pytest


@pytest.mark.asyncio
async def test_widget_config(client, test_client_and_key):
    client_record, raw_key = test_client_and_key

    res = await client.post(
        "/api/v1/widget/config",
        headers={"X-API-Key": raw_key},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["welcome_message"] == "Hi! How can I help you today?"
    assert data["theme_color"] == "#4F46E5"
    # system_prompt should NOT be in the response
    assert "system_prompt" not in data


@pytest.mark.asyncio
async def test_widget_config_bad_key(client):
    res = await client.post(
        "/api/v1/widget/config",
        headers={"X-API-Key": "ck_live_invalid_key"},
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_widget_config_missing_key(client):
    res = await client.post("/api/v1/widget/config")
    assert res.status_code == 422  # Missing required header
