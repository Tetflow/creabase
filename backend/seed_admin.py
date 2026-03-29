"""
Admin Seeding Script
Creates default admin account on startup if it doesn't exist
"""
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from uuid import uuid4
from datetime import datetime, timezone

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'creabase_db')

# Admin credentials
ADMIN_EMAIL = "admin@creabase.com"
ADMIN_PASSWORD = "admin123"
ADMIN_NAME = "Platform Admin"

async def seed_admin():
    """Create admin user if it doesn't exist"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        # Check if admin already exists
        existing_admin = await db.users.find_one({"email": ADMIN_EMAIL})
        
        if existing_admin:
            print(f"✓ Admin user already exists: {ADMIN_EMAIL}")
            return
        
        # Create admin user
        admin_id = f"user_{uuid4().hex[:16]}"
        hashed_password = pwd_context.hash(ADMIN_PASSWORD)
        
        admin_user = {
            "user_id": admin_id,
            "email": ADMIN_EMAIL,
            "password_hash": hashed_password,
            "name": ADMIN_NAME,
            "role": "admin",
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.users.insert_one(admin_user)
        print(f"✅ Admin user created successfully!")
        print(f"   Email: {ADMIN_EMAIL}")
        print(f"   Password: {ADMIN_PASSWORD}")
        print(f"   User ID: {admin_id}")
        
        # Create admin wallet
        admin_wallet = {
            "wallet_id": f"wallet_{uuid4().hex[:16]}",
            "user_id": admin_id,
            "balance": 0.0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.wallets.insert_one(admin_wallet)
        print(f"✅ Admin wallet created")
        
    except Exception as e:
        print(f"❌ Error seeding admin: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_admin())
