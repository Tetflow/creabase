# Creabase - Content Creator Database Platform

## Original Problem Statement
Create a content creator database (Instagram & YouTube) where businesses can search for creators (free) and get contact information (paid).

## Target Users
- **Businesses/Brands**: Search and hire content creators for collaborations
- **Content Creators**: List their profiles, get discovered, earn from projects
- **Admin**: Manage platform, approve creators, handle disputes

## Core Features

### Implemented (March 2026)
1. **User Authentication**
   - Google OAuth integration (via Emergent demo backend - MOCKED)
   - Session-based authentication with JWT tokens
   - Role selection: Admin, Creator, Business

2. **Creator Discovery**
   - Public creator listing with search
   - Advanced filters: platform, language, industry, city, district, follower count
   - Premium creator listings shown first
   - **Skeleton loaders** during data loading

3. **Subscription System**
   - ₹199/month or ₹1999/year plans
   - 25 creator contact views per month included
   - Pay-as-you-go: ₹15 + GST (₹17.70) per additional creator
   - Usage tracking and monthly reset

4. **Creator Profiles**
   - Bio, platforms, social stats
   - Instagram/YouTube verification (MOCKED)
   - Bank details for payouts
   - Portfolio management
   - **Creator Badges** (Premium, Top Rated, Rising Star, Verified, New)

5. **Project/Escrow System**
   - Project creation with **Creator Selector dropdown**
   - 10% + GST platform fee
   - Escrow holding and release
   - Status workflow: pending → active → delivered → completed

6. **Chat System**
   - Direct messaging between business and creator
   - **Enhanced chat UI** with user avatars, date separators
   - **Typing indicator** while sending
   - Read receipts (checkmarks)
   - Message grouping by date

7. **Analytics Dashboard**
   - Business analytics: projects, spending, creator stats
   - Creator analytics: earnings, reputation, engagement
   - Order statistics summary

8. **Order Management**
   - Order listing with status filter
   - Status updates and timeline
   - Revision requests
   - Action buttons based on user role

9. **UX Enhancements** *(NEW)*
   - **Contact Modal** - Beautiful modal with creator preview, contact copy buttons, usage tracking
   - **Creator Selector** - Searchable dropdown for selecting creators in project forms
   - **Skeleton Loaders** - Animated loading placeholders (GridSkeleton, ListSkeleton, etc.)
   - **Illustrated Empty States** - SVG illustrations with action CTAs
   - **Smooth Animations** - fadeIn, slideUp, slideDown, typing indicator

10. **Admin Dashboard**
    - Creator approval workflow
    - Platform statistics
    - Dispute management

### Mocked Integrations (Awaiting User API Keys)
- Cashfree Payment Gateway
- Google OAuth (real implementation)
- YouTube Data API v3
- Instagram Graph API
- SendGrid/Twilio for notifications
- AWS S3/Cloudinary for file uploads

## Technical Architecture

### Backend (FastAPI + MongoDB)
- `/app/backend/server.py` - Main API (1700+ lines)
- `/app/backend/services.py` - External service stubs
- Motor async MongoDB driver

### Frontend (React + Tailwind + Shadcn)
- `/app/frontend/src/pages/` - 15 page components
- `/app/frontend/src/components/` - Reusable UI components
- Neobrutalism design system

### Key API Endpoints
- `/api/auth/*` - Authentication
- `/api/creators/*` - Creator CRUD + contact
- `/api/projects/*` - Project/order management
- `/api/orders/*` - Order management (NEW)
- `/api/analytics/*` - Analytics dashboards (NEW)
- `/api/subscriptions/*` - Subscription handling
- `/api/messages/*` - Chat system
- `/api/admin/*` - Admin operations

## Database Schema

### Collections
- `users` - User accounts with subscription info
- `creators` - Creator profiles with stats
- `projects` - Projects/orders with escrow
- `escrow_transactions` - Payment tracking
- `messages` - Chat messages
- `notifications` - In-app notifications
- `reviews` - Project reviews
- `favorites` - Saved creators
- `creator_views` - Contact view tracking
- `payg_charges` - Pay-as-you-go charges

## Platform Constants
- `PLATFORM_FEE_PERCENT`: 10%
- `GST_PERCENT`: 18%
- `MONTHLY_CREATOR_LIMIT`: 25
- `PAY_AS_YOU_GO_PRICE`: ₹15

## Next Steps / Backlog

### P1 (Awaiting API Keys)
- Real Cashfree payment integration
- Real Google OAuth
- YouTube/Instagram API for stats verification
- Email notifications via SendGrid

### P2 (Future)
- Milestone-based payments
- Real-time WebSocket chat
- File uploads (S3/Cloudinary)
- SMS notifications via Twilio

### P3 (Enhancements)
- Creator search recommendations
- Analytics exports
- Invoice PDF generation
- Mobile app consideration
