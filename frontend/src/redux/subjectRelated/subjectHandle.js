import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from '../../config';

const getAllSubjects = createAsyncThunk(
    'subject/getAllSubjects',
    async (schoolId, { rejectWithValue }) => {
        try {
            // Ensure we have a valid school ID
            if (!schoolId) {
                console.error('Missing required school ID');
                return rejectWithValue('School ID is required');
            }
            
            // Extract ID if it's an object
            const id = typeof schoolId === 'object' ? schoolId._id : schoolId;
            
            console.log('Fetching subjects for school:', id);
            const response = await axios.get(`${BASE_URL}/subject/school/${id}`);
            
            if (response.data && Array.isArray(response.data)) {
                console.log(`Found ${response.data.length} subjects for school ${id}`);
                return response.data;
            } else {
                console.log('No subjects found or invalid response format');
                return [];
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            return rejectWithValue(error.message || 'Failed to fetch subjects');
        }
    }
);

const addSubject = createAsyncThunk(
    'subject/addSubject',
    async (subjectData, { rejectWithValue }) => {        try {
            console.log('Adding new subject:', subjectData);
            const response = await axios.post(`${BASE_URL}/SubjectCreate`, subjectData);
            return response.data;
        } catch (error) {
            console.error('Error adding subject:', error);
            return rejectWithValue(error.message || 'Failed to add subject');
        }
    }
);

const deleteSubject = createAsyncThunk(
    'subject/deleteSubject',
    async (id, { rejectWithValue }) => {        try {
            console.log('Deleting subject:', id);
            const response = await axios.delete(`${BASE_URL}/Subject/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting subject:', error);
            return rejectWithValue(error.message || 'Failed to delete subject');
        }
    }
);

const getSubjectsByClass = createAsyncThunk(
    'subject/getSubjectsByClass',
    async (params, { rejectWithValue }) => {
        try {
            // Handle both single classId and object with schoolId/classId
            let url;
            if (typeof params === 'object' && params.schoolId && params.classId) {
                console.log('Fetching subjects for class:', params.classId, 'in school:', params.schoolId);
                url = `${BASE_URL}/ClassSubjects/${params.schoolId}/${params.classId}`;
            } else {
                // Backward compatibility for when only classId is passed
                const classId = typeof params === 'object' ? params.classId : params;
                console.log('Fetching subjects for class:', classId);
                url = `${BASE_URL}/ClassSubjects/${classId}`;
            }
            
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching subjects by class:', error);
            return rejectWithValue(error.message || 'Failed to fetch subjects by class');
        }
    }
);

const updateSubject = createAsyncThunk(
    'subject/updateSubject',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            console.log('Updating subject:', id, 'with data:', formData);
            const response = await axios.put(`${BASE_URL}/Subject/${id}`, formData);
            return response.data;
        } catch (error) {
            console.error('Error updating subject:', error);
            return rejectWithValue(error.response?.data || 'Failed to update subject');
        }
    }
);

export {
    getAllSubjects,
    addSubject,
    deleteSubject,
    getSubjectsByClass,
    updateSubject
};
