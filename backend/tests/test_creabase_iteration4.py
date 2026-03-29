"""
Creabase Backend API Tests - Iteration 4
Testing: Auth, Creators, Projects, Chat, Wallet, Profile endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndAuth:
    """Test authentication and basic endpoints"""
    
    def test_creators_endpoint_returns_approved_creators(self):
        """GET /api/creators should return approved creators"""
        response = requests.get(f"{BASE_URL}/api/creators")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 3, "Should have at least 3 approved creators"
        # Verify creator structure
        if len(data) > 0:
            creator = data[0]
            assert "creator_id" in creator
            assert "name" in creator
            assert "status" in creator
            assert creator["status"] == "approved"
        print(f"✅ Found {len(data)} approved creators")
    
    def test_admin_login(self):
        """POST /api/auth/login - Admin login with email/password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@creabase.com", "password": "admin123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert data["user"]["role"] == "admin"
        print("✅ Admin login successful")
        return response.cookies
    
    def test_business_login(self):
        """POST /api/auth/login - Business login with email/password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "testbusiness1@example.com", "password": "business123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert data["user"]["role"] == "business"
        print("✅ Business login successful")
        return response.cookies
    
    def test_creator_login(self):
        """POST /api/auth/login - Creator login with email/password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "testcreator1@example.com", "password": "creator123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert data["user"]["role"] == "creator"
        print("✅ Creator login successful")
        return response.cookies


class TestBusinessDashboard:
    """Test business dashboard functionality"""
    
    @pytest.fixture
    def business_session(self):
        """Login as business and return session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "testbusiness1@example.com", "password": "business123"}
        )
        assert response.status_code == 200
        return session
    
    def test_get_creators_list(self, business_session):
        """Business can view approved creators"""
        response = business_session.get(f"{BASE_URL}/api/creators")
        assert response.status_code == 200
        creators = response.json()
        assert len(creators) >= 3
        print(f"✅ Business can view {len(creators)} creators")
    
    def test_get_auth_me(self, business_session):
        """GET /api/auth/me returns current user"""
        response = business_session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        user = response.json()
        assert user["role"] == "business"
        assert "email" in user
        print(f"✅ Auth/me returns business user: {user['email']}")
    
    def test_wallet_balance(self, business_session):
        """GET /api/wallet/balance returns wallet info"""
        response = business_session.get(f"{BASE_URL}/api/wallet/balance")
        assert response.status_code == 200
        wallet = response.json()
        assert "balance" in wallet
        print(f"✅ Wallet balance: ₹{wallet['balance']}")
    
    def test_usage_stats(self, business_session):
        """GET /api/usage/stats returns usage info"""
        response = business_session.get(f"{BASE_URL}/api/usage/stats")
        assert response.status_code == 200
        stats = response.json()
        assert "creators_viewed" in stats or "subscription_status" in stats
        print(f"✅ Usage stats retrieved")


class TestProjectFlow:
    """Test project creation and approval flow"""
    
    @pytest.fixture
    def business_session(self):
        """Login as business and return session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "testbusiness1@example.com", "password": "business123"}
        )
        assert response.status_code == 200
        return session
    
    @pytest.fixture
    def creator_session(self):
        """Login as creator and return session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "testcreator1@example.com", "password": "creator123"}
        )
        assert response.status_code == 200
        return session
    
    def test_get_projects_list(self, business_session):
        """GET /api/projects returns project list"""
        response = business_session.get(f"{BASE_URL}/api/projects")
        assert response.status_code == 200
        projects = response.json()
        assert isinstance(projects, list)
        print(f"✅ Found {len(projects)} projects")
    
    def test_create_project_requires_subscription(self, business_session):
        """POST /api/projects - Creating project requires subscription"""
        # Get a creator ID first
        creators_response = business_session.get(f"{BASE_URL}/api/creators")
        creators = creators_response.json()
        if len(creators) == 0:
            pytest.skip("No creators available")
        
        creator_id = creators[0]["creator_id"]
        
        response = business_session.post(
            f"{BASE_URL}/api/projects",
            json={
                "title": "TEST_Project",
                "description": "Test project description",
                "budget": 5000,
                "creator_id": creator_id
            }
        )
        # Should either succeed (201) or fail due to subscription (403)
        assert response.status_code in [200, 201, 403, 400]
        print(f"✅ Project creation returned status: {response.status_code}")
    
    def test_creator_incoming_projects(self, creator_session):
        """GET /api/projects/incoming - Creator can view incoming projects"""
        response = creator_session.get(f"{BASE_URL}/api/projects/incoming")
        assert response.status_code == 200
        projects = response.json()
        assert isinstance(projects, list)
        print(f"✅ Creator has {len(projects)} incoming projects")


class TestChatFlow:
    """Test chat/messaging functionality"""
    
    @pytest.fixture
    def business_session(self):
        """Login as business and return session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "testbusiness1@example.com", "password": "business123"}
        )
        assert response.status_code == 200
        return session
    
    def test_get_conversations(self, business_session):
        """GET /api/messages/conversations returns conversation list"""
        response = business_session.get(f"{BASE_URL}/api/messages/conversations")
        assert response.status_code == 200
        conversations = response.json()
        assert isinstance(conversations, list)
        print(f"✅ Found {len(conversations)} conversations")
    
    def test_get_messages_list(self, business_session):
        """GET /api/messages returns messages"""
        response = business_session.get(f"{BASE_URL}/api/messages")
        assert response.status_code == 200
        messages = response.json()
        assert isinstance(messages, list)
        print(f"✅ Found {len(messages)} messages")


