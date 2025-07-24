// This utility helps diagnose and fix subject loading issues in the assignment management system
import axios from 'axios';
import { BASE_URL } from '../config';

/**
 * Utility function to force reload subjects in the Redux store
 * @param {Object} currentUser - Current user information with school ID
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<Object>} - Results of the operation
 */
export const reloadSubjectsData = async (currentUser, dispatch) => {
    console.log("🔍 Starting subject data reload utility...");
    
    const schoolId = currentUser?.school || currentUser?._id;
    if (!schoolId) {
        console.error("❌ Cannot reload subjects: No school ID found");
        return { success: false, error: "No school ID found" };
    }
    
    console.log(`📚 Attempting to reload subjects for school: ${schoolId}`);
    
    try {
        // Direct API call to fetch subjects
        console.log(`🔄 Making direct API call to ${BASE_URL}/Subject/School/${schoolId}`);
        const response = await axios.get(`${BASE_URL}/Subject/School/${schoolId}`);
        
        if (!response || !response.data) {
            console.error("❌ Received empty response from subjects API");
            return { success: false, error: "Empty response from API" };
        }
        
        console.log(`✅ Successfully fetched ${response.data.length} subjects`);
        
        // Update Redux store with the fetched subjects
        if (Array.isArray(response.data) && response.data.length > 0) {
            console.log("📊 Updating Redux store with subject data");
            
            // Use the proper action creator format based on the subjectSlice
            dispatch({
                type: 'subject/getAllSubjects/fulfilled',
                payload: response.data
            });
            
            return { 
                success: true, 
                message: `Successfully loaded ${response.data.length} subjects`,
                data: response.data
            };
        } else {
            console.warn("⚠️ No subjects found for this school");
            return { success: false, error: "No subjects found" };
        }
    } catch (error) {
        console.error("❌ Error reloading subjects:", error);
        return { 
            success: false, 
            error: error.message || "Unknown error occurred",
            details: error
        };
    }
};

/**
 * Tests if subjects can be properly loaded and accessed
 * @param {Object} currentUser - Current user information with school ID
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<Object>} - Test results
 */
export const testSubjectAccess = async (currentUser, dispatch) => {
    console.log("🧪 Testing subject access functionality...");
    
    try {
        const result = await reloadSubjectsData(currentUser, dispatch);
        
        if (result.success) {
            console.log("✅ Subject access test passed - subjects loaded successfully");
            return { 
                success: true, 
                message: "Subjects loaded successfully",
                subjectCount: result.data?.length || 0
            };
        } else {
            console.error("❌ Subject access test failed:", result.error);
            return { 
                success: false, 
                error: result.error,
                message: "Failed to load subjects"
            };
        }
    } catch (error) {
        console.error("❌ Exception during subject access test:", error);
        return { 
            success: false, 
            error: error.message || "Unknown error in subject access test"
        };
    }
};

export default { reloadSubjectsData, testSubjectAccess };
