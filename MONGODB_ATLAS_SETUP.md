# 🗄️ MongoDB Atlas Setup Guide for Creabase

This guide explains where data is stored, how to connect to MongoDB Atlas, and what scripts to run.

---

## 📊 Current Data Storage

### **Collections (29 Total)**

All application data is stored in MongoDB collections:

| Collection | Purpose | Example Data |
|-----------|---------|--------------|
| **users** | User accounts (admin, business, creator) | name, email, role, subscription_status |
| **creators** | Creator profiles & stats | bio, skills, followers, rating |
| **projects** | Collaboration projects | title, description, budget, status |
| **wallets** | User wallet balances | balance, currency |
| **wallet_transactions** | Transaction history | amount, type, description |
| **escrow** | Payment escrow for projects | amount, status, release_date |
| **disputes** | Dispute management | reason, status, resolution |
| **subscriptions** | Premium subscriptions | plan, status, renewal_date |
| **messages** | Chat messages | sender_id, receiver_id, content |
| **portfolio** | Creator portfolio items | title, media_url, project_type |
| **reviews** | Creator reviews/ratings | rating, comment, project_id |
| **proposals** | Project proposals | amount, delivery_days, message |
| **favorites** | Saved creators | creator_id, business_id |
| **user_sessions** | Login sessions | session_token, expires_at |
| **bank_details** | Business bank accounts | account_number, ifsc_code |
| **bank_verifications** | Creator bank verification | verification_status, verified_at |
| **creator_views** | Creator profile views tracking | viewed_creator_ids, view_count |
| **payg_charges** | Pay-as-you-go charges | charge_amount, creator_id |
| **platform_config** | Platform configuration | fee_percentage, limits |
| **platform_settings** | Platform settings | tax_rate, company_info |
| **verification_requests** | Social verification requests | platform, handle, status |
| **notifications** | User notifications | message, read_status |
| **payout_requests** | Creator payout requests | amount, status, bank_details |
| **payment_transactions** | Payment history | payment_id, amount, status |
| **withdrawals** | Wallet withdrawals | amount, status, processed_at |
| **escrow_transactions** | Escrow transaction logs | escrow_id, action, amount |
| **user_restrictions** | User restrictions/bans | reason, restricted_until |
| **creator_subscriptions** | Creator premium plans | plan_type, features |
| **conversations** | Chat conversation threads | participants, last_message |

### **Current Configuration**

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
```

**Location**: All data is currently in **local MongoDB** running on port 27017.

---

## 🌐 How to Connect to MongoDB Atlas

### **Step 1: Get MongoDB Atlas Connection String**

1. **Sign in to MongoDB Atlas** → https://cloud.mongodb.com
2. **Create/Select Cluster**
3. Click **"Connect"** button
4. Choose **"Connect your application"**
5. **Driver**: Select **Node.js** and **Version 4.1 or later**
6. **Copy** the connection string:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### **Step 2: Update Backend Configuration**

Edit `/app/backend/.env`:

```env
# OLD (Local MongoDB)
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database

# NEW (MongoDB Atlas)
MONGO_URL=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=creabase_db
```

**⚠️ Important:**
- Replace `<username>` with your Atlas database username
- Replace `<password>` with your Atlas database password
- Change `DB_NAME` from `test_database` to `creabase_db` (or your preferred name)

**Example:**
```env
MONGO_URL=mongodb+srv://creabase_user:MySecureP@ssw0rd@cluster0.mongodb.net/?retryWrites=true&w=majority
DB_NAME=creabase_db
```

### **Step 3: Whitelist IP Address**

In MongoDB Atlas:
1. Go to **Network Access**
2. Click **"Add IP Address"**
3. **Option A**: Add your current IP
4. **Option B**: Add `0.0.0.0/0` (Allow from anywhere - **not recommended for production**)
5. Click **Confirm**

---

## 🚀 Scripts to Run in MongoDB Atlas

### **Method 1: Using MongoDB Atlas UI (Easiest)**

1. **Open MongoDB Atlas** → Select your cluster
2. Click **"Browse Collections"**
3. Click **"Add My Own Data"** or use the built-in **Shell**
4. Go to **"Mongosh"** tab (bottom of screen)
5. Run the scripts below **in order**:

### **Script 1: Initialize Database** (REQUIRED)

Copy and paste this entire script in Atlas Shell:

```javascript
// Switch to your database
use creabase_db;

