# Creabase Platform - Quick Visual Overview

## Platform Flow at a Glance

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CREABASE ECOSYSTEM                               │
└─────────────────────────────────────────────────────────────────────┘

┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│   BUSINESS    │────────│   PLATFORM    │────────│    CREATOR    │
│     USER      │         │  (CREABASE)   │         │     USER      │
└───────────────┘         └───────────────┘         └───────────────┘
       │                         │                         │
       │ 1. Subscribe            │                         │
       │    ₹199/month          │                         │
       │─────────────────────────>                         │
       │                         │                         │
       │ 2. Browse & Search      │                         │
       │    Creators (Free)      │                         │
       │<─────────────────────────                         │
       │                         │                         │
       │ 3. View Contact         │                         │
       │    (25/month limit)     │                         │
       │─────────────────────────>                         │
       │                         │                         │
       │ 4. Create Project       │                         │
       │    Amount: ₹10,000      │                         │
       │─────────────────────────>                         │
       │                         │                         │
       │ 5. Pay Total            │                         │
       │    ₹11,180              │                         │
       │    (incl. fee+GST)      │                         │
       │─────────────────────────>                         │
       │                         │                         │
       │                         │ 6. Notify New Project   │
       │                         │─────────────────────────>
       │                         │                         │
       │                         │ 7. Accept Project       │
       │                         │<─────────────────────────
       │                         │                         │
       │                    💰 ESCROW                      │
       │                    ₹10,000 HELD                   │
       │                         │                         │
       │ 8. Chat/Collaborate     │                         │
       │<──────────────────────────────────────────────────>
       │                         │                         │
       │                         │ 9. Submit Work          │
       │                         │<─────────────────────────
       │                         │                         │
       │ 10. Review & Approve    │                         │
       │─────────────────────────>                         │
       │                         │                         │
       │                         │ 11. Release Escrow      │
       │                         │      ₹10,000            │
       │                         │─────────────────────────>
       │                         │                         │
       │                    Platform Keeps                 │
       │                    Fee: ₹1,180                    │
       │                    (10% + GST)                    │
       │                         │                         │
       │ 12. Leave Review        │                         │
       │─────────────────────────>                         │
       │                         │                         │
       │                         │ 13. Request Payout      │
       │                         │<─────────────────────────
       │                         │                         │
       │                         │ 14. Bank Transfer       │
       │                         │      (2-3 days)         │
       │                         │─────────────────────────>
       │                         │                         │
       ✅ Project Complete       │                     💵 Paid
```

## Key Platform Features Map

```
┌────────────────────────────────────────────────────────────────┐
│                      FEATURE MAP                               │
└────────────────────────────────────────────────────────────────┘

📝 AUTHENTICATION          🔍 DISCOVERY              💬 COMMUNICATION
├─ Google OAuth           ├─ Search by keywords     ├─ Direct chat
├─ JWT sessions           ├─ Filter by:             ├─ Real-time messaging
├─ Role selection         │  • Platform             ├─ Typing indicators
└─ Protected routes       │  • Language             ├─ Read receipts
                          │  • Industry             └─ Notifications
                          │  • Location
                          │  • Followers
                          ├─ Sort by badges
                          └─ Premium first

💰 PAYMENTS               📊 ANALYTICS              ⚖️ DISPUTE MGMT
├─ Cashfree gateway       ├─ Business:              ├─ Raise dispute
├─ Escrow system          │  • Spending             ├─ Upload evidence
├─ 10% + GST fee          │  • Projects             ├─ Admin mediation
├─ Subscription           │  • Contact usage        ├─ Escrow freeze
│  • ₹199/month           ├─ Creator:               ├─ Resolution
│  • ₹1999/year           │  • Earnings             └─ Refund/Release
├─ Pay-as-you-go          │  • Performance
│  • ₹15 + GST            │  • Badge progress
└─ Wallet system          └─ Admin: Revenue

👥 USER MANAGEMENT        📧 NOTIFICATIONS          🏆 GAMIFICATION
├─ Admin approval         ├─ Email alerts           ├─ Creator badges:
├─ Profile management     ├─ In-app notifications   │  • Premium ⭐
├─ Bank details           ├─ SMS (future)           │  • Top Rated 🏆
├─ KYC verification       └─ Push (future)          │  • Rising Star ⚡
└─ Status tracking                                  │  • Verified ✓
                                                    │  • New 🌟
                                                    ├─ Ratings (5-star)
                                                    └─ Performance metrics
```

## Database Collections Overview

```
┌───────────────────────────────────────────────────────────────┐
│                  DATABASE SCHEMA                              │
└───────────────────────────────────────────────────────────────┘

USERS                      CREATORS                  PROJECTS
├─ user_id (PK)           ├─ creator_id (PK)        ├─ project_id (PK)
├─ email                  ├─ user_id (FK)           ├─ business_id (FK)
├─ name                   ├─ bio                    ├─ creator_id (FK)
├─ role                   ├─ platforms              ├─ title
├─ status                 ├─ followers              ├─ description
├─ subscription_plan      ├─ price_per_post         ├─ amount
├─ subscription_status    ├─ verification_status    ├─ status
├─ creators_viewed        ├─ badge                  ├─ created_at
├─ monthly_reset_date     ├─ rating                 └─ deadline
└─ created_at             ├─ completed_projects
                          └─ approved

