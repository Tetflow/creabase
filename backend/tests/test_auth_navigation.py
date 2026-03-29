"""
Test Suite for Creabase Authentication and Navigation
Tests: Admin login, OAuth flows, role-based navigation, subscription wallet debit
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAdminLogin:
    """Test admin email/password login flow"""
    
    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@creabase.com", "password": "admin123"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "user" in data, "Response should contain user"
        assert "session_token" in data, "Response should contain session_token"
        assert data["user"]["role"] == "admin", f"Expected admin role, got {data['user']['role']}"
        assert data["user"]["email"] == "admin@creabase.com"
    
    def test_admin_login_wrong_password(self):
        """Test admin login with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@creabase.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_admin_login_nonexistent_user(self):
        """Test login with non-existent email"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "nonexistent@creabase.com", "password": "password123"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestAuthSession:
    """Test session management"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@creabase.com", "password": "admin123"}
        )
        if response.status_code == 200:
            return response.json()["session_token"]
        pytest.skip("Admin login failed")
    
    def test_get_me_with_valid_session(self, admin_session):
        """Test /api/auth/me with valid session"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {admin_session}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["role"] == "admin"
        assert data["email"] == "admin@creabase.com"
    
    def test_get_me_without_session(self):
        """Test /api/auth/me without session - should fail"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_logout(self, admin_session):
        """Test logout endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/auth/logout",
            headers={"Authorization": f"Bearer {admin_session}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"


class TestRoleUpdate:
    """Test role update functionality"""
    
    @pytest.fixture
    def test_user_session(self):
        """Create a test user session via MongoDB"""
        import uuid
        from datetime import datetime, timezone, timedelta
        from pymongo import MongoClient
        
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'test_database')
        client = MongoClient(mongo_url)
        db = client[db_name]
        
        user_id = f"test-user-{uuid.uuid4().hex[:8]}"
        session_token = f"test_session_{uuid.uuid4().hex[:12]}"
        
        # Create test user
        db.users.insert_one({
            "user_id": user_id,
            "email": f"test_{uuid.uuid4().hex[:6]}@example.com",
            "name": "Test User",
            "role": "business",
            "subscription_status": "free",
            "created_at": datetime.now(timezone.utc)
        })
        
        # Create session
        db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=1),
            "created_at": datetime.now(timezone.utc)
        })
        
        yield {"user_id": user_id, "session_token": session_token}
        
        # Cleanup
        db.users.delete_one({"user_id": user_id})
        db.user_sessions.delete_one({"session_token": session_token})
        client.close()
    
    def test_update_role_to_creator(self, test_user_session):
        """Test updating user role from business to creator"""
        response = requests.patch(
            f"{BASE_URL}/api/users/{test_user_session['user_id']}/role",
            json={"role": "creator"},
            headers={"Authorization": f"Bearer {test_user_session['session_token']}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["role"] == "creator"
    
    def test_update_role_invalid(self, test_user_session):
        """Test updating to invalid role"""
        response = requests.patch(
            f"{BASE_URL}/api/users/{test_user_session['user_id']}/role",
            json={"role": "invalid_role"},
            headers={"Authorization": f"Bearer {test_user_session['session_token']}"}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"


class TestAdminEndpoints:
    """Test admin-specific endpoints"""
    
    @pytest.fixture
    def admin_session(self):
        """Get admin session token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@creabase.com", "password": "admin123"}
        )
        if response.status_code == 200:
            return response.json()["session_token"]
        pytest.skip("Admin login failed")
    
    def test_admin_stats(self, admin_session):
        """Test admin stats endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {admin_session}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "total_creators" in data
        assert "total_users" in data
    
    def test_admin_creators_list(self, admin_session):
        """Test admin creators list endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/creators",
            headers={"Authorization": f"Bearer {admin_session}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert isinstance(response.json(), list)


class TestWalletAndSubscription:
    """Test wallet and subscription functionality"""
    
    @pytest.fixture
    def business_user_with_wallet(self):
        """Create a business user with wallet balance"""
        import uuid
        from datetime import datetime, timezone, timedelta
        from pymongo import MongoClient
        
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'test_database')
        client = MongoClient(mongo_url)
        db = client[db_name]
        
        user_id = f"test-business-{uuid.uuid4().hex[:8]}"
        wallet_id = f"wallet_{uuid.uuid4().hex[:12]}"
        session_token = f"test_session_{uuid.uuid4().hex[:12]}"
        
        # Create test user
        db.users.insert_one({
            "user_id": user_id,
            "email": f"test_business_{uuid.uuid4().hex[:6]}@example.com",
            "name": "Test Business User",
            "role": "business",
            "subscription_status": "free",
            "created_at": datetime.now(timezone.utc)
        })
        
        # Create wallet with balance
        db.wallets.insert_one({
            "wallet_id": wallet_id,
            "user_id": user_id,
            "balance": 500.0,  # ₹500 balance
            "currency": "INR",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        })
        
        # Create session
        db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=1),
            "created_at": datetime.now(timezone.utc)
        })
        
        yield {
            "user_id": user_id,
            "wallet_id": wallet_id,
            "session_token": session_token,
            "initial_balance": 500.0
        }
        
        # Cleanup
        db.users.delete_one({"user_id": user_id})
        db.wallets.delete_one({"wallet_id": wallet_id})
        db.user_sessions.delete_one({"session_token": session_token})
        db.wallet_transactions.delete_many({"user_id": user_id})
        client.close()
    
    def test_get_wallet_balance(self, business_user_with_wallet):
        """Test getting wallet balance"""
        response = requests.get(
            f"{BASE_URL}/api/wallet/balance",
            headers={"Authorization": f"Bearer {business_user_with_wallet['session_token']}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "balance" in data
        assert data["balance"] == 500.0
    
    def test_subscription_checkout_debits_wallet(self, business_user_with_wallet):
        """Test that subscription checkout debits wallet when balance is sufficient"""
        # Monthly subscription is ₹199
        response = requests.post(
            f"{BASE_URL}/api/subscriptions/checkout",
            json={"plan_type": "monthly"},
            headers={"Authorization": f"Bearer {business_user_with_wallet['session_token']}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Should be paid from wallet since balance (500) > subscription cost (199)
        assert data.get("status") == "success" or data.get("payment_method") == "wallet", \
            f"Expected wallet payment, got: {data}"
        
        # Verify wallet balance was debited
        wallet_response = requests.get(
            f"{BASE_URL}/api/wallet/balance",
            headers={"Authorization": f"Bearer {business_user_with_wallet['session_token']}"}
        )
        assert wallet_response.status_code == 200
        
        new_balance = wallet_response.json()["balance"]
        expected_balance = 500.0 - 199.0  # Initial - monthly subscription
        assert new_balance == expected_balance, \
            f"Expected balance {expected_balance}, got {new_balance}"


class TestCreatorsEndpoint:
    """Test creators listing endpoint"""
    
    def test_get_creators_public(self):
        """Test public creators listing"""
        response = requests.get(f"{BASE_URL}/api/creators")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert isinstance(response.json(), list)
    
    def test_get_creators_with_search(self):
        """Test creators search"""
        response = requests.get(f"{BASE_URL}/api/creators?search=test")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
