# Social Media Verification Setup Guide

## Overview
The Social Media Verification feature allows creators to verify their Instagram and YouTube accounts via OAuth, displaying verified badges and follower/subscriber counts on their profiles.

## Current Status
✅ **Implementation Complete** - Full OAuth flow implemented  
⚠️ **API Keys Required** - Waiting for credentials to enable the feature

---

## Setup Instructions

### 1. Instagram OAuth Setup

**Step 1: Create Facebook App**
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Click "My Apps" → "Create App"
3. Choose "Business" as app type
4. Fill in app details and create

**Step 2: Add Instagram Product**
1. In your app dashboard, click "Add Product"
2. Find "Instagram" and click "Set Up"
3. Configure Instagram Basic Display or Instagram Platform API

**Step 3: Get Credentials**
1. Go to Settings → Basic
2. Copy your **App ID**
3. Click "Show" next to **App Secret** and copy it

**Step 4: Configure Redirect URI**
1. In Instagram settings, add your callback URL:
   - Development: `http://localhost:8000/api/instagram/callback`
   - Production: `https://yourdomain.com/api/instagram/callback`

**Step 5: Add to Environment**
Update `/app/backend/.env`:
```env
INSTAGRAM_APP_ID="your_app_id_here"
INSTAGRAM_APP_SECRET="your_app_secret_here"
INSTAGRAM_REDIRECT_URI="https://yourdomain.com/api/instagram/callback"
```

---

### 2. YouTube OAuth Setup

**Step 1: Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one

**Step 2: Enable YouTube Data API**
1. Go to "APIs & Services" → "Library"
2. Search for "YouTube Data API v3"
3. Click "Enable"

**Step 3: Create OAuth Credentials**
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Configure OAuth consent screen if prompted
4. Choose "Web application" as application type
5. Add authorized redirect URIs:
   - Development: `http://localhost:8000/api/youtube/callback`
   - Production: `https://yourdomain.com/api/youtube/callback`

**Step 4: Get Credentials**
1. Copy the **Client ID**
2. Copy the **Client Secret**

**Step 5: (Optional) Create API Key**
1. Click "Create Credentials" → "API Key"
2. Copy the generated API key

**Step 6: Add to Environment**
Update `/app/backend/.env`:
```env
YOUTUBE_CLIENT_ID="your_client_id_here"
YOUTUBE_CLIENT_SECRET="your_client_secret_here"
YOUTUBE_REDIRECT_URI="https://yourdomain.com/api/youtube/callback"
YOUTUBE_API_KEY="your_api_key_here"  # Optional
```

---

## After Adding Credentials

### 1. Restart Backend
```bash
sudo supervisorctl restart backend
```

### 2. Test Verification Flow

**Instagram:**
1. Log in as a creator
2. Go to Creator Dashboard → Social Verification tab
3. Click "Verify Instagram"
4. Authorize the app on Instagram
5. Should redirect back with verification success

**YouTube:**
1. Log in as a creator
2. Go to Creator Dashboard → Social Verification tab
3. Click "Verify YouTube"
4. Authorize the app on Google
5. Should redirect back with verification success

---

## API Endpoints

### Instagram Verification
- **POST** `/api/creators/verify/instagram/initiate` - Start Instagram OAuth
- **GET** `/api/instagram/callback` - Instagram OAuth callback
- **DELETE** `/api/creators/verify/instagram` - Remove verification

### YouTube Verification
- **POST** `/api/creators/verify/youtube/initiate` - Start YouTube OAuth
- **GET** `/api/youtube/callback` - YouTube OAuth callback
- **DELETE** `/api/creators/verify/youtube` - Remove verification

### Status
- **GET** `/api/creators/{creator_id}/verification-status` - Get verification status

---

## Database Schema

Verification data is stored in the `users` collection:

```javascript
{
  // Instagram
  instagram_verified: Boolean,
  instagram_handle: String,
  instagram_followers: Number,
  instagram_account_type: String,
  instagram_verified_at: DateTime,
  instagram_access_token: String,  // Encrypted in production
  
  // YouTube
  youtube_verified: Boolean,
  youtube_channel_id: String,
  youtube_channel_name: String,
  youtube_subscribers: Number,
  youtube_custom_url: String,
  youtube_verified_at: DateTime,
  youtube_access_token: String,  // Encrypted in production
  youtube_refresh_token: String
}
```

---

## Security Notes

1. **Never commit credentials** - Keep API keys in `.env` only
2. **Encrypt tokens** - In production, encrypt access tokens before storing
3. **HTTPS Only** - Use HTTPS for all OAuth callbacks in production
4. **Token Rotation** - Implement token refresh logic for long-term access
5. **Rate Limiting** - Monitor API quota usage (Instagram: 200 req/hour, YouTube: 10,000 units/day)

---

## Troubleshooting

### "Instagram OAuth not configured" Error
- Check that `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, and `INSTAGRAM_REDIRECT_URI` are set in `.env`
- Restart backend after adding credentials

### "YouTube OAuth not configured" Error
- Check that `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, and `YOUTUBE_REDIRECT_URI` are set in `.env`
- Restart backend after adding credentials

### OAuth Callback Fails
- Verify redirect URI in app settings matches exactly (including http/https and trailing slashes)
- Check backend logs: `tail -f /var/log/supervisor/backend.*.log`

### No Follower/Subscriber Count
- Instagram: Requires Business or Creator account (not personal)
- YouTube: Check API permissions and scopes

---

## Frontend Implementation

**Component:** `/app/frontend/src/components/SocialVerificationCard.js`

**Features:**
- Instagram and YouTube verification buttons
- Displays verification status and metrics
- Shows follower/subscriber counts
- Handles OAuth callback redirects
- Remove verification functionality

**Usage:**
```jsx
import SocialVerificationCard from '../components/SocialVerificationCard';

// In Creator Dashboard
<SocialVerificationCard />
```

---

## Testing Without Real OAuth

For testing the UI without setting up OAuth:

1. Manually update a creator user in MongoDB:
```javascript
db.users.updateOne(
  { email: "creator@example.com" },
  { $set: {
    instagram_verified: true,
    instagram_handle: "test_creator",
    instagram_followers: 50000,
    youtube_verified: true,
    youtube_channel_name: "Test Channel",
    youtube_subscribers: 100000
  }}
)
```

2. The UI will display the verified status

---

## Next Steps

Once credentials are added:
1. ✅ Test Instagram verification flow
2. ✅ Test YouTube verification flow
3. ✅ Verify data storage in database
4. ✅ Check verification badges display on creator profiles
5. ✅ Test removing verifications

---

## Support Resources

- [Instagram Platform API Documentation](https://developers.facebook.com/docs/instagram-platform/)
- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [OAuth 2.0 Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
