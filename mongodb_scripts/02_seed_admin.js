// ========================================
// CREABASE ADMIN USER SEEDING SCRIPT
// ========================================
// Run this script AFTER 01_initialize_database.js
// This creates the default admin user

// Switch to your database
use creabase_db;

print("👤 Creating admin user...\n");

// ========================================
// ADMIN USER CREDENTIALS
// ========================================
var adminEmail = "admin@creabase.com";
var adminPassword = "admin123";  // CHANGE THIS IN PRODUCTION!

// Check if admin already exists
var existingAdmin = db.users.findOne({ email: adminEmail });

if (existingAdmin) {
  print("⚠️  Admin user already exists!");
  print("   Email: " + existingAdmin.email);
  print("   User ID: " + existingAdmin.user_id);
} else {
  // Generate IDs
  var adminUserId = "user_" + new Date().getTime().toString(36) + Math.random().toString(36).substr(2);
  var walletId = "wallet_" + new Date().getTime().toString(36) + Math.random().toString(36).substr(2);
  
  // NOTE: Password hashing is done by backend using bcrypt
  // This is a placeholder - the actual hash will be created when admin first logs in
  // OR you need to run this through bcrypt first
  
  var adminUser = {
    user_id: adminUserId,
    email: adminEmail,
    password_hash: "$2b$12$placeholder_hash_replace_on_first_login",
    name: "Platform Admin",
    role: "admin",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  var adminWallet = {
    wallet_id: walletId,
    user_id: adminUserId,
    balance: 0.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Insert admin user
  db.users.insertOne(adminUser);
  db.wallets.insertOne(adminWallet);
  
  print("✅ Admin user created successfully!");
  print("\n📧 Admin Credentials:");
  print("   Email: " + adminEmail);
  print("   Password: " + adminPassword);
  print("   User ID: " + adminUserId);
  print("\n⚠️  IMPORTANT:");
  print("   1. Change the password on first login");
  print("   2. The password hash needs to be updated by backend");
  print("   3. First login will trigger proper bcrypt hashing");
}

print("\n✅ Admin seeding complete!\n");
