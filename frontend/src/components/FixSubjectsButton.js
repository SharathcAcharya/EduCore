// This file provides a custom button component that fixes subject loading issues
import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import axios from 'axios';
import { BASE_URL } from '../../config';

/**
 * A button that fixes subject loading issues by directly fetching subjects
 * and updating the Redux store
 */
const FixSubjectsButton = ({ schoolId, dispatch, onComplete }) => {
  const handleFixSubjects = async () => {
    console.log('🔧 Attempting to fix subjects for school:', schoolId);
    
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
        
        if (onComplete) {
          onComplete({
            success: true,
            message: `Successfully loaded ${response.data.length} subjects`,
            count: response.data.length
          });
        }
      } else {
        console.warn('⚠️ No subjects found or invalid response format');
        
        if (onComplete) {
          onComplete({
            success: false,
            message: 'No subjects found for this school',
            count: 0
          });
        }
      }
    } catch (error) {
      console.error('❌ Error fetching subjects:', error);
      
      if (onComplete) {
        onComplete({
          success: false,
          message: `Error: ${error.message || 'Unknown error'}`,
          error
        });
      }
    }
  };
  
  return (
    <Tooltip title="Fix subjects loading issues">
      <Button
        variant="outlined"
        color="info"
        startIcon={<Refresh />}
        onClick={handleFixSubjects}
        sx={{ mr: 1 }}
      >
        Fix Subjects
      </Button>
    </Tooltip>
  );
};

export default FixSubjectsButton;
