// connection-test.js
// A script to test if the backend is reachable and provide diagnostic information

const fetch = require('node-fetch');
const { exec } = require('child_process');
const dns = require('dns');

// Helper to check if localhost resolves correctly
const checkLocalhost = () => {
  return new Promise((resolve) => {
    dns.lookup('localhost', (err, address) => {
      if (err) {
        console.error('❌ DNS lookup for localhost failed:', err.message);
        resolve(false);
      } else {
        console.log(`✅ Localhost resolves to: ${address}`);
        resolve(true);
      }
    });
  });
};

// Helper to check if port is in use
const checkPortInUse = (port) => {
  return new Promise((resolve) => {
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (error) {
        console.log(`⚠️ Port ${port} does not appear to be in use`);
        resolve(false);
      } else {
        console.log(`✅ Port ${port} is in use:`);
        console.log(stdout);
        resolve(true);
      }
    });
  });
};

// Test connection to backend server
const testBackendConnection = async () => {
  console.log('🔍 Testing backend connection...');
  
  // Check if localhost resolves
  await checkLocalhost();
  
  // Check if port 5000 is in use
  await checkPortInUse(5000);
  
  try {
    const response = await fetch('http://localhost:5000/ping', {
      timeout: 5000 // 5 second timeout
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend connection successful!');
      console.log('Response:', data);
      
      // Now check the health endpoint for more details
      try {
        const healthResponse = await fetch('http://localhost:5000/health');
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          console.log('✅ Health check successful:');
          console.log('Database status:', healthData.dbStatus);
          console.log('Server time:', healthData.timestamp);
        }
      } catch (healthErr) {
        console.log('⚠️ Health check failed:', healthErr.message);
      }
      
      return true;
    } else {
      console.error(`❌ Backend connection failed. Status: ${response.status} - ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Backend connection error:', error.message);
    
    // Suggest possible solutions
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Ensure backend server is started (npm start in backend directory)');
    console.log('3. Check if port 5000 is free or change the port in backend/index.js');
    console.log('4. Try restarting both frontend and backend using restart.ps1');
    
    return false;
  }
};

// Run the test
testBackendConnection();
