// import React, { useState } from 'react';
// import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
// import { useDispatch, useSelector } from 'react-redux';
// import { deleteUser, updateUser } from '../../redux/userRelated/userHandle';
// import { useNavigate } from 'react-router-dom'
// import { authLogout } from '../../redux/userRelated/userSlice';
// import { Button, Collapse } from '@mui/material';

import { useSelector } from 'react-redux';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    margin: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
}));

const AdminProfile = () => {
    const { currentUser, schoolName } = useSelector((state) => state.user);

    if (!currentUser) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h6">Please log in to view your profile</Typography>
            </Box>
        );
    }

    return (
        <StyledPaper elevation={3}>
            <Typography variant="h4" gutterBottom>
                Admin Profile
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Name: {currentUser.name}</Typography>
                <Typography variant="h6">Email: {currentUser.email}</Typography>
                <Typography variant="h6">School: {schoolName}</Typography>
                <Typography variant="h6">Role: {currentUser.role}</Typography>
            </Box>
        </StyledPaper>
    );
};

export default AdminProfile

// const styles = {
//     attendanceButton: {
//         backgroundColor: "#270843",
//         "&:hover": {
//             backgroundColor: "#3f1068",
//         }
//     }
// }