print("🚀 Starting Creabase database initialization...\n");

// Create all collections
print("📦 Creating collections...");

db.createCollection("users");
db.createCollection("creators");
db.createCollection("projects");
db.createCollection("wallets");
db.createCollection("wallet_transactions");
db.createCollection("escrow");
db.createCollection("escrow_transactions");
db.createCollection("disputes");
db.createCollection("subscriptions");
db.createCollection("creator_subscriptions");
db.createCollection("messages");
db.createCollection("conversations");
db.createCollection("portfolio");
db.createCollection("reviews");
db.createCollection("proposals");
db.createCollection("favorites");
db.createCollection("user_sessions");
db.createCollection("bank_details");
db.createCollection("bank_verifications");
db.createCollection("creator_views");
db.createCollection("payg_charges");
db.createCollection("platform_config");
db.createCollection("platform_settings");
db.createCollection("verification_requests");
db.createCollection("notifications");
db.createCollection("payout_requests");
db.createCollection("payment_transactions");
db.createCollection("withdrawals");
db.createCollection("user_restrictions");

print("✅ Collections created!\n");

// Create indexes for performance
print("⚡ Creating indexes...");

// Users indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "user_id": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });

// Creators indexes
db.creators.createIndex({ "creator_id": 1 }, { unique: true });
db.creators.createIndex({ "user_id": 1 });
db.creators.createIndex({ "status": 1 });
db.creators.createIndex({ 
  "name": "text", 
  "bio": "text", 
  "instagram_handle": "text",
  "youtube_handle": "text"
});

// Projects indexes
db.projects.createIndex({ "project_id": 1 }, { unique: true });
db.projects.createIndex({ "business_id": 1 });
db.projects.createIndex({ "creator_id": 1 });
db.projects.createIndex({ "status": 1 });

// Wallets indexes
db.wallets.createIndex({ "wallet_id": 1 }, { unique: true });
db.wallets.createIndex({ "user_id": 1 }, { unique: true });

// Wallet transactions indexes
db.wallet_transactions.createIndex({ "transaction_id": 1 }, { unique: true });
db.wallet_transactions.createIndex({ "user_id": 1 });
db.wallet_transactions.createIndex({ "created_at": -1 });

// User sessions indexes
db.user_sessions.createIndex({ "session_token": 1 }, { unique: true });
db.user_sessions.createIndex({ "user_id": 1 });
db.user_sessions.createIndex({ "expires_at": 1 });

// Messages indexes
db.messages.createIndex({ "message_id": 1 }, { unique: true });
db.messages.createIndex({ "sender_id": 1 });
db.messages.createIndex({ "receiver_id": 1 });
db.messages.createIndex({ "created_at": -1 });

print("✅ Indexes created!\n");
print("✅ Database initialization complete!\n");
```

### **Script 2: Create Admin User** (REQUIRED)

```javascript
// Switch to your database
use creabase_db;

print("👤 Creating admin user...\n");

var adminEmail = "admin@creabase.com";

// Check if admin already exists
var existingAdmin = db.users.findOne({ email: adminEmail });

if (existingAdmin) {
  print("⚠️  Admin user already exists!");
} else {
  var adminUserId = "admin_" + new Date().getTime();
  var walletId = "wallet_admin_" + new Date().getTime();
  
  // Create admin user
  db.users.insertOne({
    user_id: adminUserId,
    email: adminEmail,
    name: "Platform Admin",
    role: "admin",
    status: "active",
    subscription_status: "premium",
    created_at: new Date(),
    updated_at: new Date()
  });
  
  // Create admin wallet
  db.wallets.insertOne({
    wallet_id: walletId,
    user_id: adminUserId,
    balance: 0.0,
    created_at: new Date(),
    updated_at: new Date()
  });
  
  print("✅ Admin user created!");
  print("\n📧 Admin Credentials:");
  print("   Email: admin@creabase.com");
  print("   Password: admin123");
  print("\n⚠️  Change password after first login!");
}

