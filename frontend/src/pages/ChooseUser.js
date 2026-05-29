import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Box,
  Container,
} from '@mui/material';
import { AccountCircle, School, Group } from '@mui/icons-material';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Popup from '../components/Popup';

const ChooseUser = ({ visitor }) => {
  const navigate = useNavigate()
  const { currentUser, currentRole, status } = useSelector(state => state.user);
  const [loader, setLoader] = useState(false);
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const navigateHandler = (user) => {
    if (visitor === "guest") {
      // If coming from guest link, pass guest flag in navigation state
      if (user === "Admin") {
        navigate('/Adminlogin', { state: { guest: true } });
      }
      else if (user === "Student") {
        navigate('/Studentlogin', { state: { guest: true } });
      }
      else if (user === "Teacher") {
        navigate('/Teacherlogin', { state: { guest: true } });
      }
    } else {
      // Normal navigation
      if (user === "Admin") {
        navigate('/Adminlogin');
      }
      else if (user === "Student") {
        navigate('/Studentlogin');
      }
      else if (user === "Teacher") {
        navigate('/Teacherlogin');
      }
    }
  }

  useEffect(() => {
    if (status === 'success' || currentUser !== null) {
      if (currentRole === 'Admin') {
        navigate('/Admin/dashboard');
      }
      else if (currentRole === 'Student') {
        navigate('/Student/dashboard');
      } else if (currentRole === 'Teacher') {
        navigate('/Teacher/dashboard');
      }
    }
    else if (status === 'error') {
      setLoader(false)
      setMessage("Network Error")
      setShowPopup(true)
    }
  }, [status, currentRole, navigate, currentUser]);

  return (
    <>
      <StyledContainer>
        <Container>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ staggerChildren: 0.15, duration: 0.5 }}
          >
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => navigateHandler("Admin")}
              >
                <StyledPaper elevation={3} className="glass">
                  <Box mb={2}>
                    <AccountCircle fontSize="large" color="primary" />
                  </Box>
                  <StyledTypography>
                    Admin
                  </StyledTypography>
                  Login as an administrator to access the dashboard to manage app data.
                </StyledPaper>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => navigateHandler("Student")}
              >
              <StyledPaper elevation={3} className="glass">
                  <Box mb={2}>
                    <School fontSize="large" color="secondary" />
                  </Box>
                  <StyledTypography>
                    Student
                  </StyledTypography>
                  Login as a student to explore course materials and assignments.
              </StyledPaper>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => navigateHandler("Teacher")}
              >
              <StyledPaper elevation={3} className="glass">
                  <Box mb={2}>
                    <Group fontSize="large" sx={{ color: '#00c853' }} />
                  </Box>
                  <StyledTypography>
                    Teacher
                  </StyledTypography>
                  Login as a teacher to create courses, assignments, and track student progress.
              </StyledPaper>
              </motion.div>
            </Grid>
          </Grid>
          </motion.div>
        </Container>
      </StyledContainer>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

export default ChooseUser;

const StyledContainer = styled.div`
  background: linear-gradient(to bottom, #411d70, #19118b);
  height: 120vh;
  display: flex;
  justify-content: center;
  padding: 2rem;
`;

const StyledPaper = styled(Paper)`
  padding: 20px;
  text-align: center;
  background-color: #1f1f38;
  color:rgba(255, 255, 255, 0.6);
  cursor:pointer;

  &:hover {
    background-color: #2c2c6c;
    color:white;
  }
`;

const StyledTypography = styled.h2`
  margin-bottom: 10px;
`;