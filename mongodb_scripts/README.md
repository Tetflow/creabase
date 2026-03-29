# Creabase MongoDB Setup Guide

This folder contains MongoDB initialization scripts for setting up Creabase on an external MongoDB database.

## 📋 Prerequisites

- MongoDB instance (local or cloud like MongoDB Atlas)
- MongoDB Shell (mongosh) or MongoDB Compass
- Database connection string

## 🚀 Setup Instructions

### Step 1: Connect to Your MongoDB

**Option A: Using MongoDB Shell (mongosh)**
```bash
mongosh "your_mongodb_connection_string"
```

**Option B: Using MongoDB Compass**
- Open MongoDB Compass
- Connect to your database
- Go to the "Mongosh" tab at the bottom

### Step 2: Run Initialization Script

In the MongoDB shell, run:

```javascript
load("/path/to/01_initialize_database.js")
```

Or copy and paste the contents of `01_initialize_database.js` into the shell.

This script will:
- Create all required collections
- Create performance indexes
- Set up text search indexes

### Step 3: Seed Admin User

Run the admin seeding script:

```javascript
load("/path/to/02_seed_admin.js")
```

Or copy and paste the contents of `02_seed_admin.js`.

**Default Admin Credentials:**
- Email: `admin@creabase.com`
- Password: `admin123`

⚠️ **IMPORTANT:** Change the admin password after first login!

### Step 4: Update Backend Configuration

Update your backend `.env` file with your MongoDB connection string:

```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=creabase_db
```

### Step 5: Start Backend

The backend will automatically:
- Connect to your external MongoDB
- Hash the admin password on first login
- Create additional users as they register

## 📊 Collections Created

| Collection | Purpose | Key Indexes |
|-----------|---------|-------------|
| users | User accounts (admin, business, creator) | email, user_id, role |
| creators | Creator profiles & stats | creator_id, platforms, followers |
| projects | Collaboration projects | project_id, business_id, creator_id |
| wallets | User wallet balances | wallet_id, user_id |
| wallet_transactions | Transaction history | transaction_id, user_id, type |
| escrow | Payment escrow for projects | escrow_id, project_id |
| disputes | Dispute management | dispute_id, project_id, status |
| subscriptions | Creator premium subscriptions | subscription_id, user_id |
| messages | Chat messages | message_id, conversation_id |
| conversations | Chat conversations | conversation_id, participants |
| invoices | Project invoices | invoice_id, project_id |

## 🔧 Optional: Sample Data

If you want to add sample creators for testing, run:

```javascript
load("/path/to/03_sample_data.js")
```

## 🔒 Security Notes

1. **Change Default Admin Password** immediately after first login
2. **Use Environment Variables** for sensitive data
3. **Enable MongoDB Authentication** in production
4. **Use Strong Passwords** for database users
5. **Whitelist IP Addresses** if using MongoDB Atlas

## 🐛 Troubleshooting

**Issue: "Collection already exists"**
- Safe to ignore - script checks for existing collections

**Issue: "Index already exists"**  
- Safe to ignore - MongoDB skips duplicate indexes

**Issue: "Admin user already exists"**
- Admin was already created - use existing credentials

**Issue: Cannot connect to MongoDB**
- Check connection string format
- Verify network access (firewall, IP whitelist)
- Ensure database user has proper permissions

## 📞 Need Help?

Refer to `/app/memory/test_credentials.md` for current admin credentials.

---

**Database Name:** `creabase_db`
**Admin Email:** `admin@creabase.com`
**First-time Password:** `admin123`