ESCROW_TRANSACTIONS       MESSAGES                  DISPUTES
├─ escrow_id (PK)         ├─ message_id (PK)       ├─ dispute_id (PK)
├─ project_id (FK)        ├─ sender_id (FK)        ├─ project_id (FK)
├─ amount                 ├─ receiver_id (FK)      ├─ raised_by (FK)
├─ status                 ├─ message               ├─ against (FK)
├─ platform_fee           ├─ project_id (FK)       ├─ reason
├─ gst                    ├─ read                  ├─ status
└─ released_at            └─ created_at            ├─ resolution
                                                   └─ resolved_at

WALLETS                   REVIEWS                   NOTIFICATIONS
├─ wallet_id (PK)         ├─ review_id (PK)        ├─ notification_id
├─ user_id (FK)           ├─ project_id (FK)       ├─ user_id (FK)
├─ balance                ├─ reviewer_id (FK)      ├─ type
├─ created_at             ├─ reviewee_id (FK)      ├─ message
└─ updated_at             ├─ rating (1-5)          ├─ read
                          ├─ comment               └─ created_at
                          └─ created_at

CREATOR_VIEWS             PAYG_CHARGES              FAVORITES
├─ view_id (PK)           ├─ charge_id (PK)        ├─ favorite_id
├─ business_id (FK)       ├─ user_id (FK)          ├─ user_id (FK)
├─ creator_id (FK)        ├─ amount                ├─ creator_id (FK)
├─ viewed_at              ├─ charged_at            └─ created_at
└─ month_year             └─ status
```

## Tech Stack Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                     TECHNOLOGY STACK                           │
└────────────────────────────────────────────────────────────────┘

FRONTEND                   BACKEND                   DATABASE
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│   React 19   │────────>│   FastAPI    │────────>│   MongoDB    │
├──────────────┤          ├──────────────┤          ├──────────────┤
│ • Tailwind   │          │ • Python     │          │ • NoSQL      │
│ • Shadcn UI  │          │ • Motor      │          │ • Collections│
│ • Lucide     │          │ • Async I/O  │          │ • Indexes    │
│ • Axios      │          │ • Pydantic   │          │ • Aggregation│
│ • Router v7  │          │ • JWT        │          └──────────────┘
└──────────────┘          └──────────────┘
       │                         │
       │                         │
       ▼                         ▼
┌──────────────┐          ┌──────────────┐
│  PORT 3000   │          │  PORT 8001   │
└──────────────┘          └──────────────┘

INTEGRATIONS (Mocked - Ready for Real APIs)
┌──────────────────────────────────────────────────────────────┐
│ • Cashfree - Payment Gateway                                 │
│ • Google OAuth - Authentication                              │
│ • YouTube Data API v3 - Creator verification                 │
│ • Instagram Graph API - Creator verification                 │
│ • SendGrid/Resend - Email notifications                      │
│ • Twilio - SMS notifications                                 │
│ • AWS S3/Cloudinary - File uploads                           │
└──────────────────────────────────────────────────────────────┘

DEPLOYMENT
┌──────────────────────────────────────────────────────────────┐
│ Current: Kubernetes (Emergent Platform)                      │
│ Production Ready For:                                        │
│ • Frontend: Vercel, Netlify                                  │
│ • Backend: Railway, Render, AWS                              │
│ • Database: MongoDB Atlas                                    │
└──────────────────────────────────────────────────────────────┘
```

## Money Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                    MONEY FLOW                                  │
└────────────────────────────────────────────────────────────────┘

SUBSCRIPTION REVENUE
Business User
    │ ₹199/month or ₹1999/year
    ├────────────────────────────────────────┐
    │                                        │
    ▼                                        ▼
Platform Wallet                      Business Account
• Monthly recurring                  • 25 contacts/month included
• Auto-renewal                       • Access to all features
• Contact limit resets               • Can create unlimited projects

PROJECT REVENUE (Example: ₹10,000 project)
Business User
    │ Pays: ₹11,180
    │ (₹10,000 + ₹1,000 fee + ₹180 GST)
    │
    ▼
Cashfree Gateway
    │ Successful Payment
    │
    ├───────────────────┬────────────────────────┐
    │                   │                        │
    ▼                   ▼                        ▼
Escrow Account    Platform Wallet          Tax Account
₹10,000          ₹1,000 (fee)            ₹180 (GST)
(Held)           (Immediate)              (Immediate)
    │
    │ Project Completed & Approved
    │
    ▼
Creator Wallet
₹10,000
    │
    │ Request Payout (Min ₹500)
    │
    ▼
Bank Transfer
₹10,000 → Creator Bank Account
(2-3 business days)

PAY-AS-YOU-GO REVENUE
Business User (exceeded 25 contacts)
    │ Each extra contact: ₹17.70
    │ (₹15 + ₹2.70 GST)
    │
    ▼
