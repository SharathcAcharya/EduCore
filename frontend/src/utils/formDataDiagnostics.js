import axios from 'axios';
import { BASE_URL } from '../config';

// Utility function to diagnose class and subject loading issues
export const troubleshootFormData = async (currentUser) => {
    console.log("========= FORM DATA TROUBLESHOOTING =========");
    
    try {
        // Check user data
        console.log("CURRENT USER DATA:");
        console.log("  User ID:", currentUser?._id);
        console.log("  User Role:", currentUser?.role);
        console.log("  School ID:", currentUser?.school);
        
        if (!currentUser?.school && !currentUser?._id) {
            console.error("ERROR: No school ID found in user data!");
            return;
        }
        
        const schoolId = currentUser?.school || currentUser?._id;
        
        // Check classes
        console.log("\nCHECKING CLASSES DATA:");
        try {
            const classesUrl = `${BASE_URL}/Class/School/${schoolId}`;
            console.log("  Fetching classes from:", classesUrl);
            const classesResponse = await axios.get(classesUrl);
            
            if (!classesResponse.data) {
                console.error("  ERROR: No data returned from classes endpoint");
            } else if (classesResponse.data.message) {
                console.error("  ERROR:", classesResponse.data.message);
            } else if (Array.isArray(classesResponse.data) && classesResponse.data.length === 0) {
                console.warn("  WARNING: No classes found for this school");
            } else if (Array.isArray(classesResponse.data)) {
                console.log(`  SUCCESS: Found ${classesResponse.data.length} classes`);
                console.log("  First class:", classesResponse.data[0]);
            } else {
                console.error("  ERROR: Unexpected response format:", classesResponse.data);
            }
        } catch (error) {
            console.error("  ERROR fetching classes:", error.message);
        }
        
        // Check subjects
        console.log("\nCHECKING SUBJECTS DATA:");
        try {
            const subjectsUrl = `${BASE_URL}/Subject/School/${schoolId}`;
            console.log("  Fetching subjects from:", subjectsUrl);
            const subjectsResponse = await axios.get(subjectsUrl);
            
            if (!subjectsResponse.data) {
                console.error("  ERROR: No data returned from subjects endpoint");
            } else if (subjectsResponse.data.message) {
                console.error("  ERROR:", subjectsResponse.data.message);
            } else if (Array.isArray(subjectsResponse.data) && subjectsResponse.data.length === 0) {
                console.warn("  WARNING: No subjects found for this school");
            } else if (Array.isArray(subjectsResponse.data)) {
                console.log(`  SUCCESS: Found ${subjectsResponse.data.length} subjects`);
                console.log("  First subject:", subjectsResponse.data[0]);
            } else {
                console.error("  ERROR: Unexpected response format:", subjectsResponse.data);
            }
        } catch (error) {
            console.error("  ERROR fetching subjects:", error.message);
        }
        
        console.log("\nCHECKING REDUX STORE SETUP:");
        console.log("  Please check the Redux store state in your browser's Redux DevTools");
        console.log("  Ensure that sclass.sclasses and subject.subjects are populated correctly");
        
        console.log("\nFORM DATA TROUBLESHOOTING COMPLETE");
    } catch (error) {
        console.error("Error in troubleshootFormData:", error);
    }
};

export default troubleshootFormData;
