import pytest


@pytest.mark.asyncio
async def test_create_and_list_clients(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Create
    res = await client.post(
        "/api/v1/clients",
        json={"name": "Acme Corp", "slug": "acme-corp"},
        headers=headers,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Acme Corp"
    assert data["slug"] == "acme-corp"
    assert data["is_active"] is True
    client_id = data["id"]

    # List
    res = await client.get("/api/v1/clients", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) == 1

    # Get
    res = await client.get(f"/api/v1/clients/{client_id}", headers=headers)
    assert res.status_code == 200
    assert res.json()["name"] == "Acme Corp"

    # Update
    res = await client.patch(
        f"/api/v1/clients/{client_id}",
        json={"welcome_message": "Hey!"},
        headers=headers,
    )
    assert res.status_code == 200
    assert res.json()["welcome_message"] == "Hey!"

    # Delete
    res = await client.delete(f"/api/v1/clients/{client_id}", headers=headers)
    assert res.status_code == 204

    # Verify gone
    res = await client.get(f"/api/v1/clients/{client_id}", headers=headers)
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_clients_require_auth(client):
    res = await client.get("/api/v1/clients")
    assert res.status_code == 422  # Missing Authorization header


@pytest.mark.asyncio
async def test_duplicate_slug_rejected(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}

    await client.post(
        "/api/v1/clients",
        json={"name": "First", "slug": "same-slug"},
        headers=headers,
    )
    res = await client.post(
        "/api/v1/clients",
        json={"name": "Second", "slug": "same-slug"},
        headers=headers,
    )
    assert res.status_code == 400


@pytest.mark.asyncio
async def test_api_key_lifecycle(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Create client
    res = await client.post(
        "/api/v1/clients",
        json={"name": "Key Test", "slug": "key-test"},
        headers=headers,
    )
    client_id = res.json()["id"]

    # Generate key
    res = await client.post(
        f"/api/v1/clients/{client_id}/api-keys",
        headers=headers,
    )
    assert res.status_code == 201
    key_data = res.json()
    assert key_data["raw_key"].startswith("ck_live_")
    key_id = key_data["id"]

    # List keys
    res = await client.get(
        f"/api/v1/clients/{client_id}/api-keys",
        headers=headers,
    )
    assert len(res.json()) == 1

    # Revoke key
    res = await client.delete(
        f"/api/v1/clients/{client_id}/api-keys/{key_id}",
        headers=headers,
    )
    assert res.status_code == 204