Platform Wallet
• Charged automatically
• Tracked per contact view
• Monthly summary sent
```

## User Journey Comparison

```
┌────────────────────────────────────────────────────────────────┐
│              USER JOURNEY COMPARISON                           │
└────────────────────────────────────────────────────────────────┘

BUSINESS USER                CREATOR USER               ADMIN USER
┌─────────────┐              ┌─────────────┐            ┌─────────────┐
│ 1. Sign Up  │              │ 1. Sign Up  │            │ 1. Login    │
│    via      │              │    via      │            │    Direct   │
│    Google   │              │    Google   │            │             │
└──────┬──────┘              └──────┬──────┘            └──────┬──────┘
       │                            │                          │
       ▼                            ▼                          ▼
┌─────────────┐              ┌─────────────┐            ┌─────────────┐
│ 2. Browse   │              │ 2. Create   │            │ 2. Platform │
│    Creators │              │    Profile  │            │    Overview │
│    (Free)   │              │             │            │             │
└──────┬──────┘              └──────┬──────┘            └──────┬──────┘
       │                            │                          │
       ▼                            ▼                          ▼
┌─────────────┐              ┌─────────────┐            ┌─────────────┐
│ 3. Subscribe│              │ 3. Verify   │            │ 3. Approve  │
│    ₹199/mo  │              │    Social   │            │    Creators │
└──────┬──────┘              │    Accounts │            │             │
       │                     └──────┬──────┘            └──────┬──────┘
       ▼                            │                          │
┌─────────────┐              ┌─────────────┐            ┌─────────────┐
│ 4. View     │              │ 4. Add Bank │            │ 4. Manage   │
│    Contacts │              │    Details  │            │    Disputes │
│    (25/mo)  │              └──────┬──────┘            │             │
└──────┬──────┘                     │                   └──────┬──────┘
       │                            ▼                          │
       ▼                     ┌─────────────┐            ┌─────────────┐
┌─────────────┐              │ 5. Wait for │            │ 5. Process  │
│ 5. Create   │              │    Admin    │            │    Payouts  │
│    Project  │              │    Approval │            │             │
└──────┬──────┘              └──────┬──────┘            └──────┬──────┘
       │                            │                          │
       ▼                            ▼                          ▼
┌─────────────┐              ┌─────────────┐            ┌─────────────┐
│ 6. Pay      │              │ 6. Profile  │            │ 6. View     │
│    ₹11,180  │              │    Goes     │            │    Analytics│
│    (escrow) │              │    Live     │            │             │
└──────┬──────┘              └──────┬──────┘            └──────┬──────┘
       │                            │                          │
       ▼                            ▼                          ▼
┌─────────────┐              ┌─────────────┐            ┌─────────────┐
│ 7. Chat &   │◄────────────>│ 7. Receive  │            │ 7. Configure│
│    Collab   │              │    Projects │            │    Platform │
└──────┬──────┘              └──────┬──────┘            │    Fees     │
       │                            │                   └─────────────┘
       ▼                            ▼
┌─────────────┐              ┌─────────────┐
│ 8. Review & │              │ 8. Complete │
│    Approve  │              │    Work     │
└──────┬──────┘              └──────┬──────┘
       │                            │
       ▼                            ▼
┌─────────────┐              ┌─────────────┐
│ 9. Rate     │              │ 9. Get Paid │
│    Creator  │              │    ₹10,000  │
└─────────────┘              └──────┬──────┘
                                    │
                                    ▼
                             ┌─────────────┐
                             │10. Request  │
                             │   Payout    │
                             └──────┬──────┘
                                    │
                                    ▼
                             ┌─────────────┐
                             │11. Bank     │
                             │   Transfer  │
                             └─────────────┘

Time to Value:               Time to Value:          Always Active:
• Immediate browsing         • 2-3 days approval     • Real-time monitoring
• <5 min signup              • First payment:        • Instant actions
• Instant contact access     • 7-10 days avg         • 24/7 access
```

---

## Quick Reference

### Platform URLs
- Landing: `/`
- Business Dashboard: `/dashboard`
- Creator Dashboard: `/creator-dashboard`
- Admin Panel: `/admin`
- Chat: `/chats`
- Analytics: `/analytics`
- Projects: `/projects`

### Key Metrics
- Platform Fee: **10%**
- GST: **18%**
- Subscription: **₹199/month** or **₹1999/year**
- Contact Limit: **25/month**
- Pay-as-you-go: **₹15 + GST (₹17.70)**

### User Roles
1. **Business** - Hire creators
2. **Creator** - Get hired for projects
3. **Admin** - Manage platform

### Project Statuses
1. `pending` - Awaiting creator acceptance
2. `active` - In progress
3. `delivered` - Creator submitted
4. `revision` - Business requested changes
5. `completed` - Approved & paid
6. `disputed` - Under admin review
7. `cancelled` - Rejected/Cancelled

### Creator Badges
1. 🌟 `new` - 0-9 projects
2. ✓ `verified` - Social accounts verified
3. ⚡ `rising_star` - 10-29 projects, 4.5+ rating
4. 🏆 `top_rated` - 30+ projects, 4.8+ rating
5. ⭐ `premium` - Paid promotion

