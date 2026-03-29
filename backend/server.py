from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Cookie, Response, BackgroundTasks, UploadFile, File
from fastapi.responses import JSONResponse, RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import requests
from googleapiclient.discovery import build
import random
import string
import secrets
from services import EmailService, SMSService, FileUploadService, NotificationService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Platform Constants
PLATFORM_FEE_PERCENT = 0.10  # 10% platform fee
GST_PERCENT = 0.18  # 18% GST
MONTHLY_CREATOR_LIMIT = 25  # 25 creators per month included in subscription
PAY_AS_YOU_GO_PRICE = 15.0  # ₹15 per additional creator
PAY_AS_YOU_GO_WITH_GST = PAY_AS_YOU_GO_PRICE * (1 + GST_PERCENT)  # ₹17.70

# Subscription Plans
BUSINESS_SUBSCRIPTION_MONTHLY = 199.0
BUSINESS_SUBSCRIPTION_ANNUAL = 1999.0
CREATOR_SUBSCRIPTION_MONTHLY = 199.0
CREATOR_SUBSCRIPTION_ANNUAL = 1999.0

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Creator Badge System
def calculate_creator_badge(creator_stats: dict) -> str:
    """Calculate creator badge based on performance"""
    completed_projects = creator_stats.get("completed_projects", 0)
    avg_rating = creator_stats.get("average_rating", 0)
    response_time_hours = creator_stats.get("avg_response_time_hours", 24)
    is_verified = creator_stats.get("verification_status") == "verified"
    is_premium = creator_stats.get("is_premium", False)
    
    # Premium badge (highest priority)
    if is_premium:
        return "premium"
    
    # Top Rated (30+ projects, 4.8+ rating, <4h response)
    if completed_projects >= 30 and avg_rating >= 4.8 and response_time_hours < 4:
        return "top_rated"
    
    # Rising Star (10-29 projects, 4.5+ rating, <8h response)
    if 10 <= completed_projects < 30 and avg_rating >= 4.5 and response_time_hours < 8:
        return "rising_star"
    
    # Verified (has verification)
    if is_verified:
        return "verified"
    
    # New (0-9 projects)
    if completed_projects < 10:
        return "new"
    
    return "standard"

def get_badge_info(badge: str) -> dict:
    """Get badge display information"""
    badges = {
        "premium": {"color": "#FFE57F", "label": "Premium", "icon": "⭐"},
        "top_rated": {"color": "#B4F8C8", "label": "Top Rated", "icon": "🏆"},
        "rising_star": {"color": "#C6A2FF", "label": "Rising Star", "icon": "⚡"},
        "verified": {"color": "#A0E7E5", "label": "Verified", "icon": "✓"},
        "new": {"color": "#FFB6B9", "label": "New Seller", "icon": "🌟"},
        "standard": {"color": "#FFFFFF", "label": "Standard", "icon": ""}
    }
    return badges.get(badge, badges["standard"])

def check_and_reset_monthly_limit(user: dict) -> dict:
    """Check if monthly limit should be reset"""
    now = datetime.now(timezone.utc)
    reset_date = user.get("monthly_reset_date")
    
    if not reset_date:
        # First time, set reset date to next month
        user["monthly_reset_date"] = now
        user["creators_viewed_this_month"] = 0
        return user
    
    if isinstance(reset_date, str):
        reset_date = datetime.fromisoformat(reset_date)
    if reset_date.tzinfo is None:
        reset_date = reset_date.replace(tzinfo=timezone.utc)
    
    # Check if a month has passed
    if now >= reset_date:
        user["creators_viewed_this_month"] = 0
        # Set next reset date (next month)
        if reset_date.month == 12:
            user["monthly_reset_date"] = reset_date.replace(year=reset_date.year + 1, month=1)
        else:
            user["monthly_reset_date"] = reset_date.replace(month=reset_date.month + 1)
    
    return user

def calculate_platform_fees(amount: float, creator_has_subscription: bool = False):
    """
    Calculate platform fees with GST
    
    Business pays: amount + 10% fee + 18% GST on fee
    Creator receives: 
      - Subscribed: full amount (zero escrow fee benefit)
      - Unsubscribed: amount - 10% fee - 18% GST on fee
    
    Example for ₹10,000 project:
    - Business pays: ₹10,000 + ₹1,000 (10%) + ₹180 (GST) = ₹11,180
    - Subscribed creator receives: ₹10,000
    - Unsubscribed creator receives: ₹10,000 - ₹1,000 - ₹180 = ₹8,820
    - Platform earns from business: ₹1,180 (always)
    - Platform earns from creator: ₹1,180 (only if unsubscribed)
    """
    # Business fee: 10% + GST
    business_fee = amount * PLATFORM_FEE_PERCENT  # 10% of project amount
    business_gst = business_fee * GST_PERCENT  # 18% GST on fee
    business_total = amount + business_fee + business_gst
    
    # Platform earns from business fee (always)
    platform_earns_from_business = business_fee + business_gst
    
    if creator_has_subscription:
        # Creator is subscribed - receives full project amount, zero escrow fee
        creator_receives = amount
        platform_earns_from_creator = 0.0
        total_platform_earns = platform_earns_from_business
    else:
        # Creator is not subscribed - deduct 10% fee + GST from their payout
        creator_fee = amount * PLATFORM_FEE_PERCENT  # 10% of project amount
        creator_gst = creator_fee * GST_PERCENT  # 18% GST on fee
        creator_receives = amount - creator_fee - creator_gst
        platform_earns_from_creator = creator_fee + creator_gst
        total_platform_earns = platform_earns_from_business + platform_earns_from_creator
    
    return {
        "project_amount": amount,
        "business_fee": round(business_fee, 2),
        "business_gst": round(business_gst, 2),
        "business_pays": round(business_total, 2),
        "creator_receives": round(creator_receives, 2),
        "platform_earns_from_business": round(platform_earns_from_business, 2),
        "platform_earns_from_creator": round(platform_earns_from_creator, 2),
        "platform_total_earns": round(total_platform_earns, 2),
        "creator_has_subscription": creator_has_subscription
    }

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: EmailStr
    name: str
    picture: Optional[str] = None
    role: str = "business"
    subscription_status: Optional[str] = "free"
    subscription_plan: Optional[str] = None
    subscription_id: Optional[str] = None
    creators_viewed_this_month: int = 0
    monthly_reset_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Creator(BaseModel):
    model_config = ConfigDict(extra="ignore")
    creator_id: str
    name: str
    email: EmailStr
    phone: str
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    platforms: List[str] = []
    instagram_handle: Optional[str] = None
    youtube_handle: Optional[str] = None
    instagram_followers: Optional[int] = 0
    youtube_subscribers: Optional[int] = 0
    language: List[str] = []
    industry: List[str] = []
    city: Optional[str] = None
    district: Optional[str] = None
    engagement_rate: Optional[float] = 0.0
    avg_views: Optional[int] = 0
    status: str = "pending"
    verification_status: str = "unverified"
    youtube_verified: bool = False
    instagram_verified: bool = False
    premium_until: Optional[datetime] = None
    submitted_by: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc_code: Optional[str] = None
    bank_account_holder: Optional[str] = None
    bank_name: Optional[str] = None
    upi_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CreatorCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    platforms: List[str]
    instagram_handle: Optional[str] = None
    youtube_handle: Optional[str] = None
    language: List[str]
    industry: List[str]
    city: Optional[str] = None
    district: Optional[str] = None

class VerificationRequest(BaseModel):
    creator_id: str
    platform: str
    handle: str
    verification_code: Optional[str] = None

class ProjectCreate(BaseModel):
    title: str
    description: str
    budget: float
    deadline: Optional[datetime] = None
    creator_id: str

class MessageCreate(BaseModel):
    receiver_id: str
    content: str

class BankDetailsUpdate(BaseModel):
    bank_account_number: str
    bank_ifsc_code: str
    bank_account_holder: str
    bank_name: str
    upi_id: Optional[str] = None

class ReviewCreate(BaseModel):
    project_id: str
    rating: int = Field(ge=1, le=5)
    comment: str

class ProposalCreate(BaseModel):
    project_id: str
    proposed_amount: float
    delivery_days: int
    message: str

class PortfolioItemCreate(BaseModel):
    title: str
    description: str
    media_url: str
    project_type: str
    platform: Optional[str] = None

class DisputeCreate(BaseModel):
    project_id: str
    reason: str
    description: str

class FavoriteCreate(BaseModel):
    creator_id: str

class SubscriptionCreate(BaseModel):
    plan_type: str
    payment_method: str = "upi"

class WalletTopUp(BaseModel):
    amount: float
    payment_method: str = "cashfree"

class WithdrawalRequest(BaseModel):
    amount: float
    bank_account_id: str

class WalletAdjustment(BaseModel):
    user_id: str
    amount: float
    reason: str
    adjustment_type: str  # credit or debit

# Duplicate DisputeCreate removed - using the one at line 269

class DisputeResolution(BaseModel):
    resolution: str  # refund_business, pay_creator, penalty, dismiss
    resolution_notes: str
    refund_amount: Optional[float] = None

class UserRestriction(BaseModel):
    user_id: str
    restriction_type: str  # ban, suspend
    reason: str
    duration_days: Optional[int] = None  # For suspensions only

# New Models for Enhanced Subscription System
class PayoutRequest(BaseModel):
    amount: float = Field(ge=500)  # Minimum ₹500
    
class PayoutAction(BaseModel):
    action: str  # "approve" | "reject" | "complete"
    admin_notes: Optional[str] = None
    rejection_reason: Optional[str] = None

# Helper Functions for Subscription System
async def check_user_subscription(user_id: str, user_type: str) -> dict:
    """Check if user has active subscription"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        return {"has_subscription": False, "subscription": None}
    
    subscription_key = f"{user_type}_subscription"
    subscription = user.get(subscription_key, {})
    
    if not subscription or subscription.get("status") != "active":
        return {"has_subscription": False, "subscription": None}
    
    # Check expiry
    expires_at = subscription.get("expires_at")
    if expires_at:
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at < datetime.now(timezone.utc):
            # Expired
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {f"{subscription_key}.status": "expired"}}
            )
            return {"has_subscription": False, "subscription": None}
    
    return {"has_subscription": True, "subscription": subscription}

async def require_business_subscription(user: User):
    """Check if business user has active subscription, raise error if not"""
    if user.role != "business":
        return  # Only check for business users
    
    result = await check_user_subscription(user.user_id, "business")
    if not result["has_subscription"]:
        raise HTTPException(
            status_code=402,
            detail="Business subscription required. Please subscribe to access this feature."
        )
    return result["subscription"]

async def pay_from_wallet_or_cashfree(user_id: str, amount: float, description: str, reference_id: str = None) -> dict:
    """
    Try to pay from wallet first, fallback to Cashfree if insufficient balance
    Returns: {"paid_from": "wallet" | "cashfree", "transaction_id": str, "redirect_url": str (if cashfree)}
    """
    wallet = await get_or_create_wallet(user_id)
    
    if wallet["balance"] >= amount:
        # Sufficient balance - deduct from wallet
        await update_wallet_balance(user_id, amount, "debit")
        
        # Record transaction
        transaction_id = f"txn_{uuid.uuid4().hex[:12]}"
        await add_wallet_transaction(
            wallet["wallet_id"],
            user_id,
            amount,
            "payment",
            description,
            reference_id,
            {"payment_method": "wallet"}
        )
        
        return {
            "paid_from": "wallet",
            "transaction_id": transaction_id,
            "success": True
        }
    else:
        # Insufficient balance - return Cashfree redirect info
        # In production, create Cashfree order here
        order_id = f"order_{uuid.uuid4().hex[:12]}"
        
        # Mock Cashfree redirect
        return {
            "paid_from": "cashfree",
            "order_id": order_id,
            "amount": amount,
            "redirect_url": f"/api/payments/cashfree-redirect?order_id={order_id}&amount={amount}",
            "success": False,
            "insufficient_balance": True,
            "wallet_balance": wallet["balance"]
        }

# Auth Helper
async def get_current_user(request: Request, session_token: Optional[str] = Cookie(None)) -> User:
    token = session_token
    if not token:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.replace('Bearer ', '')
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**user)

async def get_current_user_optional(request: Request, session_token: Optional[str] = Cookie(None)):
    try:
        return await get_current_user(request, session_token)
    except Exception:
        return None

# Auth Endpoints
@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get('session_id')
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session_id")
            
            user_data = resp.json()
        
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        existing = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})
        
        if existing:
            user_id = existing["user_id"]
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "name": user_data["name"],
                    "picture": user_data.get("picture")
                }}
            )
        else:
            await db.users.insert_one({
                "user_id": user_id,
                "email": user_data["email"],
                "name": user_data["name"],
                "picture": user_data.get("picture"),
                "role": "business",
                "subscription_status": "free",
                "created_at": datetime.now(timezone.utc)
            })
        
        session_token = user_data["session_token"]
        await db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
            "created_at": datetime.now(timezone.utc)
        })
        
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=7 * 24 * 60 * 60
        )
        
        user_obj = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        return {"user": user_obj, "session_token": session_token}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    # Get fresh user data with usage stats
    user_data = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check and reset monthly limit if needed
    user_data = check_and_reset_monthly_limit(user_data)
    
    # Update user data in DB if reset occurred
    await db.users.update_one(
        {"user_id": current_user.user_id},
        {"$set": {
            "creators_viewed_this_month": user_data.get("creators_viewed_this_month", 0),
            "monthly_reset_date": user_data.get("monthly_reset_date")
        }}
    )
    
    creators_viewed = user_data.get("creators_viewed_this_month", 0)
    remaining = max(0, MONTHLY_CREATOR_LIMIT - creators_viewed)
    
    # Add usage info
    user_data["usage_info"] = {
        "creators_viewed_this_month": creators_viewed,
        "monthly_limit": MONTHLY_CREATOR_LIMIT,
        "remaining_in_plan": remaining,
        "payg_rate": f"₹{PAY_AS_YOU_GO_WITH_GST:.2f}",
        "next_reset": user_data.get("monthly_reset_date").isoformat() if user_data.get("monthly_reset_date") else None
    }
    
    return user_data

@api_router.get("/usage/stats")
async def get_usage_stats(current_user: User = Depends(get_current_user)):
    """Get detailed usage statistics"""
    user_data = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    user_data = check_and_reset_monthly_limit(user_data)
    
    # Get pay-as-you-go charges this month
    payg_charges = await db.payg_charges.find({
        "user_id": current_user.user_id,
        "charged_at": {"$gte": user_data.get("monthly_reset_date", datetime.now(timezone.utc))}
    }, {"_id": 0}).to_list(100)
    
    total_payg_spent = sum(charge.get("amount", 0) for charge in payg_charges)
    
    # Get creator views this month
    views = await db.creator_views.find({
        "user_id": current_user.user_id,
        "viewed_at": {"$gte": user_data.get("monthly_reset_date", datetime.now(timezone.utc))}
    }, {"_id": 0}).to_list(100)
    
    creators_viewed = user_data.get("creators_viewed_this_month", 0)
    remaining = max(0, MONTHLY_CREATOR_LIMIT - creators_viewed)
    
    return {
        "subscription_plan": user_data.get("subscription_plan", "free"),
        "subscription_status": user_data.get("subscription_status", "free"),
        "creators_viewed_this_month": creators_viewed,
        "monthly_limit": MONTHLY_CREATOR_LIMIT,
        "remaining_in_plan": remaining,
        "payg_creators": max(0, creators_viewed - MONTHLY_CREATOR_LIMIT),
        "payg_rate": PAY_AS_YOU_GO_WITH_GST,
        "total_payg_charges": len(payg_charges),
        "total_payg_spent": round(total_payg_spent, 2),
        "next_reset": user_data.get("monthly_reset_date").isoformat() if user_data.get("monthly_reset_date") else None,
        "recent_views": views[:10]
    }

@api_router.post("/auth/login")
async def login_with_password(request: Request, response: Response):
    """Email/password login for admin and other users"""
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    body = await request.json()
    email = body.get('email')
    password = body.get('password')
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    # Find user
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if "password_hash" not in user:
        raise HTTPException(status_code=401, detail="Password login not available for this account")
    
    if not pwd_context.verify(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create session
    session_token = str(uuid.uuid4())
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 60 * 60
    )
    
    # Remove password_hash from response
    user_response = {k: v for k, v in user.items() if k != "password_hash"}
    
    return {"user": user_response, "session_token": session_token}

@api_router.post("/auth/logout")
async def logout(response: Response, current_user: User = Depends(get_current_user), session_token: Optional[str] = Cookie(None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.patch("/users/{user_id}/role")
async def update_user_role(user_id: str, request: Request, current_user: User = Depends(get_current_user)):
    body = await request.json()
    role = body.get('role')
    
    if role not in ['admin', 'creator', 'business']:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    if current_user.user_id != user_id:
        raise HTTPException(status_code=403, detail="Can only update own role")
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"role": role}}
    )
    
    return {"message": "Role updated successfully", "role": role}

# Creator Endpoints with Enhanced Filters
@api_router.get("/creators")
async def get_creators(
    search: Optional[str] = None,
    platform: Optional[str] = None,
    language: Optional[str] = None,
    industry: Optional[str] = None,
    city: Optional[str] = None,
    district: Optional[str] = None,
    min_followers: Optional[int] = None,
    max_followers: Optional[int] = None,
    status: str = "approved"
):
    query: Dict[str, Any] = {"status": status}
    
    now = datetime.now(timezone.utc)
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"bio": {"$regex": search, "$options": "i"}}
        ]
    
    if platform:
        query["platforms"] = platform
    
    if language:
        query["language"] = language
    
    if industry:
        query["industry"] = industry
    
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    
    if district:
        query["district"] = {"$regex": district, "$options": "i"}
    
    if min_followers or max_followers:
        follower_query = []
        if min_followers:
            follower_query.append({"instagram_followers": {"$gte": min_followers}})
            follower_query.append({"youtube_subscribers": {"$gte": min_followers}})
        if max_followers:
            follower_query.append({"instagram_followers": {"$lte": max_followers}})
            follower_query.append({"youtube_subscribers": {"$lte": max_followers}})
        if follower_query:
            query["$or"] = follower_query
    
    # Fetch all creators
    all_creators = await db.creators.find(query, {"_id": 0, "email": 0, "phone": 0}).to_list(200)
    
    # Enrich with subscription status and sort by priority
    subscribed_creators = []
    unsubscribed_creators = []
    
    for creator in all_creators:
        # Get user to check subscription
        if creator.get("submitted_by"):
            user = await db.users.find_one({"user_id": creator["submitted_by"]}, {"_id": 0, "creator_subscription": 1})
            if user:
                subscription = user.get("creator_subscription")
                if subscription and isinstance(subscription, dict) and subscription.get("status") == "active":
                    # Check if subscription is not expired
                    expires_at = subscription.get("expires_at")
                    if expires_at:
                        if isinstance(expires_at, str):
                            expires_at = datetime.fromisoformat(expires_at)
                        if expires_at > now:
                            creator["has_subscription"] = True
                            creator["subscription_features"] = subscription.get("features", {})
                            subscribed_creators.append(creator)
                            continue
        
        creator["has_subscription"] = False
        unsubscribed_creators.append(creator)
    
    # Combine: subscribed creators first, then unsubscribed
    creators = subscribed_creators + unsubscribed_creators
    
    # Add computed fields
    for creator in creators:
        if isinstance(creator.get('created_at'), str):
            creator['created_at'] = datetime.fromisoformat(creator['created_at'])
        
        # Calculate badge (tier badges only for subscribed)
        completed_projects = creator.get("completed_projects", 0)
        if creator.get("has_subscription"):
            # Tier badges for subscribed creators
            if completed_projects >= 1000:
                creator["tier_badge"] = {"name": "Gold", "icon": "🥇", "projects": 1000}
            elif completed_projects >= 500:
                creator["tier_badge"] = {"name": "Silver", "icon": "🥈", "projects": 500}
            elif completed_projects >= 100:
                creator["tier_badge"] = {"name": "Bronze", "icon": "🥉", "projects": 100}
            else:
                creator["tier_badge"] = None
            
            # Verification badge
            creator["verified_badge"] = True
        else:
            creator["tier_badge"] = None
            creator["verified_badge"] = False
    
    return creators


@api_router.get("/creators/me")
async def get_my_creator_profile(current_user: User = Depends(get_current_user)):
    """Get the current user's creator profile"""
    creator = await db.creators.find_one({"user_id": current_user.user_id}, {"_id": 0})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator profile not found")
    return creator

