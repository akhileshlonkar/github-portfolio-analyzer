if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");

// Database connections
const localDbUrl = "mongodb://127.0.0.1:27017/github-portfolio";
const atlasDbUrl = process.env.MONGODB_URI;

async function migrateData() {
  console.log("Starting data migration from local to MongoDB Atlas...\n");

  try {
    // Connect to local database
    console.log("Connecting to local MongoDB...");
    const localConn = await mongoose.createConnection(localDbUrl).asPromise();
    console.log("✓ Connected to local MongoDB\n");

    // Connect to Atlas database
    console.log("Connecting to MongoDB Atlas...");
    const atlasConn = await mongoose.createConnection(atlasDbUrl).asPromise();
    console.log("✓ Connected to MongoDB Atlas\n");

    // Get collections from local database
    const localDb = localConn.db;
    const atlasDb = atlasConn.db;

    const collections = await localDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections to migrate:\n`);

    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`Migrating collection: ${collectionName}`);

      // Get all documents from local collection
      const documents = await localDb.collection(collectionName).find({}).toArray();
      console.log(`  Found ${documents.length} documents`);

      if (documents.length > 0) {
        // Insert documents into Atlas
        const atlasCollection = atlasDb.collection(collectionName);
        
        // Clear existing data in Atlas (optional - remove if you want to keep existing)
        await atlasCollection.deleteMany({});
        
        // Insert new data
        const result = await atlasCollection.insertMany(documents);
        console.log(`  ✓ Inserted ${result.insertedCount} documents to Atlas\n`);
      } else {
        console.log(`  - No documents to migrate\n`);
      }
    }

    console.log("✓ Migration completed successfully!");
    console.log("\nClosing connections...");

    // Close connections
    await localConn.close();
    await atlasConn.close();
    
    console.log("✓ Done!");
    process.exit(0);

  } catch (error) {
    console.error("\n✗ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
migrateData();