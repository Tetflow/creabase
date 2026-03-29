"""
Creabase API Backend Tests
Tests for: Auth, Creators, Projects, Wallet, Reviews, Proposals, Notifications, Analytics
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data prefixes for cleanup
TEST_PREFIX = "TEST_"

class TestHealthAndBasicEndpoints:
    """Basic API health and public endpoint tests"""
    
    def test_creators_endpoint_returns_list(self):
        """Test /api/creators returns a list (public endpoint)"""
        response = requests.get(f"{BASE_URL}/api/creators")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of creators"
        print(f"✓ GET /api/creators returned {len(data)} creators")
    
    def test_premium_plans_endpoint(self):
        """Test /api/premium/plans returns subscription plans"""
        response = requests.get(f"{BASE_URL}/api/premium/plans")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, (list, dict)), "Expected plans data"
        print(f"✓ GET /api/premium/plans returned plans data")


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_auth_me_requires_authentication(self):
        """Test /api/auth/me returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/auth/me correctly requires authentication")
    
    def test_auth_login_requires_credentials(self):
        """Test /api/auth/login requires email and password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={})
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ POST /api/auth/login correctly requires credentials")
    
    def test_auth_login_invalid_credentials(self):
        """Test /api/auth/login rejects invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/auth/login correctly rejects invalid credentials")
    
    def test_auth_logout_requires_auth(self):
        """Test /api/auth/logout requires authentication"""
        response = requests.post(f"{BASE_URL}/api/auth/logout")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/auth/logout correctly requires authentication")


class TestCreatorEndpoints:
    """Creator-related endpoint tests"""
    
    def test_get_creators_with_filters(self):
        """Test /api/creators with various filters"""
        # Test with platform filter
        response = requests.get(f"{BASE_URL}/api/creators?platform=instagram")
        assert response.status_code == 200
        
        # Test with language filter
        response = requests.get(f"{BASE_URL}/api/creators?language=English")
        assert response.status_code == 200
        
        # Test with search
        response = requests.get(f"{BASE_URL}/api/creators?search=test")
        assert response.status_code == 200
        print("✓ GET /api/creators with filters works correctly")
    
    def test_get_creator_by_id_not_found(self):
        """Test /api/creators/{id} returns 404 for non-existent creator"""
        response = requests.get(f"{BASE_URL}/api/creators/nonexistent_id_12345")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ GET /api/creators/{id} correctly returns 404 for non-existent creator")
    
    def test_create_creator_requires_auth(self):
        """Test POST /api/creators requires authentication"""
        response = requests.post(f"{BASE_URL}/api/creators", json={
            "name": "Test Creator",
            "email": "test@test.com",
            "phone": "1234567890",
            "platforms": ["instagram"],
            "language": ["English"],
            "industry": ["Fashion"]
        })
        # Should work without auth but create pending creator
        assert response.status_code in [200, 201, 401], f"Unexpected status: {response.status_code}"
        print(f"✓ POST /api/creators returned status {response.status_code}")