@api_router.get("/creators/{creator_id}")
async def get_creator(creator_id: str, current_user: Optional[User] = Depends(get_current_user_optional)):
    creator = await db.creators.find_one({"creator_id": creator_id}, {"_id": 0})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    # Check if user has subscription to view contact
    if current_user and current_user.subscription_status == "active":
        return creator
    
    # Remove contact info for non-subscribers
    creator.pop("email", None)
    creator.pop("phone", None)
    
    return creator

@api_router.get("/creators/{creator_id}/contact")
async def get_creator_contact(creator_id: str, current_user: User = Depends(get_current_user)):
    if current_user.subscription_status != "active":
        raise HTTPException(status_code=403, detail="Subscription required to view contact information")
    
    # Get fresh user data and check monthly reset
    user_data = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check and reset monthly limit if needed
    user_data = check_and_reset_monthly_limit(user_data)
    
    # Check if already viewed this creator this month
    viewed_creators = await db.creator_views.find_one({
        "user_id": current_user.user_id,
        "creator_id": creator_id,
        "viewed_at": {"$gte": user_data["monthly_reset_date"]}
    })
    
    creators_viewed = user_data.get("creators_viewed_this_month", 0)
    
    if not viewed_creators:
        # New creator view
        if creators_viewed >= MONTHLY_CREATOR_LIMIT:
            # Charge pay-as-you-go
            charge_amount = PAY_AS_YOU_GO_WITH_GST
            
            # Record the charge (mock for now)
            await db.payg_charges.insert_one({
                "charge_id": f"payg_{uuid.uuid4().hex[:12]}",
                "user_id": current_user.user_id,
                "creator_id": creator_id,
                "amount": charge_amount,
                "base_price": PAY_AS_YOU_GO_PRICE,
                "gst": PAY_AS_YOU_GO_PRICE * GST_PERCENT,
                "status": "charged",
                "charged_at": datetime.now(timezone.utc)
            })
            
            await NotificationService.create_notification(
                db, current_user.user_id,
                "Pay-as-you-go Charge",
                f"₹{charge_amount:.2f} charged for viewing creator {creator_id}",
                "payment"
            )
        
        # Increment view count
        await db.users.update_one(
            {"user_id": current_user.user_id},
            {
                "$set": {
                    "creators_viewed_this_month": creators_viewed + 1,
                    "monthly_reset_date": user_data["monthly_reset_date"]
                }
            }
        )
        
        # Record the view
        await db.creator_views.insert_one({
            "view_id": f"view_{uuid.uuid4().hex[:12]}",
            "user_id": current_user.user_id,
            "creator_id": creator_id,
            "viewed_at": datetime.now(timezone.utc),
            "charged": creators_viewed >= MONTHLY_CREATOR_LIMIT,
            "charge_amount": charge_amount if creators_viewed >= MONTHLY_CREATOR_LIMIT else 0
        })
    
    # Get creator contact info
    creator = await db.creators.find_one({"creator_id": creator_id}, {"_id": 0, "email": 1, "phone": 1, "name": 1})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    # Add usage info to response
    updated_count = creators_viewed + (1 if not viewed_creators else 0)
    remaining = max(0, MONTHLY_CREATOR_LIMIT - updated_count)
    
    return {
        **creator,
        "usage_info": {
            "creators_viewed_this_month": updated_count,
            "monthly_limit": MONTHLY_CREATOR_LIMIT,
            "remaining_in_plan": remaining,
            "charged_payg": creators_viewed >= MONTHLY_CREATOR_LIMIT and not viewed_creators,
            "payg_charge": charge_amount if (creators_viewed >= MONTHLY_CREATOR_LIMIT and not viewed_creators) else 0,
            "next_reset": user_data["monthly_reset_date"].isoformat() if user_data.get("monthly_reset_date") else None
        }
    }

@api_router.post("/creators")
async def create_creator(creator_data: CreatorCreate, current_user: Optional[User] = Depends(get_current_user_optional)):
    creator_id = f"creator_{uuid.uuid4().hex[:12]}"
    
    creator_dict = creator_data.model_dump()
    creator_dict["creator_id"] = creator_id
    creator_dict["created_at"] = datetime.now(timezone.utc)
    creator_dict["verification_status"] = "unverified"
    creator_dict["youtube_verified"] = False
    creator_dict["instagram_verified"] = False
    creator_dict["instagram_followers"] = 0
    creator_dict["youtube_subscribers"] = 0
    creator_dict["engagement_rate"] = 0.0
    creator_dict["avg_views"] = 0
    
    # Set status
    status = "pending"
    if current_user:
        if current_user.role == "admin":
            status = "approved"
        elif current_user.role == "creator":
            status = "pending"
            creator_dict["submitted_by"] = current_user.user_id
    
    creator_dict["status"] = status
    
    await db.creators.insert_one(creator_dict)
    
    return {"message": "Creator profile submitted", "creator_id": creator_id, "status": status}

