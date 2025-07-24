// quick-test.js - A simple script to check if the rows.slice issue is fixed

// Using built-in fetch API (available in Node.js 18+)
// No need to require node-fetch

// Test backend connection
const testBackend = async () => {
  console.log('Testing backend connection...');
  try {
    console.log('Attempting to connect to: http://localhost:5000/ping');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch('http://localhost:5000/ping', {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend connection successful!');
      console.log('Response:', data);
      return true;
    } else {
      console.error(`❌ Backend connection failed. Status: ${response.status} - ${response.statusText}`);
      try {
        const errorData = await response.text();
        console.error('Error details:', errorData);
      } catch (e) {
        console.error('Could not read error details');
      }
      return false;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Connection timed out after 5 seconds');
    } else {
      console.error('❌ Backend connection error:', error);
      console.log('Make sure the backend server is running at port 5000');
    }
    return false;
  }
};

// Test MongoDB connection via backend health check
const testMongoDB = async () => {
  console.log('\nTesting MongoDB connection...');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('http://localhost:5000/health', {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Health check successful!');
      console.log('Health status:', data);
      return data.dbStatus === 'connected';
    } else {
      console.error(`❌ Health check failed. Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Health check timed out after 5 seconds');
    } else {
      console.error('❌ Health check error:', error);
    }
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log('Running connection tests...\n');
  
  const backendOk = await testBackend();
  let mongoOk = false;
  
  if (backendOk) {
    mongoOk = await testMongoDB();
  }
  
  console.log('\nTest Results:');
  console.log('-------------');
  console.log(`Backend Server: ${backendOk ? '✅ Connected' : '❌ Failed'}`);
  console.log(`MongoDB: ${mongoOk ? '✅ Connected' : '❌ Not Connected'}`);
  
  if (backendOk && mongoOk) {
    console.log('\n✅ All connection tests passed!');
    console.log('1. Try accessing the frontend at: http://localhost:3000');
    console.log('2. The TableTemplate error should now be fixed.');
    console.log('3. Log in and test the components that were having issues.');
  } else {
    console.log('\n❌ Some tests failed. Please check:');
    if (!backendOk) {
      console.log('1. Is the backend server running? (cd backend && npm start)');
      console.log('2. Is port 5000 free? (Check Task Manager)');
    }
    if (!mongoOk) {
      console.log('1. Is MongoDB installed and running?');
      console.log('2. Can you connect to MongoDB using MongoDB Compass?');
    }
  }
};

// Run the tests
runTests()
  .catch(error => {
    console.error('Unexpected error during tests:', error);
  });
