// Student Login Diagnostic Tool
// Run this script to diagnose student login issues

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Create diagnostic function
async function diagnoseStudentLogin() {
  console.log('=== Student Login Diagnostics ===');
  
  // Get server URL
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  console.log(`\nUsing server URL: ${baseUrl}`);
  
  try {
    // Check server connection
    console.log('\nTesting server connection...');
    await axios.get(`${baseUrl}/ping`);
    console.log('✅ Server connection successful');
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    console.log('Please ensure your backend server is running.');
    exitTool();
    return;
  }
  
  // Get student details
  rl.question('\nEnter roll number: ', async (rollNum) => {
    rl.question('Enter student name: ', async (studentName) => {
      rl.question('Enter password: ', async (password) => {
        try {
          console.log('\nAttempting student lookup...');
          
          // First try to find the student without logging in (admin route)
          try {
            const findResponse = await axios.get(`${baseUrl}/api/FindStudentByRollAndName/${rollNum}/${encodeURIComponent(studentName)}`);
            if (findResponse.data && findResponse.data._id) {
              console.log('✅ Student found in database');
              console.log('Student ID:', findResponse.data._id);
              console.log('Class:', findResponse.data.sclassName?.sclassName || 'Not assigned');
              console.log('School:', findResponse.data.school?.schoolName || 'Not assigned');
            } else {
              console.log('❌ Student not found with provided roll number and name');
            }
          } catch (error) {
            console.log('❌ Student lookup failed:', error.message);
          }
          
          // Attempt login
          console.log('\nAttempting login with provided credentials...');
          const loginData = { rollNum, studentName, password };
          
          try {
            const loginResponse = await axios.post(`${baseUrl}/StudentLogin`, loginData, {
              headers: { 'Content-Type': 'application/json' }
            });
            
            if (loginResponse.data && loginResponse.data._id) {
              console.log('✅ Login successful!');
            } else {
              console.log('❓ Unexpected response from server');
            }
          } catch (error) {
            console.error('❌ Login failed:', error.message);
            
            if (error.response) {
              console.log('Status:', error.response.status);
              console.log('Error message:', error.response.data?.message || 'No message provided');
              
              if (error.response.status === 401) {
                console.log('\nDiagnosis: Invalid password');
              } else if (error.response.status === 404) {
                console.log('\nDiagnosis: Student not found - check roll number and name');
              } else if (error.response.status === 400) {
                console.log('\nDiagnosis: Missing required fields');
              }
            }
          }
          
          exitTool();
        } catch (error) {
          console.error('An unexpected error occurred:', error);
          exitTool();
        }
      });
    });
  });
}

function exitTool() {
  console.log('\nDiagnostic complete. Exiting...');
  setTimeout(() => {
    rl.close();
  }, 1000);
}

// Run the diagnostic
diagnoseStudentLogin();
