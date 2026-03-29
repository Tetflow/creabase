"""
Seed test users for all roles (Admin, Business, Creator)
Run: python seed_test_users.py
"""
import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
from uuid import uuid4
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'creabase')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_test_users():
    """Create test users for all roles"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🌱 Seeding test users...")
    
    # Clear existing test users (optional - comment out if you want to keep existing)
    await db.users.delete_many({"email": {"$regex": "^test"}})
    await db.creators.delete_many({"email": {"$regex": "^test"}})
    await db.wallets.delete_many({"user_id": {"$regex": "^test_user"}})
    
    test_users = []
    
    # ==================== ADMIN USERS ====================
    print("\n👑 Creating Admin users...")
    
    admin_users = [
        {
            "user_id": f"admin_user_{uuid4().hex[:8]}",
            "email": "admin@creabase.com",
            "password": "admin123",
            "role": "admin",
            "name": "Platform Admin"
        },
        {
            "user_id": f"admin_user_{uuid4().hex[:8]}",
            "email": "testadmin@creabase.com",
            "password": "admin123",
            "role": "admin",
            "name": "Test Admin"
        }
    ]
    
    for admin in admin_users:
        hashed_password = pwd_context.hash(admin["password"])
        user_doc = {
            "user_id": admin["user_id"],
            "email": admin["email"],
            "password_hash": hashed_password,
            "role": admin["role"],
            "name": admin["name"],
            "subscription_status": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_login": datetime.now(timezone.utc).isoformat()
        }
        
        # Check if exists
        existing = await db.users.find_one({"email": admin["email"]})
        if existing:
            await db.users.replace_one({"email": admin["email"]}, user_doc)
            print(f"  ✅ Updated: {admin['email']} / {admin['password']}")
        else:
            await db.users.insert_one(user_doc)
            print(f"  ✅ Created: {admin['email']} / {admin['password']}")
        
        test_users.append(admin)
    
    # ==================== BUSINESS USERS ====================
    print("\n🏢 Creating Business users...")
    
    business_users = [
        {
            "email": "testbusiness1@example.com",
            "password": "business123",
            "name": "Tech Startup Inc",
            "wallet_balance": 5000
        },
        {
            "email": "testbusiness2@example.com",
            "password": "business123",
            "name": "Fashion Brand Co",
            "wallet_balance": 10000
        },
        {
            "email": "testbusiness3@example.com",
            "password": "business123",
            "name": "Food Delivery Ltd",
            "wallet_balance": 3000
        }
    ]
    
    for business in business_users:
        user_id = f"business_user_{uuid4().hex[:8]}"
        hashed_password = pwd_context.hash(business["password"])
        
        user_doc = {
            "user_id": user_id,
            "email": business["email"],
            "password_hash": hashed_password,
            "role": "business",
            "name": business["name"],
            "subscription_status": None,
            "business_subscription": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_login": datetime.now(timezone.utc).isoformat()
        }
        
        await db.users.insert_one(user_doc)
        
        # Create wallet with balance
        wallet_doc = {
            "wallet_id": f"wallet_{uuid4().hex[:8]}",
            "user_id": user_id,
            "balance": business["wallet_balance"],
            "currency": "INR",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        await db.wallets.insert_one(wallet_doc)
        
        print(f"  ✅ Created: {business['email']} / {business['password']} (Wallet: ₹{business['wallet_balance']})")
        test_users.append({
            "email": business["email"],
            "password": business["password"],
            "role": "business",
            "wallet_balance": business["wallet_balance"]
        })
    
    # ==================== CREATOR USERS ====================
    print("\n✨ Creating Creator users...")
    
    creator_users = [
        {
            "email": "testcreator1@example.com",
            "password": "creator123",
            "name": "Rahul Sharma",
            "bio": "Tech YouTuber with 500K+ subscribers. Reviewing gadgets and tech trends.",
            "instagram_followers": 250000,
            "youtube_subscribers": 500000,
            "engagement_rate": 4.5,
            "city": "Mumbai",
            "wallet_balance": 2000,
            "status": "approved"
        },
        {
            "email": "testcreator2@example.com",
            "password": "creator123",
            "name": "Priya Patel",
            "bio": "Fashion & Lifestyle Influencer. Collaborating with top brands.",
            "instagram_followers": 800000,
            "youtube_subscribers": 150000,
            "engagement_rate": 5.2,
            "city": "Delhi",
            "wallet_balance": 5000,
            "status": "approved"
        },
        {
            "email": "testcreator3@example.com",
            "password": "creator123",
            "name": "Amit Kumar",
            "bio": "Food vlogger exploring street food across India.",
            "instagram_followers": 120000,
            "youtube_subscribers": 300000,
            "engagement_rate": 6.1,
            "city": "Bangalore",
            "wallet_balance": 1500,
            "status": "approved"
        },
        {
            "email": "testcreator4@example.com",
            "password": "creator123",
            "name": "Neha Singh",
            "bio": "Fitness coach and wellness influencer. Helping people live healthier.",
            "instagram_followers": 350000,
            "youtube_subscribers": 200000,
            "engagement_rate": 5.8,
            "city": "Pune",
            "wallet_balance": 3000,
            "status": "pending"
        }
    ]
    
    for creator in creator_users:
        user_id = f"creator_user_{uuid4().hex[:8]}"
        creator_id = f"creator_{uuid4().hex[:12]}"
        hashed_password = pwd_context.hash(creator["password"])
        
        # Create user
        user_doc = {
            "user_id": user_id,
            "email": creator["email"],
            "password_hash": hashed_password,
            "role": "creator",
            "name": creator["name"],
            "subscription_status": None,
            "creator_subscription": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_login": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        
        # Create creator profile
        creator_doc = {
            "creator_id": creator_id,
            "submitted_by": user_id,
            "name": creator["name"],
            "email": creator["email"],
            "phone": f"+91 9876{uuid4().hex[:6]}",
            "bio": creator["bio"],
            "city": creator["city"],
            "district": creator["city"],
            "platforms": ["instagram", "youtube"],
            "instagram_handle": f"@{creator['name'].lower().replace(' ', '_')}",
            "youtube_handle": creator['name'].replace(' ', ''),
            "instagram_followers": creator["instagram_followers"],
            "youtube_subscribers": creator["youtube_subscribers"],
            "engagement_rate": creator["engagement_rate"],
            "avg_views": int(creator["youtube_subscribers"] * 0.15),
            "language": ["English", "Hindi"],
            "industry": ["Technology", "Lifestyle", "Entertainment"],
            "status": creator["status"],
            "social_verified": True,
            "bank_details": {
                "account_holder_name": creator["name"],
                "account_number": f"1234567890{uuid4().hex[:4]}",
                "ifsc_code": "SBIN0001234",
                "bank_name": "State Bank of India",
                "branch": creator["city"]
            },
            "profile_image": f"https://ui-avatars.com/api/?name={creator['name'].replace(' ', '+')}&size=400&background=random",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        await db.creators.insert_one(creator_doc)
        
        # Create wallet with balance
        wallet_doc = {
            "wallet_id": f"wallet_{uuid4().hex[:8]}",
            "user_id": user_id,
            "balance": creator["wallet_balance"],
            "currency": "INR",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        await db.wallets.insert_one(wallet_doc)
        
        status_emoji = "✅" if creator["status"] == "approved" else "⏳"
        print(f"  {status_emoji} Created: {creator['email']} / {creator['password']} (Wallet: ₹{creator['wallet_balance']}, Status: {creator['status']})")
        test_users.append({
            "email": creator["email"],
            "password": creator["password"],
            "role": "creator",
            "wallet_balance": creator["wallet_balance"],
            "status": creator["status"]
        })
    
    client.close()
    
    # ==================== SUMMARY ====================
    print("\n" + "="*60)
    print("✅ Test Users Created Successfully!")
    print("="*60)
    
    print("\n👑 ADMIN USERS:")
    print("Login URL: /admin-login")
    for user in test_users:
        if user.get("role") == "admin":
            print(f"  • {user['email']} / {user['password']}")
    
    print("\n🏢 BUSINESS USERS:")
    print("Login URL: /login/business (OAuth) or use password for testing")
    for user in test_users:
        if user.get("role") == "business":
            print(f"  • {user['email']} / {user['password']} (Wallet: ₹{user['wallet_balance']})")
    
    print("\n✨ CREATOR USERS:")
    print("Login URL: /login/creator (OAuth) or use password for testing")
    for user in test_users:
        if user.get("role") == "creator":
            status = "✅ Approved" if user.get("status") == "approved" else "⏳ Pending"
            print(f"  • {user['email']} / {user['password']} (Wallet: ₹{user['wallet_balance']}, {status})")
    
    print("\n📝 NOTES:")
    print("  • All passwords are the same for easy testing")
    print("  • Creators 1-3 are approved and visible to businesses")
    print("  • Creator 4 is pending approval (for admin testing)")
    print("  • All users have wallet balances for subscription testing")
    print("  • Admin can login directly at /admin-login")
    print("  • For OAuth testing, use the provided URLs")
    print("\n" + "="*60)

if __name__ == "__main__":
    asyncio.run(seed_test_users())
