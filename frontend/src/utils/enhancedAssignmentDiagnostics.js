import axios from 'axios';
import { BASE_URL } from '../config';

// Enhanced utility function to diagnose issues with assignment creation and display
export const diagnoseAssignmentSystem = async (currentUser) => {
    console.log("=========== ASSIGNMENT SYSTEM DIAGNOSTICS ===========");
    
    try {
        // Check user data
        console.log("CURRENT USER DATA:");
        console.log("  User ID:", currentUser?._id);
        console.log("  User Role:", currentUser?.role);
        console.log("  School ID:", currentUser?.school);
        
        if (!currentUser?.school && !currentUser?._id) {
            console.error("ERROR: No school ID found in user data!");
        }
        
        const schoolId = currentUser?.school || currentUser?._id;
        
        // Check Redux store state
        console.log("\nREDUX STORE DIAGNOSTICS:");
        try {
            // Get Redux store from window.__REDUX_DEVTOOLS_EXTENSION__
            const state = window.__REDUX_DEVTOOLS_EXTENSION__ ? 
                window.__REDUX_DEVTOOLS_EXTENSION__.connectViaExtension().getStateJs() : 
                { notAvailable: true };
            
            if (state.notAvailable) {
                console.log("  Redux DevTools not available - can't check store state");
            } else {
                console.log("  Redux Store State:");
                console.log("    sclass state:", state.sclass);
                console.log("    subject state:", state.subject);
                console.log("    assignment state:", state.assignment);
            }
        } catch (error) {
            console.error("  Error accessing Redux store:", error.message);
        }
          // Check classes for this school
        console.log("\nCHECKING AVAILABLE CLASSES:");
        try {
            const classResponse = await axios.get(`${BASE_URL}/SclassList/${schoolId}`);
            if (Array.isArray(classResponse.data) && classResponse.data.length > 0) {
                console.log(`  Found ${classResponse.data.length} classes`);
                console.log("  Sample class:", classResponse.data[0]);
                
                // Check for any class reference issues
                const classIds = classResponse.data.map(c => c._id);
                console.log("  All class IDs:", classIds);
            } else {
                console.error("  ERROR: No classes found for this school!");
            }
        } catch (error) {
            console.error("  ERROR accessing classes API:", error.message);
        }
          // Check subjects for this school
        console.log("\nCHECKING AVAILABLE SUBJECTS:");
        try {
            const subjectResponse = await axios.get(`${BASE_URL}/subject/school/${schoolId}`);
            if (Array.isArray(subjectResponse.data) && subjectResponse.data.length > 0) {
                console.log(`  Found ${subjectResponse.data.length} subjects`);
                console.log("  Sample subject:", subjectResponse.data[0]);
                
                // Check for any subject reference issues
                const subjectIds = subjectResponse.data.map(s => s._id);
                console.log("  All subject IDs:", subjectIds);
            } else {
                console.error("  ERROR: No subjects found for this school!");
            }
        } catch (error) {
            console.error("  ERROR accessing subjects API:", error.message);
        }
        
        // Check existing assignments
        console.log("\nCHECKING EXISTING ASSIGNMENTS:");
        try {
            const assignmentResponse = await axios.get(`${BASE_URL}/Assignments/${schoolId}`);
            if (Array.isArray(assignmentResponse.data) && assignmentResponse.data.length > 0) {
                console.log(`  Found ${assignmentResponse.data.length} assignments`);
                const sampleAssignment = assignmentResponse.data[0];
                console.log("  Sample assignment:", sampleAssignment);
                
                // Check for valid references
                console.log("  Checking references for sample assignment:");
                console.log("    Class reference:", sampleAssignment.sclassName);
                console.log("    Subject reference:", sampleAssignment.subject);
                console.log("    Assigned by:", sampleAssignment.assignedBy);
            } else {
                console.log("  No assignments found yet");
            }
        } catch (error) {
            console.error("  ERROR accessing assignments API:", error.message);
        }
        
        // Test creating an assignment
        console.log("\nTESTING ASSIGNMENT FORM DATA:");
        try {
            // Get a class and subject to test with
            let testClassId = null;
            let testSubjectId = null;
              try {
                const classResponse = await axios.get(`${BASE_URL}/SclassList/${schoolId}`);
                if (Array.isArray(classResponse.data) && classResponse.data.length > 0) {
                    testClassId = classResponse.data[0]._id;
                }
            } catch (error) {
                console.error("  Error fetching test class:", error.message);
            }
              try {
                const subjectResponse = await axios.get(`${BASE_URL}/subject/school/${schoolId}`);
                if (Array.isArray(subjectResponse.data) && subjectResponse.data.length > 0) {
                    testSubjectId = subjectResponse.data[0]._id;
                }
            } catch (error) {
                console.error("  Error fetching test subject:", error.message);
            }
            
            if (testClassId && testSubjectId) {
                const testFormData = {
                    title: "Test Assignment",
                    description: "This is a test assignment",
                    subject: testSubjectId,
                    sclassName: testClassId,
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    maxMarks: 100,
                    school: schoolId,
                    assignedBy: currentUser?._id,
                    assignerModel: 'admin'
                };
                
                console.log("  Form data for test assignment:", testFormData);
                console.log("  All form fields present:", Object.values(testFormData).every(val => val));
            } else {
                console.error("  Cannot test form data - missing classes or subjects");
            }
        } catch (error) {
            console.error("  ERROR testing form data:", error.message);
        }
        
        console.log("\nDIAGNOSTICS COMPLETE");
    } catch (error) {
        console.error("Error running diagnostics:", error);
    }
};

// Helper function to test assignment creation with sample data
export const testAssignmentCreation = async (currentUser, sclassId, subjectId) => {
    console.log("=========== TESTING ASSIGNMENT CREATION ===========");
    
    if (!currentUser || !sclassId || !subjectId) {
        console.error("Missing required data for test:");
        console.log("  User:", !!currentUser);
        console.log("  Class ID:", sclassId);
        console.log("  Subject ID:", subjectId);
        return;
    }
    
    const testData = {
        title: "Test Assignment " + new Date().toISOString(),
        description: "This is a test assignment created by the diagnostic tool",
        subject: subjectId,
        sclassName: sclassId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        maxMarks: 100,
        school: currentUser?.school || currentUser?._id,
        assignedBy: currentUser?._id,
        assignerModel: currentUser?.role === 'Teacher' ? 'teacher' : 'admin'
    };
    
    console.log("Test assignment data:", testData);
    
    try {
        const response = await axios.post(`${BASE_URL}/AssignmentCreate`, testData);
        console.log("Test assignment created successfully:", response.data);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error("Failed to create test assignment:", error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
};
