# Teacher Management System Fix Verification Script

# Running this file:
# Navigate to the project root and run:
# node docs/verify_teacher_fixes.js

const axios = require('axios');
const chalk = require('chalk'); // You may need to install this: npm i chalk

const BASE_URL = 'http://localhost:5000';

const log = {
  info: (msg) => console.log(chalk.blue(`[INFO] ${msg}`)),
  success: (msg) => console.log(chalk.green(`[SUCCESS] ${msg}`)),
  error: (msg) => console.log(chalk.red(`[ERROR] ${msg}`)),
  warn: (msg) => console.log(chalk.yellow(`[WARNING] ${msg}`)),
  separator: () => console.log(chalk.gray('--------------------------------------------------')),
};

const verifyTeacherManagementFixes = async () => {
  log.info('Starting Teacher Management Fix Verification');
  log.separator();

  try {
    // Step 1: Verify backend is running
    log.info('Checking if backend server is running...');
    const healthCheck = await axios.get(`${BASE_URL}/health`);
    log.success(`Backend server is running. Status: ${healthCheck.data.status}`);
    log.separator();

    // Step 2: Login as admin to get token
    log.info('Logging in as admin...');
    // Replace with valid admin credentials
    const adminCredentials = {
      email: 'admin@example.com',  // Replace with actual admin email
      password: 'password123',     // Replace with actual admin password
    };

    const loginResponse = await axios.post(`${BASE_URL}/AdminLogin`, adminCredentials);
    
    if (!loginResponse.data || !loginResponse.data._id) {
      log.error('Admin login failed. Please check credentials.');
      return;
    }
    
    const adminData = loginResponse.data;
    log.success(`Admin login successful. Admin ID: ${adminData._id}`);
    log.separator();

    // Step 3: Get classes
    log.info('Fetching classes...');
    const classesResponse = await axios.get(`${BASE_URL}/SclassList/${adminData._id}`);
    
    if (!Array.isArray(classesResponse.data) || classesResponse.data.length === 0) {
      log.error('No classes found. Please create a class first.');
      return;
    }
    
    const classId = classesResponse.data[0]._id;
    log.success(`Found ${classesResponse.data.length} classes. Using class ID: ${classId}`);
    log.separator();

    // Step 4: Get free subjects for the class
    log.info(`Fetching free subjects for class ID: ${classId}`);
    const freeSubjectsResponse = await axios.get(`${BASE_URL}/FreeSubjectList/${classId}`);
    
    if (!Array.isArray(freeSubjectsResponse.data) || freeSubjectsResponse.data.length === 0) {
      log.warn('No free subjects found. Please create a subject without a teacher first.');
      log.info('Creating a test subject...');
      
      // Create a test subject
      const subjectData = {
        subName: 'Test Subject',
        subCode: `TEST-${Date.now().toString().slice(-5)}`,
        sessions: '2',
        sclassName: classId,
        adminID: adminData._id,
        subjects: [
          {
            subName: 'Test Subject',
            subCode: `TEST-${Date.now().toString().slice(-5)}`,
            sessions: '2',
          }
        ]
      };
      
      const createSubjectResponse = await axios.post(`${BASE_URL}/SubjectCreate`, subjectData);
      if (!createSubjectResponse.data || !createSubjectResponse.data[0]) {
        log.error('Failed to create test subject.');
        return;
      }
      
      log.success(`Created test subject with ID: ${createSubjectResponse.data[0]._id}`);
      var subjectId = createSubjectResponse.data[0]._id;
    } else {
      var subjectId = freeSubjectsResponse.data[0]._id;
      log.success(`Found ${freeSubjectsResponse.data.length} free subjects. Using subject ID: ${subjectId}`);
    }
    log.separator();

    // Step 5: Get subject details
    log.info(`Fetching subject details for subject ID: ${subjectId}`);
    const subjectDetailsResponse = await axios.get(`${BASE_URL}/Subject/${subjectId}`);
    
    if (!subjectDetailsResponse.data || !subjectDetailsResponse.data._id) {
      log.error('Failed to fetch subject details.');
      return;
    }
    
    log.success(`Subject details fetched successfully. Subject name: ${subjectDetailsResponse.data.subName}`);
    log.separator();

    // Step 6: Create a teacher for the subject
    log.info('Creating a test teacher...');
    const teacherData = {
      name: `Test Teacher ${Date.now().toString().slice(-5)}`,
      email: `teacher${Date.now().toString().slice(-5)}@example.com`,
      password: 'password123',
      role: 'Teacher',
      school: adminData._id,
      teachSubject: subjectId,
      teachSclass: classId,
    };
    
    const createTeacherResponse = await axios.post(`${BASE_URL}/TeacherReg`, teacherData);
    
    if (!createTeacherResponse.data || !createTeacherResponse.data._id) {
      log.error(`Failed to create teacher: ${JSON.stringify(createTeacherResponse.data)}`);
      return;
    }
    
    const teacherId = createTeacherResponse.data._id;
    log.success(`Teacher created successfully. Teacher ID: ${teacherId}`);
    log.separator();

    // Step 7: Verify teacher was created and linked to the subject
    log.info(`Verifying teacher ${teacherId} is linked to subject ${subjectId}...`);
    const teacherDetailsResponse = await axios.get(`${BASE_URL}/Teacher/${teacherId}`);
    
    if (!teacherDetailsResponse.data || !teacherDetailsResponse.data._id) {
      log.error('Failed to fetch teacher details.');
      return;
    }
    
    if (teacherDetailsResponse.data.teachSubject && teacherDetailsResponse.data.teachSubject._id === subjectId) {
      log.success('Teacher is correctly linked to the subject.');
    } else {
      log.error('Teacher is not linked to the expected subject.');
      return;
    }
    log.separator();

    // Step 8: Verify subject is updated with teacher reference
    log.info(`Verifying subject ${subjectId} is linked to teacher ${teacherId}...`);
    const updatedSubjectResponse = await axios.get(`${BASE_URL}/Subject/${subjectId}`);
    
    if (!updatedSubjectResponse.data || !updatedSubjectResponse.data._id) {
      log.error('Failed to fetch updated subject details.');
      return;
    }
    
    if (updatedSubjectResponse.data.teacher && updatedSubjectResponse.data.teacher._id === teacherId) {
      log.success('Subject is correctly linked to the teacher.');
    } else {
      log.error('Subject is not linked to the expected teacher.');
      return;
    }
    log.separator();

    // Final verification
    log.success('All verification steps passed successfully!');
    log.success('The teacher management system fixes are working correctly.');
    log.separator();
    
    log.info('Test data created:');
    log.info(`- Teacher: ${teacherData.name} (${teacherId})`);
    log.info(`- Email: ${teacherData.email}`);
    log.info(`- Password: ${teacherData.password}`);
    log.separator();
    
    log.warn('You may want to delete this test data if it was created only for testing purposes.');

  } catch (error) {
    log.error('Verification failed with error:');
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      log.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      log.error(error.message);
    }
  }
};

verifyTeacherManagementFixes();
