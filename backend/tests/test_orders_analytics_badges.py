"""
Backend API Tests for Orders, Analytics, and Creator Badges
Tests the new features: Order Management, Analytics Dashboard, Creator Badges
"""
import pytest
import requests
import os
from datetime import datetime

# Get backend URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test session token - will be set by fixture
TEST_SESSION_TOKEN = None
TEST_USER_ID = None
TEST_CREATOR_ID = None


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def test_data():
    """Create test data in MongoDB"""
    import subprocess
    import json
    
    # Create test user and session
    result = subprocess.run([
        'mongosh', '--quiet', '--eval', '''
        use('test_database');
        var userId = 'test-user-pytest-' + Date.now();
        var sessionToken = 'test_session_pytest_' + Date.now();
        var creatorId = 'creator_pytest_' + Date.now();
        
        // Create user
        db.users.insertOne({
            user_id: userId,
            email: 'pytest.user.' + Date.now() + '@example.com',
            name: 'Pytest Business User',
            role: 'business',
            subscription_status: 'active',
            subscription_plan: 'monthly',
            creators_viewed_this_month: 0,
            monthly_reset_date: new Date(Date.now() + 30*24*60*60*1000),
            created_at: new Date()
        });
        
        // Create session
        db.user_sessions.insertOne({
            user_id: userId,
            session_token: sessionToken,
            expires_at: new Date(Date.now() + 7*24*60*60*1000),
            created_at: new Date()
        });
        
        // Create creator
        db.creators.insertOne({
            creator_id: creatorId,
            name: 'Pytest Test Creator',
            email: 'pytestcreator@example.com',
            phone: '+919876543210',
            bio: 'Test creator for pytest',
            platforms: ['instagram', 'youtube'],
            instagram_followers: 50000,
            youtube_subscribers: 25000,
            language: ['English'],
            industry: ['Tech'],
            city: 'Mumbai',
            status: 'approved',
            verification_status: 'verified',
            created_at: new Date()
        });
        
        print(JSON.stringify({
            session_token: sessionToken,
            user_id: userId,
            creator_id: creatorId
        }));
        '''
    ], capture_output=True, text=True)
    
    # Parse the output
    output = result.stdout.strip()
    for line in output.split('\n'):
        if line.startswith('{'):
            data = json.loads(line)
            return data
    
    pytest.skip("Failed to create test data")


@pytest.fixture(scope="module")
def auth_headers(test_data):
    """Get auth headers with session token"""
    return {
        "Authorization": f"Bearer {test_data['session_token']}",
        "Content-Type": "application/json"
    }


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_accessible(self, api_client):
        """Test that API is accessible"""
        response = api_client.get(f"{BASE_URL}/api/creators")
        assert response.status_code == 200, f"API not accessible: {response.text}"
        print("✓ API is accessible")


class TestCreatorBadges:
    """Tests for Creator Badge endpoint"""
    
    def test_get_creator_badge_success(self, api_client, test_data):
        """Test getting creator badge - should return badge info"""
        creator_id = test_data['creator_id']
        response = api_client.get(f"{BASE_URL}/api/creators/{creator_id}/badge")
        
        assert response.status_code == 200, f"Failed to get badge: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "badge" in data, "Response missing 'badge' field"
        assert "badge_info" in data, "Response missing 'badge_info' field"
        assert "stats" in data, "Response missing 'stats' field"
        
        # Verify badge_info structure
        badge_info = data["badge_info"]
        assert "color" in badge_info, "badge_info missing 'color'"
        assert "label" in badge_info, "badge_info missing 'label'"
        assert "icon" in badge_info, "badge_info missing 'icon'"
        
        # Verify stats structure
        stats = data["stats"]
        assert "completed_projects" in stats, "stats missing 'completed_projects'"
        assert "average_rating" in stats, "stats missing 'average_rating'"
        assert "is_verified" in stats, "stats missing 'is_verified'"
        assert "is_premium" in stats, "stats missing 'is_premium'"
        
        print(f"✓ Creator badge retrieved: {data['badge']} - {badge_info['label']}")
    
    def test_get_creator_badge_not_found(self, api_client):
        """Test getting badge for non-existent creator"""
        response = api_client.get(f"{BASE_URL}/api/creators/nonexistent_creator/badge")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Non-existent creator returns 404")
    
    def test_badge_calculation_logic(self, api_client, test_data):
        """Test that badge is calculated based on stats"""
        creator_id = test_data['creator_id']
        response = api_client.get(f"{BASE_URL}/api/creators/{creator_id}/badge")
        
        assert response.status_code == 200
        data = response.json()
        
        # Badge should be one of the valid types
        valid_badges = ["premium", "top_rated", "rising_star", "verified", "new", "standard"]
        assert data["badge"] in valid_badges, f"Invalid badge type: {data['badge']}"
        
        print(f"✓ Badge calculation working: {data['badge']}")


