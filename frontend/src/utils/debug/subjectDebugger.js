// Debug utility for fixing subject loading issues in AdminAssignments
import axios from 'axios';
import { BASE_URL } from '../../config';

/**
 * Force reload subjects into Redux store
 * @param {string} schoolId - The school ID to fetch subjects for
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<Array>} - Loaded subjects
 */
export const debugFixSubjects = async (schoolId, dispatch) => {
  console.log('🛠️ Debug Fix: Attempting to reload subjects for school:', schoolId);
  
  try {
    // Direct API call to fetch subjects
    const response = await axios.get(`${BASE_URL}/Subject/School/${schoolId}`);
    console.log('📋 Subjects API response:', response.data);
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      // Update Redux store with the fetched subjects
      dispatch({
        type: 'subject/getAllSubjects/fulfilled',
        payload: response.data
      });
      
      console.log('✅ Successfully loaded and stored subjects in Redux');
      return response.data;
    } else {
      console.warn('⚠️ No subjects found or invalid response format');
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching subjects:', error);
    return [];
  }
};

/**
 * Debug utility to check if subjects are properly loaded in Redux
 * @param {Object} subjectState - The subject part of Redux state
 * @returns {Object} - Diagnostic info
 */
export const checkSubjectsState = (subjectState) => {
  console.log('🔍 Checking subject state in Redux:', subjectState);
  
  const result = {
    hasSubjects: Array.isArray(subjectState?.subjects) && subjectState.subjects.length > 0,
    subjectCount: subjectState?.subjects?.length || 0,
    isLoading: !!subjectState?.loading,
    hasError: !!subjectState?.error,
    errorMessage: subjectState?.error || null
  };
  
  console.log('📊 Subject state diagnostic:', result);
  return result;
};

export default {
  debugFixSubjects,
  checkSubjectsState
};
