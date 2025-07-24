// mongo-test.js
// A script to test MongoDB connection and database status

const mongoose = require('mongoose');

console.log('=================================================');
console.log('           MongoDB Connection Tester             ');
console.log('=================================================');

const testLocalMongo = async () => {
  console.log('\n🔍 Testing connection to local MongoDB...');
  
  try {
    await mongoose.connect('mongodb://localhost:27017/school-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // 5 second timeout for server selection
    });
    
    console.log('✅ Successfully connected to local MongoDB!');
    
    // Check database stats
    const adminDb = mongoose.connection.db.admin();
    const serverStatus = await adminDb.serverStatus();
    console.log(`\n📊 MongoDB Server Information:`);
    console.log(`   Version: ${serverStatus.version}`);
    console.log(`   Uptime: ${Math.floor(serverStatus.uptime / 86400)} days, ${Math.floor((serverStatus.uptime % 86400) / 3600)} hours`);
    console.log(`   Connections: ${serverStatus.connections.current} (current)`);
    
    // List all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log(`\n📁 Database Collections (${collections.length}):`);
    if (collections.length === 0) {
      console.log('   No collections found - database may be empty');
    } else {
      collections.forEach(collection => {
        console.log(`   - ${collection.name}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to local MongoDB:', error.message);
    
    // Troubleshooting suggestions
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('1. Make sure MongoDB service is running');
    console.log('   - Windows: Check Services app for MongoDB service');
    console.log('   - You can start it with: net start MongoDB');
    console.log('2. Check if MongoDB is installed correctly');
    console.log('3. Verify MongoDB is listening on the default port (27017)');
    console.log('4. Check MongoDB logs for errors');
    
    return false;
  } finally {
    // Close the connection
    await mongoose.connection.close();
  }
};

// Run the test
testLocalMongo()
  .then(() => {
    console.log('\n=================================================');
    console.log('Test completed.');
  })
  .catch(err => {
    console.error('\n❌ Unexpected error during testing:', err);
  });
