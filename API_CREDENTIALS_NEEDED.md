# API Credentials Needed for Creabase Platform

## Required API Credentials

You need to obtain and configure the following API credentials to enable full platform functionality:

---

## 1. Cashfree (Payment Gateway) ✅ REQUIRED FOR PAYMENTS

**Purpose**: Process payments for creator premium subscriptions and business subscriptions

**What you need**:
- `CASHFREE_CLIENT_ID`
- `CASHFREE_CLIENT_SECRET`
- `CASHFREE_ENV` (SANDBOX for testing, PRODUCTION for live)

**Where to get**:
1. Sign up at: https://merchant.cashfree.com/
2. Complete KYC verification
3. Navigate to: Dashboard → Developers → API Keys
4. Copy your **Client ID** and **Client Secret**

**Where to add**:
File: `/app/backend/.env`
```env
CASHFREE_CLIENT_ID="your_client_id_here"
CASHFREE_CLIENT_SECRET="your_client_secret_here"
CASHFREE_ENV="SANDBOX"  # Use "PRODUCTION" when going live
```

**After adding**:
```bash
sudo supervisorctl restart backend
```

**Test Mode**:
- Use Cashfree test cards: `4111 1111 1111 1111`
- Test UPI: `testsuccess@gocash`

---

## 2. Instagram OAuth (Social Verification) - OPTIONAL

**Purpose**: Allow creators to verify their Instagram accounts and display follower counts

**What you need**:
- `INSTAGRAM_APP_ID`
- `INSTAGRAM_APP_SECRET`
- `INSTAGRAM_REDIRECT_URI`

**Where to get**:
1. Go to: https://developers.facebook.com
2. Create a new app (or use existing)
3. Add "Instagram" product to your app
4. Navigate to: Settings → Basic
5. Copy **App ID** and **App Secret**

**Where to add**:
File: `/app/backend/.env`
```env
INSTAGRAM_APP_ID="your_app_id_here"
INSTAGRAM_APP_SECRET="your_app_secret_here"
INSTAGRAM_REDIRECT_URI="https://yourdomain.com/api/instagram/callback"
```

**Important**:
- Update `INSTAGRAM_REDIRECT_URI` with your actual domain
- For local testing: `http://localhost:8000/api/instagram/callback`

**After adding**:
```bash
sudo supervisorctl restart backend
```

---

## 3. YouTube OAuth (Social Verification) - OPTIONAL

**Purpose**: Allow creators to verify their YouTube channels and display subscriber counts

**What you need**:
- `YOUTUBE_CLIENT_ID`
- `YOUTUBE_CLIENT_SECRET`
- `YOUTUBE_REDIRECT_URI`
- `YOUTUBE_API_KEY` (optional)

**Where to get**:
1. Go to: https://console.cloud.google.com
2. Create a new project (or select existing)
3. Enable **YouTube Data API v3**:
   - APIs & Services → Library → Search "YouTube Data API v3" → Enable
4. Create OAuth 2.0 credentials:
   - APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
5. Configure OAuth consent screen if prompted
6. Add authorized redirect URI: `https://yourdomain.com/api/youtube/callback`
7. Copy **Client ID** and **Client Secret**

**Where to add**:
File: `/app/backend/.env`
```env
YOUTUBE_CLIENT_ID="your_client_id_here"
YOUTUBE_CLIENT_SECRET="your_client_secret_here"
YOUTUBE_REDIRECT_URI="https://yourdomain.com/api/youtube/callback"
YOUTUBE_API_KEY="your_api_key_here"  # Optional
```

**Important**:
- Update `YOUTUBE_REDIRECT_URI` with your actual domain
- For local testing: `http://localhost:8000/api/youtube/callback`

**After adding**:
```bash
sudo supervisorctl restart backend
```

---

## Priority Order

### Must Have (Platform Won't Work Without):
1. ✅ **Cashfree** - Required for all payment features

### Nice to Have (Enhances Platform):
2. ⭐ **Instagram OAuth** - For creator verification
3. ⭐ **YouTube OAuth** - For creator verification

---

## Current Status

- ✅ **Code Implementation**: Complete for all integrations
- ⏳ **Cashfree Credentials**: Needed for payments
- ⏳ **Instagram Credentials**: Needed for IG verification
- ⏳ **YouTube Credentials**: Needed for YT verification

---

## What Happens Without Credentials?

### Without Cashfree:
- Premium subscriptions won't work
- Business subscriptions won't process
- Payment checkout will show "Payment system not configured"
- Everything else works fine

### Without Instagram/YouTube:
- Social verification buttons will show "OAuth not configured"
- Creators can still use platform without verification
- Everything else works fine

---

## Testing Credentials (Sandbox Mode)

### Cashfree Test Environment:
- Mode: SANDBOX
- Test cards work
- No real money processed
- Use for development and testing

### Production Credentials:
- Only use when ready to go live
- Real payments will be processed
- Complete KYC verification required
- Set `CASHFREE_ENV="PRODUCTION"`

---

## Need Help?

**Cashfree Setup Issues**: 
- Documentation: https://docs.cashfree.com/docs/
- Support: merchant-care@cashfree.com

**Instagram/Facebook Setup Issues**:
- Documentation: https://developers.facebook.com/docs/instagram
- Community: https://developers.facebook.com/community/

**YouTube API Setup Issues**:
- Documentation: https://developers.google.com/youtube/v3
- Support: Google Cloud Console → Support

---

## Quick Start Checklist

- [ ] Sign up for Cashfree account
- [ ] Get Cashfree sandbox credentials
- [ ] Add credentials to `/app/backend/.env`
- [ ] Restart backend: `sudo supervisorctl restart backend`
- [ ] Test premium subscription payment flow
- [ ] (Optional) Set up Instagram OAuth
- [ ] (Optional) Set up YouTube OAuth
- [ ] Switch to production credentials when ready

---

**Once you add the credentials, all features will be fully operational!**
