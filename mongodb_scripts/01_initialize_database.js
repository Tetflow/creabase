// ========================================
// CREABASE MONGODB INITIALIZATION SCRIPT
// ========================================
// Run this script in your MongoDB shell or MongoDB Compass
// This will create all necessary collections and indexes

// Switch to your database
use creabase_db;

print("🚀 Starting Creabase database initialization...\n");

// ========================================
// 1. CREATE COLLECTIONS
// ========================================
print("📦 Creating collections...");

db.createCollection("users");
db.createCollection("creators");
db.createCollection("projects");
db.createCollection("wallets");
db.createCollection("wallet_transactions");
db.createCollection("escrow");
db.createCollection("disputes");
db.createCollection("subscriptions");
db.createCollection("messages");
db.createCollection("conversations");
db.createCollection("invoices");

print("✅ Collections created successfully!\n");

// ========================================
// 2. CREATE INDEXES FOR PERFORMANCE
// ========================================
print("⚡ Creating indexes for better performance...");

// Users indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "user_id": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "status": 1 });

// Creators indexes
db.creators.createIndex({ "creator_id": 1 }, { unique: true });
db.creators.createIndex({ "user_id": 1 });
db.creators.createIndex({ "status": 1 });
db.creators.createIndex({ "platforms": 1 });
db.creators.createIndex({ "language": 1 });
db.creators.createIndex({ "industry": 1 });
db.creators.createIndex({ "city": 1 });
db.creators.createIndex({ "instagram_followers": 1 });
db.creators.createIndex({ "youtube_subscribers": 1 });
// Text search index for creator search
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
db.projects.createIndex({ "created_at": -1 });

// Wallets indexes
db.wallets.createIndex({ "wallet_id": 1 }, { unique: true });
db.wallets.createIndex({ "user_id": 1 }, { unique: true });

// Wallet transactions indexes
db.wallet_transactions.createIndex({ "transaction_id": 1 }, { unique: true });
db.wallet_transactions.createIndex({ "user_id": 1 });
db.wallet_transactions.createIndex({ "transaction_type": 1 });
db.wallet_transactions.createIndex({ "created_at": -1 });

// Escrow indexes
db.escrow.createIndex({ "escrow_id": 1 }, { unique: true });
db.escrow.createIndex({ "project_id": 1 }, { unique: true });
db.escrow.createIndex({ "status": 1 });

// Disputes indexes
db.disputes.createIndex({ "dispute_id": 1 }, { unique: true });
db.disputes.createIndex({ "project_id": 1 });
db.disputes.createIndex({ "raised_by": 1 });
db.disputes.createIndex({ "status": 1 });
db.disputes.createIndex({ "raised_at": -1 });

// Subscriptions indexes
db.subscriptions.createIndex({ "subscription_id": 1 }, { unique: true });
db.subscriptions.createIndex({ "user_id": 1 });
db.subscriptions.createIndex({ "status": 1 });

// Messages indexes
db.messages.createIndex({ "message_id": 1 }, { unique: true });
db.messages.createIndex({ "conversation_id": 1 });
db.messages.createIndex({ "sender_id": 1 });
db.messages.createIndex({ "created_at": -1 });

// Conversations indexes
db.conversations.createIndex({ "conversation_id": 1 }, { unique: true });
db.conversations.createIndex({ "participants": 1 });
db.conversations.createIndex({ "updated_at": -1 });

// Invoices indexes
db.invoices.createIndex({ "invoice_id": 1 }, { unique: true });
db.invoices.createIndex({ "project_id": 1 });
db.invoices.createIndex({ "user_id": 1 });
db.invoices.createIndex({ "created_at": -1 });

print("✅ Indexes created successfully!\n");

// ========================================
// 3. VERIFY SETUP
// ========================================
print("🔍 Verifying database setup...\n");

var collections = db.getCollectionNames();
print("Collections created: " + collections.length);
collections.forEach(function(col) {
  var count = db[col].countDocuments();
  var indexes = db[col].getIndexes().length;
  print("  - " + col + ": " + count + " documents, " + indexes + " indexes");
});

print("\n✅ Database initialization complete!");
print("\n📝 Next steps:");
print("1. Run the admin seeding script (02_seed_admin.js)");
print("2. Update your backend .env file with MongoDB connection string");
print("3. Start your backend server\n");
