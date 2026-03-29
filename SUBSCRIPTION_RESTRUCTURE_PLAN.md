# Subscription & Wallet System Restructuring Plan

## Changes Summary

### 1. Business Subscription Features (₹199/month or ₹1999/year)

**Included Features:**
- ✅ Chat with creators (unlimited)
- ✅ View creator analytics (followers, views - unlimited)
- ✅ Create projects and assign to creators
- ✅ View creator ratings
- ✅ View 25 creator contacts per month
- ✅ ₹15 + GST (₹17.70) per additional contact (PAYG)

**Without Subscription:**
- ❌ Cannot chat with creators
- ❌ Cannot view detailed analytics
- ❌ Cannot create projects
- ❌ Cannot view ratings
- ❌ Can only browse creators (limited info)

---

### 2. Creator Subscription Features (NEW)

**Plans:**
- **Basic Plan:** ₹999/month
- **Pro Plan:** ₹2999/month
- **Enterprise Plan:** ₹4999/month

**Included Features:**
- ✅ Top page visibility (appears higher in search)
- ✅ Verification mark badge
- ✅ Badge tiers based on completed projects:
  - 🥉 **Bronze (100):** 100 projects completed
  - 🥈 **Silver (500):** 500 projects completed
  - 🥇 **Gold (1000):** 1000+ projects completed
- ✅ **ZERO escrow fee** (normally 10% + GST)
  - Business still pays full amount
  - Creator receives 100% instead of 90%
  - Platform earns from subscription instead

**Without Subscription:**
- Standard visibility (normal search ranking)
- No verification badge
- Badge based only on project count (no special tiers)
- Standard 10% + GST escrow fee applies

---

### 3. Subscription Payment Flow

**Priority Order:**
1. **Try Wallet Balance First**
   - Check if wallet has sufficient balance
   - Deduct subscription amount from wallet
   - Create transaction record

2. **Fallback to Cashfree Payment**
   - If wallet balance < subscription amount
   - Redirect to Cashfree gateway
   - After successful payment, activate subscription

**Example:**
```
Subscription: ₹199
Wallet Balance: ₹150
→ Insufficient, redirect to Cashfree for ₹199
→ After payment, activate subscription
```

---

### 4. Wallet Operations Restrictions

#### Business Users
- ✅ **CAN:** Add balance (Top-up)
  - Minimum: ₹100
  - Maximum: ₹1,00,000 per transaction
  - Methods: Cashfree (UPI/Card/Net Banking)
  
- ❌ **CANNOT:** Withdraw balance
  - Wallet balance used for:
    - Subscriptions
    - Project payments
    - PAYG contact charges
  - No refunds to bank

#### Creator Users
- ❌ **CANNOT:** Add balance (Top-up)
  - Wallet receives money from:
    - Completed projects
    - Escrow releases
  
- ✅ **CAN:** Withdraw balance (Payout)
  - Minimum withdrawal: ₹500
  - Maximum withdrawal: Current wallet balance
  - Requires admin approval
  - Bank transfer (2-3 business days)

#### Admin Users
- ✅ **CAN:** View all wallets
- ✅ **CAN:** Manual credit/debit (with reason)
- ✅ **CAN:** Approve/reject payout requests

---

### 5. Payout Approval System

**Creator Requests Payout:**
1. Go to wallet page
2. Click "Request Payout"
3. Enter amount (min ₹500)
4. Confirm bank details
5. Submit request

**Admin Approval Flow:**
1. Admin sees payout request in `/admin/payouts`
2. Reviews:
   - Wallet balance sufficient?
   - Bank details verified?
   - KYC complete?
   - No pending disputes?
3. Clicks "Approve Payout" button
4. System:
   - Marks as "processing"
   - Deducts from creator wallet
   - Creates transaction record
   - Sends notification to creator
5. Admin manually transfers via bank
6. Clicks "Mark as Completed"
7. Status updated to "completed"

**Payout States:**
- `pending` - Waiting for admin review
- `approved` - Admin approved, processing
- `processing` - Bank transfer in progress
- `completed` - Money transferred
- `rejected` - Admin rejected (with reason)

---

## Implementation Checklist

### Backend Changes

