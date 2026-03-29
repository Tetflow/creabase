// ========================================
// CREABASE SAMPLE DATA SEEDING (OPTIONAL)
// ========================================
// Run this script to add sample creators for testing
// This is OPTIONAL - only use for development/testing

use creabase_db;

print("🎨 Seeding sample creator data...\n");

// Sample creators
var sampleCreators = [
  {
    creator_id: "creator_sample001",
    user_id: "user_sample001",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    bio: "Fashion & Lifestyle content creator based in Mumbai. Specializing in sustainable fashion and beauty.",
    profile_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    platforms: ["instagram", "youtube"],
    instagram_handle: "@priya_fashionista",
    youtube_handle: "@PriyaStyleDiaries",
    instagram_followers: 125000,
    youtube_subscribers: 45000,
    language: ["english", "hindi"],
    industry: ["fashion", "lifestyle"],
    city: "Mumbai",
    district: "Andheri",
    engagement_rate: 4.8,
    avg_views: 15000,
    status: "approved",
    created_at: new Date().toISOString()
  },
  {
    creator_id: "creator_sample002",
    user_id: "user_sample002",
    name: "Rahul Tech",
    email: "rahul.tech@example.com",
    bio: "Tech reviewer and gadget enthusiast. Latest smartphones, laptops, and tech news.",
    profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    platforms: ["youtube", "instagram"],
    instagram_handle: "@rahul_tech_reviews",
    youtube_handle: "@RahulTechZone",
    instagram_followers: 85000,
    youtube_subscribers: 250000,
    language: ["english", "hindi"],
    industry: ["tech", "reviews"],
    city: "Bangalore",
    district: "Koramangala",
    engagement_rate: 5.2,
    avg_views: 50000,
    status: "approved",
    created_at: new Date().toISOString()
  },
  {
    creator_id: "creator_sample003",
    user_id: "user_sample003",
    name: "Anjali Foodie",
    email: "anjali.food@example.com",
    bio: "Food blogger exploring street food and restaurants across India. Pure vegetarian content.",
    profile_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    platforms: ["instagram"],
    instagram_handle: "@anjali_fooddiaries",
    instagram_followers: 95000,
    language: ["hindi", "english"],
    industry: ["food", "travel"],
    city: "Delhi",
    district: "Connaught Place",
    engagement_rate: 6.1,
    avg_views: 25000,
    status: "approved",
    created_at: new Date().toISOString()
  }
];

// Insert sample creators
var inserted = 0;
sampleCreators.forEach(function(creator) {
  var exists = db.creators.findOne({ creator_id: creator.creator_id });
  if (!exists) {
    db.creators.insertOne(creator);
    inserted++;
    print("  ✅ Created: " + creator.name);
  } else {
    print("  ⏭️  Skipped: " + creator.name + " (already exists)");
  }
});

print("\n✅ Sample data seeding complete!");
print("   Inserted: " + inserted + " new creators");
print("   Total creators: " + db.creators.countDocuments() + "\n");
