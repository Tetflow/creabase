#!/usr/bin/env python3
"""
Backend API Testing Script for Profile Save & Bank Verification Endpoints
Tests the specific endpoints mentioned in the review request.
"""

import requests
import json
import os
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://github-preview-25.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.session_token = None
        self.user_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, details):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
    def test_create_test_user(self):
        """Test 1: Create test user and get session token"""
        try:
            url = f"{BACKEND_URL}/test/create-test-user?role=creator"
            response = requests.post(url)
            
            if response.status_code == 200:
                data = response.json()
                self.session_token = data.get("session_token")
                self.user_id = data.get("user", {}).get("user_id")
                
                if self.session_token and self.user_id:
                    self.log_test("Create Test User", True, f"Created user {self.user_id} with session token")
                    return True
                else:
                    self.log_test("Create Test User", False, "Missing session_token or user_id in response")
                    return False
            else:
                self.log_test("Create Test User", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Create Test User", False, f"Exception: {str(e)}")
            return False
    
    def test_profile_update_empty_rate(self):
        """Test 2: Profile update with empty rate_per_post (should succeed)"""
        if not self.session_token:
            self.log_test("Profile Update (Empty Rate)", False, "No session token available")
            return False
            
        try:
            url = f"{BACKEND_URL}/user/profile"
            headers = {"Content-Type": "application/json"}
            cookies = {"session_token": self.session_token}
            
            # Test with empty rate_per_post
            profile_data = {
                "name": "Test Creator Pro",
                "bio": "Testing profile update with empty rate",
                "rate_per_post": ""  # Empty string - should not cause 500 error
            }
            
            response = requests.put(url, json=profile_data, headers=headers, cookies=cookies)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "Profile updated successfully":
                    self.log_test("Profile Update (Empty Rate)", True, "Successfully saved profile with empty rate field")
                    return True
                else:
                    self.log_test("Profile Update (Empty Rate)", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Profile Update (Empty Rate)", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Profile Update (Empty Rate)", False, f"Exception: {str(e)}")
            return False
    
    def test_profile_update_valid_rate(self):
        """Test 3: Profile update with valid rate_per_post=5000"""
        if not self.session_token:
            self.log_test("Profile Update (Valid Rate)", False, "No session token available")
            return False
            
        try:
            url = f"{BACKEND_URL}/user/profile"
            headers = {"Content-Type": "application/json"}
            cookies = {"session_token": self.session_token}
            
            # Test with valid rate_per_post
            profile_data = {
                "name": "Test Creator Pro",
                "bio": "Testing profile update with valid rate",
                "rate_per_post": 5000
            }
            
            response = requests.put(url, json=profile_data, headers=headers, cookies=cookies)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "Profile updated successfully":
                    self.log_test("Profile Update (Valid Rate)", True, "Successfully saved profile with rate=5000")
                    return True
                else:
                    self.log_test("Profile Update (Valid Rate)", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Profile Update (Valid Rate)", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Profile Update (Valid Rate)", False, f"Exception: {str(e)}")
            return False
    
    def test_auth_me(self):
        """Test 4: GET /api/auth/me to verify data saved"""
        if not self.session_token:
            self.log_test("Auth Me", False, "No session token available")
            return False
            
        try:
            url = f"{BACKEND_URL}/auth/me"
            cookies = {"session_token": self.session_token}
            
            response = requests.get(url, cookies=cookies)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify profile data was saved (auth/me returns user data directly, not wrapped in "user" key)
                if data.get("name") == "Test Creator Pro":
                    self.log_test("Auth Me", True, f"Profile data verified: name={data.get('name')}, bio={data.get('bio')}")
                    return True
                else:
                    self.log_test("Auth Me", False, f"Profile data not saved correctly: name={data.get('name')}, expected='Test Creator Pro'")
                    return False
            else:
                self.log_test("Auth Me", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Auth Me", False, f"Exception: {str(e)}")
            return False
    
    def test_bank_verification_initiate(self):
        """Test 5: Bank verification initiate"""
        if not self.session_token:
            self.log_test("Bank Verification Initiate", False, "No session token available")
            return False
            
        try:
            url = f"{BACKEND_URL}/creators/verify/bank/initiate"
            headers = {"Content-Type": "application/json"}
            cookies = {"session_token": self.session_token}
            
            # Valid bank details
            bank_data = {
                "bank_account_number": "1234567890123456",
                "bank_ifsc_code": "SBIN0001234",
                "bank_account_holder": "Test Creator Pro",
                "bank_name": "State Bank of India",
                "upi_id": "testcreator@paytm"
            }
            
            response = requests.post(url, json=bank_data, headers=headers, cookies=cookies)
            
            if response.status_code == 200:
                data = response.json()
                verification_id = data.get("verification_id")
                
                if verification_id and data.get("status") == "verified":
                    self.log_test("Bank Verification Initiate", True, f"Bank verification successful with ID: {verification_id}")
                    return True
                else:
                    self.log_test("Bank Verification Initiate", False, f"Missing verification_id or status: {data}")
                    return False
            else:
                self.log_test("Bank Verification Initiate", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Bank Verification Initiate", False, f"Exception: {str(e)}")
            return False
    
    def test_bank_verification_status(self):
        """Test 6: Bank verification status"""
        if not self.session_token:
            self.log_test("Bank Verification Status", False, "No session token available")
            return False
            
        try:
            url = f"{BACKEND_URL}/creators/verify/bank/status"
            cookies = {"session_token": self.session_token}
            
            response = requests.get(url, cookies=cookies)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("bank_verified") == True:
                    self.log_test("Bank Verification Status", True, f"Bank verified status confirmed: {data}")
                    return True
                else:
                    self.log_test("Bank Verification Status", False, f"Bank not verified: {data}")
                    return False
            else:
                self.log_test("Bank Verification Status", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Bank Verification Status", False, f"Exception: {str(e)}")
            return False
    
    def test_instagram_oauth_503(self):
        """Test 7: Instagram OAuth should return 503 (not configured)"""
        if not self.session_token:
            self.log_test("Instagram OAuth (503)", False, "No session token available")
            return False
            
        try:
            url = f"{BACKEND_URL}/creators/verify/instagram/initiate"
            headers = {"Content-Type": "application/json"}
            cookies = {"session_token": self.session_token}
            
            response = requests.post(url, headers=headers, cookies=cookies)
            
            if response.status_code == 503:
                try:
                    data = response.json()
                    if "Instagram OAuth not configured" in data.get("detail", ""):
                        self.log_test("Instagram OAuth (503)", True, f"Correctly returned 503 with proper error message: {data}")
                        return True
                    else:
                        self.log_test("Instagram OAuth (503)", False, f"503 status but wrong error message: {data}")
                        return False
                except:
                    self.log_test("Instagram OAuth (503)", False, f"503 status but invalid JSON response: {response.text}")
                    return False
            else:
                self.log_test("Instagram OAuth (503)", False, f"Expected 503 but got HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Instagram OAuth (503)", False, f"Exception: {str(e)}")
            return False
    
    def test_youtube_oauth_503(self):
        """Test 8: YouTube OAuth should return 503 (not configured)"""
        if not self.session_token:
            self.log_test("YouTube OAuth (503)", False, "No session token available")
            return False
            
        try:
            url = f"{BACKEND_URL}/creators/verify/youtube/initiate"
            headers = {"Content-Type": "application/json"}
            cookies = {"session_token": self.session_token}
            
            response = requests.post(url, headers=headers, cookies=cookies)
            
            if response.status_code == 503:
                try:
                    data = response.json()
                    if "YouTube OAuth not configured" in data.get("detail", ""):
                        self.log_test("YouTube OAuth (503)", True, f"Correctly returned 503 with proper error message: {data}")
                        return True
                    else:
                        self.log_test("YouTube OAuth (503)", False, f"503 status but wrong error message: {data}")
                        return False
                except:
                    self.log_test("YouTube OAuth (503)", False, f"503 status but invalid JSON response: {response.text}")
                    return False
            else:
                self.log_test("YouTube OAuth (503)", False, f"Expected 503 but got HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("YouTube OAuth (503)", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 Starting Backend API Tests for Profile Save & Bank Verification")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 80)
        
        # Test sequence as specified in review request
        tests = [
            self.test_create_test_user,
            self.test_profile_update_empty_rate,
            self.test_profile_update_valid_rate,
            self.test_auth_me,
            self.test_bank_verification_initiate,
            self.test_bank_verification_status,
            self.test_instagram_oauth_503,
            self.test_youtube_oauth_503
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
            print()  # Add spacing between tests
        
        print("=" * 80)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests PASSED!")
        else:
            print(f"⚠️  {total - passed} tests FAILED")
            
        return passed, total, self.test_results

def main():
    tester = BackendTester()
    passed, total, results = tester.run_all_tests()
    
    # Save detailed results
    with open("/app/backend_test_results.json", "w") as f:
        json.dump({
            "summary": {"passed": passed, "total": total, "success_rate": passed/total},
            "results": results
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: /app/backend_test_results.json")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)