#### Phase 1: Update Subscription Models
- [ ] Update business subscription check functions
- [ ] Create creator subscription models
- [ ] Add subscription status to user schema
- [ ] Create subscription plans collection

#### Phase 2: Feature Gating
- [ ] Gate chat endpoint (require business subscription)
- [ ] Gate analytics endpoint (require business subscription)
- [ ] Gate project creation (require business subscription)
- [ ] Gate ratings view (require business subscription)
- [ ] Implement 25 contact limit + PAYG

#### Phase 3: Creator Subscription
- [ ] Create creator subscription checkout endpoint
- [ ] Update creator badge calculation (add tier badges)
- [ ] Update search ranking (prioritize subscribed creators)
- [ ] Add verification badge for subscribed creators

#### Phase 4: Escrow Fee Logic
- [ ] Update fee calculation function
- [ ] Check creator subscription status
- [ ] Apply zero fee if subscribed
- [ ] Update project/escrow creation

#### Phase 5: Wallet Payment Flow
- [ ] Create wallet payment attempt function
- [ ] Fallback to Cashfree if insufficient
- [ ] Update subscription activation
- [ ] Create wallet transaction records

#### Phase 6: Wallet Restrictions
- [ ] Add wallet operation validation
- [ ] Business: Enable top-up, disable withdraw
- [ ] Creator: Enable withdraw, disable top-up
- [ ] Add minimum/maximum limits

#### Phase 7: Payout System
- [ ] Create payout request endpoint
- [ ] Create admin approval endpoint
- [ ] Add payout status management
- [ ] Create notification system
- [ ] Add bank transfer tracking

### Frontend Changes

#### Phase 1: Business Dashboard
- [ ] Add subscription gate modals
- [ ] Show subscription benefits
- [ ] Disable features for non-subscribers
- [ ] Add "Upgrade to access" prompts

#### Phase 2: Creator Dashboard
- [ ] Create creator subscription page
- [ ] Show subscription benefits
- [ ] Display current plan and features
- [ ] Add badge tier progress

#### Phase 3: Wallet UI
- [ ] Business: Add "Top-up Wallet" button
- [ ] Creator: Add "Request Payout" button
- [ ] Show transaction history
- [ ] Display current balance prominently

#### Phase 4: Admin Payout Management
- [ ] Create payout requests table
- [ ] Add approve/reject buttons
- [ ] Show creator bank details
- [ ] Add status filters
- [ ] Create payout history view

### Database Schema Changes

#### Users Collection
```javascript
{
  // Existing fields...
  
  // Business Subscription
  "business_subscription": {
    "plan": "monthly", // "monthly" | "annual" | null
    "status": "active", // "active" | "inactive" | "cancelled"
    "started_at": "2025-03-29T...",
    "expires_at": "2025-04-29T...",
    "auto_renew": true,
    "payment_method": "wallet" // "wallet" | "cashfree"
  },
  
  // Creator Subscription
  "creator_subscription": {
    "plan": "pro", // "basic" | "pro" | "enterprise" | null
    "status": "active",
    "started_at": "2025-03-29T...",
    "expires_at": "2025-04-29T...",
    "auto_renew": true,
    "features": {
      "zero_escrow_fee": true,
      "top_visibility": true,
      "verification_badge": true,
      "tier_badges": true
    }
  }
}
```

#### Wallet Transactions Collection
```javascript
{
  "transaction_id": "txn_abc123",
  "wallet_id": "wallet_xyz789",
  "user_id": "user_123",
  "amount": 199.00,
  "type": "subscription", // "topup" | "subscription" | "project" | "payout" | "payg"
  "operation": "debit", // "credit" | "debit"
  "description": "Monthly subscription renewal",
  "reference_id": "sub_abc123",
  "balance_before": 500.00,
  "balance_after": 301.00,
  "status": "completed",
  "created_at": "2025-03-29T..."
}
```

#### Payout Requests Collection
```javascript
{
  "payout_id": "payout_abc123",
  "creator_id": "user_xyz789",
  "amount": 10000.00,
  "bank_details": {
    "account_holder": "Priya Sharma",
    "account_number": "1234567890",
    "ifsc_code": "HDFC0001234",
    "bank_name": "HDFC Bank"
  },
  "status": "pending", // "pending" | "approved" | "processing" | "completed" | "rejected"
  "requested_at": "2025-03-29T...",
  "approved_by": "admin_user_id",
  "approved_at": "2025-03-29T...",
  "completed_at": null,
  "rejection_reason": null,
  "admin_notes": "",
  "transaction_reference": "txn_abc123"
}
```