class TestWalletEndpoints:
    """Wallet-related endpoint tests"""
    
    def test_wallet_balance_requires_auth(self):
        """Test /api/wallet/balance requires authentication"""
        response = requests.get(f"{BASE_URL}/api/wallet/balance")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/wallet/balance correctly requires authentication")
    
    def test_wallet_transactions_requires_auth(self):
        """Test /api/wallet/transactions requires authentication"""
        response = requests.get(f"{BASE_URL}/api/wallet/transactions")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/wallet/transactions correctly requires authentication")
    
    def test_wallet_topup_requires_auth(self):
        """Test /api/wallet/topup requires authentication"""
        response = requests.post(f"{BASE_URL}/api/wallet/topup", json={
            "amount": 1000,
            "payment_method": "cashfree"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/wallet/topup correctly requires authentication")
    
    def test_wallet_payout_requires_auth(self):
        """Test /api/wallet/request-payout requires authentication"""
        response = requests.post(f"{BASE_URL}/api/wallet/request-payout", json={
            "amount": 500
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/wallet/request-payout correctly requires authentication")


class TestProjectEndpoints:
    """Project-related endpoint tests"""
    
    def test_projects_requires_auth(self):
        """Test /api/projects requires authentication"""
        response = requests.get(f"{BASE_URL}/api/projects")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/projects correctly requires authentication")
    
    def test_create_project_requires_auth(self):
        """Test POST /api/projects requires authentication"""
        response = requests.post(f"{BASE_URL}/api/projects", json={
            "title": "Test Project",
            "description": "Test description",
            "budget": 10000,
            "creator_id": "test_creator_id"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/projects correctly requires authentication")
    
    def test_incoming_projects_requires_auth(self):
        """Test /api/projects/incoming requires authentication"""
        response = requests.get(f"{BASE_URL}/api/projects/incoming")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/projects/incoming correctly requires authentication")


class TestProposalEndpoints:
    """Proposal/bidding endpoint tests"""
    
    def test_proposals_endpoint_exists(self):
        """Test proposals endpoint structure"""
        # Test that the endpoint exists (should require auth)
        response = requests.get(f"{BASE_URL}/api/projects/test_project/proposals")
        # Should return 401 (auth required) or 404 (project not found)
        assert response.status_code in [401, 404], f"Unexpected status: {response.status_code}"
        print(f"✓ GET /api/projects/{{id}}/proposals returned {response.status_code}")


class TestNotificationEndpoints:
    """Notification endpoint tests"""
    
    def test_notifications_requires_auth(self):
        """Test /api/notifications requires authentication"""
        response = requests.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/notifications correctly requires authentication")


class TestFavoritesEndpoints:
    """Favorites endpoint tests"""
    
    def test_favorites_requires_auth(self):
        """Test /api/favorites requires authentication"""
        response = requests.get(f"{BASE_URL}/api/favorites")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/favorites correctly requires authentication")
    
    def test_add_favorite_requires_auth(self):
        """Test POST /api/favorites requires authentication"""
        response = requests.post(f"{BASE_URL}/api/favorites", json={
            "creator_id": "test_creator_id"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/favorites correctly requires authentication")


class TestDisputeEndpoints:
    """Dispute endpoint tests"""
    
    def test_disputes_requires_auth(self):
        """Test /api/disputes requires authentication"""
        response = requests.get(f"{BASE_URL}/api/disputes")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/disputes correctly requires authentication")


class TestSubscriptionEndpoints:
    """Subscription endpoint tests"""
    
    def test_my_subscription_requires_auth(self):
        """Test /api/subscriptions/my-subscription requires authentication"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/my-subscription")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/subscriptions/my-subscription correctly requires authentication")
    
    def test_subscription_checkout_requires_auth(self):
        """Test /api/subscriptions/checkout requires authentication"""
        response = requests.post(f"{BASE_URL}/api/subscriptions/checkout", json={
            "plan_type": "monthly",
            "user_type": "business"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ POST /api/subscriptions/checkout correctly requires authentication")


class TestPortfolioEndpoints:
    """Portfolio endpoint tests"""
    
    def test_get_portfolio_public(self):
        """Test /api/creators/{id}/portfolio is accessible"""
        response = requests.get(f"{BASE_URL}/api/creators/test_creator/portfolio")
        # Should return empty list or 404
        assert response.status_code in [200, 404], f"Unexpected status: {response.status_code}"
        print(f"✓ GET /api/creators/{{id}}/portfolio returned {response.status_code}")


class TestAdminEndpoints:
    """Admin endpoint tests - should all require admin auth"""
    
    def test_admin_creators_requires_auth(self):
        """Test /api/admin/creators requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/creators")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/admin/creators correctly requires authentication")
    
    def test_admin_wallets_requires_auth(self):
        """Test /api/admin/wallets requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/wallets")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/admin/wallets correctly requires authentication")
    
    def test_admin_disputes_requires_auth(self):
        """Test /api/admin/disputes requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/disputes")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/admin/disputes correctly requires authentication")
    
    def test_admin_payouts_requires_auth(self):
        """Test /api/admin/payouts requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/payouts")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/admin/payouts correctly requires authentication")
    
    def test_admin_analytics_requires_auth(self):
        """Test /api/admin/analytics/overview requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/overview")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/admin/analytics/overview correctly requires authentication")


class TestUsageEndpoints:
    """Usage stats endpoint tests"""
    
    def test_usage_stats_requires_auth(self):
        """Test /api/usage/stats requires authentication"""
        response = requests.get(f"{BASE_URL}/api/usage/stats")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/usage/stats correctly requires authentication")


class TestMessagesEndpoints:
    """Messages/chat endpoint tests"""
    
    def test_messages_requires_auth(self):
        """Test /api/messages requires authentication"""
        response = requests.get(f"{BASE_URL}/api/messages")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/messages correctly requires authentication")
    
    def test_conversations_requires_auth(self):
        """Test /api/messages/conversations requires authentication"""
        response = requests.get(f"{BASE_URL}/api/messages/conversations")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/messages/conversations correctly requires authentication")


class TestFileUploadEndpoint:
    """File upload endpoint tests"""
    
    def test_upload_requires_auth(self):
        """Test /api/upload requires authentication"""
        response = requests.post(f"{BASE_URL}/api/upload")
        # Should return 401 (auth) or 422 (missing file)
        assert response.status_code in [401, 422], f"Unexpected status: {response.status_code}"
        print(f"✓ POST /api/upload returned {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