@api_router.patch("/creators/{creator_id}/status")
async def update_creator_status(creator_id: str, status: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.creators.update_one(
        {"creator_id": creator_id},
        {"$set": {"status": status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    return {"message": "Creator status updated"}

@api_router.patch("/creators/{creator_id}/bank-details")
async def update_bank_details(creator_id: str, bank_details: BankDetailsUpdate, current_user: User = Depends(get_current_user)):
    # Verify the creator owns this profile or is admin
    creator = await db.creators.find_one({"creator_id": creator_id}, {"_id": 0})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    # Check authorization
    if current_user.role != "admin":
        if creator.get("submitted_by") != current_user.user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this creator's bank details")
    
    result = await db.creators.update_one(
        {"creator_id": creator_id},
        {"$set": {
            "bank_account_number": bank_details.bank_account_number,
            "bank_ifsc_code": bank_details.bank_ifsc_code,
            "bank_account_holder": bank_details.bank_account_holder,
            "bank_name": bank_details.bank_name,
            "upi_id": bank_details.upi_id,
            "bank_details_updated_at": datetime.now(timezone.utc)
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Failed to update bank details")
    
    return {"message": "Bank details updated successfully"}

@api_router.get("/creators/{creator_id}/bank-details")
async def get_bank_details(creator_id: str, current_user: User = Depends(get_current_user)):
    creator = await db.creators.find_one({"creator_id": creator_id}, {"_id": 0})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    # Only creator owner or admin can view bank details
    if current_user.role != "admin":
        if creator.get("submitted_by") != current_user.user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    return {
        "bank_account_number": creator.get("bank_account_number"),
        "bank_ifsc_code": creator.get("bank_ifsc_code"),
        "bank_account_holder": creator.get("bank_account_holder"),
        "bank_name": creator.get("bank_name"),
        "upi_id": creator.get("upi_id"),
        "has_bank_details": bool(creator.get("bank_account_number"))
    }

# Verification Endpoints
@api_router.post("/verification/initiate")
async def initiate_verification(request: VerificationRequest, current_user: User = Depends(get_current_user)):
    verification_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    
    verification_id = f"verify_{uuid.uuid4().hex[:12]}"
    
    await db.verification_requests.insert_one({
        "verification_id": verification_id,
        "creator_id": request.creator_id,
        "platform": request.platform,
        "handle": request.handle,
        "verification_code": verification_code,
        "status": "pending",
        "created_at": datetime.now(timezone.utc),
        "user_id": current_user.user_id
    })
    
    return {
        "verification_id": verification_id,
        "verification_code": verification_code,
        "message": f"Post this code in your {request.platform} bio: {verification_code}"
    }

@api_router.post("/verification/{verification_id}/verify")
async def verify_account(verification_id: str, background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user)):
    verification = await db.verification_requests.find_one({"verification_id": verification_id}, {"_id": 0})
    if not verification:
        raise HTTPException(status_code=404, detail="Verification request not found")
    
    # Verify based on platform
    verified = False
    stats = {}
    
    if verification["platform"] == "youtube":
        # Mock verification for demo - in production, use YouTube API
        verified = True
        stats = {
            "subscribers": random.randint(1000, 100000),
            "views": random.randint(50000, 1000000)
        }
    elif verification["platform"] == "instagram":
        # Mock verification for demo - in production, use Instagram API
        verified = True
        stats = {
            "followers": random.randint(1000, 100000),
            "engagement_rate": round(random.uniform(2.0, 8.0), 2)
        }
    
    if verified:
        update_data = {"verification_status": "verified"}
        if verification["platform"] == "youtube":
            update_data["youtube_verified"] = True
            update_data["youtube_subscribers"] = stats["subscribers"]
        elif verification["platform"] == "instagram":
            update_data["instagram_verified"] = True
            update_data["instagram_followers"] = stats["followers"]
            update_data["engagement_rate"] = stats["engagement_rate"]
        
        await db.creators.update_one(
            {"creator_id": verification["creator_id"]},
            {"$set": update_data}
        )
        
        await db.verification_requests.update_one(
            {"verification_id": verification_id},
            {"$set": {"status": "verified", "verified_at": datetime.now(timezone.utc), "stats": stats}}
        )
        
        return {"message": "Verification successful", "stats": stats}
    
    return {"message": "Verification failed", "verified": False}

# Project/Escrow Endpoints
@api_router.post("/projects")
async def create_project(project: ProjectCreate, current_user: User = Depends(get_current_user)):
    """Create a new project - requires business subscription"""
    # Check business subscription
    await require_business_subscription(current_user)
    
    # Get creator to check their subscription status
    creator = await db.creators.find_one({"creator_id": project.creator_id}, {"_id": 0})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    creator_user = await db.users.find_one({"user_id": creator["submitted_by"]}, {"_id": 0})
    if not creator_user:
        raise HTTPException(status_code=404, detail="Creator user not found")
    
    # Check if creator has subscription (for zero escrow fee)
    creator_subscription = await check_user_subscription(creator_user["user_id"], "creator")
    creator_has_subscription = creator_subscription["has_subscription"]
    
    # Calculate fees based on creator subscription
    fees = calculate_platform_fees(project.budget, creator_has_subscription)
    
    project_id = f"project_{uuid.uuid4().hex[:12]}"
    
    # Try to pay from wallet first
    payment_result = await pay_from_wallet_or_cashfree(
        current_user.user_id,
        fees["business_pays"],
        f"Project payment: {project.title}",
        project_id
    )
    
    if not payment_result["success"]:
        # Insufficient wallet balance - return payment URL
        return {
            "status": "payment_required",
            "message": "Insufficient wallet balance. Please complete payment via Cashfree.",
            "payment_info": payment_result,
            "fees": fees,
            "project_id": project_id
        }
    
    # Payment successful - create project
    await db.projects.insert_one({
        "project_id": project_id,
        "title": project.title,
        "description": project.description,
        "budget": project.budget,
        "fees": fees,
        "deadline": project.deadline,
        "business_id": current_user.user_id,
        "creator_id": project.creator_id,
        "status": "pending",
        "payment_method": payment_result["paid_from"],
        "created_at": datetime.now(timezone.utc)
    })
    
    # Create escrow transaction
    await db.escrow_transactions.insert_one({
        "transaction_id": f"escrow_{uuid.uuid4().hex[:12]}",
        "project_id": project_id,
        "amount": project.budget,
        "business_pays": fees["business_pays"],
        "creator_receives": fees["creator_receives"],
        "platform_fee": fees["platform_earns"],
        "creator_has_subscription": creator_has_subscription,
        "status": "held_in_escrow",
        "created_at": datetime.now(timezone.utc),
        "paid_at": datetime.now(timezone.utc)
    })
    
    # Send notification to creator
    await db.notifications.insert_one({
        "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
        "user_id": creator_user["user_id"],
        "type": "project_offer",
        "title": "New Project Offer!",
        "message": f"You have a new project offer: {project.title}",
        "reference_id": project_id,
        "read": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {
        "status": "success",
        "project_id": project_id,
        "fees": fees,
        "payment_method": payment_result["paid_from"],
        "message": f"Project created successfully. Payment of ₹{fees['business_pays']} processed."
    }

@api_router.get("/projects")
async def get_projects(current_user: User = Depends(get_current_user)):
    if current_user.role == "business":
        projects = await db.projects.find({"business_id": current_user.user_id}, {"_id": 0}).to_list(100)
    else:
        projects = await db.projects.find({"creator_id": current_user.user_id}, {"_id": 0}).to_list(100)
    
    return projects

@api_router.post("/projects/{project_id}/pay")
async def pay_project(project_id: str, current_user: User = Depends(get_current_user)):
    # Mock payment - in production, integrate with Cashfree
    await db.escrow_transactions.update_one(
        {"project_id": project_id},
        {"$set": {"status": "held_in_escrow", "paid_at": datetime.now(timezone.utc)}}
    )
    
    await db.projects.update_one(
        {"project_id": project_id},
        {"$set": {"status": "active"}}
    )
    
    return {"message": "Payment successful. Project is now active."}

@api_router.post("/projects/{project_id}/deliver")
async def deliver_project(project_id: str, delivery_notes: str, current_user: User = Depends(get_current_user)):
    """Creator delivers project - requires creator role and project ownership"""
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can deliver projects")
    
    project = await db.projects.find_one({"project_id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verify creator owns this project
    creator = await db.creators.find_one({"submitted_by": current_user.user_id}, {"_id": 0})
    if not creator or project["creator_id"] != creator["creator_id"]:
        raise HTTPException(status_code=403, detail="Not authorized for this project")
    
    if project["status"] not in ["in_progress", "active"]:
        raise HTTPException(status_code=400, detail=f"Cannot deliver project with status: {project['status']}")
    
    await db.projects.update_one(
        {"project_id": project_id},
        {"$set": {"status": "delivered", "delivery_notes": delivery_notes, "delivered_at": datetime.now(timezone.utc)}}
    )
    
    return {"message": "Work delivered. Waiting for business approval."}

@api_router.post("/projects/{project_id}/approve")
async def approve_project(project_id: str, current_user: User = Depends(get_current_user)):
    """Business approves completed project and releases payment to creator"""
    project = await db.projects.find_one({"project_id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project["business_id"] != current_user.user_id:
        raise HTTPException(status_code=403, detail="Only project owner can approve")
    
    if project["status"] != "delivered":
        raise HTTPException(status_code=400, detail=f"Can only approve delivered projects. Current status: {project['status']}")
    
    # Get escrow transaction
    escrow = await db.escrow_transactions.find_one({"project_id": project_id}, {"_id": 0})
    if not escrow:
        raise HTTPException(status_code=404, detail="Escrow transaction not found")
    
    if escrow["status"] != "held_in_escrow":
        raise HTTPException(status_code=400, detail=f"Escrow is not in correct state: {escrow['status']}")
    
    # Get creator details
    creator = await db.creators.find_one({"creator_id": project["creator_id"]}, {"_id": 0})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    # Get creator's user ID
    creator_user = await db.users.find_one({"user_id": creator["submitted_by"]}, {"_id": 0})
    if not creator_user:
        raise HTTPException(status_code=404, detail="Creator user not found")
    
    # Create or get creator wallet
    creator_wallet = await get_or_create_wallet(creator_user["user_id"])
    
    # Credit creator wallet with creator_receives amount
    payout_amount = escrow["creator_receives"]
    await update_wallet_balance(creator_user["user_id"], payout_amount, "credit")
    
    # Record transaction in creator wallet
    await add_wallet_transaction(
        creator_wallet["wallet_id"],
        creator_user["user_id"],
        payout_amount,
        "payout",
        f"Payment for completed project: {project['title']}",
        project_id,
        {
            "project_id": project_id,
            "business_id": project["business_id"],
            "platform_fee": escrow["platform_fee"]
        }
    )
    
    # Release payment from escrow
    await db.escrow_transactions.update_one(
        {"project_id": project_id},
        {"$set": {
            "status": "released",
            "released_at": datetime.now(timezone.utc)
        }}
    )
    
    # Update project status
    await db.projects.update_one(
        {"project_id": project_id},
        {"$set": {
            "status": "completed",
            "completed_at": datetime.now(timezone.utc),
            "approved_by": current_user.user_id
        }}
    )
    
    # Create notification for creator
    await db.notifications.insert_one({
        "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
        "user_id": creator_user["user_id"],
        "type": "project_approved",
        "title": "Project Approved & Paid!",
        "message": f"Your work on '{project['title']}' has been approved. ₹{payout_amount} added to your wallet.",
        "reference_id": project_id,
        "read": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {
        "message": "Project approved successfully!",
        "project_id": project_id,
        "payout_amount": payout_amount,
        "creator_wallet_updated": True,
        "status": "completed"
    }

@api_router.post("/projects/{project_id}/request-revision")
async def request_revision(
    project_id: str,
    revision_notes: str,
    current_user: User = Depends(get_current_user)
):
    """Business requests revisions on delivered project"""
    project = await db.projects.find_one({"project_id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project["business_id"] != current_user.user_id:
        raise HTTPException(status_code=403, detail="Only project owner can request revision")
    
    if project["status"] != "delivered":
        raise HTTPException(status_code=400, detail="Can only request revision on delivered projects")
    
    # Update project status back to in_progress
    await db.projects.update_one(
        {"project_id": project_id},
        {"$set": {
            "status": "in_progress",
            "revision_requested": True,
            "revision_notes": revision_notes,
            "revision_requested_at": datetime.now(timezone.utc)
        }}
    )
    
    # Get creator details for notification
    creator = await db.creators.find_one({"creator_id": project["creator_id"]}, {"_id": 0})
    if creator:
        creator_user = await db.users.find_one({"user_id": creator["submitted_by"]}, {"_id": 0})
        if creator_user:
            # Create notification for creator
            await db.notifications.insert_one({
                "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
                "user_id": creator_user["user_id"],
                "type": "revision_requested",
                "title": "Revision Requested",
                "message": f"Business has requested revisions on: {project['title']}",
                "reference_id": project_id,
                "read": False,
                "created_at": datetime.now(timezone.utc)
            })
    
    return {
        "message": "Revision requested successfully",
        "project_id": project_id,
        "revision_notes": revision_notes,
        "status": "in_progress"
    }


# ==================== PROJECT WORKFLOW (CREATOR SIDE) ====================

@api_router.get("/projects/incoming")
async def get_incoming_projects(current_user: User = Depends(get_current_user)):
    """Get projects assigned to creator (pending acceptance)"""
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can view incoming projects")
    
    # Get creator ID for this user
    creator = await db.creators.find_one({"submitted_by": current_user.user_id}, {"_id": 0})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator profile not found")
    
    # Get projects in pending, active, delivered status
    projects = await db.projects.find({
        "creator_id": creator["creator_id"],
        "status": {"$in": ["pending", "active", "delivered", "in_progress"]}
    }, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Enrich with business details
    for project in projects:
        business = await db.users.find_one({"user_id": project["business_id"]}, {"_id": 0, "name": 1, "email": 1})
        if business:
            project["business_name"] = business.get("name", "Business User")
            project["business_email"] = business.get("email", "")
    
    return projects

@api_router.patch("/projects/{project_id}/accept")
async def accept_project(project_id: str, current_user: User = Depends(get_current_user)):
    """Creator accepts a project"""
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can accept projects")
    
    project = await db.projects.find_one({"project_id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verify creator owns this project
    creator = await db.creators.find_one({"submitted_by": current_user.user_id}, {"_id": 0})
    if not creator or project["creator_id"] != creator["creator_id"]:
        raise HTTPException(status_code=403, detail="Not authorized for this project")
    
    if project["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Project is already {project['status']}")
    
    # Check if payment is made (escrow held)
    escrow = await db.escrow_transactions.find_one({"project_id": project_id}, {"_id": 0})
    if not escrow or escrow["status"] != "held_in_escrow":
        raise HTTPException(status_code=400, detail="Payment not received yet. Ask business to pay first.")
    
    # Accept project
    await db.projects.update_one(
        {"project_id": project_id},
        {"$set": {
            "status": "in_progress",
            "accepted_at": datetime.now(timezone.utc)
        }}
    )
    
    return {
        "message": "Project accepted successfully!",
        "project_id": project_id,
        "status": "in_progress"
    }

@api_router.patch("/projects/{project_id}/decline")
async def decline_project(project_id: str, reason: str = "", current_user: User = Depends(get_current_user)):
    """Creator declines a project"""
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can decline projects")
    
    project = await db.projects.find_one({"project_id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verify creator owns this project
    creator = await db.creators.find_one({"submitted_by": current_user.user_id}, {"_id": 0})
    if not creator or project["creator_id"] != creator["creator_id"]:
        raise HTTPException(status_code=403, detail="Not authorized for this project")
    
    if project["status"] not in ["pending", "active"]:
        raise HTTPException(status_code=400, detail=f"Cannot decline project with status: {project['status']}")
    
    # Check if payment was made - need to refund
    escrow = await db.escrow_transactions.find_one({"project_id": project_id}, {"_id": 0})
    needs_refund = escrow and escrow["status"] == "held_in_escrow"
    
    if needs_refund:
        # Refund to business wallet
        business_wallet = await get_or_create_wallet(project["business_id"])
        await update_wallet_balance(project["business_id"], project["budget"], "credit")
        
        # Record transaction
        await add_wallet_transaction(
            business_wallet["wallet_id"],
            project["business_id"],
            project["budget"],
            "refund",
            f"Refund for declined project: {project['title']}",
            project_id,
            {"reason": reason or "Creator declined"}
        )
        
        # Update escrow status
        await db.escrow_transactions.update_one(
            {"project_id": project_id},
            {"$set": {
                "status": "refunded",
                "refunded_at": datetime.now(timezone.utc)
            }}
        )
    
    # Decline project
    await db.projects.update_one(
        {"project_id": project_id},
        {"$set": {
            "status": "declined",
            "declined_at": datetime.now(timezone.utc),
            "decline_reason": reason
        }}
    )
    
    return {
        "message": "Project declined successfully",
        "project_id": project_id,
        "refunded": needs_refund
    }

@api_router.post("/projects/{project_id}/deliverables")
async def submit_deliverables(
    project_id: str,
    deliverable_url: str,
    notes: str = "",
    current_user: User = Depends(get_current_user)
):
    """Creator submits project deliverables"""
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can submit deliverables")
    
    project = await db.projects.find_one({"project_id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verify creator owns this project
    creator = await db.creators.find_one({"submitted_by": current_user.user_id}, {"_id": 0})
    if not creator or project["creator_id"] != creator["creator_id"]:
        raise HTTPException(status_code=403, detail="Not authorized for this project")
    
    if project["status"] not in ["in_progress", "active"]:
        raise HTTPException(status_code=400, detail=f"Cannot submit deliverables for project with status: {project['status']}")
    
    # Update project with deliverables
    await db.projects.update_one(
        {"project_id": project_id},
        {"$set": {
            "status": "delivered",
            "deliverable_url": deliverable_url,
            "delivery_notes": notes,
            "delivered_at": datetime.now(timezone.utc)
        }}
    )
    
    # Create notification for business
    await db.notifications.insert_one({
        "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
        "user_id": project["business_id"],
        "type": "project_delivered",
        "title": "Project Delivered",
        "message": f"Creator has submitted deliverables for: {project['title']}",
        "reference_id": project_id,
        "read": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {
        "message": "Deliverables submitted successfully!",
        "project_id": project_id,
        "status": "delivered",
        "next_step": "Waiting for business approval"
    }

@api_router.get("/projects/{project_id}")
async def get_project_details(project_id: str, current_user: User = Depends(get_current_user)):
    """Get detailed project information"""
    project = await db.projects.find_one({"project_id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check authorization
    authorized = False
    if current_user.role == "admin":
        authorized = True
    elif current_user.role == "business" and project["business_id"] == current_user.user_id:
        authorized = True
    elif current_user.role == "creator":
        creator = await db.creators.find_one({"submitted_by": current_user.user_id}, {"_id": 0})
        if creator and project["creator_id"] == creator["creator_id"]:
            authorized = True
    
    if not authorized:
        raise HTTPException(status_code=403, detail="Not authorized to view this project")
    
    # Enrich with additional data
    escrow = await db.escrow_transactions.find_one({"project_id": project_id}, {"_id": 0})
    
    # Get business and creator details
    business = await db.users.find_one({"user_id": project["business_id"]}, {"_id": 0, "name": 1, "email": 1})
    creator_profile = await db.creators.find_one({"creator_id": project["creator_id"]}, {"_id": 0, "name": 1, "email": 1, "phone": 1})
    
    project["escrow"] = escrow
    project["business_details"] = business
    project["creator_details"] = creator_profile
    
    return project

# ==================== END PROJECT WORKFLOW ====================

# Chat Endpoints
@api_router.post("/messages")
async def send_message(message: MessageCreate, current_user: User = Depends(get_current_user)):
    """Send a message - Business users require subscription"""
    # Check subscription for business users
    if current_user.role == "business":
        await require_business_subscription(current_user)
    
    message_id = f"msg_{uuid.uuid4().hex[:12]}"
    
    await db.messages.insert_one({
        "message_id": message_id,
        "sender_id": current_user.user_id,
        "receiver_id": message.receiver_id,
        "content": message.content,
        "read": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message_id": message_id, "message": "Message sent"}

@api_router.get("/messages/{other_user_id}")
async def get_messages(other_user_id: str, current_user: User = Depends(get_current_user)):
    messages = await db.messages.find({
        "$or": [
            {"sender_id": current_user.user_id, "receiver_id": other_user_id},
            {"sender_id": other_user_id, "receiver_id": current_user.user_id}
        ]
    }, {"_id": 0}).sort("created_at", 1).to_list(1000)
    
    # Mark messages as read
    await db.messages.update_many(
        {"sender_id": other_user_id, "receiver_id": current_user.user_id, "read": False},
        {"$set": {"read": True}}
    )
    
    return messages

@api_router.get("/messages")
async def get_conversations(current_user: User = Depends(get_current_user)):
    # Get all unique conversation partners
    messages = await db.messages.find({
        "$or": [
            {"sender_id": current_user.user_id},
            {"receiver_id": current_user.user_id}
        ]
    }, {"_id": 0}).to_list(1000)
    
    conversations = {}
    for msg in messages:
        other_id = msg["receiver_id"] if msg["sender_id"] == current_user.user_id else msg["sender_id"]
        if other_id not in conversations:
            conversations[other_id] = {
                "user_id": other_id,
                "last_message": msg["content"],
                "last_message_time": msg["created_at"],
                "unread_count": 0
            }
        else:
            if msg["created_at"] > conversations[other_id]["last_message_time"]:
                conversations[other_id]["last_message"] = msg["content"]
                conversations[other_id]["last_message_time"] = msg["created_at"]
        
        if msg["receiver_id"] == current_user.user_id and not msg["read"]:
            conversations[other_id]["unread_count"] += 1
    
    return list(conversations.values())

@api_router.get("/messages/conversations")
async def get_conversations_with_names(current_user: User = Depends(get_current_user)):
    """Get all conversations with user/creator names"""
    # Get all unique conversation partners
    messages = await db.messages.find({
        "$or": [
            {"sender_id": current_user.user_id},
            {"receiver_id": current_user.user_id}
        ]
    }, {"_id": 0}).sort("created_at", -1).to_list(10000)
    
    conversations = {}
    for msg in messages:
        other_id = msg["receiver_id"] if msg["sender_id"] == current_user.user_id else msg["sender_id"]
        if other_id not in conversations:
            conversations[other_id] = {
                "user_id": other_id,
                "last_message": msg["content"],
                "last_message_time": msg["created_at"],
                "unread_count": 0,
                "name": "User"  # Default name
            }
        else:
            if msg["created_at"] > conversations[other_id]["last_message_time"]:
                conversations[other_id]["last_message"] = msg["content"]
                conversations[other_id]["last_message_time"] = msg["created_at"]
        
        if msg["receiver_id"] == current_user.user_id and not msg["read"]:
            conversations[other_id]["unread_count"] += 1
    
    # Fetch names for each user
    for conv_id, conv in conversations.items():
        # Try to find as creator first
        creator = await db.creators.find_one({"creator_id": conv_id}, {"_id": 0, "name": 1})
        if creator:
            conv["name"] = creator.get("name", "Creator")
        else:
            # Try to find as user
            user = await db.users.find_one({"user_id": conv_id}, {"_id": 0, "name": 1, "email": 1})
            if user:
                conv["name"] = user.get("name") or user.get("email", "User")
    
    # Sort by last message time
    sorted_conversations = sorted(
        conversations.values(),
        key=lambda x: x["last_message_time"],
        reverse=True
    )
    
    return sorted_conversations

# Premium Creator Subscription
@api_router.post("/creators/{creator_id}/premium")
async def subscribe_premium(creator_id: str, months: int = 1, current_user: User = Depends(get_current_user)):
    amount = 249 * months
    
    # Mock payment
    premium_until = datetime.now(timezone.utc) + timedelta(days=30 * months)
    
    await db.creators.update_one(
        {"creator_id": creator_id},
        {"$set": {"premium_until": premium_until}}
    )
    
    await db.creator_subscriptions.insert_one({
        "subscription_id": f"premium_{uuid.uuid4().hex[:12]}",
        "creator_id": creator_id,
        "amount": amount,
        "months": months,
        "premium_until": premium_until,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {
        "message": f"Premium subscription activated for {months} month(s)",
        "premium_until": premium_until,
        "amount": amount
    }

# Subscription Endpoints
@api_router.post("/subscriptions")
async def create_subscription(sub_data: SubscriptionCreate, current_user: User = Depends(get_current_user)):
    plan_id = "monthly_199" if sub_data.plan_type == "monthly" else "yearly_1999"
    amount = 199.0 if sub_data.plan_type == "monthly" else 1999.0
    
    subscription_id = f"sub_{uuid.uuid4().hex[:12]}"
    
    await db.subscriptions.insert_one({
        "subscription_id": subscription_id,
        "user_id": current_user.user_id,
        "plan_type": sub_data.plan_type,
        "plan_id": plan_id,
        "amount": amount,
        "status": "pending",
        "created_at": datetime.now(timezone.utc)
    })
    
    await db.users.update_one(
        {"user_id": current_user.user_id},
        {"$set": {
            "subscription_status": "pending",
            "subscription_plan": sub_data.plan_type,
            "subscription_id": subscription_id
        }}
    )
    
    return {
        "subscription_id": subscription_id,
        "plan_type": sub_data.plan_type,
        "amount": amount,
        "status": "pending",
        "message": "Subscription created. Complete payment to activate."
    }

@api_router.post("/subscriptions/{subscription_id}/activate")
async def activate_subscription(subscription_id: str, current_user: User = Depends(get_current_user)):
    result = await db.subscriptions.update_one(
        {"subscription_id": subscription_id, "user_id": current_user.user_id},
        {"$set": {"status": "active", "activated_at": datetime.now(timezone.utc)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Set monthly reset date (30 days from now)
    next_reset = datetime.now(timezone.utc) + timedelta(days=30)
    
    await db.users.update_one(
        {"user_id": current_user.user_id},
        {"$set": {
            "subscription_status": "active",
            "monthly_reset_date": next_reset
        }}
    )
    
    return {"message": "Subscription activated", "next_reset": next_reset}


# ==================== DISPUTE MANAGEMENT SYSTEM ====================

@api_router.post("/disputes")
async def create_dispute(dispute: DisputeCreate, current_user: User = Depends(get_current_user)):
    """Create a dispute on a project"""
    # Verify project exists
    project = await db.projects.find_one({"project_id": dispute.project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Determine who is raising the dispute and against whom
    if current_user.role == "creator":
        # Get creator profile
        creator = await db.creators.find_one({"submitted_by": current_user.user_id}, {"_id": 0})
        if not creator or project["creator_id"] != creator["creator_id"]:
            raise HTTPException(status_code=403, detail="Not authorized for this project")
        
        raised_by = current_user.user_id
        raised_against = project["business_id"]
        raised_by_role = "creator"
    
    elif current_user.role == "business":
        if project["business_id"] != current_user.user_id:
            raise HTTPException(status_code=403, detail="Not authorized for this project")
        
        raised_by = current_user.user_id
        raised_against = project["creator_id"]
        raised_by_role = "business"
        
        # Get creator user_id
        creator = await db.creators.find_one({"creator_id": project["creator_id"]}, {"_id": 0})
        if creator:
            raised_against = creator.get("submitted_by")
    else:
        raise HTTPException(status_code=403, detail="Only business or creator can raise disputes")
    
    # Create dispute
    dispute_id = f"dispute_{uuid.uuid4().hex[:12]}"
    
    dispute_doc = {
        "dispute_id": dispute_id,
        "project_id": dispute.project_id,
        "project_title": project.get("title", "Project"),
        "raised_by": raised_by,
        "raised_by_role": raised_by_role,
        "raised_against": raised_against,
        "reason": dispute.reason,
        "description": dispute.description,
        "evidence_urls": dispute.evidence_urls,
        "status": "pending",
        "resolution": None,
        "resolution_notes": None,
        "resolved_by": None,
        "created_at": datetime.now(timezone.utc),
        "resolved_at": None
    }
    
    await db.disputes.insert_one(dispute_doc)
    
    # Create notification for admin
    await db.notifications.insert_one({
        "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
        "user_id": "admin",  # Notify all admins
        "type": "dispute_created",
        "title": "New Dispute Filed",
        "message": f"Dispute raised on project: {project['title']}",
        "reference_id": dispute_id,
        "read": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {
        "message": "Dispute created successfully",
        "dispute_id": dispute_id,
        "status": "pending"
    }

@api_router.get("/disputes")
async def get_disputes(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get disputes - filtered by role"""
    query = {}
    
    if current_user.role == "admin":
        # Admin sees all disputes
        if status:
            query["status"] = status
    elif current_user.role == "creator":
        # Creator sees disputes they raised or that are against them
        creator = await db.creators.find_one({"submitted_by": current_user.user_id}, {"_id": 0})
        if creator:
            query["$or"] = [
                {"raised_by": current_user.user_id},
                {"raised_against": current_user.user_id}
            ]
            if status:
                query["status"] = status
    elif current_user.role == "business":
        # Business sees disputes they raised or that are against them
        query["$or"] = [
            {"raised_by": current_user.user_id},
            {"raised_against": current_user.user_id}
        ]
        if status:
            query["status"] = status
    else:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    disputes = await db.disputes.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Enrich with user details
    for dispute in disputes:
        # Get raised_by user details
        raised_by_user = await db.users.find_one({"user_id": dispute["raised_by"]}, {"_id": 0, "name": 1, "email": 1})
        if raised_by_user:
            dispute["raised_by_name"] = raised_by_user.get("name", raised_by_user.get("email", "User"))
        
        # Get raised_against user details
        raised_against_user = await db.users.find_one({"user_id": dispute["raised_against"]}, {"_id": 0, "name": 1, "email": 1})
        if raised_against_user:
            dispute["raised_against_name"] = raised_against_user.get("name", raised_against_user.get("email", "User"))
        
        # Get project details
        project = await db.projects.find_one({"project_id": dispute["project_id"]}, {"_id": 0, "title": 1, "budget": 1})
        if project:
            dispute["project_details"] = project
    
    return disputes

@api_router.get("/disputes/{dispute_id}")
async def get_dispute_details(dispute_id: str, current_user: User = Depends(get_current_user)):
    """Get detailed dispute information"""
    dispute = await db.disputes.find_one({"dispute_id": dispute_id}, {"_id": 0})
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Check authorization
    authorized = False
    if current_user.role == "admin":
        authorized = True
    elif current_user.user_id in [dispute["raised_by"], dispute["raised_against"]]:
        authorized = True
    elif current_user.role == "creator":
        creator = await db.creators.find_one({"submitted_by": current_user.user_id}, {"_id": 0})
        if creator and creator.get("submitted_by") in [dispute["raised_by"], dispute["raised_against"]]:
            authorized = True
    
    if not authorized:
        raise HTTPException(status_code=403, detail="Not authorized to view this dispute")
    
    # Enrich with full details
    project = await db.projects.find_one({"project_id": dispute["project_id"]}, {"_id": 0})
    raised_by_user = await db.users.find_one({"user_id": dispute["raised_by"]}, {"_id": 0})
    raised_against_user = await db.users.find_one({"user_id": dispute["raised_against"]}, {"_id": 0})
    
    dispute["project"] = project
    dispute["raised_by_user"] = raised_by_user
    dispute["raised_against_user"] = raised_against_user
    
    return dispute

@api_router.patch("/disputes/{dispute_id}/resolve")
async def resolve_dispute(
    dispute_id: str,
    resolution: DisputeResolution,
    current_user: User = Depends(get_current_user)
):
    """Admin resolves a dispute"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can resolve disputes")
    
    dispute = await db.disputes.find_one({"dispute_id": dispute_id}, {"_id": 0})
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    if dispute["status"] == "resolved":
        raise HTTPException(status_code=400, detail="Dispute already resolved")
    
    # Get project details
    project = await db.projects.find_one({"project_id": dispute["project_id"]}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Handle different resolution types
    if resolution.resolution == "refund_business":
        # Refund business from escrow or creator wallet
        escrow = await db.escrow_transactions.find_one({"project_id": project["project_id"]}, {"_id": 0})
        
        if escrow and escrow["status"] == "held_in_escrow":
            # Refund from escrow
            refund_amount = resolution.refund_amount or project["budget"]
            business_wallet = await get_or_create_wallet(project["business_id"])
            await update_wallet_balance(project["business_id"], refund_amount, "credit")
            
            await add_wallet_transaction(
                business_wallet["wallet_id"],
                project["business_id"],
                refund_amount,
                "refund",
                f"Dispute refund for project: {project['title']}",
                dispute_id,
                {"dispute_id": dispute_id, "resolution": "refund_business"}
            )
            
            # Update escrow
            await db.escrow_transactions.update_one(
                {"project_id": project["project_id"]},
                {"$set": {"status": "refunded", "refunded_at": datetime.now(timezone.utc)}}
            )
        else:
            # Escrow already released - would need to deduct from creator wallet
            pass
    
    elif resolution.resolution == "pay_creator":
        # Release payment to creator if not already done
        escrow = await db.escrow_transactions.find_one({"project_id": project["project_id"]}, {"_id": 0})
        
        if escrow and escrow["status"] == "held_in_escrow":
            # Get creator user
            creator = await db.creators.find_one({"creator_id": project["creator_id"]}, {"_id": 0})
            if creator:
                creator_user = await db.users.find_one({"user_id": creator["submitted_by"]}, {"_id": 0})
                if creator_user:
                    payout_amount = escrow["creator_receives"]
                    creator_wallet = await get_or_create_wallet(creator_user["user_id"])
                    await update_wallet_balance(creator_user["user_id"], payout_amount, "credit")
                    
                    await add_wallet_transaction(
                        creator_wallet["wallet_id"],
                        creator_user["user_id"],
                        payout_amount,
                        "payout",
                        f"Dispute resolution payout: {project['title']}",
                        dispute_id,
                        {"dispute_id": dispute_id, "resolution": "pay_creator"}
                    )
                    
                    # Update escrow
                    await db.escrow_transactions.update_one(
                        {"project_id": project["project_id"]},
                        {"$set": {"status": "released", "released_at": datetime.now(timezone.utc)}}
                    )
    
    # Update dispute status
    await db.disputes.update_one(
        {"dispute_id": dispute_id},
        {"$set": {
            "status": "resolved",
            "resolution": resolution.resolution,
            "resolution_notes": resolution.resolution_notes,
            "resolved_by": current_user.user_id,
            "resolved_at": datetime.now(timezone.utc)
        }}
    )
    
    # Notify both parties
    for user_id in [dispute["raised_by"], dispute["raised_against"]]:
        await db.notifications.insert_one({
            "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
            "user_id": user_id,
            "type": "dispute_resolved",
            "title": "Dispute Resolved",
            "message": f"Your dispute on '{project['title']}' has been resolved: {resolution.resolution}",
            "reference_id": dispute_id,
            "read": False,
            "created_at": datetime.now(timezone.utc)
        })
    
    return {
        "message": "Dispute resolved successfully",
        "dispute_id": dispute_id,
        "resolution": resolution.resolution
    }

@api_router.post("/disputes/{dispute_id}/evidence")
async def add_evidence(
    dispute_id: str,
    evidence_url: str,
    current_user: User = Depends(get_current_user)
):
    """Add evidence to a dispute"""
    dispute = await db.disputes.find_one({"dispute_id": dispute_id}, {"_id": 0})
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Only parties involved can add evidence
    if current_user.user_id not in [dispute["raised_by"], dispute["raised_against"]]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if dispute["status"] == "resolved":
        raise HTTPException(status_code=400, detail="Cannot add evidence to resolved dispute")
    
    await db.disputes.update_one(
        {"dispute_id": dispute_id},
        {"$push": {"evidence_urls": evidence_url}}
    )
    
    return {"message": "Evidence added successfully"}

# ==================== END DISPUTE MANAGEMENT SYSTEM ====================

@api_router.get("/admin/creators")
async def get_all_creators(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    creators = await db.creators.find({}, {"_id": 0}).to_list(1000)
    return creators


# ==================== WALLET SYSTEM ====================

# Wallet Helper Functions
async def get_or_create_wallet(user_id: str) -> dict:
    """Get wallet for user or create if doesn't exist"""
    wallet = await db.wallets.find_one({"user_id": user_id}, {"_id": 0})
    if not wallet:
        wallet = {
            "wallet_id": f"wallet_{uuid.uuid4().hex[:12]}",
            "user_id": user_id,
            "balance": 0.0,
            "currency": "INR",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        await db.wallets.insert_one(wallet)
    return wallet

async def add_wallet_transaction(wallet_id: str, user_id: str, amount: float, 
                                 transaction_type: str, description: str, 
                                 reference_id: str = None, metadata: dict = None):
    """Add a wallet transaction record"""
    transaction = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "wallet_id": wallet_id,
        "user_id": user_id,
        "amount": amount,
        "transaction_type": transaction_type,  # credit, debit, topup, withdrawal, payment, payout
        "description": description,
        "reference_id": reference_id,
        "metadata": metadata or {},
        "status": "completed",
        "created_at": datetime.now(timezone.utc)
    }
    await db.wallet_transactions.insert_one(transaction)
    return transaction

async def update_wallet_balance(user_id: str, amount: float, operation: str = "credit"):
    """Update wallet balance - credit (add) or debit (subtract)"""
    wallet = await get_or_create_wallet(user_id)
    
    if operation == "debit" and wallet["balance"] < amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")
    
    new_balance = wallet["balance"] + amount if operation == "credit" else wallet["balance"] - amount
    
    await db.wallets.update_one(
        {"user_id": user_id},
        {"$set": {
            "balance": new_balance,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    return new_balance


# Analytics Helper Functions
async def calculate_avg_response_time(user_id: str) -> float:
    """Calculate average time to first response in hours"""
    try:
        # Get all messages where user is the receiver (first message from sender)
        # and track when they responded
        pipeline = [
            {
                "$match": {
                    "$or": [
                        {"sender_id": user_id},
                        {"receiver_id": user_id}
                    ]
                }
            },
            {"$sort": {"created_at": 1}},
            {
                "$group": {
                    "_id": {
                        "$cond": [
                            {"$eq": ["$sender_id", user_id]},
                            "$receiver_id",
                            "$sender_id"
                        ]
                    },
                    "messages": {"$push": "$$ROOT"}
                }
            }
        ]
        
        conversations = await db.messages.aggregate(pipeline).to_list(None)
        response_times = []
        
        for conv in conversations:
            messages = conv.get("messages", [])
            if len(messages) < 2:
                continue
                
            # Find first message TO the user and their first response
            first_incoming = None
            first_response = None
            
            for msg in messages:
                if msg["receiver_id"] == user_id and not first_incoming:
                    first_incoming = msg
                elif msg["sender_id"] == user_id and first_incoming and not first_response:
                    first_response = msg
                    break
            
            if first_incoming and first_response:
                time_diff = (first_response["created_at"] - first_incoming["created_at"]).total_seconds() / 3600
                response_times.append(time_diff)
        
        if not response_times:
            return 24.0  # Default 24 hours if no data
        
        avg_time = sum(response_times) / len(response_times)
        return round(avg_time, 1)
    except Exception as e:
        print(f"Error calculating response time: {e}")
        return 24.0

async def calculate_on_time_delivery(creator_id: str) -> float:
    """Calculate percentage of projects delivered on time"""
    try:
        completed_projects = await db.projects.find({
            "creator_id": creator_id,
            "status": "completed"
        }).to_list(None)
        
        if not completed_projects:
            return 100.0  # Perfect score if no projects yet
        
        on_time_count = 0
        for project in completed_projects:
            deadline = project.get("deadline")
            completed_at = project.get("completed_at")
            
            if deadline and completed_at:
                # Convert strings to datetime if needed
                if isinstance(deadline, str):
                    deadline = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
                if isinstance(completed_at, str):
                    completed_at = datetime.fromisoformat(completed_at.replace('Z', '+00:00'))
                
                if completed_at <= deadline:
                    on_time_count += 1
        
        percentage = (on_time_count / len(completed_projects)) * 100
        return round(percentage, 1)
    except Exception as e:
        print(f"Error calculating on-time delivery: {e}")
        return 95.0

async def calculate_monthly_earnings(user_id: str) -> float:
    """Calculate current month earnings from wallet transactions"""
    try:
        from datetime import datetime, timezone
        
        # Get first day of current month
        now = datetime.now(timezone.utc)
        first_day = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Get all credit transactions this month
        transactions = await db.wallet_transactions.find({
            "user_id": user_id,
            "transaction_type": {"$in": ["payout", "credit", "topup"]},
            "created_at": {"$gte": first_day},
            "status": "completed"
        }).to_list(None)
        
        total = sum(txn.get("amount", 0) for txn in transactions)
        return round(total, 2)
    except Exception as e:
        print(f"Error calculating monthly earnings: {e}")
        return 0.0


# Wallet Endpoints
@api_router.get("/wallet/balance")
async def get_wallet_balance(current_user: User = Depends(get_current_user)):
    """Get current wallet balance with recent transactions"""
    wallet = await get_or_create_wallet(current_user.user_id)
    
    # Get recent transactions (last 10)
    transactions = await db.wallet_transactions.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "wallet_id": wallet["wallet_id"],
        "balance": wallet.get("balance", 0.0),
        "currency": wallet.get("currency", "INR"),
        "can_topup": current_user.role == "business",
        "can_withdraw": current_user.role == "creator",
        "recent_transactions": transactions
    }

@api_router.get("/wallet/transactions")
async def get_wallet_transactions(
    current_user: User = Depends(get_current_user),
    limit: int = 50,
    transaction_type: str = None
):
    """Get wallet transaction history"""
    wallet = await get_or_create_wallet(current_user.user_id)
    
    query = {"user_id": current_user.user_id}
    if transaction_type:
        query["transaction_type"] = transaction_type
    
    transactions = await db.wallet_transactions.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {
        "transactions": transactions,
        "count": len(transactions)
    }

@api_router.get("/wallet/withdrawals")
async def get_withdrawals(current_user: User = Depends(get_current_user)):
    """Get withdrawal history"""
    withdrawals = await db.withdrawals.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("requested_at", -1).to_list(100)
    
    return withdrawals

# Admin: Process Withdrawal
@api_router.patch("/admin/withdrawals/{withdrawal_id}/process")
async def process_withdrawal(
    withdrawal_id: str,
    status: str,
    current_user: User = Depends(get_current_user)
):
    """Admin: Approve or reject withdrawal"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if status not in ["completed", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'completed' or 'rejected'")
    
    withdrawal = await db.withdrawals.find_one({"withdrawal_id": withdrawal_id}, {"_id": 0})
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal request not found")
    
    if withdrawal["status"] != "pending":
        raise HTTPException(status_code=400, detail="Withdrawal already processed")
    
    # Update withdrawal status
    await db.withdrawals.update_one(
        {"withdrawal_id": withdrawal_id},
        {"$set": {
            "status": status,
            "processed_at": datetime.now(timezone.utc),
            "processed_by": current_user.user_id
        }}
    )
    
    # If rejected, credit back to wallet
    if status == "rejected":
        await update_wallet_balance(withdrawal["user_id"], withdrawal["amount"], "credit")
        
        # Update transaction status
        await db.wallet_transactions.update_one(
            {"reference_id": withdrawal_id},
            {"$set": {"status": "failed", "metadata.rejection_reason": "Admin rejected"}}
        )
    else:
        # Update transaction status
        await db.wallet_transactions.update_one(
            {"reference_id": withdrawal_id},
            {"$set": {"status": "completed"}}
        )
    
    return {
        "message": f"Withdrawal {status}",
        "withdrawal_id": withdrawal_id,
        "status": status
    }

# Admin: Manual Wallet Adjustment
@api_router.post("/admin/wallet/adjust")
async def adjust_wallet_balance(
    adjustment: WalletAdjustment,
    current_user: User = Depends(get_current_user)
):
    """Admin: Manually adjust wallet balance"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    wallet = await get_or_create_wallet(adjustment.user_id)
    
    # Apply adjustment
    operation = "credit" if adjustment.adjustment_type == "credit" else "debit"
    new_balance = await update_wallet_balance(adjustment.user_id, adjustment.amount, operation)
    
    # Record transaction
    await add_wallet_transaction(
        wallet["wallet_id"],
        adjustment.user_id,
        adjustment.amount,
        "adjustment",
        f"Admin adjustment: {adjustment.reason}",
        f"admin_{current_user.user_id}",
        {
            "adjusted_by": current_user.user_id,
            "adjustment_type": adjustment.adjustment_type,
            "reason": adjustment.reason
        }
    )
    


# ==================== ADMIN USER MANAGEMENT ====================

# Middleware to check user restrictions
async def check_user_restrictions(user_id: str):
    """Check if user has active restrictions"""
    restriction = await db.user_restrictions.find_one({
        "user_id": user_id,
        "active": True,
        "$or": [
            {"expires_at": None},  # Permanent ban
            {"expires_at": {"$gt": datetime.now(timezone.utc)}}  # Active suspension
        ]
    }, {"_id": 0})
    
    return restriction

@api_router.get("/admin/users")
async def get_all_users(
    role: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get all users - Admin only"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = {}
    
    if role:
        query["role"] = role
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    
    users = await db.users.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    
    # Enrich with restriction info
    for user in users:
        restriction = await check_user_restrictions(user["user_id"])
        user["restricted"] = bool(restriction)
        user["restriction_type"] = restriction.get("restriction_type") if restriction else None
        
        # Get creator profile if role is creator
        if user["role"] == "creator":
            creator = await db.creators.find_one({"submitted_by": user["user_id"]}, {"_id": 0, "name": 1, "badge": 1, "status": 1})
            if creator:
                user["creator_profile"] = creator
    
    return users

@api_router.get("/admin/users/{user_id}")
async def get_user_details(user_id: str, current_user: User = Depends(get_current_user)):
    """Get detailed user information - Admin only"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get wallet info
    wallet = await get_or_create_wallet(user_id)
    
    # Get restrictions
    restrictions = await db.user_restrictions.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("restricted_at", -1).to_list(10)
    
    # Get projects
    if user["role"] == "creator":
        creator = await db.creators.find_one({"submitted_by": user_id}, {"_id": 0})
        if creator:
            projects = await db.projects.find({"creator_id": creator["creator_id"]}, {"_id": 0}).to_list(100)
            user["creator_profile"] = creator
            user["projects_count"] = len(projects)
    elif user["role"] == "business":
        projects = await db.projects.find({"business_id": user_id}, {"_id": 0}).to_list(100)
        user["projects_count"] = len(projects)
    
    # Get disputes
    disputes = await db.disputes.find({
        "$or": [
            {"raised_by": user_id},
            {"raised_against": user_id}
        ]
    }, {"_id": 0}).to_list(50)
    
    user["wallet"] = wallet
    user["restrictions"] = restrictions
    user["disputes_count"] = len(disputes)
    
    return user

@api_router.post("/admin/users/{user_id}/restrict")
async def restrict_user(
    user_id: str,
    restriction: UserRestriction,
    current_user: User = Depends(get_current_user)
):
    """Ban or suspend a user - Admin only"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user["role"] == "admin":
        raise HTTPException(status_code=400, detail="Cannot restrict admin users")
    
    # Check if user is already restricted
    existing = await check_user_restrictions(user_id)
    if existing:
        raise HTTPException(status_code=400, detail="User already has an active restriction")
    
    # Calculate expiry for suspensions
    expires_at = None
    if restriction.restriction_type == "suspend" and restriction.duration_days:
        expires_at = datetime.now(timezone.utc) + timedelta(days=restriction.duration_days)
    
    # Create restriction record
    restriction_id = f"restrict_{uuid.uuid4().hex[:12]}"
    restriction_doc = {
        "restriction_id": restriction_id,
        "user_id": user_id,
        "restriction_type": restriction.restriction_type,
        "reason": restriction.reason,
        "duration_days": restriction.duration_days,
        "restricted_by": current_user.user_id,
        "restricted_at": datetime.now(timezone.utc),
        "expires_at": expires_at,
        "active": True
    }
    
    await db.user_restrictions.insert_one(restriction_doc)
    
    # Notify user
    await db.notifications.insert_one({
        "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "type": "account_restricted",
        "title": f"Account {restriction.restriction_type.title()}ed",
        "message": f"Your account has been {restriction.restriction_type}ed. Reason: {restriction.reason}",
        "reference_id": restriction_id,
        "read": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {
        "message": f"User {restriction.restriction_type}ed successfully",
        "restriction_id": restriction_id,
        "expires_at": expires_at
    }

@api_router.post("/admin/users/{user_id}/unrestrict")
async def unrestrict_user(user_id: str, current_user: User = Depends(get_current_user)):
    """Remove restrictions from a user - Admin only"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Deactivate all active restrictions
    result = await db.user_restrictions.update_many(
        {"user_id": user_id, "active": True},
        {"$set": {
            "active": False,
            "unrestricted_by": current_user.user_id,
            "unrestricted_at": datetime.now(timezone.utc)
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="No active restrictions found for this user")
    
    # Notify user
    await db.notifications.insert_one({
        "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "type": "account_unrestricted",
        "title": "Account Restriction Lifted",
        "message": "Your account restrictions have been removed. You can now access the platform normally.",
        "reference_id": None,
        "read": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {
        "message": "User restrictions removed successfully",
        "count": result.modified_count
    }

@api_router.get("/admin/restrictions")
async def get_all_restrictions(
    active_only: bool = True,
    current_user: User = Depends(get_current_user)
):
    """Get all user restrictions - Admin only"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = {}
    if active_only:
        query["active"] = True
    
    restrictions = await db.user_restrictions.find(query, {"_id": 0}).sort("restricted_at", -1).to_list(200)
    
    # Enrich with user details
    for restriction in restrictions:
        user = await db.users.find_one({"user_id": restriction["user_id"]}, {"_id": 0, "name": 1, "email": 1, "role": 1})
        if user:
            restriction["user_name"] = user.get("name", user.get("email"))
            restriction["user_role"] = user.get("role")
    
    return restrictions

# ==================== END ADMIN USER MANAGEMENT ====================

@api_router.get("/analytics/business")
async def get_business_analytics(current_user: User = Depends(get_current_user)):
    """Business analytics dashboard"""
    # Projects stats
    total_projects = await db.projects.count_documents({"business_id": current_user.user_id})
    active_projects = await db.projects.count_documents({"business_id": current_user.user_id, "status": "active"})
    completed_projects = await db.projects.count_documents({"business_id": current_user.user_id, "status": "completed"})
    
    # Spending stats
    all_projects = await db.projects.find({"business_id": current_user.user_id}, {"_id": 0}).to_list(1000)
    total_spent = sum(p.get("budget", 0) for p in all_projects)
    avg_project_value = total_spent / total_projects if total_projects > 0 else 0
    
    # Creator stats
    creators_contacted = await db.creator_views.count_documents({"user_id": current_user.user_id})
    favorite_creators = await db.favorites.count_documents({"user_id": current_user.user_id})
    
    # Usage stats
    user_data = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    creators_viewed_this_month = user_data.get("creators_viewed_this_month", 0)
    
    # Pay-as-you-go charges
    payg_charges = await db.payg_charges.find({"user_id": current_user.user_id}, {"_id": 0}).to_list(1000)
    total_payg_spent = sum(c.get("amount", 0) for c in payg_charges)
    
    return {
        "projects": {
            "total": total_projects,
            "active": active_projects,
            "completed": completed_projects,
            "completion_rate": (completed_projects / total_projects * 100) if total_projects > 0 else 0
        },
        "spending": {
            "total_spent": round(total_spent, 2),
            "avg_project_value": round(avg_project_value, 2),
            "payg_spent": round(total_payg_spent, 2)
        },
        "creators": {
            "contacted": creators_contacted,
            "viewed_this_month": creators_viewed_this_month,
            "favorites": favorite_creators
        },
        "subscription": {
            "plan": user_data.get("subscription_plan", "free"),
            "status": user_data.get("subscription_status", "free")
        }
    }

@api_router.get("/analytics/creator/{creator_id}")
async def get_creator_analytics(creator_id: str, current_user: User = Depends(get_current_user)):
    """Creator analytics dashboard"""
    creator = await db.creators.find_one({"creator_id": creator_id}, {"_id": 0})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    # Only creator owner or admin can view
    if current_user.role != "admin" and creator.get("submitted_by") != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Projects stats
    total_projects = await db.projects.count_documents({"creator_id": creator_id})
    active_projects = await db.projects.count_documents({"creator_id": creator_id, "status": "active"})
    completed_projects = await db.projects.count_documents({"creator_id": creator_id, "status": "completed"})
    
    # Earnings stats
    completed_project_docs = await db.projects.find({"creator_id": creator_id, "status": "completed"}, {"_id": 0}).to_list(1000)
    total_earnings = sum(p.get("fees", {}).get("creator_receives", 0) for p in completed_project_docs)
    avg_project_value = total_earnings / completed_projects if completed_projects > 0 else 0
    
    # Reviews stats
    reviews = await db.reviews.find({"reviewee_id": creator_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r.get("rating", 0) for r in reviews) / len(reviews) if reviews else 0
    total_reviews = len(reviews)
    
    # Profile views (estimate based on creator_views)
    profile_views = await db.creator_views.count_documents({"creator_id": creator_id})
    
    # Response time (calculate from real message data)
    avg_response_time_hours = await calculate_avg_response_time(creator_id)
    
    # Calculate badge
    creator_stats = {
        "completed_projects": completed_projects,
        "average_rating": avg_rating,
        "avg_response_time_hours": avg_response_time_hours,
        "verification_status": creator.get("verification_status", "unverified"),
        "is_premium": creator.get("premium_until") and creator["premium_until"] > datetime.now(timezone.utc) if creator.get("premium_until") else False
    }
    badge = calculate_creator_badge(creator_stats)
    badge_info = get_badge_info(badge)
    
    # Update creator with badge
    await db.creators.update_one(
        {"creator_id": creator_id},
        {"$set": {
            "badge": badge,
            "completed_projects": completed_projects,
            "average_rating": round(avg_rating, 2),
            "total_reviews": total_reviews,
            "profile_views": profile_views
        }}
    )
    
    return {
        "projects": {
            "total": total_projects,
            "active": active_projects,
            "completed": completed_projects,
            "completion_rate": (completed_projects / total_projects * 100) if total_projects > 0 else 0
        },
        "earnings": {
            "total": round(total_earnings, 2),
            "avg_per_project": round(avg_project_value, 2),
            "this_month": await calculate_monthly_earnings(creator_id)
        },
        "reputation": {
            "average_rating": round(avg_rating, 2),
            "total_reviews": total_reviews,
            "badge": badge,
            "badge_info": badge_info
        },
        "engagement": {
            "profile_views": profile_views,
            "avg_response_time_hours": avg_response_time_hours
        },
        "verification": {
            "status": creator.get("verification_status", "unverified"),
            "youtube_verified": creator.get("youtube_verified", False),
            "instagram_verified": creator.get("instagram_verified", False)
        }
    }


@api_router.get("/analytics/creator")
async def get_my_creator_analytics(current_user: User = Depends(get_current_user)):
    """Get analytics for current creator user"""
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can access this endpoint")
    
    # Get creator profile
    creator = await db.creators.find_one({"submitted_by": current_user.user_id}, {"_id": 0})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator profile not found. Please create your profile first.")
    
    creator_id = creator["creator_id"]
    
    # Projects stats by status
    all_projects = await db.projects.find({"creator_id": creator_id}, {"_id": 0}).to_list(1000)
    total_projects = len(all_projects)
    
    project_stats = {
        "pending": 0,
        "in_progress": 0,
        "delivered": 0,
        "completed": 0,
        "declined": 0
    }
    
    for project in all_projects:
        status = project.get("status", "pending")
        if status in project_stats:
            project_stats[status] += 1
        elif status == "active":
            project_stats["in_progress"] += 1
    
    completion_rate = (project_stats["completed"] / total_projects * 100) if total_projects > 0 else 0
    
    # Earnings from wallet transactions
    wallet = await get_or_create_wallet(current_user.user_id)
    wallet_txns = await db.wallet_transactions.find({
        "user_id": current_user.user_id,
        "transaction_type": "payout"
    }, {"_id": 0}).to_list(1000)
    
    total_earnings = sum(txn.get("amount", 0) for txn in wallet_txns)
    
    # Monthly earnings (last 6 months)
    from datetime import timedelta
    now = datetime.now(timezone.utc)
    monthly_earnings = []
    
    for i in range(5, -1, -1):  # Last 6 months
        month_start = (now - timedelta(days=30*i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)
        
        month_txns = [txn for txn in wallet_txns if month_start <= txn.get("created_at", now) <= month_end]
        month_total = sum(txn.get("amount", 0) for txn in month_txns)
        
        monthly_earnings.append({
            "month": month_start.strftime("%b %Y"),
            "earnings": round(month_total, 2),
            "projects": len(month_txns)
        })
    
    # Current month earnings
    current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    current_month_txns = [txn for txn in wallet_txns if txn.get("created_at", now) >= current_month_start]
    current_month_earnings = sum(txn.get("amount", 0) for txn in current_month_txns)
    
    # Average earnings per project
    avg_per_project = total_earnings / project_stats["completed"] if project_stats["completed"] > 0 else 0
    
    # Reviews stats
    reviews = await db.reviews.find({"reviewee_id": creator_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r.get("rating", 0) for r in reviews) / len(reviews) if reviews else 0
    total_reviews = len(reviews)
    
    # Profile views
    profile_views = await db.creator_views.count_documents({"creator_id": creator_id})
    
    # Recent projects
    recent_projects = await db.projects.find({
        "creator_id": creator_id
    }, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    # Add business names to recent projects
    for project in recent_projects:
        business = await db.users.find_one({"user_id": project["business_id"]}, {"_id": 0, "name": 1, "email": 1})
        if business:
            project["business_name"] = business.get("name", business.get("email", "Business User"))
    
    return {
        "creator_id": creator_id,
        "creator_name": creator.get("name"),
        "badge": creator.get("badge", "new"),
        "wallet": {
            "current_balance": wallet["balance"],
            "total_earnings": round(total_earnings, 2),
            "this_month": round(current_month_earnings, 2),
            "avg_per_project": round(avg_per_project, 2)
        },
        "projects": {
            "total": total_projects,
            "by_status": project_stats,
            "completion_rate": round(completion_rate, 2)
        },
        "earnings_chart": monthly_earnings,
        "reputation": {
            "average_rating": round(avg_rating, 2),
            "total_reviews": total_reviews,
            "profile_views": profile_views
        },
        "recent_projects": recent_projects,
        "performance": {
            "response_time_hours": await calculate_avg_response_time(creator_id),
            "on_time_delivery": await calculate_on_time_delivery(creator_id)
        }
    }


@api_router.get("/admin/stats")
async def get_admin_stats(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_creators = await db.creators.count_documents({})
    approved_creators = await db.creators.count_documents({"status": "approved"})
    pending_creators = await db.creators.count_documents({"status": "pending"})
    verified_creators = await db.creators.count_documents({"verification_status": "verified"})
    premium_creators = await db.creators.count_documents({"premium_until": {"$gte": datetime.now(timezone.utc)}})
    total_users = await db.users.count_documents({})
    active_subscribers = await db.users.count_documents({"subscription_status": "active"})
    total_projects = await db.projects.count_documents({})
    active_projects = await db.projects.count_documents({"status": "active"})
    
    return {
        "total_creators": total_creators,
        "approved_creators": approved_creators,
        "pending_creators": pending_creators,
        "verified_creators": verified_creators,
        "premium_creators": premium_creators,
        "total_users": total_users,
        "active_subscribers": active_subscribers,
        "total_projects": total_projects,
        "active_projects": active_projects
    }

# Order Management Endpoints
class OrderStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

@api_router.get("/orders")
async def get_orders(
    status: Optional[str] = None,
    role: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get orders/projects with filters"""
    query = {}
    
    # Filter by user role
    if current_user.role == "business":
        query["business_id"] = current_user.user_id
    elif current_user.role == "creator":
        # Find creator profile for this user
        creator = await db.creators.find_one({"submitted_by": current_user.user_id}, {"_id": 0})
        if creator:
            query["creator_id"] = creator["creator_id"]
        else:
            return []
    # Admin sees all
    
    if status:
        query["status"] = status
    
    orders = await db.projects.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Enrich with creator and business details
    for order in orders:
        # Get creator details
        creator = await db.creators.find_one({"creator_id": order.get("creator_id")}, {"_id": 0, "name": 1, "profile_image": 1})
        if creator:
            order["creator_name"] = creator.get("name", "Unknown")
            order["creator_image"] = creator.get("profile_image")
        
        # Get business details
        business = await db.users.find_one({"user_id": order.get("business_id")}, {"_id": 0, "name": 1, "picture": 1})
        if business:
            order["business_name"] = business.get("name", "Unknown")
            order["business_image"] = business.get("picture")
        
        # Get escrow info
        escrow = await db.escrow_transactions.find_one({"project_id": order.get("project_id")}, {"_id": 0})
        if escrow:
            order["escrow_status"] = escrow.get("status")
            order["escrow_amount"] = escrow.get("amount")
    
    return orders

@api_router.get("/orders/{order_id}")
async def get_order_details(order_id: str, current_user: User = Depends(get_current_user)):
    """Get detailed order information"""
    order = await db.projects.find_one({"project_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Authorization check
    if current_user.role != "admin":
        creator = await db.creators.find_one({"submitted_by": current_user.user_id}, {"_id": 0})
        is_creator = creator and creator["creator_id"] == order.get("creator_id")
        is_business = order.get("business_id") == current_user.user_id
        if not (is_creator or is_business):
            raise HTTPException(status_code=403, detail="Not authorized")
    
    # Enrich with details
    creator = await db.creators.find_one({"creator_id": order.get("creator_id")}, {"_id": 0})
    business = await db.users.find_one({"user_id": order.get("business_id")}, {"_id": 0})
    escrow = await db.escrow_transactions.find_one({"project_id": order_id}, {"_id": 0})
    messages = await db.messages.find({
        "$or": [
            {"sender_id": order.get("business_id"), "receiver_id": order.get("creator_id")},
            {"sender_id": order.get("creator_id"), "receiver_id": order.get("business_id")}
        ]
    }, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        **order,
        "creator": creator,
        "business": business,
        "escrow": escrow,
        "recent_messages": messages,
        "timeline": await get_order_timeline(order_id)
    }

async def get_order_timeline(order_id: str):
    """Generate timeline for order"""
    order = await db.projects.find_one({"project_id": order_id}, {"_id": 0})
    if not order:
        return []
    
    timeline = []
    
    if order.get("created_at"):
        timeline.append({
            "event": "Order Created",
            "timestamp": order["created_at"].isoformat() if hasattr(order["created_at"], 'isoformat') else str(order["created_at"]),
            "status": "completed"
        })
    
    escrow = await db.escrow_transactions.find_one({"project_id": order_id}, {"_id": 0})
    if escrow and escrow.get("paid_at"):
        timeline.append({
            "event": "Payment Received",
            "timestamp": escrow["paid_at"].isoformat() if hasattr(escrow["paid_at"], 'isoformat') else str(escrow["paid_at"]),
            "status": "completed"
        })
    
    if order.get("delivered_at"):
        timeline.append({
            "event": "Work Delivered",
            "timestamp": order["delivered_at"].isoformat() if hasattr(order["delivered_at"], 'isoformat') else str(order["delivered_at"]),
            "status": "completed"
        })
    
    if order.get("completed_at"):
        timeline.append({
            "event": "Order Completed",
            "timestamp": order["completed_at"].isoformat() if hasattr(order["completed_at"], 'isoformat') else str(order["completed_at"]),
            "status": "completed"
        })
    
    return timeline

@api_router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, status_update: OrderStatusUpdate, current_user: User = Depends(get_current_user)):
    """Update order status"""
    order = await db.projects.find_one({"project_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    valid_statuses = ["pending", "active", "in_progress", "delivered", "revision_requested", "completed", "cancelled", "disputed"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    update_data = {
        "status": status_update.status,
        "updated_at": datetime.now(timezone.utc)
    }
    
    if status_update.notes:
        update_data["status_notes"] = status_update.notes
    
    if status_update.status == "delivered":
        update_data["delivered_at"] = datetime.now(timezone.utc)
    elif status_update.status == "completed":
        update_data["completed_at"] = datetime.now(timezone.utc)
    
    await db.projects.update_one(
        {"project_id": order_id},
        {"$set": update_data}
    )
    
    # Create notification
    notify_user = order["business_id"] if current_user.user_id != order["business_id"] else order.get("creator_id")
    if notify_user:
        await NotificationService.create_notification(
            db, notify_user,
            "Order Status Updated",
            f"Order {order_id[:12]}... status changed to {status_update.status}",
            "order",
            f"/orders/{order_id}"
        )
    
    return {"message": f"Order status updated to {status_update.status}"}

@api_router.post("/orders/{order_id}/revision")
@api_router.get("/orders/stats/summary")
async def get_order_stats(current_user: User = Depends(get_current_user)):
    """Get order statistics for dashboard"""
    query = {}
    
    if current_user.role == "business":
        query["business_id"] = current_user.user_id
    elif current_user.role == "creator":
        creator = await db.creators.find_one({"submitted_by": current_user.user_id}, {"_id": 0})
        if creator:
            query["creator_id"] = creator["creator_id"]
    
    total = await db.projects.count_documents(query)
    pending = await db.projects.count_documents({**query, "status": "pending"})
    active = await db.projects.count_documents({**query, "status": {"$in": ["active", "in_progress"]}})
    delivered = await db.projects.count_documents({**query, "status": "delivered"})
    completed = await db.projects.count_documents({**query, "status": "completed"})
    disputed = await db.projects.count_documents({**query, "status": "disputed"})
    
    # Calculate total value
    all_orders = await db.projects.find(query, {"_id": 0, "budget": 1, "fees": 1}).to_list(1000)
    total_value = sum(o.get("budget", 0) for o in all_orders)
    
    return {
        "total_orders": total,
        "pending": pending,
        "active": active,
        "delivered": delivered,
        "completed": completed,
        "disputed": disputed,
        "total_value": round(total_value, 2),
        "completion_rate": round((completed / total * 100) if total > 0 else 0, 2)
    }

# Creator Badges Endpoint
@api_router.get("/creators/{creator_id}/badge")
async def get_creator_badge(creator_id: str):
    """Get creator badge information"""
    creator = await db.creators.find_one({"creator_id": creator_id}, {"_id": 0})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    # Calculate badge based on stats
    completed_projects = await db.projects.count_documents({"creator_id": creator_id, "status": "completed"})
    reviews = await db.reviews.find({"reviewee_id": creator_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews) if reviews else 0
    
    is_premium = False
    if creator.get("premium_until"):
        premium_until = creator["premium_until"]
        if isinstance(premium_until, str):
            premium_until = datetime.fromisoformat(premium_until)
        is_premium = premium_until > datetime.now(timezone.utc)
    
    creator_stats = {
        "completed_projects": completed_projects,
        "average_rating": avg_rating,
        "avg_response_time_hours": await calculate_avg_response_time(creator_id),
        "verification_status": creator.get("verification_status", "unverified"),
        "is_premium": is_premium
    }
    
    badge = calculate_creator_badge(creator_stats)
    badge_info = get_badge_info(badge)
    
    return {
        "badge": badge,
        "badge_info": badge_info,
        "stats": {
            "completed_projects": completed_projects,
            "average_rating": round(avg_rating, 2),
            "total_reviews": len(reviews),
            "is_verified": creator.get("verification_status") == "verified",
            "is_premium": is_premium
        }
    }

# Review & Rating System
@api_router.post("/reviews")
async def create_review(review: ReviewCreate, current_user: User = Depends(get_current_user)):
    project = await db.projects.find_one({"project_id": review.project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project["status"] != "completed":
        raise HTTPException(status_code=400, detail="Can only review completed projects")
    
    review_id = f"review_{uuid.uuid4().hex[:12]}"
    
    await db.reviews.insert_one({
        "review_id": review_id,
        "project_id": review.project_id,
        "reviewer_id": current_user.user_id,
        "reviewee_id": project["creator_id"] if current_user.user_id == project["business_id"] else project["business_id"],
        "rating": review.rating,
        "comment": review.comment,
        "created_at": datetime.now(timezone.utc)
    })
    
    # Update average rating
    reviewee_id = project["creator_id"] if current_user.user_id == project["business_id"] else project["business_id"]
    reviews = await db.reviews.find({"reviewee_id": reviewee_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
    
    await db.creators.update_one(
        {"creator_id": reviewee_id},
        {"$set": {"average_rating": round(avg_rating, 2), "total_reviews": len(reviews)}}
    )
    
    return {"message": "Review submitted successfully", "review_id": review_id}

@api_router.get("/creators/{creator_id}/reviews")
async def get_creator_reviews(creator_id: str):
    reviews = await db.reviews.find({"reviewee_id": creator_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return reviews

# Proposal/Bidding System
@api_router.post("/proposals")
async def create_proposal(proposal: ProposalCreate, current_user: User = Depends(get_current_user)):
    project = await db.projects.find_one({"project_id": proposal.project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    proposal_id = f"proposal_{uuid.uuid4().hex[:12]}"
    
    await db.proposals.insert_one({
        "proposal_id": proposal_id,
        "project_id": proposal.project_id,
        "creator_id": current_user.user_id,
        "proposed_amount": proposal.proposed_amount,
        "delivery_days": proposal.delivery_days,
        "message": proposal.message,
        "status": "pending",
        "created_at": datetime.now(timezone.utc)
    })
    
    # Notify business
    await NotificationService.create_notification(
        db, project["business_id"],
        "New Proposal Received",
        f"You have a new proposal for your project: {project['title']}",
        "proposal",
        f"/projects/{proposal.project_id}"
    )
    
    return {"message": "Proposal submitted successfully", "proposal_id": proposal_id}

@api_router.get("/projects/{project_id}/proposals")
async def get_project_proposals(project_id: str, current_user: User = Depends(get_current_user)):
    proposals = await db.proposals.find({"project_id": project_id}, {"_id": 0}).to_list(100)
    return proposals

@api_router.post("/proposals/{proposal_id}/accept")
async def accept_proposal(proposal_id: str, current_user: User = Depends(get_current_user)):
    proposal = await db.proposals.find_one({"proposal_id": proposal_id}, {"_id": 0})
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Update proposal
    await db.proposals.update_one(
        {"proposal_id": proposal_id},
        {"$set": {"status": "accepted", "accepted_at": datetime.now(timezone.utc)}}
    )
    
    # Update project with accepted creator
    await db.projects.update_one(
        {"project_id": proposal["project_id"]},
        {"$set": {"creator_id": proposal["creator_id"], "budget": proposal["proposed_amount"], "status": "active"}}
    )
    
    return {"message": "Proposal accepted"}

# Portfolio Management
@api_router.post("/creators/{creator_id}/portfolio")
async def add_portfolio_item(creator_id: str, item: PortfolioItemCreate, current_user: User = Depends(get_current_user)):
    portfolio_id = f"portfolio_{uuid.uuid4().hex[:12]}"
    
    await db.portfolio.insert_one({
        "portfolio_id": portfolio_id,
        "creator_id": creator_id,
        "title": item.title,
        "description": item.description,
        "media_url": item.media_url,
        "project_type": item.project_type,
        "platform": item.platform,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": "Portfolio item added", "portfolio_id": portfolio_id}

@api_router.get("/creators/{creator_id}/portfolio")
async def get_portfolio(creator_id: str):
    portfolio = await db.portfolio.find({"creator_id": creator_id}, {"_id": 0}).to_list(100)
    return portfolio

# Dispute Resolution
@api_router.post("/disputes")
@api_router.get("/disputes")
@api_router.patch("/disputes/{dispute_id}/resolve")
@api_router.post("/favorites")
async def add_favorite(favorite: FavoriteCreate, current_user: User = Depends(get_current_user)):
    await db.favorites.insert_one({
        "user_id": current_user.user_id,
        "creator_id": favorite.creator_id,
        "created_at": datetime.now(timezone.utc)
    })
    return {"message": "Creator added to favorites"}

@api_router.delete("/favorites/{creator_id}")
async def remove_favorite(creator_id: str, current_user: User = Depends(get_current_user)):
    await db.favorites.delete_one({"user_id": current_user.user_id, "creator_id": creator_id})
    return {"message": "Creator removed from favorites"}

@api_router.get("/favorites")
async def get_favorites(current_user: User = Depends(get_current_user)):
    favorites = await db.favorites.find({"user_id": current_user.user_id}, {"_id": 0}).to_list(100)
    creator_ids = [f["creator_id"] for f in favorites]
    creators = await db.creators.find({"creator_id": {"$in": creator_ids}}, {"_id": 0, "email": 0, "phone": 0}).to_list(100)
    return creators

# Notifications
@api_router.get("/notifications")
async def get_notifications(current_user: User = Depends(get_current_user)):
    notifications = await db.notifications.find({"user_id": current_user.user_id}, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
    return notifications

@api_router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user)):
    await db.notifications.update_one(
        {"notification_id": notification_id, "user_id": current_user.user_id},
        {"$set": {"read": True}}
    )
    return {"message": "Notification marked as read"}

@api_router.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: str, current_user: User = Depends(get_current_user)):
    await db.notifications.delete_one({"notification_id": notification_id, "user_id": current_user.user_id})
    return {"message": "Notification deleted"}

# File Upload
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    contents = await file.read()
    file_url = await FileUploadService.upload_file(contents, file.filename, "uploads")
    return {"file_url": file_url, "filename": file.filename}

# ==================== Social Media Verification ====================
from social_verification import instagram_oauth, youtube_oauth

# In-memory state storage (use Redis in production)
verification_states = {}

@api_router.post("/creators/verify/instagram/initiate")
async def initiate_instagram_verification(current_user: User = Depends(get_current_user)):
    """Initiate Instagram account verification"""
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can verify social accounts")
    
    if not instagram_oauth.is_configured():
        raise HTTPException(
            status_code=503,
            detail="Instagram OAuth not configured. Please contact administrator to add API credentials."
        )
    
    # Generate secure state token
    state = secrets.token_urlsafe(32)
    verification_states[state] = {
        "user_id": current_user.user_id,
        "platform": "instagram",
        "created_at": datetime.now(timezone.utc),
        "used": False
    }
    
    try:
        auth_url = instagram_oauth.get_authorization_url(state)
        return {
            "auth_url": auth_url,
            "message": "Redirect user to this URL to authorize Instagram connection"
        }
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))

@api_router.get("/instagram/callback")
async def instagram_oauth_callback(code: str, state: str):
    """Handle Instagram OAuth callback"""
    # Validate state
    if state not in verification_states:
        raise HTTPException(status_code=400, detail="Invalid or expired verification request")
    
    state_data = verification_states[state]
    
    # Check expiration (10 minutes)
    if datetime.now(timezone.utc) - state_data["created_at"] > timedelta(minutes=10):
        del verification_states[state]
        raise HTTPException(status_code=400, detail="Verification request expired")
    
    if state_data["used"]:
        del verification_states[state]
        raise HTTPException(status_code=400, detail="Verification request already used")
    
    state_data["used"] = True
    user_id = state_data["user_id"]
    
    try:
        # Exchange code for token
        token_response = await instagram_oauth.exchange_code_for_token(code)
        short_lived_token = token_response.get("access_token")
        
        # Get long-lived token
        long_lived_response = await instagram_oauth.get_long_lived_token(short_lived_token)
        access_token = long_lived_response.get("access_token")
        
        # Fetch user profile
        profile = await instagram_oauth.get_user_profile(access_token)
        
        # Update creator with verification data
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "instagram_verified": True,
                "instagram_handle": profile.get("username"),
                "instagram_followers": profile.get("followers_count", 0),
                "instagram_account_type": profile.get("account_type"),
                "instagram_verified_at": datetime.now(timezone.utc),
                "instagram_access_token": access_token  # Store encrypted in production
            }}
        )
        
        # Clean up state
        del verification_states[state]
        
        # Redirect to success page
        return RedirectResponse(
            url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/creator-dashboard?verification=instagram_success",
            status_code=302
        )
        
    except Exception as e:
        logger.error(f"Instagram verification failed: {str(e)}")
        return RedirectResponse(
            url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/creator-dashboard?verification=instagram_error",
            status_code=302
        )

@api_router.post("/creators/verify/youtube/initiate")
async def initiate_youtube_verification(current_user: User = Depends(get_current_user)):
    """Initiate YouTube account verification"""
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can verify social accounts")
    
    if not youtube_oauth.is_configured():
        raise HTTPException(
            status_code=503,
            detail="YouTube OAuth not configured. Please contact administrator to add API credentials."
        )
    
    # Generate secure state token
    state = secrets.token_urlsafe(32)
    verification_states[state] = {
        "user_id": current_user.user_id,
        "platform": "youtube",
        "created_at": datetime.now(timezone.utc),
        "used": False
    }
    
    try:
        auth_url = youtube_oauth.get_authorization_url(state)
        return {
            "auth_url": auth_url,
            "message": "Redirect user to this URL to authorize YouTube connection"
        }
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))

@api_router.get("/youtube/callback")
async def youtube_oauth_callback(code: str, state: str):
    """Handle YouTube OAuth callback"""
    # Validate state
    if state not in verification_states:
        raise HTTPException(status_code=400, detail="Invalid or expired verification request")
    
    state_data = verification_states[state]
    
    # Check expiration (10 minutes)
    if datetime.now(timezone.utc) - state_data["created_at"] > timedelta(minutes=10):
        del verification_states[state]
        raise HTTPException(status_code=400, detail="Verification request expired")
    
    if state_data["used"]:
        del verification_states[state]
        raise HTTPException(status_code=400, detail="Verification request already used")
    
    state_data["used"] = True
    user_id = state_data["user_id"]
    
    try:
        # Exchange code for token
        token_response = await youtube_oauth.exchange_code_for_token(code)
        access_token = token_response.get("access_token")
        refresh_token = token_response.get("refresh_token")
        
        # Fetch channel info
        channel_info = await youtube_oauth.get_channel_info(access_token)
        
        # Update creator with verification data
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "youtube_verified": True,
                "youtube_channel_id": channel_info.get("channel_id"),
                "youtube_channel_name": channel_info.get("channel_title"),
                "youtube_subscribers": channel_info.get("subscriber_count", 0),
                "youtube_custom_url": channel_info.get("custom_url"),
                "youtube_verified_at": datetime.now(timezone.utc),
                "youtube_access_token": access_token,  # Store encrypted in production
                "youtube_refresh_token": refresh_token
            }}
        )
        
        # Clean up state
        del verification_states[state]
        
        # Redirect to success page
        return RedirectResponse(
            url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/creator-dashboard?verification=youtube_success",
            status_code=302
        )
        
    except Exception as e:
        logger.error(f"YouTube verification failed: {str(e)}")
        return RedirectResponse(
            url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/creator-dashboard?verification=youtube_error",
            status_code=302
        )

@api_router.get("/creators/{creator_id}/verification-status")
async def get_verification_status(creator_id: str):
    """Get social media verification status for a creator"""
    creator = await db.users.find_one({"user_id": creator_id, "role": "creator"}, {"_id": 0})
    
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    return {
        "instagram_verified": creator.get("instagram_verified", False),
        "instagram_handle": creator.get("instagram_handle"),
        "instagram_followers": creator.get("instagram_followers", 0),
        "youtube_verified": creator.get("youtube_verified", False),
        "youtube_channel_name": creator.get("youtube_channel_name"),
        "youtube_subscribers": creator.get("youtube_subscribers", 0)
    }

@api_router.delete("/creators/verify/instagram")
async def remove_instagram_verification(current_user: User = Depends(get_current_user)):
    """Remove Instagram verification"""
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can manage verifications")
    
    await db.users.update_one(
        {"user_id": current_user.user_id},
        {"$unset": {
            "instagram_verified": "",
            "instagram_handle": "",
            "instagram_followers": "",
            "instagram_account_type": "",
            "instagram_verified_at": "",
            "instagram_access_token": ""
        }}
    )
    
    return {"message": "Instagram verification removed"}

@api_router.delete("/creators/verify/youtube")
async def remove_youtube_verification(current_user: User = Depends(get_current_user)):
    """Remove YouTube verification"""
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can manage verifications")
    
    await db.users.update_one(
        {"user_id": current_user.user_id},
        {"$unset": {
            "youtube_verified": "",
            "youtube_channel_id": "",
            "youtube_channel_name": "",
            "youtube_subscribers": "",
            "youtube_custom_url": "",
            "youtube_verified_at": "",
            "youtube_access_token": "",
            "youtube_refresh_token": ""
        }}
    )
    
    return {"message": "YouTube verification removed"}

# ==================== CREATOR PREMIUM SUBSCRIPTION ====================
import cashfree_pg
from cashfree_pg.models.create_order_request import CreateOrderRequest
from cashfree_pg.models.customer_details import CustomerDetails
from cashfree_pg.models.order_meta import OrderMeta

# Configure Cashfree (set globally)
cashfree_client_id = os.getenv('CASHFREE_CLIENT_ID', '')
cashfree_client_secret = os.getenv('CASHFREE_CLIENT_SECRET', '')
cashfree_env = os.getenv('CASHFREE_ENV', 'SANDBOX')

# Premium subscription plans
PREMIUM_PLANS = {
    "monthly": {
        "price": 99.00,  # ₹99/month
        "duration_days": 30,
        "name": "Monthly Premium",
        "features": [
            "Top position in search results",
            "Premium badge on profile",
            "Priority project recommendations",
            "Featured in creator listings"
        ]
    },
    "yearly": {
        "price": 999.00,  # ₹999/year (saves ₹189)
        "duration_days": 365,
        "name": "Yearly Premium",
        "features": [
            "Top position in search results",
            "Premium badge on profile",
            "Priority project recommendations",
            "Featured in creator listings",
            "2 months free (₹189 savings)"
        ]
    }
}

@api_router.get("/premium/plans")
async def get_premium_plans():
    """Get available premium subscription plans"""
    return {"plans": PREMIUM_PLANS}

@api_router.post("/creators/premium/checkout")
async def create_premium_checkout(
    plan_type: str,
    origin_url: str,
    current_user: User = Depends(get_current_user)
):
    """Create Cashfree order for premium subscription"""
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can subscribe to premium")
    
    # Validate plan
    if plan_type not in PREMIUM_PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan type. Choose 'monthly' or 'yearly'")
    
    plan = PREMIUM_PLANS[plan_type]
    amount = plan["price"]
    
    # Check if Cashfree is configured
    if not cashfree_client_id or not cashfree_client_secret:
        raise HTTPException(
            status_code=503, 
            detail="Payment system not configured. Please add Cashfree credentials to enable payments."
        )
    
    try:
        # Generate order ID
        order_id = f"premium_{current_user.user_id}_{uuid.uuid4().hex[:12]}"
        payment_session_id = f"session_{uuid.uuid4().hex[:16]}"
        
        # Store payment transaction
        payment_id = f"pay_{uuid.uuid4().hex[:12]}"
        await db.payment_transactions.insert_one({
            "payment_id": payment_id,
            "order_id": order_id,
            "payment_session_id": payment_session_id,
            "user_id": current_user.user_id,
            "amount": amount,
            "currency": "INR",
            "plan_type": plan_type,
            "product_type": "creator_premium",
            "payment_status": "PENDING",
            "status": "initiated",
            "created_at": datetime.now(timezone.utc),
            "metadata": {
                "plan_name": plan["name"],
                "duration_days": plan["duration_days"]
            }
        })
        
        return {
            "payment_session_id": payment_session_id,
            "order_id": order_id,
            "payment_id": payment_id,
            "amount": amount,
            "plan_type": plan_type
        }
        
    except Exception as e:
        logger.error(f"Failed to create Cashfree order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create checkout: {str(e)}")

@api_router.get("/creators/premium/status/{order_id}")
async def check_premium_payment_status(
    order_id: str,
    current_user: User = Depends(get_current_user)
):
    """Check status of premium subscription payment"""
    # Get payment transaction
    payment = await db.payment_transactions.find_one(
        {"order_id": order_id, "user_id": current_user.user_id},
        {"_id": 0}
    )
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # If already processed, return status
    if payment.get("payment_status") in ["SUCCESS", "PAID"]:
        return {
            "payment_status": "SUCCESS",
            "status": "completed",
            "message": "Premium subscription activated"
        }
    
    # Return pending status (will be updated by webhook when payment completes)
    return {
        "payment_status": payment.get("payment_status", "PENDING"),
        "status": payment.get("status", "pending"),
        "amount": payment.get("amount"),
        "currency": payment.get("currency", "INR")
    }

@api_router.post("/cashfree/webhook")
async def cashfree_webhook(request: Request):
    """Handle Cashfree webhook events"""
    try:
        body = await request.body()
        event_data = await request.json()
        
        event_type = event_data.get("type")
        data = event_data.get("data", {})
        
        logger.info(f"Processing Cashfree webhook event: {event_type}")
        
        # Handle payment success
        if event_type == "PAYMENT_SUCCESS_WEBHOOK":
            order_id = data.get("order", {}).get("order_id")
            
            if order_id:
                # Get payment transaction
                payment = await db.payment_transactions.find_one({"order_id": order_id}, {"_id": 0})
                
                if payment and payment.get("status") != "completed":
                    user_id = payment.get("user_id")
                    plan_type = payment.get("plan_type", "monthly")
                    
                    duration_days = PREMIUM_PLANS[plan_type]["duration_days"]
                    premium_until = datetime.now(timezone.utc) + timedelta(days=duration_days)
                    
                    # Activate premium
                    await db.users.update_one(
                        {"user_id": user_id},
                        {"$set": {
                            "is_premium": True,
                            "premium_plan": plan_type,
                            "premium_until": premium_until,
                            "premium_activated_at": datetime.now(timezone.utc)
                        }}
                    )
                    
                    # Mark payment as completed
                    await db.payment_transactions.update_one(
                        {"order_id": order_id},
                        {"$set": {
                            "payment_status": "SUCCESS",
                            "status": "completed",
                            "completed_at": datetime.now(timezone.utc)
                        }}
                    )
                    
                    logger.info(f"Premium activated via webhook for user {user_id}")
        
        # Always return 200 to acknowledge receipt
        return {"status": "ok"}
        
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}

@api_router.get("/creators/premium/my-subscription")
async def get_my_premium_subscription(current_user: User = Depends(get_current_user)):
    """Get current user's premium subscription status"""
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can view premium status")
    
    is_premium = current_user.is_premium or False
    premium_until = current_user.premium_until
    
    # Check if premium expired
    if is_premium and premium_until and premium_until < datetime.now(timezone.utc):
        is_premium = False
        await db.users.update_one(
            {"user_id": current_user.user_id},
            {"$set": {"is_premium": False}}
        )
    
    return {
        "is_premium": is_premium,
        "premium_plan": current_user.premium_plan if is_premium else None,
        "premium_until": premium_until.isoformat() if premium_until else None,
        "days_remaining": (premium_until - datetime.now(timezone.utc)).days if premium_until and is_premium else 0
    }

@api_router.delete("/creators/premium/cancel")
async def cancel_premium_subscription(current_user: User = Depends(get_current_user)):
    """Cancel premium subscription"""
    if current_user.role != "creator":
        raise HTTPException(status_code=403, detail="Only creators can cancel premium")
    
    await db.users.update_one(
        {"user_id": current_user.user_id},
        {"$set": {
            "is_premium": False,
            "premium_plan": None,
            "premium_until": None
        }}
    )
    
    return {"message": "Premium subscription cancelled"}

# ==================== ADMIN WALLET MANAGEMENT ====================

@api_router.get("/admin/wallets")
async def get_all_wallets(
    search: Optional[str] = None,
    role: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get all user wallets with optional search and filters"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Build query
        user_query = {}
        if search:
            user_query["$or"] = [
                {"email": {"$regex": search, "$options": "i"}},
                {"name": {"$regex": search, "$options": "i"}},
                {"user_id": {"$regex": search, "$options": "i"}}
            ]
        
        if role and role != "all":
            user_query["role"] = role
        
        # Get users
        users = await db.users.find(user_query, {"_id": 0}).to_list(1000)
        
        # Get wallet data for each user
        wallets_data = []
        for user in users:
            wallet = await db.wallets.find_one({"user_id": user["user_id"]}, {"_id": 0})
            
            if not wallet:
                # Create wallet if doesn't exist
                wallet = {
                    "user_id": user["user_id"],
                    "balance": 0.0,
                    "currency": "INR",
                    "created_at": datetime.now(timezone.utc)
                }
                await db.wallets.insert_one(wallet)
            
            wallets_data.append({
                "user_id": user["user_id"],
                "name": user.get("name", "Unknown"),
                "email": user.get("email", ""),
                "role": user.get("role", ""),
                "balance": wallet.get("balance", 0.0),
                "currency": wallet.get("currency", "INR"),
                "created_at": wallet.get("created_at")
            })
        
        return {"wallets": wallets_data, "total": len(wallets_data)}
        
    except Exception as e:
        logger.error(f"Failed to fetch wallets: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch wallets")

@api_router.get("/admin/wallets/{user_id}")
async def get_wallet_details(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed wallet information for a specific user"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Get user
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get wallet
        wallet = await db.wallets.find_one({"user_id": user_id}, {"_id": 0})
        
        if not wallet:
            wallet = {
                "user_id": user_id,
                "balance": 0.0,
                "currency": "INR",
                "created_at": datetime.now(timezone.utc)
            }
            await db.wallets.insert_one(wallet)
        
        return {
            "user": {
                "user_id": user["user_id"],
                "name": user.get("name", "Unknown"),
                "email": user.get("email", ""),
                "role": user.get("role", "")
            },
            "wallet": {
                "balance": wallet.get("balance", 0.0),
                "currency": wallet.get("currency", "INR"),
                "created_at": wallet.get("created_at")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch wallet details: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch wallet details")

@api_router.get("/admin/wallets/{user_id}/transactions")
async def get_user_wallet_transactions(
    user_id: str,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    """Get wallet transactions for a specific user - Admin only"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    transactions = await db.wallet_transactions.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {"transactions": transactions, "count": len(transactions)}


class WalletAdjustmentAdmin(BaseModel):
    amount: float
    adjustment_type: str  # "credit" or "debit"
    reason: str
    notes: Optional[str] = None

@api_router.post("/admin/wallets/{user_id}/adjust")
async def adjust_user_wallet(
    user_id: str,
    adjustment: WalletAdjustmentAdmin,
    current_user: User = Depends(get_current_user)
):
    """Adjust wallet balance for a user - Admin only"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    wallet = await get_or_create_wallet(user_id)
    
    operation = "credit" if adjustment.adjustment_type == "credit" else "debit"
    new_balance = await update_wallet_balance(user_id, adjustment.amount, operation)
    
    await add_wallet_transaction(
        wallet["wallet_id"],
        user_id,
        adjustment.amount,
        f"admin_{adjustment.adjustment_type}",
        f"Admin adjustment: {adjustment.reason}",
        f"admin_{current_user.user_id}",
        {
            "adjusted_by": current_user.user_id,
            "adjustment_type": adjustment.adjustment_type,
            "reason": adjustment.reason,
            "notes": adjustment.notes
        }
    )
    
    return {
        "message": f"Wallet {adjustment.adjustment_type}ed successfully",
        "new_balance": new_balance,
        "amount": adjustment.amount
    }

@api_router.get("/admin/wallet-adjustments")
async def get_wallet_adjustments(
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """Get all manual wallet adjustments made by admins"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Get all admin adjustments
        adjustments = await db.wallet_transactions.find(
            {"type": {"$in": ["admin_credit", "admin_debit"]}},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        # Enrich with user details
        enriched_adjustments = []
        for adj in adjustments:
            user = await db.users.find_one(
                {"user_id": adj.get("user_id")},
                {"_id": 0, "name": 1, "email": 1, "role": 1}
            )
            
            enriched_adjustments.append({
                **adj,
                "user_name": user.get("name", "Unknown") if user else "Unknown",
                "user_email": user.get("email", "") if user else "",
                "user_role": user.get("role", "") if user else ""
            })
        
        return {
            "adjustments": enriched_adjustments,
            "total": len(enriched_adjustments)
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch adjustments: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch adjustments")

# ==================== BUSINESS REFUND BANK DETAILS ====================

class BankDetails(BaseModel):
    account_holder_name: str
    account_number: str
    ifsc_code: str
    bank_name: str
    branch_name: Optional[str] = None
    account_type: str  # "savings" or "current"

@api_router.post("/business/bank-details")
async def save_bank_details(
    bank_details: BankDetails,
    current_user: User = Depends(get_current_user)
):
    """Save or update bank details for refunds"""
    if current_user.role != "business":
        raise HTTPException(status_code=403, detail="Only businesses can add bank details")
    
    # Validate IFSC code format (11 characters, first 4 alpha, 5th is 0, last 6 alphanumeric)
    import re
    ifsc_pattern = r'^[A-Z]{4}0[A-Z0-9]{6}$'
    if not re.match(ifsc_pattern, bank_details.ifsc_code.upper()):
        raise HTTPException(
            status_code=400,
            detail="Invalid IFSC code format. Example: SBIN0001234"
        )
    
    # Validate account number (typically 9-18 digits)
    if not bank_details.account_number.isdigit() or len(bank_details.account_number) < 9 or len(bank_details.account_number) > 18:
        raise HTTPException(
            status_code=400,
            detail="Account number must be 9-18 digits"
        )
    
    # Validate account type
    if bank_details.account_type.lower() not in ["savings", "current"]:
        raise HTTPException(
            status_code=400,
            detail="Account type must be 'savings' or 'current'"
        )
    
    try:
        # Check if bank details already exist
        existing = await db.bank_details.find_one({"user_id": current_user.user_id}, {"_id": 0})
        
        bank_data = {
            "user_id": current_user.user_id,
            "account_holder_name": bank_details.account_holder_name.strip(),
            "account_number": bank_details.account_number,
            "ifsc_code": bank_details.ifsc_code.upper(),
            "bank_name": bank_details.bank_name.strip(),
            "branch_name": bank_details.branch_name.strip() if bank_details.branch_name else None,
            "account_type": bank_details.account_type.lower(),
            "updated_at": datetime.now(timezone.utc)
        }
        
        if existing:
            # Update existing
            await db.bank_details.update_one(
                {"user_id": current_user.user_id},
                {"$set": bank_data}
            )
            message = "Bank details updated successfully"
        else:
            # Create new
            bank_data["created_at"] = datetime.now(timezone.utc)
            await db.bank_details.insert_one(bank_data)
            message = "Bank details saved successfully"
        
        logger.info(f"Bank details saved for business: {current_user.user_id}")
        
        return {
            "message": message,
            "bank_details": {
                "account_holder_name": bank_data["account_holder_name"],
                "account_number": "XXXX" + bank_data["account_number"][-4:],  # Mask account number
                "ifsc_code": bank_data["ifsc_code"],
                "bank_name": bank_data["bank_name"],
                "branch_name": bank_data["branch_name"],
                "account_type": bank_data["account_type"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to save bank details: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save bank details")

@api_router.get("/business/bank-details")
async def get_bank_details(current_user: User = Depends(get_current_user)):
    """Get saved bank details"""
    if current_user.role != "business":
        raise HTTPException(status_code=403, detail="Only businesses can view bank details")
    
    try:
        bank_details = await db.bank_details.find_one(
            {"user_id": current_user.user_id},
            {"_id": 0}
        )
        
        if not bank_details:
            return {"bank_details": None}
        
        # Mask sensitive information
        return {
            "bank_details": {
                "account_holder_name": bank_details.get("account_holder_name"),
                "account_number": "XXXX" + bank_details.get("account_number", "")[-4:],
                "account_number_full": bank_details.get("account_number"),  # For editing
                "ifsc_code": bank_details.get("ifsc_code"),
                "bank_name": bank_details.get("bank_name"),
                "branch_name": bank_details.get("branch_name"),
                "account_type": bank_details.get("account_type"),
                "updated_at": bank_details.get("updated_at")
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch bank details: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch bank details")

@api_router.delete("/business/bank-details")
async def delete_bank_details(current_user: User = Depends(get_current_user)):
    """Delete saved bank details"""
    if current_user.role != "business":
        raise HTTPException(status_code=403, detail="Only businesses can delete bank details")
    
    try:
        result = await db.bank_details.delete_one({"user_id": current_user.user_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="No bank details found")
        
        logger.info(f"Bank details deleted for business: {current_user.user_id}")
        
        return {"message": "Bank details deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete bank details: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete bank details")

# ==================== ADMIN PLATFORM CONFIGURATION ====================

class PlatformConfig(BaseModel):
    escrow_fee_percentage: float  # Platform fee on transactions (e.g., 10.0 for 10%)
    gst_percentage: float  # GST on platform fee (e.g., 18.0 for 18%)
    business_subscription_monthly: float  # Monthly subscription for businesses
    business_subscription_yearly: float  # Yearly subscription for businesses
    creator_premium_monthly: float  # Creator premium monthly
    creator_premium_yearly: float  # Creator premium yearly
    monthly_creator_limit: int  # Free tier creator view limit

@api_router.get("/admin/platform-config")
async def get_platform_config(current_user: User = Depends(get_current_user)):
    """Get current platform configuration"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Get config from database
        config = await db.platform_config.find_one({"config_type": "main"}, {"_id": 0})
        
        if not config:
            # Return default config if none exists
            default_config = {
                "config_type": "main",
                "escrow_fee_percentage": 10.0,
                "gst_percentage": 18.0,
                "business_subscription_monthly": 999.0,
                "business_subscription_yearly": 9999.0,
                "creator_premium_monthly": 99.0,
                "creator_premium_yearly": 999.0,
                "monthly_creator_limit": 25,
                "updated_at": datetime.now(timezone.utc),
                "updated_by": None
            }
            # Save default config
            await db.platform_config.insert_one(default_config)
            return {"config": default_config}
        
        return {"config": config}
        
    except Exception as e:
        logger.error(f"Failed to fetch platform config: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch platform configuration")

@api_router.put("/admin/platform-config")
async def update_platform_config(
    config: PlatformConfig,
    current_user: User = Depends(get_current_user)
):
    """Update platform configuration"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Validate config values
    if config.escrow_fee_percentage < 0 or config.escrow_fee_percentage > 100:
        raise HTTPException(status_code=400, detail="Escrow fee must be between 0-100%")
    
    if config.gst_percentage < 0 or config.gst_percentage > 100:
        raise HTTPException(status_code=400, detail="GST must be between 0-100%")
    
    if config.business_subscription_monthly <= 0:
        raise HTTPException(status_code=400, detail="Business subscription monthly must be positive")
    
    if config.business_subscription_yearly <= 0:
        raise HTTPException(status_code=400, detail="Business subscription yearly must be positive")
    
    if config.creator_premium_monthly <= 0:
        raise HTTPException(status_code=400, detail="Creator premium monthly must be positive")
    
    if config.creator_premium_yearly <= 0:
        raise HTTPException(status_code=400, detail="Creator premium yearly must be positive")
    
    if config.monthly_creator_limit < 0:
        raise HTTPException(status_code=400, detail="Monthly creator limit must be non-negative")
    
    try:
        # Get current config for audit
        current_config = await db.platform_config.find_one({"config_type": "main"}, {"_id": 0})
        
        new_config = {
            "config_type": "main",
            "escrow_fee_percentage": config.escrow_fee_percentage,
            "gst_percentage": config.gst_percentage,
            "business_subscription_monthly": config.business_subscription_monthly,
            "business_subscription_yearly": config.business_subscription_yearly,
            "creator_premium_monthly": config.creator_premium_monthly,
            "creator_premium_yearly": config.creator_premium_yearly,
            "monthly_creator_limit": config.monthly_creator_limit,
            "updated_at": datetime.now(timezone.utc),
            "updated_by": current_user.user_id
        }
        
        # Update config
        await db.platform_config.update_one(
            {"config_type": "main"},
            {"$set": new_config},
            upsert=True
        )
        
        # Create audit log entry
        audit_entry = {
            "config_type": "main",
            "changes": {},
            "changed_by": current_user.user_id,
            "changed_by_email": current_user.email,
            "changed_at": datetime.now(timezone.utc)
        }
        
        # Track what changed
        if current_config:
            for key in ["escrow_fee_percentage", "gst_percentage", "business_subscription_monthly",
                       "business_subscription_yearly", "creator_premium_monthly", "creator_premium_yearly",
                       "monthly_creator_limit"]:
                old_val = current_config.get(key)
                new_val = new_config.get(key)
                if old_val != new_val:
                    audit_entry["changes"][key] = {
                        "old": old_val,
                        "new": new_val
                    }
        
        # Save audit log
        if audit_entry["changes"]:
            await db.platform_config_history.insert_one(audit_entry)
        
        logger.info(f"Platform config updated by admin: {current_user.user_id}")
        
        return {
            "message": "Platform configuration updated successfully",
            "config": new_config
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update platform config: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update platform configuration")

@api_router.get("/admin/platform-config/history")
async def get_config_history(
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    """Get platform configuration change history"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        history = await db.platform_config_history.find(
            {"config_type": "main"},
            {"_id": 0}
        ).sort("changed_at", -1).limit(limit).to_list(limit)
        
        return {"history": history, "total": len(history)}
        
    except Exception as e:
        logger.error(f"Failed to fetch config history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch configuration history")

# ==================== ADMIN ANALYTICS ====================

@api_router.get("/admin/analytics/overview")
async def get_analytics_overview(
    days: int = 30,
    current_user: User = Depends(get_current_user)
):
    """Get platform overview analytics"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Calculate date range
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days) if days > 0 else datetime(2020, 1, 1, tzinfo=timezone.utc)
        
        # Total users by role
        total_creators = await db.users.count_documents({"role": "creator"})
        total_businesses = await db.users.count_documents({"role": "business"})
        total_admins = await db.users.count_documents({"role": "admin"})
        total_users = total_creators + total_businesses + total_admins
        
        # New users in period
        new_creators = await db.users.count_documents({
            "role": "creator",
            "created_at": {"$gte": start_date}
        }) if days > 0 else total_creators
        
        new_businesses = await db.users.count_documents({
            "role": "business",
            "created_at": {"$gte": start_date}
        }) if days > 0 else total_businesses
        
        # Active projects
        total_projects = await db.projects.count_documents({})
        active_projects = await db.projects.count_documents({
            "status": {"$in": ["pending", "in_progress", "submitted"]}
        })
        completed_projects = await db.projects.count_documents({"status": "completed"})
        
        # Premium creators
        premium_creators = await db.users.count_documents({
            "role": "creator",
            "is_premium": True,
            "premium_until": {"$gte": end_date}
        })
        
        # Wallet statistics
        all_wallets = await db.wallets.find({}, {"_id": 0, "balance": 1}).to_list(10000)
        total_wallet_balance = sum(w.get("balance", 0) for w in all_wallets)
        
        # Transaction volume
        transactions = await db.wallet_transactions.find({
            "created_at": {"$gte": start_date}
        }, {"_id": 0, "amount": 1, "type": 1}).to_list(10000)
        
        total_transaction_volume = sum(t.get("amount", 0) for t in transactions)
        total_transactions = len(transactions)
        
        return {
            "period_days": days,
            "users": {
                "total": total_users,
                "creators": total_creators,
                "businesses": total_businesses,
                "admins": total_admins,
                "new_creators": new_creators,
                "new_businesses": new_businesses
            },
            "projects": {
                "total": total_projects,
                "active": active_projects,
                "completed": completed_projects
            },
            "premium": {
                "total_premium_creators": premium_creators
            },
            "financial": {
                "total_wallet_balance": round(total_wallet_balance, 2),
                "transaction_volume": round(total_transaction_volume, 2),
                "transaction_count": total_transactions
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch analytics overview: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics")

@api_router.get("/admin/analytics/growth")
async def get_growth_analytics(current_user: User = Depends(get_current_user)):
    """Get user growth analytics over time"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Get user registrations grouped by month (last 12 months)
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=365)
        
        # Aggregate users by month
        pipeline = [
            {
                "$match": {
                    "created_at": {"$gte": start_date}
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$created_at"},
                        "month": {"$month": "$created_at"},
                        "role": "$role"
                    },
                    "count": {"$sum": 1}
                }
            },
            {
                "$sort": {"_id.year": 1, "_id.month": 1}
            }
        ]
        
        growth_data = await db.users.aggregate(pipeline).to_list(1000)
        
        return {"growth_data": growth_data}
        
    except Exception as e:
        logger.error(f"Failed to fetch growth analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch growth analytics")

@api_router.get("/admin/analytics/revenue")
async def get_revenue_analytics(
    days: int = 30,
    current_user: User = Depends(get_current_user)
):
    """Get revenue analytics"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days) if days > 0 else datetime(2020, 1, 1, tzinfo=timezone.utc)
        
        # Get all payment transactions in period
        payments = await db.payment_transactions.find({
            "created_at": {"$gte": start_date},
            "payment_status": {"$in": ["paid", "SUCCESS", "PAID"]}
        }, {"_id": 0, "amount": 1, "product_type": 1, "plan_type": 1}).to_list(10000)
        
        # Calculate revenue by type
        total_revenue = sum(p.get("amount", 0) for p in payments)
        
        premium_revenue = sum(
            p.get("amount", 0) for p in payments 
            if p.get("product_type") == "creator_premium"
        )
        
        subscription_revenue = sum(
            p.get("amount", 0) for p in payments 
            if p.get("product_type") == "business_subscription"
        )
        
        # Get platform fees from completed projects
        completed_projects = await db.projects.find({
            "status": "completed",
            "completed_at": {"$gte": start_date}
        }, {"_id": 0, "budget": 1, "fees": 1}).to_list(10000)
        
        platform_fees = sum(
            p.get("fees", {}).get("platform_fee", 0) for p in completed_projects
        )
        
        return {
            "period_days": days,
            "total_revenue": round(total_revenue, 2),
            "premium_subscriptions": round(premium_revenue, 2),
            "business_subscriptions": round(subscription_revenue, 2),
            "platform_fees": round(platform_fees, 2),
            "payment_count": len(payments),
            "completed_projects": len(completed_projects)
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch revenue analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch revenue analytics")


# ========================
# ADMIN DISPUTE MANAGEMENT
# ========================

@api_router.get("/admin/disputes")
async def get_all_disputes(current_user: User = Depends(get_current_user)):
    """Get all disputes for admin"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    disputes = await db.disputes.find({}, {"_id": 0}).to_list(1000)
    
    # Enrich with project titles
    for dispute in disputes:
        project = await db.projects.find_one({"project_id": dispute["project_id"]}, {"_id": 0, "title": 1})
        if project:
            dispute["project_title"] = project.get("title", "Unknown Project")
    
    # Sort by raised_at descending
    disputes.sort(key=lambda x: x.get("raised_at", ""), reverse=True)
    
    return disputes

@api_router.patch("/admin/disputes/{dispute_id}/resolve")
async def resolve_dispute(
    dispute_id: str,
    resolution_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Resolve a dispute"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    dispute = await db.disputes.find_one({"dispute_id": dispute_id}, {"_id": 0})
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    if dispute["status"] == "resolved":
        raise HTTPException(status_code=400, detail="Dispute already resolved")
    
    resolution = resolution_data.get("resolution")
    admin_notes = resolution_data.get("admin_notes", "")
    
    if not resolution:
        raise HTTPException(status_code=400, detail="Resolution type required")
    
    # Get project and escrow details
    project = await db.projects.find_one({"project_id": dispute["project_id"]}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    escrow = await db.escrow.find_one({"project_id": project["project_id"]}, {"_id": 0})
    if not escrow:
        raise HTTPException(status_code=404, detail="Escrow not found for this project")
    
    # Get user IDs
    business_user = await db.users.find_one({"user_id": project["business_id"]}, {"_id": 0})
    creator_user = await db.users.find_one({"user_id": project["creator_id"]}, {"_id": 0})
    
    # Handle resolution
    if resolution == "favor_creator":
        # Release payment to creator, refund business
        creator_amount = escrow["creator_receives"]
        business_refund = escrow["business_paid"] - creator_amount
        
        # Pay creator
        await update_wallet_balance(creator_user["user_id"], creator_amount, "credit")
        await db.wallet_transactions.insert_one({
            "transaction_id": f"txn_{uuid.uuid4().hex[:16]}",
            "user_id": creator_user["user_id"],
            "amount": creator_amount,
            "transaction_type": "payout",
            "description": f"Dispute resolved in your favor: {project['title']}",
            "balance_after": (await db.wallets.find_one({"user_id": creator_user["user_id"]}, {"_id": 0}))["balance"],
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Refund business
        if business_refund > 0:
            await update_wallet_balance(business_user["user_id"], business_refund, "credit")
            await db.wallet_transactions.insert_one({
                "transaction_id": f"txn_{uuid.uuid4().hex[:16]}",
                "user_id": business_user["user_id"],
                "amount": business_refund,
                "transaction_type": "refund",
                "description": f"Partial refund for dispute: {project['title']}",
                "balance_after": (await db.wallets.find_one({"user_id": business_user["user_id"]}, {"_id": 0}))["balance"],
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        
        # Update escrow
        await db.escrow.update_one(
            {"escrow_id": escrow["escrow_id"]},
            {"$set": {"status": "released", "released_at": datetime.now(timezone.utc).isoformat()}}
        )
        
    elif resolution == "favor_business":
        # Full refund to business
        refund_amount = escrow["business_paid"]
        
        await update_wallet_balance(business_user["user_id"], refund_amount, "credit")
        await db.wallet_transactions.insert_one({
            "transaction_id": f"txn_{uuid.uuid4().hex[:16]}",
            "user_id": business_user["user_id"],
            "amount": refund_amount,
            "transaction_type": "refund",
            "description": f"Full refund for dispute: {project['title']}",
            "balance_after": (await db.wallets.find_one({"user_id": business_user["user_id"]}, {"_id": 0}))["balance"],
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Update escrow
        await db.escrow.update_one(
            {"escrow_id": escrow["escrow_id"]},
            {"$set": {"status": "refunded", "refunded_at": datetime.now(timezone.utc).isoformat()}}
        )
        
    elif resolution == "partial":
        # Split 50/50 between creator and business
        total_amount = escrow["business_paid"]
        creator_amount = total_amount * 0.5
        business_refund = total_amount * 0.5
        
        # Pay creator 50%
        await update_wallet_balance(creator_user["user_id"], creator_amount, "credit")
        await db.wallet_transactions.insert_one({
            "transaction_id": f"txn_{uuid.uuid4().hex[:16]}",
            "user_id": creator_user["user_id"],
            "amount": creator_amount,
            "transaction_type": "payout",
            "description": f"Partial payment (50%) for dispute: {project['title']}",
            "balance_after": (await db.wallets.find_one({"user_id": creator_user["user_id"]}, {"_id": 0}))["balance"],
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Refund business 50%
        await update_wallet_balance(business_user["user_id"], business_refund, "credit")
        await db.wallet_transactions.insert_one({
            "transaction_id": f"txn_{uuid.uuid4().hex[:16]}",
            "user_id": business_user["user_id"],
            "amount": business_refund,
            "transaction_type": "refund",
            "description": f"Partial refund (50%) for dispute: {project['title']}",
            "balance_after": (await db.wallets.find_one({"user_id": business_user["user_id"]}, {"_id": 0}))["balance"],
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Update escrow
        await db.escrow.update_one(
            {"escrow_id": escrow["escrow_id"]},
            {"$set": {"status": "partially_released", "released_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    # Update dispute status
    await db.disputes.update_one(
        {"dispute_id": dispute_id},
        {"$set": {
            "status": "resolved",
            "resolution": resolution,
            "admin_notes": admin_notes,
            "resolved_at": datetime.now(timezone.utc).isoformat(),
            "resolved_by": current_user.user_id
        }}
    )
    
    # Update project status
    await db.projects.update_one(
        {"project_id": project["project_id"]},
        {"$set": {"status": "disputed_resolved"}}
    )
    
    return {"message": "Dispute resolved successfully", "resolution": resolution}


# ========================
# ADMIN PAYOUT MANAGEMENT
# ========================

@api_router.get("/admin/payouts")
async def get_all_payouts(
    days: int = 30,
    current_user: User = Depends(get_current_user)
):
    """Get all payout transactions for admin"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Calculate date range
    if days == 0 or days == 999:  # "all" time
        start_date = datetime(2020, 1, 1, tzinfo=timezone.utc)
    else:
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Get all payout transactions
    payouts = await db.wallet_transactions.find({
        "transaction_type": "payout",
        "created_at": {"$gte": start_date.isoformat()}
    }, {"_id": 0}).to_list(10000)
    
    # Enrich with user and project details
    for payout in payouts:
        # Get creator name
        user = await db.users.find_one({"user_id": payout["user_id"]}, {"_id": 0, "name": 1, "email": 1})
        if user:
            payout["creator_name"] = user.get("name", "Unknown")
            payout["creator_email"] = user.get("email", "N/A")
        
        # Try to extract project title from description
        if "project" in payout.get("description", "").lower():
            # Description format: "Your work on 'Project Title' has been approved..."
            desc = payout.get("description", "")
            if "'" in desc:
                start = desc.find("'")
                end = desc.find("'", start + 1)
                if start != -1 and end != -1:
                    payout["project_title"] = desc[start + 1:end]
    
    # Sort by created_at descending
    payouts.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    
    return payouts

@api_router.get("/admin/payout-stats")
async def get_payout_stats(
    days: int = 30,
    current_user: User = Depends(get_current_user)
):
    """Get payout statistics for admin"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Calculate date range
    if days == 0 or days == 999:  # "all" time
        start_date = datetime(2020, 1, 1, tzinfo=timezone.utc)
    else:
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Get all payout transactions
    payouts = await db.wallet_transactions.find({
        "transaction_type": "payout",
        "created_at": {"$gte": start_date.isoformat()}
    }, {"_id": 0, "amount": 1}).to_list(10000)
    
    total_count = len(payouts)
    total_amount = sum(p.get("amount", 0) for p in payouts)
    
    # For now, all payouts are completed (auto-payout system)
    # In future, can add pending status for manual approvals
    completed_count = total_count
    completed_amount = total_amount
    pending_count = 0
    pending_amount = 0
    
    average_payout = total_amount / total_count if total_count > 0 else 0
    
    return {
        "total_count": total_count,
        "total_amount": round(total_amount, 2),
        "completed_count": completed_count,
        "completed_amount": round(completed_amount, 2),
        "pending_count": pending_count,
        "pending_amount": round(pending_amount, 2),
        "average_payout": round(average_payout, 2),
        "period_days": days
    }


@app.on_event("startup")
async def startup_event():
    """Run on application startup - seed admin user"""
    logger.info("Starting Creabase API...")
    
    # Seed admin user
    try:
        # Check if admin exists
        existing_admin = await db.users.find_one({"email": "admin@creabase.com"})
        
        if not existing_admin:
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            
            admin_id = f"user_{uuid.uuid4().hex[:16]}"
            hashed_password = pwd_context.hash("admin123")
            
            admin_user = {
                "user_id": admin_id,
                "email": "admin@creabase.com",
                "password_hash": hashed_password,
                "name": "Platform Admin",
                "role": "admin",
                "status": "active",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.users.insert_one(admin_user)
            
            # Create admin wallet
            admin_wallet = {
                "wallet_id": f"wallet_{uuid.uuid4().hex[:16]}",
                "user_id": admin_id,
                "balance": 0.0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            await db.wallets.insert_one(admin_wallet)
            
            logger.info("✅ Admin user created: admin@creabase.com")
        else:
            logger.info("✓ Admin user already exists")
    except Exception as e:
        logger.error(f"❌ Failed to seed admin: {str(e)}")





# ==================== SUBSCRIPTION ENDPOINTS ====================

@api_router.post("/subscriptions/checkout")
async def create_subscription_checkout(
    subscription: SubscriptionCreate,
    current_user: User = Depends(get_current_user)
):
    """Create subscription checkout - pays from wallet first, then Cashfree"""
    # Determine subscription details
    user_type = current_user.role  # "business" or "creator"
    plan_type = subscription.plan_type  # "monthly" or "annual"
    
    if user_type not in ["business", "creator"]:
        raise HTTPException(status_code=400, detail="Only business and creator users can subscribe")
    
    if user_type == "business":
        amount = BUSINESS_SUBSCRIPTION_MONTHLY if plan_type == "monthly" else BUSINESS_SUBSCRIPTION_ANNUAL
    else:  # creator
        amount = CREATOR_SUBSCRIPTION_MONTHLY if plan_type == "monthly" else CREATOR_SUBSCRIPTION_ANNUAL
    
    subscription_id = f"sub_{uuid.uuid4().hex[:12]}"
    
    # Try to pay from wallet
    payment_result = await pay_from_wallet_or_cashfree(
        current_user.user_id,
        amount,
        f"{user_type.capitalize()} {plan_type} subscription",
        subscription_id
    )
    
    if not payment_result["success"]:
        # Insufficient balance - return Cashfree payment info
        return {
            "status": "payment_required",
            "subscription_id": subscription_id,
            "payment_info": payment_result,
            "amount": amount,
            "plan_type": plan_type
        }
    
    # Payment successful - activate subscription
    expires_at = datetime.now(timezone.utc) + timedelta(days=30 if plan_type == "monthly" else 365)
    
    subscription_data = {
        "subscription_id": subscription_id,
        "plan": plan_type,
        "status": "active",
        "started_at": datetime.now(timezone.utc),
        "expires_at": expires_at,
        "auto_renew": True,
        "payment_method": payment_result["paid_from"]
    }
    
    # Add features based on user type
    if user_type == "creator":
        subscription_data["features"] = {
            "zero_escrow_fee": True,
            "top_visibility": True,
            "verification_badge": True,
            "tier_badges": True,
            "priority_support": True
        }
    else:  # business
        subscription_data["features"] = {
            "unlimited_chat": True,
            "unlimited_analytics": True,
            "create_projects": True,
            "view_ratings": True,
            "priority_support": True,
            "contact_limit": MONTHLY_CREATOR_LIMIT
        }
    
    await db.users.update_one(
        {"user_id": current_user.user_id},
        {"$set": {f"{user_type}_subscription": subscription_data}}
    )
    
    # Send notification
    await db.notifications.insert_one({
        "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
        "user_id": current_user.user_id,
        "type": "subscription_activated",
        "title": "Subscription Activated!",
        "message": f"Your {plan_type} subscription is now active. Enjoy all premium features!",
        "reference_id": subscription_id,
        "read": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {
        "status": "success",
        "subscription": subscription_data,
        "payment_method": payment_result["paid_from"],
        "message": "Subscription activated successfully!"
    }


@api_router.get("/subscriptions/my-subscription")
async def get_my_subscription(current_user: User = Depends(get_current_user)):
    """Get current user's subscription details"""
    user = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    
    user_type = current_user.role
    subscription_key = f"{user_type}_subscription"
    subscription = user.get(subscription_key, {})
    
    if not subscription:
        return {
            "has_subscription": False,
            "subscription": None,
            "user_type": user_type,
            "message": "No active subscription"
        }
    
    return {
        "has_subscription": subscription.get("status") == "active",
        "subscription": subscription,
        "user_type": user_type
    }


@api_router.post("/subscriptions/cancel")
async def cancel_subscription(current_user: User = Depends(get_current_user)):
    """Cancel user subscription"""
    user_type = current_user.role
    subscription_key = f"{user_type}_subscription"
    
    user = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    subscription = user.get(subscription_key, {})
    
    if not subscription or subscription.get("status") != "active":
        raise HTTPException(status_code=400, detail="No active subscription to cancel")
    
    # Update subscription status
    await db.users.update_one(
        {"user_id": current_user.user_id},
        {"$set": {
            f"{subscription_key}.status": "cancelled",
            f"{subscription_key}.cancelled_at": datetime.now(timezone.utc),
            f"{subscription_key}.auto_renew": False
        }}
    )
    
    return {
        "message": "Subscription cancelled. You can continue using features until end of current period.",
        "expires_at": subscription.get("expires_at")
    }


# ==================== WALLET ENDPOINTS ====================

@api_router.post("/wallet/topup")
async def wallet_topup(
    topup: WalletTopUp,
    current_user: User = Depends(get_current_user)
):
    """Business users can top-up wallet - Creator users cannot"""
    if current_user.role != "business":
        raise HTTPException(
            status_code=403,
            detail="Only business users can top-up wallet. Creators receive funds from completed projects."
        )
    
    if topup.amount < 100 or topup.amount > 100000:
        raise HTTPException(
            status_code=400,
            detail="Top-up amount must be between ₹100 and ₹100,000"
        )
    
    # Create Cashfree order for top-up
    order_id = f"topup_{uuid.uuid4().hex[:12]}"
    
    # In production, create actual Cashfree order here
    # For now, mock the payment and credit wallet immediately
    
    wallet = await get_or_create_wallet(current_user.user_id)
    await update_wallet_balance(current_user.user_id, topup.amount, "credit")
    
    await add_wallet_transaction(
        wallet["wallet_id"],
        current_user.user_id,
        topup.amount,
        "topup",
        f"Wallet top-up via {topup.payment_method}",
        order_id,
        {"payment_method": topup.payment_method, "order_id": order_id}
    )
    
    # Get updated balance
    updated_wallet = await db.wallets.find_one({"user_id": current_user.user_id}, {"_id": 0})
    
    return {
        "status": "success",
        "order_id": order_id,
        "amount": topup.amount,
        "new_balance": updated_wallet["balance"],
        "message": f"₹{topup.amount} added to wallet successfully"
    }


@api_router.post("/wallet/request-payout")
async def request_payout(
    payout: PayoutRequest,
    current_user: User = Depends(get_current_user)
):
    """Creator users can request payout - Business users cannot"""
    if current_user.role != "creator":
        raise HTTPException(
            status_code=403,
            detail="Only creator users can request payout. Business users can top-up wallet."
        )


    
    if payout.amount < 500:
        raise HTTPException(
            status_code=400,
            detail="Minimum payout amount is ₹500"
        )
    
    wallet = await get_or_create_wallet(current_user.user_id)
    
    if wallet["balance"] < payout.amount:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient balance. Your balance: ₹{wallet['balance']}"
        )
    
    # Check for pending payouts
    pending = await db.payout_requests.find_one({
        "creator_id": current_user.user_id,
        "status": {"$in": ["pending", "approved", "processing"]}
    })
    
    if pending:
        raise HTTPException(
            status_code=400,
            detail="You have a pending payout request. Please wait for it to be processed."
        )
    
    payout_id = f"payout_{uuid.uuid4().hex[:12]}"
    
    # Create payout request
    await db.payout_requests.insert_one({
        "payout_id": payout_id,
        "creator_id": current_user.user_id,
        "creator_name": current_user.name,
        "amount": payout.amount,
        "bank_details": {
            "account_holder": payout.bank_account_holder,
            "account_number": payout.bank_account_number,
            "ifsc_code": payout.bank_ifsc_code,
            "bank_name": payout.bank_name
        },
        "status": "pending",
        "requested_at": datetime.now(timezone.utc),
        "approved_by": None,
        "approved_at": None,
        "completed_at": None,
        "rejection_reason": None,
        "admin_notes": ""
    })
    
    # Notify admin
    await db.notifications.insert_one({
        "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
        "user_id": "admin",
        "type": "payout_request",
        "title": "New Payout Request",
        "message": f"{current_user.name} requested payout of ₹{payout.amount}",
        "reference_id": payout_id,
        "read": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {
        "status": "success",
        "payout_id": payout_id,
        "amount": payout.amount,
        "message": "Payout request submitted. Admin will review and process within 2-3 business days."
    }

# Duplicate get_wallet_balance removed (original at line ~2234)


# ==================== ADMIN PAYOUT ENDPOINTS ====================

# Duplicate get_all_payouts removed (original at line ~4807)


@api_router.post("/admin/payouts/{payout_id}/action")
async def payout_action(
    payout_id: str,
    action: PayoutAction,
    current_user: User = Depends(get_current_user)
):
    """Admin: Approve, reject, or complete payout"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    payout = await db.payout_requests.find_one({"payout_id": payout_id}, {"_id": 0})
    if not payout:
        raise HTTPException(status_code=404, detail="Payout request not found")
    
    if action.action == "approve":
        # Approve payout
        await db.payout_requests.update_one(
            {"payout_id": payout_id},
            {"$set": {
                "status": "approved",
                "approved_by": current_user.user_id,
                "approved_at": datetime.now(timezone.utc),
                "admin_notes": action.admin_notes or ""
            }}
        )
        
        # Notify creator
        await db.notifications.insert_one({
            "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
            "user_id": payout["creator_id"],
            "type": "payout_approved",
            "title": "Payout Approved",
            "message": f"Your payout request of ₹{payout['amount']} has been approved. Processing transfer...",
            "reference_id": payout_id,
            "read": False,
            "created_at": datetime.now(timezone.utc)
        })
        
        return {"message": "Payout approved. Please process bank transfer and mark as complete."}
    
    elif action.action == "reject":
        # Reject payout
        await db.payout_requests.update_one(
            {"payout_id": payout_id},
            {"$set": {
                "status": "rejected",
                "rejection_reason": action.rejection_reason,
                "admin_notes": action.admin_notes or "",
                "rejected_at": datetime.now(timezone.utc)
            }}
        )
        
        # Notify creator
        await db.notifications.insert_one({
            "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
            "user_id": payout["creator_id"],
            "type": "payout_rejected",
            "title": "Payout Rejected",
            "message": f"Your payout request of ₹{payout['amount']} was rejected. Reason: {action.rejection_reason}",
            "reference_id": payout_id,
            "read": False,
            "created_at": datetime.now(timezone.utc)
        })
        
        return {"message": "Payout rejected"}
    
    elif action.action == "complete":
        # Complete payout - deduct from wallet
        if payout["status"] not in ["approved", "processing"]:
            raise HTTPException(status_code=400, detail="Payout must be approved first")
        
        # Deduct from wallet
        wallet = await get_or_create_wallet(payout["creator_id"])
        if wallet["balance"] < payout["amount"]:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")
        
        await update_wallet_balance(payout["creator_id"], payout["amount"], "debit")
        
        # Record transaction
        await add_wallet_transaction(
            wallet["wallet_id"],
            payout["creator_id"],
            payout["amount"],
            "withdrawal",
            f"Bank payout to {payout['bank_details']['bank_name']}",
            payout_id,
            {"payout_id": payout_id, "bank_details": payout["bank_details"]}
        )
        
        # Update payout status
        await db.payout_requests.update_one(
            {"payout_id": payout_id},
            {"$set": {
                "status": "completed",
                "completed_at": datetime.now(timezone.utc),
                "completed_by": current_user.user_id,
                "admin_notes": action.admin_notes or ""
            }}
        )
        
        # Notify creator
        await db.notifications.insert_one({
            "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
            "user_id": payout["creator_id"],
            "type": "payout_completed",
            "title": "Payout Completed",
            "message": f"₹{payout['amount']} has been transferred to your bank account. It may take 2-3 business days to reflect.",
            "reference_id": payout_id,
            "read": False,
            "created_at": datetime.now(timezone.utc)
        })
        
        return {"message": "Payout completed successfully. Wallet debited."}
    
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use: approve, reject, or complete")


@api_router.get("/admin/tax-settings")
async def get_tax_settings(current_user: User = Depends(get_current_user)):
    """Get platform tax settings"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    settings = await db.platform_settings.find_one({"setting_type": "tax"}, {"_id": 0})
    
    if not settings:
        # Return defaults
        return {
            "gst_rate": GST_PERCENT,
            "platform_fee_rate": PLATFORM_FEE_PERCENT,
            "tax_id": "GSTIN1234567890",
            "company_name": "Creabase Private Limited",
            "company_address": "Mumbai, Maharashtra, India"
        }
    
    return settings

@api_router.patch("/admin/tax-settings")
async def update_tax_settings(
    settings_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Update platform tax settings"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    settings_data["setting_type"] = "tax"
    settings_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    settings_data["updated_by"] = current_user.user_id
    
    await db.platform_settings.update_one(
        {"setting_type": "tax"},
        {"$set": settings_data},
        upsert=True
    )
    
    return {"message": "Tax settings updated successfully"}



# Include router at the end after all routes are defined
app.include_router(api_router)
