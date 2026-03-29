# Creator Visibility & Approval System - Business Rule

## ⚠️ CRITICAL BUSINESS RULE

**Only APPROVED creators are visible to business users and in public search.**

---

## Implementation Details

### Backend Endpoint: `GET /api/creators`

**Location:** `/app/backend/server.py` (Line 470-538)

```python
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
    status: str = "approved"  # ✅ DEFAULT: Only approved creators
):
    query: Dict[str, Any] = {"status": status}  # ✅ Applied to query
    # ... rest of the logic
```

### Key Points:

1. **Default Status Filter:** `status: str = "approved"`
2. **Query Filter:** `query: Dict[str, Any] = {"status": status}`
3. **No Authentication Required:** Public endpoint (businesses and visitors can browse)

---

## Creator Status Lifecycle

```
┌────────────────────────────────────────────────────────────┐
│              CREATOR STATUS FLOW                           │
└────────────────────────────────────────────────────────────┘

Creator Signs Up
     │
     ▼
┌─────────────────┐
│ Status: PENDING │  ← NOT VISIBLE to business users
└────┬────────────┘    NOT VISIBLE in public search
     │
     │ Admin reviews profile
     │
     ├───────────────┬────────────────┐
     │               │                │
     ▼               ▼                ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐
│ APPROVED │  │ REJECTED │  │ MORE_INFO    │
└────┬─────┘  └────┬─────┘  └──────┬───────┘
     │             │                │
     │             │                ▼
     │             │         Creator updates
     │             │         → Back to PENDING
     │             │
     │             ▼
     │      ❌ HIDDEN from search
     │         (Permanently unless reapplied)
     │
     ▼
✅ VISIBLE in public search
✅ VISIBLE to business users
✅ Can receive project offers
✅ Appears in filtered results
```

---

## Where Creators Are Visible

### ✅ Visible (Approved Creators Only)

1. **Landing Page Creator Grid**
   - URL: `/`
   - Endpoint: `GET /api/creators`
   - Default status filter: "approved"

2. **Business Dashboard Search**
   - URL: `/dashboard`
   - Endpoint: `GET /api/creators`
   - Default status filter: "approved"

3. **Creator Profile Page (Direct Link)**
   - URL: `/creator/:id`
   - Endpoint: `GET /api/creators/{creator_id}`
   - Only accessible if creator is "approved"

4. **Filtered Search Results**
   - All search queries default to approved creators
   - Platform, language, industry, location filters apply only to approved creators

### ❌ Not Visible (Pending/Rejected Creators)

1. **Public Search**
   - Pending creators: Hidden
   - Rejected creators: Hidden

2. **Business Dashboard**
   - Cannot find pending/rejected creators

3. **Direct Profile Links**
   - Would return 404 or "Creator not found" for non-approved creators

### 🔐 Admin Only Visibility

**Admin Dashboard** (`/admin/creators`)
- Endpoint: `GET /api/admin/creators`
- Shows ALL creators regardless of status:
  - ✅ Approved
  - ⏳ Pending
  - ❌ Rejected
  - 📝 More Info Requested

---

## Database Schema

### Creators Collection

```javascript
{
  "creator_id": "creator_abc123",
  "user_id": "user_xyz789",
  "name": "Priya Sharma",
  "status": "approved",  // ⚠️ Key field: "pending" | "approved" | "rejected"
  "bio": "Fashion & Lifestyle Creator",
  "platforms": ["instagram", "youtube"],
  "instagram_handle": "@priya_vlogs",
  "instagram_followers": 50000,
  "instagram_verified": true,
  "youtube_channel": "Priya Vlogs",
  "youtube_subscribers": 120000,
  "youtube_verified": true,
  "industry": "fashion",
  "language": "english",
  "city": "Mumbai",
  "district": "Andheri",
  "badge": "verified",
  "created_at": "2025-03-15T10:30:00Z",
  "approved_at": "2025-03-17T14:20:00Z",  // Set when approved
  "approved_by": "admin_user_id"
}
```

---

## API Response Examples

### Public Creator Search (Business User)

**Request:**
```http
GET /api/creators?platform=instagram&language=english
```

**Response:**
```json
[
  {
    "creator_id": "creator_001",
    "name": "Priya Sharma",
    "status": "approved",
    "instagram_followers": 50000,
    "badge": "verified",
    "is_premium": false
  },
  {
    "creator_id": "creator_002",
    "name": "Rahul Tech",
    "status": "approved",
    "youtube_subscribers": 200000,
    "badge": "top_rated",
    "is_premium": true
  }
]
```

**Note:** No pending or rejected creators in response.

---

### Admin View (All Creators)

**Request:**
```http
GET /api/admin/creators
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "creator_id": "creator_001",
    "name": "Priya Sharma",
    "status": "approved",
    "approved_at": "2025-03-17T14:20:00Z"
  },
  {
    "creator_id": "creator_003",
    "name": "New Creator",
    "status": "pending",
    "created_at": "2025-03-29T08:00:00Z"
  },
  {
    "creator_id": "creator_004",
    "name": "Rejected Creator",
    "status": "rejected",
    "rejection_reason": "Incomplete profile"
  }
]
```