print("\n✅ Admin seeding complete!\n");
```

---

## 📝 Alternative: Using MongoDB Compass

1. **Download MongoDB Compass** → https://www.mongodb.com/products/compass
2. **Connect** using your Atlas connection string
3. **Select your database** (e.g., `creabase_db`)
4. Click **"Create Collection"** manually for each collection OR
5. Use the **Mongosh** tab at the bottom and run the scripts above

---

## ✅ Verification Steps

After running the scripts:

### **1. Check Collections Created**

In Atlas Shell or Compass:
```javascript
use creabase_db;
show collections;
```

**Expected Output:** 29 collections listed

### **2. Check Admin User**

```javascript
use creabase_db;
db.users.findOne({ email: "admin@creabase.com" });
```

**Expected Output:** Admin user document with `role: "admin"`

### **3. Check Indexes**

```javascript
use creabase_db;
db.users.getIndexes();
```

**Expected Output:** Multiple indexes including `email_1` and `user_id_1`

---

## 🔄 Start Your Backend

1. **Ensure `.env` is updated** with Atlas connection string
2. **Restart backend:**
```bash
sudo supervisorctl restart backend
```

3. **Check logs:**
```bash
tail -f /var/log/supervisor/backend.err.log
```

**Expected Output:**
```
INFO:server:Starting Creabase API...
INFO:server:✓ Admin user already exists
INFO:     Application startup complete.
```

---

## 🧪 Test the Connection

### **Test 1: Admin Login**

```bash
curl -X POST https://your-domain.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@creabase.com","password":"admin123"}'
```

**Expected:** 200 OK with user object

### **Test 2: Create Test User**

```bash
curl -X POST https://your-domain.com/api/test/create-test-user?role=creator&name=Test%20Creator
```

**Expected:** 200 OK with user and session_token

---

## 🔒 Security Best Practices

### **1. Change Admin Password**
After first login, change from `admin123` to a strong password.

### **2. Use Strong Database Credentials**
```
Username: creabase_admin
Password: Use a password generator (min 20 characters)
```

### **3. IP Whitelisting**
- **Development**: Add your IP only
- **Production**: Add server IP only (not 0.0.0.0/0)

### **4. Enable Connection String Encryption**
Use `mongodb+srv://` (SRV record) instead of `mongodb://`

### **5. Backup Configuration**
- Enable **Continuous Backups** in Atlas
- Schedule **Snapshots** daily
- Test **Restore** process

---

## 🐛 Troubleshooting

### **Error: "MongoNetworkError: connection timeout"**
**Solution:**
- Check IP whitelist in Atlas Network Access
- Verify connection string is correct
- Check firewall settings

### **Error: "Authentication failed"**
**Solution:**
- Verify username/password in connection string
- Check database user permissions (read/write)
- Ensure password doesn't contain special characters that need URL encoding

### **Error: "Collection already exists"**
**Solution:**
- Safe to ignore - skip collection creation
- Or drop existing collections first:
  ```javascript
  use creabase_db;
  db.users.drop();
  // Repeat for other collections
  ```

### **Error: "Admin user already exists"**
**Solution:**
- Admin is already created - use existing credentials
- Or reset admin:
  ```javascript
  use creabase_db;
  db.users.deleteOne({ email: "admin@creabase.com" });
  db.wallets.deleteMany({ user_id: /admin/ });
  // Then run admin seeding script again
  ```

---

## 📞 Quick Reference

**Local MongoDB:**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
```

**MongoDB Atlas:**
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=creabase_db
```

**Admin Credentials:**
- Email: `admin@creabase.com`
- Password: `admin123` (change after first login)

**Required Scripts (in order):**
1. Initialize Database (collections + indexes)
2. Seed Admin User

**Verification:**
```javascript
use creabase_db;
show collections;  // Should show 29 collections
db.users.findOne({ role: "admin" });  // Should show admin user
```

---

**🎉 You're all set! Your Creabase application is now connected to MongoDB Atlas.**
