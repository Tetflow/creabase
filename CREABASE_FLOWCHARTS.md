# Creabase Platform - Complete Flowcharts & Feature Flows

## Table of Contents
1. [High-Level Platform Architecture](#high-level-platform-architecture)
2. [User Onboarding Flow](#user-onboarding-flow)
3. [Creator Registration & Verification Flow](#creator-registration--verification-flow)
4. [Business Subscription Flow](#business-subscription-flow)
5. [Creator Discovery & Contact Flow](#creator-discovery--contact-flow)
6. [Project Creation & Escrow Flow](#project-creation--escrow-flow)
7. [Payment & Escrow Release Flow](#payment--escrow-release-flow)
8. [Chat/Messaging Flow](#chatmessaging-flow)
9. [Dispute Management Flow](#dispute-management-flow)
10. [Admin Workflows](#admin-workflows)
11. [Analytics & Reporting Flow](#analytics--reporting-flow)

---

## High-Level Platform Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CREABASE PLATFORM                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │         THREE USER TYPES                │
        └─────────────────────────────────────────┘
                 │           │           │
         ┌───────┴───┬───────┴───┬───────┴────┐
         │           │           │            │
         ▼           ▼           ▼            ▼
    ┌────────┐  ┌────────┐  ┌────────┐  ┌─────────┐
    │BUSINESS│  │CREATOR │  │ ADMIN  │  │ PUBLIC  │
    │  USER  │  │  USER  │  │  USER  │  │ VISITOR │
    └────────┘  └────────┘  └────────┘  └─────────┘
         │           │           │            │
         │           │           │            │
    ┌────▼───────────▼───────────▼────────────▼────┐
    │         CORE PLATFORM FEATURES                │
    ├───────────────────────────────────────────────┤
    │  • Authentication & Authorization             │
    │  • Creator Database & Search                  │
    │  • Subscription Management                    │
    │  • Project & Escrow System                    │
    │  • Payment Processing                         │
    │  • Chat & Messaging                           │
    │  • Analytics & Reporting                      │
    │  • Dispute Resolution                         │
    │  • Notifications                              │
    └───────────────────────────────────────────────┘
                         │
                         ▼
    ┌────────────────────────────────────────────┐
    │         TECHNICAL INFRASTRUCTURE           │
    ├────────────────────────────────────────────┤
    │  Frontend: React + Tailwind + Shadcn      │
    │  Backend: FastAPI + MongoDB               │
    │  Auth: JWT + Google OAuth                 │
    │  Payments: Cashfree                       │
    │  Notifications: SendGrid + Twilio         │
    └────────────────────────────────────────────┘
```

---

## User Onboarding Flow

```
                    ┌─────────────────┐
                    │  Landing Page   │
                    │  (Public View)  │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                │                         │
                ▼                         ▼
        ┌───────────────┐        ┌──────────────┐
        │ Browse        │        │ Click Login/ │
        │ Creators      │        │  Sign Up     │
        │ (Read Only)   │        └──────┬───────┘
        └───────────────┘               │
                                        ▼
                              ┌──────────────────┐
                              │  Role Selection  │
                              │   Page           │
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │   Business   │  │   Creator    │  │    Admin     │
            │   Login      │  │   Login      │  │    Login     │
            └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                   │                  │                  │
                   │                  │                  │
                   ▼                  ▼                  ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │ Google OAuth │  │ Google OAuth │  │Email/Password│
            │ (Mocked)     │  │ (Mocked)     │  │   Direct     │
            └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                   │                  │                  │
                   │                  │                  │
                   ▼                  ▼                  ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │Create Profile│  │Create Profile│  │ Admin Panel  │
            │ + Wallet     │  │ + Wallet     │  │   Access     │
            └──────┬───────┘  └──────┬───────┘  └──────────────┘
                   │                  │
                   ▼                  ▼
            ┌──────────────┐  ┌──────────────┐
            │   Business   │  │   Creator    │
            │  Dashboard   │  │  Dashboard   │
            └──────────────┘  └──────────────┘
```

### User Journey Details

#### Business User Journey
1. **Landing Page** → Browse creators (no login required)
2. **Sign Up** → Select "Business" role
3. **Google OAuth** → Authenticate (currently mocked)
4. **Profile Setup** → Add company details, contact info
5. **Wallet Creation** → Auto-created with ₹0 balance
6. **Dashboard Access** → Full creator search unlocked
7. **Subscription Prompt** → To view creator contacts (25/month limit)

#### Creator User Journey
1. **Landing Page** → Learn about platform
2. **Sign Up** → Select "Creator" role
3. **Google OAuth** → Authenticate (currently mocked)
4. **Profile Setup** → Bio, platforms, pricing, portfolio
5. **Social Verification** → Link Instagram/YouTube (mocked)
6. **Bank Details** → Add for payouts
7. **Approval Wait** → Admin reviews and approves
8. **Go Live** → Profile visible in creator database

#### Admin User Journey
1. **Direct Login** → Email/Password (admin@creabase.com)
2. **Admin Dashboard** → Platform overview
3. **Management Tools** → Users, creators, disputes, payouts

---

## Creator Registration & Verification Flow

```
┌────────────────────────────────────────────────────────────────┐
│                  CREATOR REGISTRATION FLOW                      │
└────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │ Creator      │
    │ Sign Up      │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────┐
    │ Google OAuth     │──────┐ (Currently Mocked)
    │ Authentication   │      │ Ready for Real OAuth
    └──────┬───────────┘      │
           │                  │
           ▼                  │
    ┌──────────────────────────────────┐
    │   Create Basic Profile           │
    │  • Name, Email (from OAuth)      │
    │  • Phone Number                  │
    │  • Bio                           │
    └──────┬───────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │   Add Platform Details           │
    │  • Instagram Handle              │
    │  • YouTube Channel               │
    │  • Follower Counts               │
    │  • Content Categories            │
    │  • Languages                     │
    │  • Location (City/District)      │
    └──────┬───────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │   Pricing & Availability         │
    │  • Price per Post/Video          │
    │  • Available Days                │
    └──────┬───────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │   Social Media Verification      │──────┐
    │  (Optional but Recommended)      │      │ MOCKED
    └──────┬───────────────────────────┘      │ APIs Ready
           │                                   │
    ┌──────┴────────────────┐                 │
    │                       │                 │
    ▼                       ▼                 │
┌─────────────┐      ┌──────────────┐        │
│ Instagram   │      │  YouTube     │        │
│ OAuth       │      │  OAuth       │◄───────┘
│ API v3      │      │  Data API v3 │
└─────┬───────┘      └──────┬───────┘
      │                     │
      └──────────┬──────────┘
                 │
                 ▼
    ┌──────────────────────────────────┐
    │  Fetch Real Stats:               │
    │  • Follower Count                │
    │  • Engagement Rate               │
    │  • Recent Posts                  │
    │  • Verification Badge            │
    └──────┬───────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │   Add Bank Details               │
    │  • Account Holder Name           │
    │  • Account Number                │
    │  • IFSC Code                     │
    │  • Bank Name                     │
    └──────┬───────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │   Upload Portfolio (Optional)    │
    │  • Past Work Samples             │
    │  • Brand Collaborations          │
    └──────┬───────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │   Submit for Review              │
    │   Status: "pending_approval"     │
    └──────┬───────────────────────────┘
           │
           ▼
    ┌─────────────────────────────────────────────┐
    │         ADMIN APPROVAL WORKFLOW             │
    ├─────────────────────────────────────────────┤
    │  Admin Reviews:                             │
    │  • Profile completeness                     │
    │  • Social verification status               │
    │  • Content quality                          │
    │  • Platform compliance                      │
    └──────┬──────────────────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────┐  ┌──────────┐
│APPROVED │  │ REJECTED │
└────┬────┘  └────┬─────┘
     │            │
     │            ▼
     │     ┌──────────────────┐
     │     │ Notification     │
     │     │ + Rejection      │
     │     │   Reason         │
     │     └──────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│  Creator Profile Goes LIVE       │
│  • Status: "approved"            │
│  • ✅ VISIBLE in public search   │
│  • ✅ VISIBLE to business users  │
│  • Can receive project offers    │
│  • Badge assigned based on:      │
│    - Verification: "verified"    │
│    - Premium: "premium"          │
│    - New: "new" (0-9 projects)   │
│                                  │
│  ⚠️ IMPORTANT BUSINESS RULE:     │
│  Only "approved" creators are    │
│  visible to business users.      │
│  Pending/rejected creators are   │
│  hidden from public search.      │
└──────────────────────────────────┘
```

---

## Business Subscription Flow

```
┌────────────────────────────────────────────────────────────────┐
│               BUSINESS SUBSCRIPTION FLOW                        │
└────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  Business    │
    │  Dashboard   │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │   Browse Creators                │
    │   (Free - No Login Required)     │
    └──────┬───────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │   Click "View Contact"           │
    └──────┬───────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │   Check User Status              │
    └──────┬───────────────────────────┘
           │
    ┌──────┴─────────────────────────────┐
    │                                    │
    ▼                                    ▼
┌─────────────────┐              ┌──────────────────┐
│ Has Active      │              │ No Active        │
│ Subscription?   │              │ Subscription     │
└────┬────────────┘              └────┬─────────────┘
     │ YES                            │ NO
     │                                │
     ▼                                ▼
┌─────────────────────────┐    ┌─────────────────────┐
│ Check Monthly Limit     │    │  Show Subscription  │
│ (25 creators/month)     │    │  Required Modal     │
└────┬────────────────────┘    └────┬────────────────┘
     │                              │
┌────┴────┐                         ▼
│         │                    ┌─────────────────────┐
▼         ▼                    │  Pricing Page       │
┌────┐  ┌──────┐               │                     │
│<25 │  │ ≥25  │               │  PLAN OPTIONS:      │
└─┬──┘  └──┬───┘               │                     │
  │        │                   │  ┌────────────────┐ │
  │        │                   │  │  MONTHLY       │ │
  │        ▼                   │  │  ₹199/month    │ │
  │   ┌──────────────┐         │  │  25 contacts   │ │
  │   │Pay-As-You-Go │         │  │  included      │ │
  │   │Charge Prompt │         │  └────────────────┘ │
  │   │              │         │                     │
  │   │₹15 + GST     │         │  ┌────────────────┐ │
  │   │= ₹17.70      │         │  │  ANNUAL        │ │
  │   └──┬───────────┘         │  │  ₹1999/year    │ │
  │      │                     │  │  25/month      │ │
  │      │                     │  │  (300 total)   │ │
  │      ▼                     │  └────────────────┘ │
  │   ┌──────────────┐         └────┬────────────────┘
  │   │Confirm       │              │
  │   │Payment       │              │
  │   └──┬───────────┘              │
  │      │                          │
  │      ▼                          ▼
  │   ┌──────────────────────────────┐
  │   │   CASHFREE PAYMENT           │
  │   │   (Currently Mocked)         │
  │   ├──────────────────────────────┤
  │   │  1. Create Order             │
  │   │  2. Redirect to Cashfree     │
  │   │  3. Customer pays            │
  │   │  4. Webhook callback         │
  │   │  5. Verify payment           │
  │   └──────┬───────────────────────┘
  │          │
  │          ▼
  │   ┌──────────────────────────────┐
  │   │  Payment Successful          │
  │   │  • Update subscription       │
  │   │  • Set monthly_reset_date    │
  │   │  • creators_viewed = 0       │
  │   │  • Send email receipt        │
  │   └──────┬───────────────────────┘
  │          │
  └──────────┴───────────┐
                         │
                         ▼
              ┌────────────────────────┐
              │  SHOW CREATOR CONTACT  │
              │  • Email               │
              │  • Phone               │
              │  • WhatsApp            │
              │  • Copy Buttons        │
              └────┬───────────────────┘
                   │
                   ▼
              ┌────────────────────────┐
              │  Track View            │
              │  • Log to DB           │
              │  • Increment counter   │
              │  • Update analytics    │
              └────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    MONTHLY AUTO-RESET                          │
├────────────────────────────────────────────────────────────────┤
│  Every Month (30 days):                                        │
│  • Check monthly_reset_date                                    │
│  • If >= 30 days, reset:                                       │
│    - creators_viewed_this_month = 0                            │
│    - monthly_reset_date = NOW                                  │
│  • User gets fresh 25 contacts                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## Creator Discovery & Contact Flow

```
┌────────────────────────────────────────────────────────────────┐
│            CREATOR DISCOVERY & CONTACT FLOW                     │
└────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │  Landing Page /  │
    │  Dashboard       │
    └────┬─────────────┘
         │
         ▼
    ┌─────────────────────────────────────┐
    │   CREATOR SEARCH INTERFACE          │
    ├─────────────────────────────────────┤
    │  ⚠️ BUSINESS RULE:                  │
    │  Only APPROVED creators visible     │
    │  (status = "approved")              │
    │                                     │
    │  🔍 Search Bar                      │
    │  └─ Name, Bio, Keywords             │
    │                                     │
    │  🎯 FILTERS:                        │
    │  ├─ Platform (Instagram/YouTube)    │
    │  ├─ Language (EN/HI/TA/TE)          │
    │  ├─ Industry (Fashion/Tech/Food..)  │
    │  ├─ Location (City/District)        │
    │  └─ Followers (Min/Max Range)       │
    │                                     │
    └────┬────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────────┐
    │   API: GET /api/creators/search     │
    │   Query Parameters Applied          │
    └────┬────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────────┐
    │   RESULTS SORTING:                  │
    │   1. Premium creators first         │
    │   2. Top Rated                      │
    │   3. Rising Star                    │
    │   4. Verified                       │
    │   5. Standard/New                   │
    └────┬────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────────┐
    │   CREATOR CARDS DISPLAYED           │
    │                                     │
    │  ┌─────────────────────────────┐   │
    │  │ 👤 Creator Avatar           │   │
    │  │ ⭐ Badge (Premium/Top/etc)  │   │
    │  │ 📊 Followers: 50K           │   │
    │  │ 💰 Price: ₹5000/post        │   │
    │  │ 📱 Platforms: IG + YT       │   │
    │  │ 🏷️ Tags: Fashion, Lifestyle │   │
    │  │                             │   │
    │  │ [View Profile] [Contact]    │   │
    │  └─────────────────────────────┘   │
    └────┬────────────────────────────────┘
         │
    ┌────┴──────────────┐
    │                   │
    ▼                   ▼
┌────────────┐    ┌─────────────┐
│View Profile│    │View Contact │
└────┬───────┘    └─────┬───────┘
     │                  │
     ▼                  ▼
┌──────────────────────────────┐
│  CREATOR PROFILE PAGE        │
│  /creator/:id                │
├──────────────────────────────┤
│  • Full Bio                  │
│  • Portfolio Samples         │
│  • Social Stats              │
│  • Past Collaborations       │
│  • Reviews & Ratings         │
│  • Pricing Details           │
│  • Availability              │
│                              │
│  Actions:                    │
│  ├─ [View Contact]           │
│  ├─ [Save to Favorites] ❤️   │
│  ├─ [Create Project]         │
│  └─ [Send Message] 💬        │
└──────────────────────────────┘
         │
         │ Click "View Contact"
         ▼
┌──────────────────────────────┐
│  CONTACT MODAL               │
├──────────────────────────────┤
│  ┌────────────────────────┐  │
│  │  Creator Preview       │  │
│  │  👤 Name + Avatar      │  │
│  │  ⭐ Badge              │  │
│  └────────────────────────┘  │
│                              │
│  📧 Email: xxx@example.com   │
│     [Copy] 📋               │
│                              │
│  📞 Phone: +91-XXXXXXXXXX    │
│     [Copy] 📋               │
│                              │
│  💬 WhatsApp: [Open Chat]   │
│                              │
│  Usage: 12/25 this month    │
│                              │
│  [Close]                     │
└──────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  POST /api/creators/         │
│       {creator_id}/contact   │
│                              │
│  Actions:                    │
│  • Log view in DB            │
│  • Increment counter         │
│  • Charge PAYG if needed     │
│  • Update analytics          │
│  • Send notification to      │
│    creator (someone viewed)  │
└──────────────────────────────┘
```

---

## Project Creation & Escrow Flow

```
┌────────────────────────────────────────────────────────────────┐
│              PROJECT CREATION & ESCROW FLOW                     │
└────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  Business User  │
│  Dashboard      │
└────┬────────────┘
     │
     ▼
┌──────────────────────────────────┐
│  Navigate to /projects           │
│  Click "Create New Project"      │
└────┬─────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────┐
│         PROJECT CREATION FORM                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1️⃣ SELECT CREATOR                                  │
│     ┌────────────────────────────────┐              │
│     │  Searchable Dropdown           │              │
│     │  • Shows verified creators     │              │
│     │  • With avatars & badges       │              │
│     └────────────────────────────────┘              │
│                                                      │
│  2️⃣ PROJECT DETAILS                                 │
│     • Project Title                                 │
│     • Description                                   │
│     • Deliverables                                  │
│     • Timeline/Deadline                             │
│                                                      │
│  3️⃣ PRICING                                         │
│     • Project Amount (₹)                            │
│     • Platform Fee (10% + GST)                      │
│     • Total: Amount * 1.118                         │
│                                                      │
│  4️⃣ TERMS & CONDITIONS                              │
│     • Revision rounds                               │
│     • Content rights                                │
│     • Usage permissions                             │
│                                                      │
│  [Cancel]  [Create Project & Pay]                   │
└────┬─────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│  POST /api/projects/create       │
└────┬─────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────┐
│  CALCULATE FINAL AMOUNT                              │
│                                                      │
│  Project Amount:        ₹10,000                      │
│  Platform Fee (10%):    ₹1,000                       │
│  GST on Fee (18%):      ₹180                         │
│  ──────────────────────────────                      │
│  Total to Pay:          ₹11,180                      │
│                                                      │
│  Breakdown:                                          │
│  • ₹10,000 → Escrow (for creator)                    │
│  • ₹1,180 → Platform (fee + GST)                     │
└────┬─────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────┐
│         CASHFREE PAYMENT GATEWAY                     │
│         (Currently Mocked)                           │
├──────────────────────────────────────────────────────┤
│  1. Create Order in Cashfree                         │
│     • order_id, order_amount, customer_details       │
│                                                      │
│  2. Get Payment Session URL                          │
│                                                      │
│  3. Redirect Business User to Cashfree               │
│     • UPI / Card / Net Banking / Wallet              │
│                                                      │
│  4. User Completes Payment                           │
│                                                      │
│  5. Cashfree Webhook → Backend                       │
│     POST /api/payments/webhook                       │
│                                                      │
│  6. Verify Payment Signature                         │
│                                                      │
│  7. Update Order Status                              │
└────┬─────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────┐
│  PAYMENT SUCCESSFUL - CREATE ESCROW                  │
│                                                      │
│  Database Transactions:                              │
│  ┌────────────────────────────────────────────────┐  │
│  │ 1. CREATE PROJECT RECORD                       │  │
│  │    • project_id                                │  │
│  │    • business_user_id                          │  │
│  │    • creator_user_id                           │  │
│  │    • amount: ₹10,000                           │  │
│  │    • status: "pending"                         │  │
│  │    • created_at                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ 2. CREATE ESCROW TRANSACTION                   │  │
│  │    • escrow_id                                 │  │
│  │    • project_id                                │  │
│  │    • amount: ₹10,000                           │  │
│  │    • status: "held"                            │  │
│  │    • platform_fee: ₹1,000                      │  │
│  │    • gst: ₹180                                 │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ 3. DEDUCT FROM BUSINESS WALLET                 │  │
│  │    (If using wallet balance)                   │  │
│  └────────────────────────────────────────────────┘  │
└────┬─────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────┐
│  SEND NOTIFICATIONS                                  │
│                                                      │
│  To Business:                                        │
│  ✅ "Project created! Payment held in escrow"        │
│     Email + In-app notification                      │
│                                                      │
│  To Creator:                                         │
│  🔔 "New project offer from [Business Name]"         │
│     Email + In-app notification                      │
│     Action: Accept / Reject                          │
└────┬─────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────┐
│         CREATOR RESPONSE                             │
│                                                      │
│  ┌─────────────┐              ┌─────────────┐       │
│  │   ACCEPT    │              │   REJECT    │       │
│  └──────┬──────┘              └──────┬──────┘       │
│         │                            │              │
│         │                            ▼              │
│         │                    ┌──────────────────┐   │
│         │                    │ Refund to        │   │
│         │                    │ Business         │   │
│         │                    │ Cancel project   │   │
│         │                    │ Release escrow   │   │
│         │                    └──────────────────┘   │
│         │                                           │
│         ▼                                           │
│  ┌─────────────────────────────────────────┐       │
│  │  PROJECT STATUS: "active"               │       │
│  │  • Creator can start work               │       │
│  │  • Money stays in escrow                │       │
│  │  • Chat enabled between parties         │       │
│  └─────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────┘
```

---

## Payment & Escrow Release Flow

```
┌────────────────────────────────────────────────────────────────┐
│           PAYMENT & ESCROW RELEASE FLOW                         │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│  Active Project     │
│  Status: "active"   │
└────┬────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│  Creator Works on Project        │
│  • Creates content               │
│  • Uploads drafts via chat       │
│  • Submits deliverables          │
└────┬─────────────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│  Creator Marks as "Delivered"    │
│  PUT /api/projects/{id}/deliver  │
└────┬─────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────┐
│  NOTIFICATION TO BUSINESS                            │
│  🔔 "Creator has submitted deliverables"             │
│     "Please review and approve"                      │
└────┬─────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────┐
│         BUSINESS REVIEWS WORK                        │
│                                                      │
│  Options:                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │   APPROVE    │  │   REVISE     │  │  DISPUTE  │  │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘  │
│         │                 │                 │        │
└─────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │
          │                 │                 │
          │                 ▼                 │
          │    ┌────────────────────────┐    │
          │    │  Request Revision      │    │
          │    │  • Add comments        │    │
          │    │  • Specific changes    │    │
          │    └────┬───────────────────┘    │
          │         │                        │
          │         ▼                        │
          │    ┌────────────────────────┐    │
          │    │  Notify Creator        │    │
          │    │  Status: "revision"    │    │
          │    │  Back to Creator       │    │
          │    └────────────────────────┘    │
          │                                  │
          ▼                                  ▼
┌───────────────────────┐          ┌─────────────────────┐
│   APPROVE WORK        │          │  OPEN DISPUTE       │
└────┬──────────────────┘          └────┬────────────────┘
     │                                  │
     ▼                                  │ (See Dispute Flow)
┌──────────────────────────────────┐   │
│  PUT /api/projects/{id}/approve  │   │
│  Status: "completed"             │   │
└────┬─────────────────────────────┘   │
     │                                  │
     ▼                                  │
┌─────────────────────────────────────────────────┐
│       RELEASE ESCROW TRANSACTION                │
├─────────────────────────────────────────────────┤
│                                                 │
│  Project Amount: ₹10,000 (in escrow)            │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ 1. Platform keeps fee                     │  │
│  │    • Platform Fee: ₹1,000                 │  │
│  │    • GST: ₹180                            │  │
│  │    • Total: ₹1,180 → Platform Wallet      │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ 2. Transfer to Creator                    │  │
│  │    • Amount: ₹10,000                      │  │
│  │    • Destination: Creator Wallet          │  │
│  │                                           │  │
│  │    UPDATE wallets SET                     │  │
│  │      balance = balance + 10000            │  │
│  │    WHERE user_id = creator_id             │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ 3. Update Escrow Record                   │  │
│  │    • status: "released"                   │  │
│  │    • released_at: TIMESTAMP               │  │
│  │    • released_to: creator_id              │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ 4. Update Project Stats                   │  │
│  │    • Creator: completed_projects += 1     │  │
│  │    • Creator: total_earnings += 10000     │  │
│  │    • Business: total_spent += 11180       │  │
│  └───────────────────────────────────────────┘  │
└────┬────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────┐
│  SEND NOTIFICATIONS                          │
│                                              │
│  To Creator:                                 │
│  💰 "Payment released! ₹10,000 in wallet"    │
│     "Available for withdrawal"               │
│                                              │
│  To Business:                                │
│  ✅ "Project completed successfully"         │
│     "Leave a review for creator"             │
└────┬─────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────┐
│  ENABLE REVIEW SYSTEM                        │
│  • Business can rate creator (1-5 ⭐)        │
│  • Leave feedback/testimonial                │
│  • Impacts creator's badge                  │
└──────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────┐
│  CREATOR WITHDRAWAL OPTIONS                  │
│                                              │
│  Wallet Balance: ₹10,000                     │
│                                              │
│  [Request Payout]                            │
│  • Min: ₹500                                 │
│  • Bank transfer (uses saved bank details)   │
│  • Processing: 2-3 business days             │
│                                              │
│  Admin approves payout →                     │
│  Mark as "processed" →                       │
│  Deduct from wallet                          │
└──────────────────────────────────────────────┘
```

---

## Chat/Messaging Flow

```
┌────────────────────────────────────────────────────────────────┐
│                  CHAT / MESSAGING FLOW                          │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│  User (Business or      │
│  Creator)               │
└────┬────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│  Navigate to /chats              │
│  GET /api/messages/conversations │
└────┬─────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────┐
│         CHAT LIST PAGE                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  Conversations List:                            │
│  ┌───────────────────────────────────────────┐  │
│  │ 👤 John Doe (Business)                    │  │
│  │    "Thanks for the update..."             │  │
│  │    📅 2 hours ago  🔵 New                 │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ 👤 Sarah Creator                          │  │
│  │    "I'll submit by Friday"                │  │
│  │    📅 Yesterday  ✓✓ Read                  │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  Sorted by: Most recent first                  │
│  Filter by: Unread / All                       │
└────┬────────────────────────────────────────────┘
     │
     │ Click on conversation
     ▼
┌─────────────────────────────────────────────────┐
│         CHAT PAGE                               │
│         /chat/:userId                           │
├─────────────────────────────────────────────────┤
│  Header:                                        │
│  ┌───────────────────────────────────────────┐  │
│  │ ⬅️ Back  👤 Sarah Creator  🟢 Online      │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  Messages Area:                                 │
│  ┌───────────────────────────────────────────┐  │
│  │  ──── March 28, 2025 ────                │  │
│  │                                           │  │
│  │  👤 Sarah (10:30 AM)                      │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ Hi! I got your project request.     │  │  │
│  │  │ I can deliver by this Friday.       │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │  ✓✓ Read                                 │  │
│  │                                           │  │
│  │              You (10:35 AM) 👤            │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ Perfect! Please share a draft by    │  │  │
│  │  │ Wednesday for review.               │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │  ✓ Sent                                  │  │
│  │                                           │  │
│  │  ──── March 29, 2025 ────                │  │
│  │                                           │  │
│  │  👤 Sarah (09:15 AM)                      │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ Sure! I'll send it by tomorrow.     │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │  ✓✓ Read                                 │  │
│  │                                           │  │
│  │  💬 Sarah is typing...                   │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  Input Area:                                    │
│  ┌───────────────────────────────────────────┐  │
│  │ 📎  [Type your message...]        [Send]│  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
     │
     │ User types message
     ▼
┌──────────────────────────────────┐
│  POST /api/messages/send         │
│                                  │
│  Payload:                        │
│  {                               │
│    "receiver_id": "user_xxx",    │
│    "message": "Hello!",          │
│    "project_id": "proj_xxx"      │
│  }                               │
└────┬─────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────┐
│  CREATE MESSAGE RECORD                      │
│                                             │
│  {                                          │
│    "message_id": "msg_xxx",                 │
│    "sender_id": "user_abc",                 │
│    "receiver_id": "user_xyz",               │
│    "message": "Hello!",                     │
│    "project_id": "proj_123",                │
│    "read": false,                           │
│    "created_at": "2025-03-29T09:15:00Z"     │
│  }                                          │
└────┬────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────┐
│  REAL-TIME UPDATE                            │
│  (Currently Polling - Ready for WebSocket)   │
│                                              │
│  Current: Frontend polls every 3 seconds    │
│  GET /api/messages/conversation/{user_id}    │
│                                              │
│  Future: WebSocket Implementation           │
│  • ws://backend/chat                         │
│  • Instant message delivery                  │
│  • Typing indicators                         │
│  • Online status                             │
└────┬─────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────┐
│  MESSAGE APPEARS IN CHAT                     │
│  • Smooth fade-in animation                  │
│  • Auto-scroll to bottom                     │
│  • Show timestamp                            │
│  • Status: Sent (✓) → Read (✓✓)             │
└────┬─────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────┐
│  SEND NOTIFICATION TO RECEIVER               │
│                                              │
│  If receiver is offline:                     │
│  • In-app notification badge                 │
│  • Email notification (if enabled)           │
│  • Push notification (future)                │
│                                              │
│  Content:                                    │
│  "New message from [Sender Name]"            │
│  "[First 50 chars of message...]"            │
└──────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                  MESSAGE READ RECEIPTS                          │
├────────────────────────────────────────────────────────────────┤
│  When receiver opens chat:                                     │
│  PUT /api/messages/{message_id}/read                           │
│                                                                │
│  • Update all unread messages from that user                   │
│  • Set read: true, read_at: TIMESTAMP                          │
│  • Update UI: ✓ → ✓✓                                          │
│  • Clear notification badge                                    │
└────────────────────────────────────────────────────────────────┘
```

---

## Dispute Management Flow

```
┌────────────────────────────────────────────────────────────────┐
│                  DISPUTE MANAGEMENT FLOW                        │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│  Active Project     │
│  Issue Arises       │
└────┬────────────────┘
     │
     ▼
┌──────────────────────────────────────┐
│  User Opens Dispute                  │
│  (Business or Creator)               │
│  POST /api/disputes/create           │
└────┬─────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────┐
│         DISPUTE CREATION FORM                   │
├─────────────────────────────────────────────────┤
│  • Project ID (auto-filled)                     │
│  • Dispute Reason:                              │
│    ○ Quality Issues                             │
│    ○ Late Delivery                              │
│    ○ Scope Mismatch                             │
│    ○ Payment Issues                             │
│    ○ Other                                      │
│                                                 │
│  • Detailed Description                         │
│  • Upload Evidence (screenshots, files)         │
│                                                 │
│  [Submit Dispute]                               │
└────┬────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────┐
│  CREATE DISPUTE RECORD                       │
│                                              │
│  {                                           │
│    "dispute_id": "disp_xxx",                 │
│    "project_id": "proj_123",                 │
│    "raised_by": "user_business",             │
│    "against": "user_creator",                │
│    "reason": "quality_issues",               │
│    "description": "...",                     │
│    "status": "open",                         │
│    "escrow_amount": 10000,                   │
│    "created_at": "..."                       │
│  }                                           │
└────┬─────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────┐
│  UPDATE PROJECT STATUS                       │
│  • project.status = "disputed"               │
│  • FREEZE ESCROW (cannot be released)        │
└────┬─────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────┐
│  SEND NOTIFICATIONS                          │
│                                              │
│  To Other Party:                             │
│  ⚠️ "Dispute raised on Project #123"         │
│     "Please respond with your side"          │
│                                              │
│  To Admin:                                   │
│  🚨 "New dispute requires attention"         │
│     "Project #123 - Quality Issues"          │
└────┬─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────┐
│         OTHER PARTY RESPONDS                        │
│         PUT /api/disputes/{id}/respond              │
│                                                     │
│  • Counter-statement                                │
│  • Upload evidence                                  │
│  • Suggested resolution                             │
└────┬────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────┐
│  ADMIN REVIEW DASHBOARD                      │
│  /admin/disputes                             │
│                                              │
│  Dispute Details:                            │
│  ┌──────────────────────────────────────┐    │
│  │ Dispute ID: #DISP-001                │    │
│  │ Project: Wedding Photoshoot          │    │
│  │ Amount: ₹10,000 (in escrow)          │    │
│  │                                      │    │
│  │ Raised By: Business User             │    │
│  │ Reason: Quality Issues               │    │
│  │ Details: "Photos are out of focus..."│    │
│  │ Evidence: [View 3 files]             │    │
│  │                                      │    │
│  │ Response From: Creator               │    │
│  │ Statement: "I can redo the shoot..." │    │
│  │ Evidence: [View 2 files]             │    │
│  │                                      │    │
│  │ Timeline:                            │    │
│  │ • March 25: Project started          │    │
│  │ • March 28: Delivered                │    │
│  │ • March 29: Dispute raised           │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  Admin Actions:                              │
│  ┌──────────────────────────────────────┐    │
│  │ [Request More Info]                  │    │
│  │ [Schedule Mediation Call]            │    │
│  │ [Resolve Dispute] ▼                  │    │
│  │   • Full Refund to Business          │    │
│  │   • Partial Refund (50/50 split)     │    │
│  │   • Release to Creator (no refund)   │    │
│  │   • Custom Split                     │    │
│  └──────────────────────────────────────┘    │
└────┬─────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────┐
│  ADMIN DECISION                              │
│  PUT /api/disputes/{id}/resolve              │
│                                              │
│  Example: Partial Refund                     │
│  • Refund to Business: ₹5,000                │
│  • Release to Creator: ₹5,000                │
│  • Platform fee already taken                │
│  • Resolution notes logged                   │
└────┬─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────┐
│  EXECUTE ESCROW TRANSACTION                     │
│                                                 │
│  Original Escrow: ₹10,000                       │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ 1. Refund to Business Wallet              │  │
│  │    • Amount: ₹5,000                       │  │
│  │    • Also refund portion of platform fee  │  │
│  │      (₹500 fee + ₹90 GST = ₹590)          │  │
│  │    • Total refund: ₹5,590                 │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ 2. Release to Creator Wallet              │  │
│  │    • Amount: ₹5,000                       │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ 3. Update Records                         │  │
│  │    • Escrow status: "partial_release"     │  │
│  │    • Project status: "disputed_resolved"  │  │
│  │    • Dispute status: "resolved"           │  │
│  └───────────────────────────────────────────┘  │
└────┬────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────┐
│  SEND RESOLUTION NOTIFICATIONS               │
│                                              │
│  To Business:                                │
│  ✅ "Dispute resolved - ₹5,590 refunded"     │
│     "Admin decision: [Full notes]"           │
│                                              │
│  To Creator:                                 │
│  ✅ "Dispute resolved - ₹5,000 released"     │
│     "Admin decision: [Full notes]"           │
│                                              │
│  Both parties can:                           │
│  • View full resolution details              │
│  • Download dispute report                   │
│  • Cannot reopen (final decision)            │
└──────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────┐
│  UPDATE USER STATS                           │
│  • Log dispute in user history               │
│  • May impact creator badge/rating           │
│  • Track for platform analytics              │
└──────────────────────────────────────────────┘
```

---

## Admin Workflows

```
┌────────────────────────────────────────────────────────────────┐
│                     ADMIN WORKFLOWS                             │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│  Admin Login        │
│  /login/admin       │
└────┬────────────────┘
     │
     ▼
┌──────────────────────────────────────┐
│  Email: admin@creabase.com           │
│  Password: admin123                  │
└────┬─────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│              ADMIN DASHBOARD (/admin)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 PLATFORM STATISTICS                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Total Users: 1,234                              │    │
│  │ • Businesses: 450                               │    │
│  │ • Creators: 784                                 │    │
│  │                                                 │    │
│  │ Projects:                                       │    │
│  │ • Active: 45                                    │    │
│  │ • Completed: 892                                │    │
│  │ • Disputed: 3                                   │    │
│  │                                                 │    │
│  │ Revenue (This Month): ₹1,24,500                 │    │
│  │ • Platform Fees: ₹1,05,000                      │    │
│  │ • GST Collected: ₹19,500                        │    │
│  │                                                 │    │
│  │ Pending Approvals:                              │    │
│  │ • New Creators: 12                              │    │
│  │ • Payout Requests: 8                            │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  QUICK ACTIONS:                                         │
│  [Approve Creators] [Process Payouts] [View Disputes]   │
└────┬────────────────────────────────────────────────────┘
     │
     │
┌────┴────────────────────────────────┐
│                                     │
│    ADMIN NAVIGATION MENU            │
│                                     │
│    1. User Management               │
│    2. Creator Approvals             │
│    3. Wallet Management             │
│    4. Fee Configuration             │
│    5. Analytics                     │
│    6. Disputes                      │
│    7. Payout Management             │
│    8. Invoice Management            │
│                                     │
└─┬──────┬────────┬──────┬────────┬───┘
  │      │        │      │        │
  ▼      ▼        ▼      ▼        ▼

┌──────────────────────────────────────────────────────────────┐
│  1. USER MANAGEMENT (/admin/users)                           │
├──────────────────────────────────────────────────────────────┤
│  • View all users (Business/Creator/Admin)                   │
│  • Filter by role, status, join date                         │
│  • Search by name, email                                     │
│                                                              │
│  User Actions:                                               │
│  • View full profile                                         │
│  • Suspend/Activate account                                  │
│  • Reset password                                            │
│  • View transaction history                                  │
│  • Manually adjust wallet balance                            │
│  • Send notification                                         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  2. CREATOR APPROVALS (/admin)                               │
├──────────────────────────────────────────────────────────────┤
│  Pending Creators List:                                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 👤 Priya Sharma                                        │  │
│  │    Instagram: @priya_vlogs (50K followers)             │  │
│  │    YouTube: Priya Vlogs (120K subscribers)             │  │
│  │    Category: Lifestyle, Fashion                        │  │
│  │    Verification: ✅ Instagram, ✅ YouTube              │  │
│  │    Joined: 2 days ago                                  │  │
│  │                                                        │  │
│  │    [View Full Profile] [Approve] [Reject]              │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Review Checklist:                                           │
│  ✓ Profile complete                                          │
│  ✓ Social accounts verified                                  │
│  ✓ Bank details provided                                     │
│  ✓ Portfolio uploaded                                        │
│  ✓ No duplicate accounts                                     │
│                                                              │
│  Actions:                                                    │
│  • Approve → Creator goes live                               │
│  • Reject → Send reason, can reapply                         │
│  • Request more info                                         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  3. WALLET MANAGEMENT (/admin/wallets)                       │
├──────────────────────────────────────────────────────────────┤
│  All User Wallets:                                           │
│  • Total platform balance                                    │
│  • Individual user balances                                  │
│  • Transaction history                                       │
│  • Pending payouts                                           │
│                                                              │
│  Admin Actions:                                              │
│  • Manual credit/debit (with reason)                         │
│  • View transaction logs                                     │
│  • Export wallet report                                      │
│  • Freeze/Unfreeze wallet                                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  4. FEE CONFIGURATION (/admin/settings)                      │
├──────────────────────────────────────────────────────────────┤
│  Platform Settings:                                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Platform Fee: [10] %                                   │  │
│  │ GST Rate: [18] %                                       │  │
│  │                                                        │  │
│  │ Subscription Pricing:                                  │  │
│  │ • Monthly: ₹ [199]                                     │  │
│  │ • Annual: ₹ [1999]                                     │  │
│  │ • Monthly Contact Limit: [25]                          │  │
│  │                                                        │  │
│  │ Pay-as-you-go:                                         │  │
│  │ • Price per contact: ₹ [15]                            │  │
│  │                                                        │  │
│  │ [Update Settings]                                      │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  5. ANALYTICS (/admin/analytics)                             │
├──────────────────────────────────────────────────────────────┤
│  📈 Revenue Analytics                                         │
│  • Daily/Weekly/Monthly revenue                              │
│  • Platform fee breakdown                                    │
│  • Subscription vs. Pay-as-you-go                            │
│                                                              │
│  📊 User Analytics                                           │
│  • New user signups                                          │
│  • Active users (DAU/MAU)                                    │
│  • User retention                                            │
│                                                              │
│  💼 Project Analytics                                        │
│  • Projects created/completed                                │
│  • Average project value                                     │
│  • Completion rate                                           │
│  • Dispute rate                                              │
│                                                              │
│  🏆 Top Performers                                           │
│  • Top earning creators                                      │
│  • Top spending businesses                                   │
│  • Most active categories                                    │
│                                                              │
│  [Export Report] [Download CSV]                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  6. PAYOUT MANAGEMENT (/admin/payouts)                       │
├──────────────────────────────────────────────────────────────┤
│  Pending Payout Requests:                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Creator: Priya Sharma                                  │  │
│  │ Amount: ₹25,000                                        │  │
│  │ Bank: HDFC Bank - ****4567                             │  │
│  │ Requested: March 28, 2025                              │  │
│  │                                                        │  │
│  │ Wallet Balance: ₹25,000 ✅                             │  │
│  │ KYC Verified: ✅                                       │  │
│  │ Bank Details: ✅                                       │  │
│  │                                                        │  │
│  │ [View Details] [Approve] [Reject]                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Approval Process:                                           │
│  1. Verify wallet balance sufficient                         │
│  2. Check KYC/bank details                                   │
│  3. Mark as "processing"                                     │
│  4. Transfer via bank/UPI                                    │
│  5. Mark as "completed"                                      │
│  6. Deduct from creator wallet                               │
│                                                              │
│  Payout History:                                             │
│  • Completed payouts                                         │
│  • Failed payouts (with reason)                              │
│  • Total disbursed                                           │
└──────────────────────────────────────────────────────────────┘
```

---

## Analytics & Reporting Flow

```
┌────────────────────────────────────────────────────────────────┐
│            ANALYTICS & REPORTING FLOW                           │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  User opens Analytics Dashboard                │
│  (Different views for each role)                │
└────┬────────────────────────────────────────────┘
     │
┌────┴────────────────────────────────┐
│                                     │
▼                                     ▼
┌──────────────────────┐    ┌──────────────────────┐
│  BUSINESS ANALYTICS  │    │  CREATOR ANALYTICS   │
│  /analytics          │    │  /creator-analytics  │
└────┬─────────────────┘    └────┬─────────────────┘
     │                           │
     ▼                           ▼

┌─────────────────────────────────────────────────────┐
│  BUSINESS ANALYTICS DASHBOARD                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📊 SPENDING OVERVIEW                               │
│  ┌───────────────────────────────────────────────┐  │
│  │ Total Spent (All Time): ₹2,45,000             │  │
│  │ • This Month: ₹45,000                         │  │
│  │ • Last Month: ₹38,000                         │  │
│  │ • Trend: ↗️ +18%                              │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  💼 PROJECTS                                        │
│  ┌───────────────────────────────────────────────┐  │
│  │ • Active: 3                                   │  │
│  │ • Completed: 12                               │  │
│  │ • Disputed: 0                                 │  │
│  │ • Success Rate: 100%                          │  │
│  │                                               │  │
│  │ Average Project Value: ₹18,750                │  │
│  │ Average Completion Time: 5.2 days             │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  👥 CREATOR CONTACTS                                │
│  ┌───────────────────────────────────────────────┐  │
│  │ This Month: 18/25 used                        │  │
│  │ [██████████████░░░░░░░] 72%                   │  │
│  │                                               │  │
│  │ Pay-as-you-go Charges: ₹0                     │  │
│  │ (7 contacts remaining)                        │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  📈 SPENDING BREAKDOWN                              │
│  ┌───────────────────────────────────────────────┐  │
│  │ Category-wise:                                │  │
│  │ • Fashion: ₹80,000 (33%)                      │  │
│  │ • Tech: ₹65,000 (27%)                         │  │
│  │ • Food: ₹50,000 (20%)                         │  │
│  │ • Others: ₹50,000 (20%)                       │  │
│  │                                               │  │
│  │ [Pie Chart Visualization]                     │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  🏆 TOP CREATORS WORKED WITH                        │
│  ┌───────────────────────────────────────────────┐  │
│  │ 1. Priya Sharma - 4 projects - ₹60,000       │  │
│  │ 2. Rahul Tech - 3 projects - ₹45,000          │  │
│  │ 3. Food Vlogs - 2 projects - ₹30,000          │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  CREATOR ANALYTICS DASHBOARD                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  💰 EARNINGS OVERVIEW                               │
│  ┌───────────────────────────────────────────────┐  │
│  │ Total Earnings: ₹1,85,000                     │  │
│  │ • This Month: ₹35,000                         │  │
│  │ • Last Month: ₹28,000                         │  │
│  │ • Trend: ↗️ +25%                              │  │
│  │                                               │  │
│  │ Wallet Balance: ₹12,500                       │  │
│  │ Pending Payouts: ₹0                           │  │
│  │ [Request Payout]                              │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  💼 PROJECT STATS                                   │
│  ┌───────────────────────────────────────────────┐  │
│  │ • Total Projects: 28                          │  │
│  │ • Completed: 24 (86%)                         │  │
│  │ • Active: 3                                   │  │
│  │ • Cancelled: 1                                │  │
│  │                                               │  │
│  │ Average Rating: ⭐⭐⭐⭐⭐ 4.8/5.0              │  │
│  │ Total Reviews: 24                             │  │
│  │                                               │  │
│  │ Average Project Value: ₹7,708                 │  │
│  │ Avg Completion Time: 4.5 days                 │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  🏆 BADGES & REPUTATION                             │
│  ┌───────────────────────────────────────────────┐  │
│  │ Current Badge: ⭐ Top Rated                   │  │
│  │                                               │  │
│  │ Performance Metrics:                          │  │
│  │ • On-time Delivery: 96%                       │  │
│  │ • Response Time: 2.3 hours                    │  │
│  │ • Revision Rate: 8%                           │  │
│  │ • Dispute Rate: 0%                            │  │
│  │                                               │  │
│  │ Next Badge: 🏆 Premium                        │  │
│  │ Requirements:                                 │  │
│  │ ✅ 30+ projects (Current: 28)                 │  │
│  │ ✅ 4.8+ rating (Current: 4.8)                 │  │
│  │ ⏳ Maintain for 30 days                       │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  📊 PROFILE VIEWS                                   │
│  ┌───────────────────────────────────────────────┐  │
│  │ This Month: 156 views                         │  │
│  │ Last Month: 142 views                         │  │
│  │ Contact Requests: 23                          │  │
│  │ Conversion Rate: 15%                          │  │
│  │                                               │  │
│  │ [Weekly Trend Graph]                          │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  🎯 PERFORMANCE INSIGHTS                            │
│  ┌───────────────────────────────────────────────┐  │
│  │ 💡 Tips to improve:                           │  │
│  │ • Upload more portfolio samples               │  │
│  │ • Respond faster to messages (goal: <2h)      │  │
│  │ • Complete 2 more projects for Premium badge  │  │
│  │ • Update pricing for better conversions       │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  DATA TRACKING & UPDATES                                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Real-time Updates:                                            │
│  • Project completion → Update earnings                        │
│  • New review → Recalculate average rating                     │
│  • Profile view → Increment counter                            │
│  • Message received → Update response time                     │
│  • Badge criteria met → Auto-upgrade badge                     │
│                                                                │
│  Scheduled Jobs (Cron):                                        │
│  • Daily: Calculate response times, update trends              │
│  • Weekly: Generate performance reports                        │
│  • Monthly: Reset contact limits, send summary emails          │
└────────────────────────────────────────────────────────────────┘
```

---

## Summary: Complete Platform Flow

```
┌────────────────────────────────────────────────────────────────┐
│               CREABASE - END-TO-END FLOW                        │
└────────────────────────────────────────────────────────────────┘

1. USER ONBOARDING
   └─→ Sign up → Select role → OAuth → Profile creation

2. CREATOR JOURNEY
   └─→ Profile setup → Social verification → Bank details
       → Admin approval → Go live → Receive projects

3. BUSINESS JOURNEY
   └─→ Browse creators → Subscribe → View contacts
       → Create projects → Chat → Pay & Review

4. PROJECT LIFECYCLE
   └─→ Create → Payment (escrow) → Creator accepts
       → Work delivered → Business approves → Escrow release

5. PAYMENT FLOW
   └─→ Cashfree integration → Escrow holding
       → Admin/auto release → Creator wallet → Payout

6. COMMUNICATION
   └─→ In-app chat → Real-time messaging → Notifications
       → Email alerts

7. DISPUTE RESOLUTION
   └─→ Raise dispute → Freeze escrow → Admin review
       → Decision → Partial/Full refund or release

8. ADMIN MANAGEMENT
   └─→ Approve creators → Manage users → Configure fees
       → Resolve disputes → Process payouts → Analytics

9. ANALYTICS
   └─→ Track revenue → Monitor projects → User engagement
       → Creator performance → Business spending

10. MONETIZATION
    └─→ Subscription fees (₹199/₹1999)
        → Pay-as-you-go charges (₹17.70)
        → Platform fees (10% + 18% GST)
        → Transaction volume

┌────────────────────────────────────────────────────────────────┐
│  REVENUE FORMULA PER PROJECT                                   │
│  Business Pays: Project Amount × 1.118                         │
│  Creator Gets: Project Amount                                  │
│  Platform Gets: (Project Amount × 0.10) + GST                  │
└────────────────────────────────────────────────────────────────┘
```

---

*Document Created: March 29, 2025*
*Last Updated: March 29, 2025*
*Platform: Creabase - Content Creator Marketplace*
