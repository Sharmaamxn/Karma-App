#!/usr/bin/env python3
"""
Backend API Testing for Ethical Shopping Karma MVP
Tests all backend endpoints to verify functionality
"""

import requests
import json
import sys
from typing import Dict, List, Any
import time

# Backend URL from frontend/.env
BACKEND_URL = "https://617f17c8-b9e8-46c2-87b5-31074dd3844d.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        self.created_user_id = None
        
    def log_test(self, test_name: str, success: bool, message: str, response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        
    def test_main_api_endpoint(self):
        """Test GET /api/ endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "Ethical Shopping Karma API" in data["message"]:
                    self.log_test("Main API Endpoint", True, "API responding correctly", data)
                    return True
                else:
                    self.log_test("Main API Endpoint", False, f"Unexpected response format: {data}")
                    return False
            else:
                self.log_test("Main API Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Main API Endpoint", False, f"Connection error: {str(e)}")
            return False
    
    def test_get_all_products(self):
        """Test GET /api/products endpoint"""
        try:
            response = requests.get(f"{self.base_url}/products", timeout=10)
            if response.status_code == 200:
                products = response.json()
                if isinstance(products, list) and len(products) == 8:
                    # Verify product structure
                    required_fields = ["id", "name", "price", "description", "category", 
                                     "ethical_badges", "karma_points", "sustainability_score", 
                                     "carbon_footprint"]
                    
                    all_valid = True
                    for product in products:
                        for field in required_fields:
                            if field not in product:
                                all_valid = False
                                break
                        if not all_valid:
                            break
                    
                    if all_valid:
                        # Check categories
                        categories = set(product["category"] for product in products)
                        expected_categories = {"Beverages", "Produce", "Home & Kitchen", 
                                             "Health & Wellness", "Home & Garden", "Food & Snacks"}
                        
                        self.log_test("Get All Products", True, 
                                    f"Found {len(products)} products with correct structure. Categories: {categories}")
                        return products
                    else:
                        self.log_test("Get All Products", False, "Products missing required fields")
                        return None
                else:
                    self.log_test("Get All Products", False, 
                                f"Expected 8 products, got {len(products) if isinstance(products, list) else 'non-list'}")
                    return None
            else:
                self.log_test("Get All Products", False, f"HTTP {response.status_code}: {response.text}")
                return None
        except Exception as e:
            self.log_test("Get All Products", False, f"Error: {str(e)}")
            return None
    
    def test_get_specific_product(self, products: List[Dict]):
        """Test GET /api/products/{product_id} endpoint"""
        if not products:
            self.log_test("Get Specific Product", False, "No products available for testing")
            return False
            
        try:
            # Test with first product
            test_product = products[0]
            product_id = test_product["id"]
            
            response = requests.get(f"{self.base_url}/products/{product_id}", timeout=10)
            if response.status_code == 200:
                product = response.json()
                if product["id"] == product_id and product["name"] == test_product["name"]:
                    self.log_test("Get Specific Product", True, 
                                f"Successfully retrieved product: {product['name']}")
                    return True
                else:
                    self.log_test("Get Specific Product", False, "Product data mismatch")
                    return False
            else:
                self.log_test("Get Specific Product", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Specific Product", False, f"Error: {str(e)}")
            return False
    
    def test_get_products_by_category(self, products: List[Dict]):
        """Test GET /api/products/category/{category} endpoint"""
        if not products:
            self.log_test("Get Products by Category", False, "No products available for testing")
            return False
            
        try:
            # Test with "Beverages" category
            test_category = "Beverages"
            expected_products = [p for p in products if p["category"] == test_category]
            
            response = requests.get(f"{self.base_url}/products/category/{test_category}", timeout=10)
            if response.status_code == 200:
                category_products = response.json()
                if len(category_products) == len(expected_products):
                    self.log_test("Get Products by Category", True, 
                                f"Found {len(category_products)} products in {test_category} category")
                    return True
                else:
                    self.log_test("Get Products by Category", False, 
                                f"Expected {len(expected_products)} products, got {len(category_products)}")
                    return False
            else:
                self.log_test("Get Products by Category", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Products by Category", False, f"Error: {str(e)}")
            return False
    
    def test_create_user(self):
        """Test POST /api/users endpoint"""
        try:
            user_data = {
                "email": "sarah.green@ethicalshop.com",
                "name": "Sarah Green"
            }
            
            response = requests.post(f"{self.base_url}/users", 
                                   json=user_data, timeout=10)
            if response.status_code == 200:
                user = response.json()
                required_fields = ["id", "email", "name", "karma_points", "total_impact_score", "purchases"]
                
                if all(field in user for field in required_fields):
                    if user["email"] == user_data["email"] and user["name"] == user_data["name"]:
                        self.created_user_id = user["id"]
                        self.log_test("Create User", True, 
                                    f"User created successfully: {user['name']} (ID: {user['id']})")
                        return True
                    else:
                        self.log_test("Create User", False, "User data mismatch")
                        return False
                else:
                    self.log_test("Create User", False, "User missing required fields")
                    return False
            else:
                self.log_test("Create User", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create User", False, f"Error: {str(e)}")
            return False
    
    def test_add_karma_points(self):
        """Test POST /api/users/{user_id}/karma endpoint"""
        if not self.created_user_id:
            self.log_test("Add Karma Points", False, "No user ID available for testing")
            return False
            
        try:
            karma_data = {
                "points": 100,
                "description": "Purchased eco-friendly product"
            }
            
            # Note: The API expects query parameters, not JSON body
            response = requests.post(f"{self.base_url}/users/{self.created_user_id}/karma", 
                                   params=karma_data, timeout=10)
            if response.status_code == 200:
                result = response.json()
                if "message" in result and "successfully" in result["message"]:
                    self.log_test("Add Karma Points", True, 
                                f"Karma points added successfully: {karma_data['points']} points")
                    return True
                else:
                    self.log_test("Add Karma Points", False, f"Unexpected response: {result}")
                    return False
            else:
                self.log_test("Add Karma Points", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Add Karma Points", False, f"Error: {str(e)}")
            return False
    
    def test_verify_ethical_data(self, products: List[Dict]):
        """Verify ethical badges, sustainability scores, and karma points"""
        if not products:
            self.log_test("Verify Ethical Data", False, "No products available for testing")
            return False
            
        try:
            ethical_issues = []
            
            for product in products:
                # Check ethical badges
                if not product.get("ethical_badges"):
                    ethical_issues.append(f"Product '{product['name']}' has no ethical badges")
                else:
                    for badge in product["ethical_badges"]:
                        if not all(key in badge for key in ["category", "score", "description"]):
                            ethical_issues.append(f"Product '{product['name']}' has incomplete ethical badge")
                        elif not (0 <= badge["score"] <= 100):
                            ethical_issues.append(f"Product '{product['name']}' has invalid ethical score: {badge['score']}")
                
                # Check sustainability score
                if not (0 <= product.get("sustainability_score", -1) <= 100):
                    ethical_issues.append(f"Product '{product['name']}' has invalid sustainability score")
                
                # Check karma points
                if product.get("karma_points", -1) < 0:
                    ethical_issues.append(f"Product '{product['name']}' has negative karma points")
                
                # Check carbon footprint
                valid_footprints = ["Very Low", "Low", "Medium", "High", "Very High"]
                if product.get("carbon_footprint") not in valid_footprints:
                    ethical_issues.append(f"Product '{product['name']}' has invalid carbon footprint")
            
            if not ethical_issues:
                self.log_test("Verify Ethical Data", True, "All products have valid ethical information")
                return True
            else:
                self.log_test("Verify Ethical Data", False, f"Ethical data issues: {'; '.join(ethical_issues[:3])}")
                return False
                
        except Exception as e:
            self.log_test("Verify Ethical Data", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🧪 Starting Ethical Shopping Karma Backend API Tests")
        print(f"🔗 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test 1: Main API endpoint
        api_working = self.test_main_api_endpoint()
        
        # Test 2: Get all products
        products = self.test_get_all_products()
        
        # Test 3: Get specific product
        if products:
            self.test_get_specific_product(products)
        
        # Test 4: Get products by category
        if products:
            self.test_get_products_by_category(products)
        
        # Test 5: Create user
        self.test_create_user()
        
        # Test 6: Add karma points
        self.test_add_karma_points()
        
        # Test 7: Verify ethical data
        if products:
            self.test_verify_ethical_data(products)
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 All tests passed! Backend API is working correctly.")
            return True
        else:
            print(f"\n⚠️  {total - passed} test(s) failed. Check the details above.")
            return False

def main():
    """Main test execution"""
    tester = BackendTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()