class TestOrdersAPI:
    """Tests for Order Management endpoints"""
    
    def test_get_orders_authenticated(self, api_client, auth_headers):
        """Test getting orders with authentication"""
        response = api_client.get(
            f"{BASE_URL}/api/orders",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed to get orders: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Orders should be a list"
        print(f"✓ Orders endpoint working, returned {len(data)} orders")
    
    def test_get_orders_unauthenticated(self, api_client):
        """Test getting orders without authentication - should fail"""
        response = api_client.get(f"{BASE_URL}/api/orders")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Orders endpoint requires authentication")
    
    def test_get_orders_with_status_filter(self, api_client, auth_headers):
        """Test filtering orders by status"""
        response = api_client.get(
            f"{BASE_URL}/api/orders?status=pending",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed to filter orders: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Filtered orders should be a list"
        print(f"✓ Orders filtering working, returned {len(data)} pending orders")
    
    def test_get_order_stats_summary(self, api_client, auth_headers):
        """Test getting order statistics summary"""
        response = api_client.get(
            f"{BASE_URL}/api/orders/stats/summary",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed to get order stats: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "total_orders" in data, "Missing 'total_orders'"
        assert "pending" in data, "Missing 'pending'"
        assert "active" in data, "Missing 'active'"
        assert "delivered" in data, "Missing 'delivered'"
        assert "completed" in data, "Missing 'completed'"
        assert "disputed" in data, "Missing 'disputed'"
        assert "total_value" in data, "Missing 'total_value'"
        assert "completion_rate" in data, "Missing 'completion_rate'"
        
        print(f"✓ Order stats summary working: {data['total_orders']} total orders")
    
    def test_get_order_stats_unauthenticated(self, api_client):
        """Test getting order stats without authentication - should fail"""
        response = api_client.get(f"{BASE_URL}/api/orders/stats/summary")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Order stats endpoint requires authentication")


class TestAnalyticsAPI:
    """Tests for Analytics Dashboard endpoints"""
    
    def test_get_business_analytics(self, api_client, auth_headers):
        """Test getting business analytics"""
        response = api_client.get(
            f"{BASE_URL}/api/analytics/business",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed to get analytics: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "projects" in data, "Missing 'projects'"
        assert "spending" in data, "Missing 'spending'"
        assert "creators" in data, "Missing 'creators'"
        assert "subscription" in data, "Missing 'subscription'"
        
        # Verify projects structure
        projects = data["projects"]
        assert "total" in projects, "projects missing 'total'"
        assert "active" in projects, "projects missing 'active'"
        assert "completed" in projects, "projects missing 'completed'"
        assert "completion_rate" in projects, "projects missing 'completion_rate'"
        
        # Verify spending structure
        spending = data["spending"]
        assert "total_spent" in spending, "spending missing 'total_spent'"
        assert "avg_project_value" in spending, "spending missing 'avg_project_value'"
        assert "payg_spent" in spending, "spending missing 'payg_spent'"
        
        print(f"✓ Business analytics working: {projects['total']} total projects")
    
    def test_get_business_analytics_unauthenticated(self, api_client):
        """Test getting business analytics without authentication - should fail"""
        response = api_client.get(f"{BASE_URL}/api/analytics/business")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Business analytics endpoint requires authentication")
    
    def test_get_creator_analytics(self, api_client, auth_headers, test_data):
        """Test getting creator analytics - requires admin or creator owner"""
        creator_id = test_data['creator_id']
        response = api_client.get(
            f"{BASE_URL}/api/analytics/creator/{creator_id}",
            headers=auth_headers
        )
        
        # This may return 403 if user is not admin or creator owner
        # That's expected behavior
        if response.status_code == 403:
            print("✓ Creator analytics correctly requires authorization")
        elif response.status_code == 200:
            data = response.json()
            assert "projects" in data, "Missing 'projects'"
            assert "earnings" in data, "Missing 'earnings'"
            assert "reputation" in data, "Missing 'reputation'"
            print(f"✓ Creator analytics working")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}")


class TestOrderStatusUpdate:
    """Tests for Order Status Update endpoint"""
    
    def test_update_order_status_invalid_order(self, api_client, auth_headers):
        """Test updating status of non-existent order"""
        response = api_client.patch(
            f"{BASE_URL}/api/orders/nonexistent_order/status",
            headers=auth_headers,
            json={"status": "active"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Non-existent order returns 404")
    
    def test_update_order_status_invalid_status(self, api_client, auth_headers, test_data):
        """Test updating order with invalid status"""
        # First create a project/order
        import subprocess
        result = subprocess.run([
            'mongosh', '--quiet', '--eval', f'''
            use('test_database');
            var projectId = 'project_pytest_' + Date.now();
            db.projects.insertOne({{
                project_id: projectId,
                title: 'Test Project',
                description: 'Test project for pytest',
                budget: 5000,
                business_id: '{test_data["user_id"]}',
                creator_id: '{test_data["creator_id"]}',
                status: 'pending',
                created_at: new Date()
            }});
            print(projectId);
            '''
        ], capture_output=True, text=True)
        
        project_id = result.stdout.strip().split('\n')[-1]
        
        response = api_client.patch(
            f"{BASE_URL}/api/orders/{project_id}/status",
            headers=auth_headers,
            json={"status": "invalid_status"}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Invalid status returns 400")


class TestCreatorsEndpoint:
    """Tests for Creators endpoint - verify badge data is included"""
    
    def test_get_creators_list(self, api_client):
        """Test getting creators list"""
        response = api_client.get(f"{BASE_URL}/api/creators")
        
        assert response.status_code == 200, f"Failed to get creators: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Creators should be a list"
        print(f"✓ Creators endpoint working, returned {len(data)} creators")
    
    def test_get_single_creator(self, api_client, test_data):
        """Test getting single creator"""
        creator_id = test_data['creator_id']
        response = api_client.get(f"{BASE_URL}/api/creators/{creator_id}")
        
        assert response.status_code == 200, f"Failed to get creator: {response.text}"
        data = response.json()
        
        assert "creator_id" in data, "Missing 'creator_id'"
        assert "name" in data, "Missing 'name'"
        assert data["creator_id"] == creator_id, "Creator ID mismatch"
        
        print(f"✓ Single creator endpoint working: {data['name']}")


class TestAuthEndpoints:
    """Tests for Auth endpoints"""
    
    def test_auth_me_authenticated(self, api_client, auth_headers):
        """Test /auth/me with valid session"""
        response = api_client.get(
            f"{BASE_URL}/api/auth/me",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Auth failed: {response.text}"
        data = response.json()
        
        assert "user_id" in data, "Missing 'user_id'"
        assert "email" in data, "Missing 'email'"
        assert "role" in data, "Missing 'role'"
        
        print(f"✓ Auth endpoint working: {data['name']}")
    
    def test_auth_me_unauthenticated(self, api_client):
        """Test /auth/me without session"""
        response = api_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Auth endpoint requires authentication")


# Cleanup fixture
@pytest.fixture(scope="module", autouse=True)
def cleanup(request, test_data):
    """Cleanup test data after all tests"""
    def cleanup_data():
        import subprocess
        subprocess.run([
            'mongosh', '--quiet', '--eval', f'''
            use('test_database');
            db.users.deleteMany({{user_id: /test-user-pytest/}});
            db.user_sessions.deleteMany({{session_token: /test_session_pytest/}});
            db.creators.deleteMany({{creator_id: /creator_pytest/}});
            db.projects.deleteMany({{project_id: /project_pytest/}});
            print('Cleanup completed');
            '''
        ], capture_output=True, text=True)
    
    request.addfinalizer(cleanup_data)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
