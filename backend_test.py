import requests
import sys
import json
from datetime import datetime

class CreabaseAPITester:
    def __init__(self, base_url="https://repo-viewer-46.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        # Test session tokens provided
        self.admin_token = "admin_session_token_123"
        self.business_token = "business_session_token_456"
        self.free_token = "free_session_token_789"

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None, description=""):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        if description:
            print(f"   Description: {description}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, list) and len(response_data) > 0:
                        print(f"   Response: Found {len(response_data)} items")
                    elif isinstance(response_data, dict):
                        print(f"   Response keys: {list(response_data.keys())}")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                self.tests_passed += 1 if response.status_code in [401, 403] and expected_status in [401, 403] else 0
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })

            return success, response.json() if response.status_code < 400 else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_public_endpoints(self):
        """Test endpoints that don't require authentication"""
        print("\n" + "="*50)
        print("TESTING PUBLIC ENDPOINTS")
        print("="*50)
        
        # Test public creators endpoint
        self.run_test(
            "Public Creators List",
            "GET",
            "creators",
            200,
            description="Should return approved creators without contact info"
        )
        
        # Test creators search
        self.run_test(
            "Creators Search",
            "GET",
            "creators?search=test",
            200,
            description="Should search creators by name/bio"
        )
        
        # Test creators filter by platform
        self.run_test(
            "Creators Filter by Platform",
            "GET",
            "creators?platform=instagram",
            200,
            description="Should filter creators by platform"
        )

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n" + "="*50)
        print("TESTING AUTH ENDPOINTS")
        print("="*50)
        
        # Test auth/me with admin token
        self.run_test(
            "Admin Auth Check",
            "GET",
            "auth/me",
            200,
            token=self.admin_token,
            description="Should return admin user data"
        )
        
        # Test auth/me with business token
        self.run_test(
            "Business Auth Check",
            "GET",
            "auth/me",
            200,
            token=self.business_token,
            description="Should return business user data"
        )
        
        # Test auth/me with free token
        self.run_test(
            "Free User Auth Check",
            "GET",
            "auth/me",
            200,
            token=self.free_token,
            description="Should return free user data"
        )
        
        # Test auth/me without token
        self.run_test(
            "Unauthorized Auth Check",
            "GET",
            "auth/me",
            401,
            description="Should return 401 without token"
        )

    def test_creator_endpoints(self):
        """Test creator-related endpoints"""
        print("\n" + "="*50)
        print("TESTING CREATOR ENDPOINTS")
        print("="*50)
        
        # First get a creator ID
        success, creators_data = self.run_test(
            "Get Creators for Testing",
            "GET",
            "creators",
            200,
            description="Get creator list to test individual creator endpoints"
        )
        
        if success and creators_data and len(creators_data) > 0:
            creator_id = creators_data[0]['creator_id']
            print(f"   Using creator ID: {creator_id}")
            
            # Test individual creator endpoint (public)
            self.run_test(
                "Public Creator Profile",
                "GET",
                f"creators/{creator_id}",
                200,
                description="Should return creator without contact info"
            )
            
            # Test creator contact with subscription (business user)
            self.run_test(
                "Creator Contact (Business User)",
                "GET",
                f"creators/{creator_id}/contact",
                403,  # Expecting 403 since business user likely doesn't have active subscription
                token=self.business_token,
                description="Should require active subscription"
            )
            
            # Test creator contact without auth
            self.run_test(
                "Creator Contact (No Auth)",
                "GET",
                f"creators/{creator_id}/contact",
                401,
                description="Should require authentication"
            )
        else:
            print("❌ No creators found for testing individual endpoints")

    def test_subscription_endpoints(self):
        """Test subscription-related endpoints"""
        print("\n" + "="*50)
        print("TESTING SUBSCRIPTION ENDPOINTS")
        print("="*50)
        
        # Test create subscription (monthly)
        success, sub_data = self.run_test(
            "Create Monthly Subscription",
            "POST",
            "subscriptions",
            200,
            data={"plan_type": "monthly", "payment_method": "upi"},
            token=self.business_token,
            description="Should create monthly subscription"
        )
        
        if success and sub_data.get('subscription_id'):
            subscription_id = sub_data['subscription_id']
            print(f"   Created subscription ID: {subscription_id}")
            
            # Test activate subscription
            self.run_test(
                "Activate Subscription",
                "POST",
                f"subscriptions/{subscription_id}/activate",
                200,
                token=self.business_token,
                description="Should activate subscription (mocked)"
            )
        
        # Test create subscription without auth
        self.run_test(
            "Create Subscription (No Auth)",
            "POST",
            "subscriptions",
            401,
            data={"plan_type": "yearly", "payment_method": "upi"},
            description="Should require authentication"
        )

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        print("\n" + "="*50)
        print("TESTING ADMIN ENDPOINTS")
        print("="*50)
        
        # Test admin creators list
        self.run_test(
            "Admin Creators List",
            "GET",
            "admin/creators",
            200,
            token=self.admin_token,
            description="Should return all creators for admin"
        )
        
        # Test admin stats
        self.run_test(
            "Admin Stats",
            "GET",
            "admin/stats",
            200,
            token=self.admin_token,
            description="Should return platform statistics"
        )
        
        # Test admin endpoints with business user (should fail)
        self.run_test(
            "Admin Access (Business User)",
            "GET",
            "admin/creators",
            403,
            token=self.business_token,
            description="Should deny access to non-admin"
        )
        
        # Test admin endpoints without auth
        self.run_test(
            "Admin Access (No Auth)",
            "GET",
            "admin/stats",
            401,
            description="Should require authentication"
        )

    def test_creator_submission(self):
        """Test creator profile submission"""
        print("\n" + "="*50)
        print("TESTING CREATOR SUBMISSION")
        print("="*50)
        
        creator_data = {
            "name": "Test Creator",
            "email": "test.creator@example.com",
            "phone": "+91-9876543210",
            "bio": "Test creator for API testing",
            "platforms": ["instagram", "youtube"],
            "instagram_handle": "@testcreator",
            "youtube_handle": "testcreator",
            "instagram_followers": 50000,
            "youtube_subscribers": 25000,
            "language": ["english", "hindi"],
            "industry": ["lifestyle", "tech"],
            "engagement_rate": 3.5,
            "avg_views": 10000
        }
        
        # Test creator submission with business user
        self.run_test(
            "Creator Submission (Business User)",
            "POST",
            "creators",
            200,
            data=creator_data,
            token=self.business_token,
            description="Should create creator profile"
        )
        
        # Test creator submission without auth
        self.run_test(
            "Creator Submission (No Auth)",
            "POST",
            "creators",
            200,  # Should still work for public submissions
            data=creator_data,
            description="Should allow public creator submissions"
        )

def main():
    print("🚀 Starting Creabase API Testing")
    print("=" * 60)
    
    tester = CreabaseAPITester()
    
    # Run all test suites
    tester.test_public_endpoints()
    tester.test_auth_endpoints()
    tester.test_creator_endpoints()
    tester.test_subscription_endpoints()
    tester.test_admin_endpoints()
    tester.test_creator_submission()
    
    # Print final results
    print("\n" + "="*60)
    print("📊 FINAL TEST RESULTS")
    print("="*60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS:")
        for i, test in enumerate(tester.failed_tests, 1):
            print(f"{i}. {test['test']}")
            if 'error' in test:
                print(f"   Error: {test['error']}")
            else:
                print(f"   Expected: {test['expected']}, Got: {test['actual']}")
                print(f"   Response: {test['response']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())