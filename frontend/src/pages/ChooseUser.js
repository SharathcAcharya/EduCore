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
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <div onClick={() => navigateHandler("Admin")}>
                <StyledPaper elevation={3}>
                  <Box mb={2}>
                    <AccountCircle fontSize="large" />
                  </Box>
                  <StyledTypography>
                    Admin
                  </StyledTypography>
                  Login as an administrator to access the dashboard to manage app data.
                </StyledPaper>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StyledPaper elevation={3}>
                <div onClick={() => navigateHandler("Student")}>
                  <Box mb={2}>
                    <School fontSize="large" />
                  </Box>
                  <StyledTypography>
                    Student
                  </StyledTypography>
                  Login as a student to explore course materials and assignments.
                </div>
              </StyledPaper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StyledPaper elevation={3}>
                <div onClick={() => navigateHandler("Teacher")}>
                  <Box mb={2}>
                    <Group fontSize="large" />
                  </Box>
                  <StyledTypography>
                    Teacher
                  </StyledTypography>
                  Login as a teacher to create courses, assignments, and track student progress.
                </div>
              </StyledPaper>
            </Grid>
          </Grid>
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