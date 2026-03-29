# Additional Subscription & Wallet Endpoints
# Add these to server.py

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
    
    if user_type == "business":
        amount = BUSINESS_SUBSCRIPTION_MONTHLY if plan_type == "monthly" else BUSINESS_SUBSCRIPTION_ANNUAL
    elif user_type == "creator":
        amount = CREATOR_SUBSCRIPTION_MONTHLY if plan_type == "monthly" else CREATOR_SUBSCRIPTION_ANNUAL
    else:
        raise HTTPException(status_code=400, detail="Only business and creator users can subscribe")
    
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
    
    # Add features for creator subscription
    if user_type == "creator":
        subscription_data["features"] = {
            "zero_escrow_fee": True,
            "top_visibility": True,
            "verification_badge": True,
            "tier_badges": True,
            "priority_support": True
        }
    else:
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
            "message": "No active subscription"
        }
    
    return {
        "has_subscription": subscription.get("status") == "active",
        "subscription": subscription,
        "user_type": user_type
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
    # For now, mock the payment
    
    # After successful payment (webhook), credit wallet
    wallet = await get_or_create_wallet(current_user.user_id)
    await update_wallet_balance(current_user.user_id, topup.amount, "credit")
    
    await add_wallet_transaction(
        wallet["wallet_id"],
        current_user.user_id,
        topup.amount,
        "topup",
        f"Wallet top-up via {topup.payment_method}",
        order_id,
        {"payment_method": topup.payment_method}
    )
    
    return {
        "status": "success",
        "order_id": order_id,
        "amount": topup.amount,
        "new_balance": wallet["balance"] + topup.amount,
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


@api_router.get("/wallet/balance")
async def get_wallet_balance(current_user: User = Depends(get_current_user)):
    """Get wallet balance and recent transactions"""
    wallet = await get_or_create_wallet(current_user.user_id)
    
    # Get recent transactions
    transactions = await db.wallet_transactions.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "wallet_id": wallet["wallet_id"],
        "balance": wallet["balance"],
        "currency": wallet.get("currency", "INR"),
        "recent_transactions": transactions,
        "can_topup": current_user.role == "business",
        "can_withdraw": current_user.role == "creator"
    }


# ==================== ADMIN PAYOUT ENDPOINTS ====================

@api_router.get("/admin/payouts")
async def get_all_payouts(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Admin: Get all payout requests"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = {}
    if status:
        query["status"] = status
    
    payouts = await db.payout_requests.find(query, {"_id": 0}).sort("requested_at", -1).to_list(100)
    
    # Enrich with user details
    for payout in payouts:
        user = await db.users.find_one({"user_id": payout["creator_id"]}, {"_id": 0, "name": 1, "email": 1})
        if user:
            payout["creator_name"] = user["name"]
            payout["creator_email"] = user["email"]
        
        # Get wallet balance
        wallet = await db.wallets.find_one({"user_id": payout["creator_id"]}, {"_id": 0, "balance": 1})
        if wallet:
            payout["wallet_balance"] = wallet["balance"]
    
    return payouts


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
        if payout["status"] != "approved":
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
        
        return {"message": "Payout completed successfully"}
    
    else:
        raise HTTPException(status_code=400, detail="Invalid action")


# ==================== FEATURE-GATED ENDPOINTS ====================

@api_router.post("/messages/send")
async def send_message(
    message: MessageCreate,
    current_user: User = Depends(get_current_user)
):
    """Send message - Business users require subscription"""
    # Check subscription for business users
    if current_user.role == "business":
        await require_business_subscription(current_user)
    
    # Rest of message sending logic...
    message_id = f"msg_{uuid.uuid4().hex[:12]}"
    
    await db.messages.insert_one({
        "message_id": message_id,
        "sender_id": current_user.user_id,
        "receiver_id": message.receiver_id,
        "content": message.content,
        "read": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    # Notify receiver
    await db.notifications.insert_one({
        "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
        "user_id": message.receiver_id,
        "type": "new_message",
        "title": "New Message",
        "message": f"{current_user.name} sent you a message",
        "reference_id": message_id,
        "read": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message_id": message_id, "status": "sent"}


@api_router.get("/creators/{creator_id}/analytics")
async def get_creator_analytics(
    creator_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get creator analytics - Business users require subscription"""
    if current_user.role == "business":
        await require_business_subscription(current_user)
    
    creator = await db.creators.find_one({"creator_id": creator_id}, {"_id": 0})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    # Return detailed analytics
    return {
        "creator_id": creator_id,
        "name": creator.get("name"),
        "instagram_followers": creator.get("instagram_followers", 0),
        "youtube_subscribers": creator.get("youtube_subscribers", 0),
        "avg_views": creator.get("avg_views", 0),
        "engagement_rate": creator.get("engagement_rate", 0),
        "completed_projects": creator.get("completed_projects", 0),
        "average_rating": creator.get("average_rating", 0),
        "response_time_hours": creator.get("avg_response_time_hours", 24)
    }