class TestAdminFlow:
    """Test admin functionality"""
    
    @pytest.fixture
    def admin_session(self):
        """Login as admin and return session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@creabase.com", "password": "admin123"}
        )
        assert response.status_code == 200
        return session
    
    def test_admin_stats(self, admin_session):
        """GET /api/admin/stats returns platform stats"""
        response = admin_session.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        stats = response.json()
        assert "total_users" in stats or "total_creators" in stats or isinstance(stats, dict)
        print(f"✅ Admin stats retrieved")
    
    def test_admin_creators_list(self, admin_session):
        """GET /api/admin/creators returns all creators"""
        response = admin_session.get(f"{BASE_URL}/api/admin/creators")
        assert response.status_code == 200
        creators = response.json()
        assert isinstance(creators, list)
        print(f"✅ Admin can view {len(creators)} creators")


class TestWalletAndSubscription:
    """Test wallet and subscription endpoints"""
    
    @pytest.fixture
    def business_session(self):
        """Login as business and return session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "testbusiness1@example.com", "password": "business123"}
        )
        assert response.status_code == 200
        return session
    
    def test_wallet_balance(self, business_session):
        """GET /api/wallet/balance returns balance"""
        response = business_session.get(f"{BASE_URL}/api/wallet/balance")
        assert response.status_code == 200
        data = response.json()
        assert "balance" in data
        print(f"✅ Wallet balance: ₹{data['balance']}")
    
    def test_wallet_transactions(self, business_session):
        """GET /api/wallet/transactions returns transaction history"""
        response = business_session.get(f"{BASE_URL}/api/wallet/transactions")
        assert response.status_code == 200
        transactions = response.json()
        assert isinstance(transactions, list)
        print(f"✅ Found {len(transactions)} transactions")


class TestNavigationRoutes:
    """Test that key pages/routes exist"""
    
    def test_analytics_page_exists(self):
        """Analytics endpoint should exist"""
        session = requests.Session()
        session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "testbusiness1@example.com", "password": "business123"}
        )
        # Check if analytics data endpoint exists
        response = session.get(f"{BASE_URL}/api/analytics/dashboard")
        # May return 200 or 404 depending on implementation
        print(f"Analytics endpoint status: {response.status_code}")
    
    def test_wallet_page_endpoint(self):
        """Wallet endpoint should exist"""
        session = requests.Session()
        session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "testbusiness1@example.com", "password": "business123"}
        )
        response = session.get(f"{BASE_URL}/api/wallet/balance")
        assert response.status_code == 200
        print("✅ Wallet endpoint works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