#### Creator Badge Tiers Collection
```javascript
{
  "tier_id": "tier_100",
  "name": "Bronze",
  "icon": "🥉",
  "projects_required": 100,
  "color": "#CD7F32",
  "benefits": [
    "100 Projects Achievement",
    "Bronze Badge Display",
    "Trust Indicator"
  ]
}
```

---

## API Endpoints to Create/Update

### Subscription Endpoints

```
POST   /api/subscriptions/business/checkout
POST   /api/subscriptions/creator/checkout
GET    /api/subscriptions/my-subscription
POST   /api/subscriptions/cancel
POST   /api/subscriptions/renew
GET    /api/subscriptions/payment-history
```

### Wallet Endpoints

```
POST   /api/wallet/topup (Business only)
POST   /api/wallet/request-payout (Creator only)
GET    /api/wallet/balance
GET    /api/wallet/transactions
```

### Admin Payout Endpoints

```
GET    /api/admin/payouts
GET    /api/admin/payouts/{payout_id}
POST   /api/admin/payouts/{payout_id}/approve
POST   /api/admin/payouts/{payout_id}/reject
POST   /api/admin/payouts/{payout_id}/complete
```

### Feature-Gated Endpoints (Update)

```
POST   /api/messages/send (Require business subscription)
GET    /api/creators/{id}/analytics (Require business subscription)
POST   /api/projects (Require business subscription)
GET    /api/creators/{id}/reviews (Require business subscription)
```

---

## Testing Plan

### Test Case 1: Business Subscription Required
- Try to chat without subscription → Show upgrade modal
- Try to create project without subscription → Show upgrade modal
- Subscribe → Features unlocked

### Test Case 2: Creator Subscription Benefits
- Create project with non-subscribed creator → 10% fee
- Creator subscribes → Future projects have 0% fee
- Check search ranking → Subscribed creators appear first

### Test Case 3: Wallet Payment Flow
- Subscription cost: ₹199
- Wallet balance: ₹500
- Subscribe → Balance: ₹301 (deducted from wallet)

### Test Case 4: Cashfree Fallback
- Subscription cost: ₹199
- Wallet balance: ₹50
- Subscribe → Redirect to Cashfree for ₹199

### Test Case 5: Business Top-up
- Business adds ₹1000 to wallet
- Balance updates
- Can use for subscriptions/projects

### Test Case 6: Creator Payout
- Creator requests ₹10,000 payout
- Admin approves
- Wallet balance deducted
- Payout marked as processing

### Test Case 7: Wallet Restrictions
- Business tries to withdraw → Error
- Creator tries to top-up → Error

---

## Revenue Impact Analysis

### Old Model (Project-based only)
- Revenue per ₹10,000 project: ₹1,180 (10% + GST)
- Variable income based on projects

### New Model (Subscription + Project)

**Business Side:**
- Monthly subscription: ₹199 × users = Recurring revenue
- Annual subscription: ₹1,999 × users = Upfront revenue
- PAYG charges: ₹17.70 per contact beyond 25

**Creator Side:**
- Basic subscription: ₹999/month
- Pro subscription: ₹2,999/month  
- Enterprise subscription: ₹4,999/month
- Trade-off: Lose 10% project fee, gain subscription revenue

**Example Calculation:**
```
100 Business Users:
- 70 monthly (₹199 × 70) = ₹13,930/month
- 30 annual (₹1,999 × 30 / 12) = ₹4,997/month
- Total: ₹18,927/month = ₹2,27,124/year

50 Creators:
- 30 Pro (₹2,999 × 30) = ₹89,970/month
- 20 Basic (₹999 × 20) = ₹19,980/month
- Total: ₹1,09,950/month = ₹13,19,400/year

Grand Total: ₹15,46,524/year from subscriptions alone
Plus: Project fees from non-subscribed creators
Plus: PAYG charges
```

---

**Ready to implement these changes?**

*Document Created: March 29, 2025*
