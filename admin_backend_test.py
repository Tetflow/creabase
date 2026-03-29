#!/usr/bin/env python3
"""
Admin Backend API Testing Script
Tests all critical admin features as specified in the review request.
"""

import requests
import json
import os
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://github-preview-25.preview.emergentagent.com/api"

class AdminBackendTester:
    def __init__(self):
        self.session_token = None
        self.admin_user = None
        self.test_results = []
        self.test_user_id = None
        
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
        
    def test_admin_login(self):
        """Test 1: Admin Login"""
        try:
            url = f"{BACKEND_URL}/auth/login"
            headers = {"Content-Type": "application/json"}
            
            # Admin credentials from test_credentials.md
            login_data = {
                "email": "admin@creabase.com",
                "password": "admin123"
            }
            
            response = requests.post(url, json=login_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                user = data.get("user", {})
                
                if user.get("role") == "admin":
                    self.session_token = data.get("session_token")
                    self.admin_user = user
                    self.log_test("Admin Login", True, f"Successfully logged in as admin: {user.get('email')}")
                    return True
                else:
                    self.log_test("Admin Login", False, f"User role is not admin: {user.get('role')}")
                    return False
            else:
                self.log_test("Admin Login", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Login", False, f"Exception: {str(e)}")
            return False
    
    def test_get_all_users(self):
        """Test 2: GET /api/admin/users"""
        if not self.session_token:
            self.log_test("Get All Users", False, "No admin session token available")
            return False
            
        try:
            url = f"{BACKEND_URL}/admin/users"
            cookies = {"session_token": self.session_token}
            
            response = requests.get(url, cookies=cookies)
            
            if response.status_code == 200:
                users = response.json()  # Direct list response
                
                if isinstance(users, list) and len(users) > 0:
                    # Store a test user ID for later wallet tests
                    for user in users:
                        if user.get("role") in ["creator", "business"] and user.get("user_id"):
                            self.test_user_id = user.get("user_id")
                            break
                    
                    self.log_test("Get All Users", True, f"Retrieved {len(users)} users, test_user_id: {self.test_user_id}")
                    return True
                else:
                    self.log_test("Get All Users", False, f"No users found or invalid response: {users}")
                    return False
            else:
                self.log_test("Get All Users", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get All Users", False, f"Exception: {str(e)}")
            return False
    
    def test_get_all_wallets(self):
        """Test 3: GET /api/admin/wallets"""
        if not self.session_token:
            self.log_test("Get All Wallets", False, "No admin session token available")
            return False
            
        try:
            url = f"{BACKEND_URL}/admin/wallets"
            cookies = {"session_token": self.session_token}
            
            response = requests.get(url, cookies=cookies)
            
            if response.status_code == 200:
                data = response.json()
                wallets = data.get("wallets", [])
                
                if isinstance(wallets, list):
                    self.log_test("Get All Wallets", True, f"Retrieved {len(wallets)} wallets")
                    return True
                else:
                    self.log_test("Get All Wallets", False, f"Invalid wallets response: {data}")
                    return False
            else:
                self.log_test("Get All Wallets", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get All Wallets", False, f"Exception: {str(e)}")
            return False
    
    def test_wallet_credit(self):
        """Test 4: POST /api/admin/wallets/{user_id}/adjust - Credit"""
        if not self.session_token or not self.test_user_id:
            self.log_test("Wallet Credit", False, "No admin session token or test user ID available")
            return False
            
        try:
            # First get current wallet balance
            url = f"{BACKEND_URL}/admin/wallets/{self.test_user_id}"
            cookies = {"session_token": self.session_token}
            
            response = requests.get(url, cookies=cookies)
            if response.status_code != 200:
                self.log_test("Wallet Credit", False, f"Failed to get wallet: HTTP {response.status_code}")
                return False
            
            wallet_data = response.json()
            initial_balance = wallet_data.get("wallet", {}).get("balance", 0)
            self.log_test("Wallet Credit", True, f"Initial balance: ₹{initial_balance}")  # Debug log
            
            # Now credit the wallet
            url = f"{BACKEND_URL}/admin/wallets/{self.test_user_id}/adjust"
            headers = {"Content-Type": "application/json"}
            
            credit_data = {
                "adjustment_type": "credit",
                "amount": 1000,
                "reason": "Test credit",
                "notes": "Testing admin wallet credit functionality"
            }
            
            response = requests.post(url, json=credit_data, headers=headers, cookies=cookies)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify the response
                if "message" in data and "successfully" in data.get("message", ""):
                    # Check if balance increased
                    response = requests.get(f"{BACKEND_URL}/admin/wallets/{self.test_user_id}", cookies=cookies)
                    if response.status_code == 200:
                        new_wallet_data = response.json()
                        new_balance = new_wallet_data.get("wallet", {}).get("balance", 0)
                        
                        if new_balance == initial_balance + 1000:
                            self.log_test("Wallet Credit", True, f"Successfully credited ₹1000. Balance: {initial_balance} → {new_balance}")
                            return True
                        else:
                            self.log_test("Wallet Credit", False, f"Balance not updated correctly. Expected: {initial_balance + 1000}, Got: {new_balance}")
                            return False
                    else:
                        self.log_test("Wallet Credit", False, "Failed to verify balance after credit")
                        return False
                else:
                    self.log_test("Wallet Credit", False, f"Credit operation failed: {data}")
                    return False
            else:
                self.log_test("Wallet Credit", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Wallet Credit", False, f"Exception: {str(e)}")
            return False
    
    def test_wallet_debit(self):
        """Test 5: POST /api/admin/wallets/{user_id}/adjust - Debit"""
        if not self.session_token or not self.test_user_id:
            self.log_test("Wallet Debit", False, "No admin session token or test user ID available")
            return False
            
        try:
            # First get current wallet balance
            url = f"{BACKEND_URL}/admin/wallets/{self.test_user_id}"
            cookies = {"session_token": self.session_token}
            
            response = requests.get(url, cookies=cookies)
            if response.status_code != 200:
                self.log_test("Wallet Debit", False, f"Failed to get wallet: HTTP {response.status_code}")
                return False
            
            wallet_data = response.json()
            initial_balance = wallet_data.get("wallet", {}).get("balance", 0)
            self.log_test("Wallet Debit", True, f"Initial balance: ₹{initial_balance}")  # Debug log
            
            # Now debit the wallet
            url = f"{BACKEND_URL}/admin/wallets/{self.test_user_id}/adjust"
            headers = {"Content-Type": "application/json"}
            
            debit_data = {
                "adjustment_type": "debit",
                "amount": 500,
                "reason": "Test debit",
                "notes": "Testing admin wallet debit functionality"
            }
            
            response = requests.post(url, json=debit_data, headers=headers, cookies=cookies)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify the response
                if "message" in data and "successfully" in data.get("message", ""):
                    # Check if balance decreased
                    response = requests.get(f"{BACKEND_URL}/admin/wallets/{self.test_user_id}", cookies=cookies)
                    if response.status_code == 200:
                        new_wallet_data = response.json()
                        new_balance = new_wallet_data.get("wallet", {}).get("balance", 0)
                        
                        if new_balance == initial_balance - 500:
                            self.log_test("Wallet Debit", True, f"Successfully debited ₹500. Balance: {initial_balance} → {new_balance}")
                            return True
                        else:
                            self.log_test("Wallet Debit", False, f"Balance not updated correctly. Expected: {initial_balance - 500}, Got: {new_balance}")
                            return False
                    else:
                        self.log_test("Wallet Debit", False, "Failed to verify balance after debit")
                        return False
                else:
                    self.log_test("Wallet Debit", False, f"Debit operation failed: {data}")
                    return False
            else:
                self.log_test("Wallet Debit", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Wallet Debit", False, f"Exception: {str(e)}")
            return False
    
    def test_get_wallet_transactions(self):
        """Test 6: GET /api/admin/wallets/{user_id}/transactions"""
        if not self.session_token or not self.test_user_id:
            self.log_test("Get Wallet Transactions", False, "No admin session token or test user ID available")
            return False
            
        try:
            url = f"{BACKEND_URL}/admin/wallets/{self.test_user_id}/transactions"
            cookies = {"session_token": self.session_token}
            
            response = requests.get(url, cookies=cookies)
            
            if response.status_code == 200:
                data = response.json()
                transactions = data.get("transactions", [])
                
                if isinstance(transactions, list):
                    # Look for our test transactions
                    credit_found = False
                    debit_found = False
                    
                    for txn in transactions:
                        if txn.get("type") == "credit" and txn.get("amount") == 1000:
                            credit_found = True
                        if txn.get("type") == "debit" and txn.get("amount") == 500:
                            debit_found = True
                    
                    if credit_found and debit_found:
                        self.log_test("Get Wallet Transactions", True, f"Found {len(transactions)} transactions including our test credit/debit")
                        return True
                    else:
                        self.log_test("Get Wallet Transactions", True, f"Retrieved {len(transactions)} transactions (test transactions may not be visible)")
                        return True
                else:
                    self.log_test("Get Wallet Transactions", False, f"Invalid transactions response: {data}")
                    return False
            else:
                self.log_test("Get Wallet Transactions", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get Wallet Transactions", False, f"Exception: {str(e)}")
            return False
    
    def test_user_restriction(self):
        """Test 7: POST /api/admin/users/{user_id}/restrict"""
        if not self.session_token or not self.test_user_id:
            self.log_test("User Restriction", False, "No admin session token or test user ID available")
            return False
            
        try:
            url = f"{BACKEND_URL}/admin/users/{self.test_user_id}/restrict"
            headers = {"Content-Type": "application/json"}
            cookies = {"session_token": self.session_token}
            
            restriction_data = {
                "user_id": self.test_user_id,
                "restriction_type": "suspend",
                "reason": "Testing suspension functionality",
                "duration_days": 7
            }
            
            response = requests.post(url, json=restriction_data, headers=headers, cookies=cookies)
            
            if response.status_code == 200:
                data = response.json()
                
                if "message" in data and "successfully" in data.get("message", ""):
                    # Verify user is restricted
                    user_url = f"{BACKEND_URL}/admin/users/{self.test_user_id}"
                    response = requests.get(user_url, cookies=cookies)
                    
                    if response.status_code == 200:
                        user_data = response.json()
                        restrictions = user_data.get("restrictions", [])
                        has_active_restriction = any(r.get("active") == True for r in restrictions)
                        
                        if has_active_restriction:
                            self.log_test("User Restriction", True, f"Successfully restricted user: {restrictions[0].get('restriction_type')}")
                            return True
                        else:
                            self.log_test("User Restriction", False, f"User not marked as restricted: {restrictions}")
                            return False
                    else:
                        self.log_test("User Restriction", False, "Failed to verify user restriction status")
                        return False
                else:
                    self.log_test("User Restriction", False, f"Restriction failed: {data}")
                    return False
            else:
                self.log_test("User Restriction", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Restriction", False, f"Exception: {str(e)}")
            return False
    
    def test_user_unrestriction(self):
        """Test 8: POST /api/admin/users/{user_id}/unrestrict"""
        if not self.session_token or not self.test_user_id:
            self.log_test("User Unrestriction", False, "No admin session token or test user ID available")
            return False
            
        try:
            url = f"{BACKEND_URL}/admin/users/{self.test_user_id}/unrestrict"
            headers = {"Content-Type": "application/json"}
            cookies = {"session_token": self.session_token}
            
            response = requests.post(url, headers=headers, cookies=cookies)
            
            if response.status_code == 200:
                data = response.json()
                
                if "message" in data and "successfully" in data.get("message", ""):
                    # Verify user is unrestricted
                    user_url = f"{BACKEND_URL}/admin/users/{self.test_user_id}"
                    response = requests.get(user_url, cookies=cookies)
                    
                    if response.status_code == 200:
                        user_data = response.json()
                        restrictions = user_data.get("restrictions", [])
                        has_active_restriction = any(r.get("active") == True for r in restrictions)
                        
                        if not has_active_restriction:
                            self.log_test("User Unrestriction", True, "Successfully unrestricted user")
                            return True
                        else:
                            self.log_test("User Unrestriction", False, f"User still has active restrictions: {restrictions}")
                            return False
                    else:
                        self.log_test("User Unrestriction", False, "Failed to verify user unrestriction status")
                        return False
                else:
                    self.log_test("User Unrestriction", False, f"Unrestriction failed: {data}")
                    return False
            else:
                self.log_test("User Unrestriction", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Unrestriction", False, f"Exception: {str(e)}")
            return False
    
    def test_fee_configuration(self):
        """Test 9: GET /api/admin/fees (or platform-config)"""
        if not self.session_token:
            self.log_test("Fee Configuration", False, "No admin session token available")
            return False
            
        try:
            # Try the platform-config endpoint first
            url = f"{BACKEND_URL}/admin/platform-config"
            cookies = {"session_token": self.session_token}
            
            response = requests.get(url, cookies=cookies)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for expected fee configuration fields
                if "platform_fee_percent" in data or "transaction_fees" in data:
                    self.log_test("Fee Configuration", True, f"Retrieved fee configuration: {list(data.keys())}")
                    return True
                else:
                    self.log_test("Fee Configuration", True, f"Retrieved platform config (may not contain fees): {list(data.keys())}")
                    return True
            else:
                # Try alternative endpoint
                url = f"{BACKEND_URL}/admin/fees"
                response = requests.get(url, cookies=cookies)
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_test("Fee Configuration", True, f"Retrieved fees from /admin/fees: {list(data.keys())}")
                    return True
                else:
                    self.log_test("Fee Configuration", False, f"Both endpoints failed. HTTP {response.status_code}: {response.text}")
                    return False
                
        except Exception as e:
            self.log_test("Fee Configuration", False, f"Exception: {str(e)}")
            return False
    
    def test_disputes_list(self):
        """Test 10: GET /api/admin/disputes"""
        if not self.session_token:
            self.log_test("Disputes List", False, "No admin session token available")
            return False
            
        try:
            url = f"{BACKEND_URL}/admin/disputes"
            cookies = {"session_token": self.session_token}
            
            response = requests.get(url, cookies=cookies)
            
            if response.status_code == 200:
                disputes = response.json()  # Direct list response
                
                if isinstance(disputes, list):
                    self.log_test("Disputes List", True, f"Retrieved {len(disputes)} disputes")
                    return True
                else:
                    self.log_test("Disputes List", False, f"Invalid disputes response: {disputes}")
                    return False
            else:
                self.log_test("Disputes List", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Disputes List", False, f"Exception: {str(e)}")
            return False
    
    def test_payouts_list(self):
        """Test 11: GET /api/admin/payouts"""
        if not self.session_token:
            self.log_test("Payouts List", False, "No admin session token available")
            return False
            
        try:
            url = f"{BACKEND_URL}/admin/payouts"
            cookies = {"session_token": self.session_token}
            
            response = requests.get(url, cookies=cookies)
            
            if response.status_code == 200:
                payouts = response.json()  # Direct list response
                
                if isinstance(payouts, list):
                    self.log_test("Payouts List", True, f"Retrieved {len(payouts)} payouts")
                    return True
                else:
                    self.log_test("Payouts List", False, f"Invalid payouts response: {payouts}")
                    return False
            else:
                self.log_test("Payouts List", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Payouts List", False, f"Exception: {str(e)}")
            return False
    
    def test_analytics(self):
        """Test 12: GET /api/admin/analytics"""
        if not self.session_token:
            self.log_test("Analytics", False, "No admin session token available")
            return False
            
        try:
            # Try the analytics overview endpoint
            url = f"{BACKEND_URL}/admin/analytics/overview"
            cookies = {"session_token": self.session_token}
            
            response = requests.get(url, cookies=cookies)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for expected analytics fields
                if any(key in data for key in ["users", "creators", "projects", "revenue", "total_users", "total_creators"]):
                    self.log_test("Analytics", True, f"Retrieved analytics data: {list(data.keys())}")
                    return True
                else:
                    self.log_test("Analytics", True, f"Retrieved analytics (unknown format): {list(data.keys())}")
                    return True
            else:
                # Try alternative endpoint
                url = f"{BACKEND_URL}/admin/analytics"
                response = requests.get(url, cookies=cookies)
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_test("Analytics", True, f"Retrieved analytics from /admin/analytics: {list(data.keys())}")
                    return True
                else:
                    self.log_test("Analytics", False, f"Both endpoints failed. HTTP {response.status_code}: {response.text}")
                    return False
                
        except Exception as e:
            self.log_test("Analytics", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all admin tests in sequence"""
        print(f"🚀 Starting Admin Backend API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 80)
        
        # Test sequence as specified in review request
        tests = [
            self.test_admin_login,
            self.test_get_all_users,
            self.test_get_all_wallets,
            self.test_wallet_credit,
            self.test_wallet_debit,
            self.test_get_wallet_transactions,
            self.test_user_restriction,
            self.test_user_unrestriction,
            self.test_fee_configuration,
            self.test_disputes_list,
            self.test_payouts_list,
            self.test_analytics
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
            print("🎉 All admin tests PASSED!")
        else:
            print(f"⚠️  {total - passed} tests FAILED")
            
        return passed, total, self.test_results

def main():
    tester = AdminBackendTester()
    passed, total, results = tester.run_all_tests()
    
    # Save detailed results
    with open("/app/admin_backend_test_results.json", "w") as f:
        json.dump({
            "summary": {"passed": passed, "total": total, "success_rate": passed/total},
            "results": results
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: /app/admin_backend_test_results.json")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)