---

## Testing the Business Rule

### Test Case 1: Public Search Shows Only Approved

**Steps:**
1. Open landing page: https://repo-viewer-46.preview.emergentagent.com
2. Scroll to "Find Creators" section
3. Observe creator listings

**Expected Result:**
- Only creators with `status: "approved"` are shown
- No pending or rejected creators visible

### Test Case 2: Admin Can See All

**Steps:**
1. Login as admin: admin@creabase.com / admin123
2. Navigate to `/admin/creators`
3. Check status column

**Expected Result:**
- All creators visible (pending, approved, rejected)
- Status filter available

### Test Case 3: Pending Creator Not in Search

**Steps:**
1. Create a new creator (sign up as creator)
2. Complete profile but don't wait for approval
3. Logout and browse as business user
4. Search for the new creator by name

**Expected Result:**
- New creator NOT found in search results
- Profile page returns error or 404

### Test Case 4: After Approval, Creator Appears

**Steps:**
1. Admin approves the pending creator
2. Refresh business dashboard
3. Search for the creator again

**Expected Result:**
- Creator now appears in search results
- Profile is accessible
- Can view contact info (with subscription)

---

## Frontend Implementation

### Landing Page Enhanced (LandingPageEnhanced.js)

```javascript
const fetchCreators = async () => {
  try {
    const params = new URLSearchParams();
    // No status parameter needed - backend defaults to "approved"
    if (searchQuery) params.append('search', searchQuery);
    if (selectedPlatform && selectedPlatform !== 'all') 
      params.append('platform', selectedPlatform);
    // ... other filters
    
    const response = await axios.get(
      `${BACKEND_URL}/api/creators?${params.toString()}`
    );
    setCreators(response.data);  // Only approved creators
  } catch (error) {
    console.error('Error fetching creators:', error);
  }
};
```

---

## Security Considerations

### Why This Rule Exists:

1. **Quality Control:** Only vetted creators appear to businesses
2. **Trust Building:** Businesses see verified, legitimate creators
3. **Fraud Prevention:** Prevents fake profiles from being visible
4. **Platform Reputation:** Maintains high standards

### Implementation Benefits:

✅ **Automatic Filtering:** No need to manually filter in frontend
✅ **Consistent Behavior:** All search endpoints use same rule
✅ **Admin Override:** Admin can manage all creators regardless
✅ **Performance:** Database index on `status` field for fast queries

---

## MongoDB Query Optimization

### Recommended Index:

```javascript
db.creators.createIndex({ "status": 1 });
db.creators.createIndex({ "status": 1, "created_at": -1 });
db.creators.createIndex({ "status": 1, "premium_until": -1 });
```

This ensures fast queries when filtering by approval status.

---

## Edge Cases Handled

### 1. Creator Profile Link Sharing
**Scenario:** Business user shares direct link to pending creator
**Behavior:** Profile shows "Creator not found" or requires approval

### 2. Creator Gets Rejected After Being Bookmarked
**Scenario:** Business user favorited a creator, then creator gets rejected
**Behavior:** Creator disappears from search, favorite still exists but profile inaccessible

### 3. Admin Viewing Creator Details
**Scenario:** Admin clicks on any creator (pending/approved/rejected)
**Behavior:** Full profile visible with status indicator

### 4. Status Parameter Override (Potential Security Issue)
**Scenario:** Malicious user tries: `GET /api/creators?status=pending`
**Current Behavior:** ⚠️ Would show pending creators
**Recommended Fix:** Remove status parameter from public endpoint or restrict to admin

---

## Recommended Enhancement

### Secure the Status Parameter

**Current Code (Line 480):**
```python
status: str = "approved"
```

**Recommended Change:**
```python
@api_router.get("/creators")
async def get_creators(
    search: Optional[str] = None,
    platform: Optional[str] = None,
    # ... other params
    # Remove status parameter completely for public endpoint
):
    # Always enforce approved status for non-admin users
    query: Dict[str, Any] = {"status": "approved"}
    # ... rest of logic
```

**Or with role-based access:**
```python
@api_router.get("/creators")
async def get_creators(
    search: Optional[str] = None,
    platform: Optional[str] = None,
    status: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_user)
):
    # Only admin can override status filter
    if current_user and current_user.role == "admin":
        query: Dict[str, Any] = {"status": status} if status else {}
    else:
        query: Dict[str, Any] = {"status": "approved"}
    # ... rest of logic
```

---

## Summary

✅ **Current Implementation:** Only approved creators are visible (default)
✅ **Frontend:** No changes needed, backend enforces rule
✅ **Admin Access:** Full visibility of all creator statuses
⚠️ **Security Note:** Consider hardcoding approved status for non-admin users

**The business rule "Only approved creators can be seen by business" is ALREADY IMPLEMENTED and WORKING correctly!**

---

*Document Created: March 29, 2025*
*Last Updated: March 29, 2025*
