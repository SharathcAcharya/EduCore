import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FolderIcon from '@mui/icons-material/Folder';
import MessageIcon from '@mui/icons-material/Message';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

const StudentSideBar = () => {
    const location = useLocation();
    const itemSx = (active) => ({
        borderRadius: 3,
        mb: 0.5,
        px: 1.5,
        py: 1,
        color: active ? 'primary.main' : 'text.secondary',
        background: active ? 'linear-gradient(135deg, rgba(76, 201, 240, 0.14), rgba(247,37,133,0.08))' : 'transparent',
        boxShadow: active ? '0 10px 24px rgba(76, 201, 240, 0.12)' : 'none',
        '&:hover': {
            background: 'linear-gradient(135deg, rgba(76, 201, 240, 0.10), rgba(247,37,133,0.05))',
            transform: 'translateX(4px)',
        },
        '& .MuiListItemIcon-root': {
            minWidth: 38,
            color: active ? 'primary.main' : 'inherit',
        },
    });

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

    return (
        <>
            <React.Fragment>
                <ListItemButton component={Link} to="/" sx={itemSx(isActive('/Student/dashboard') || location.pathname === '/')}>
                    <ListItemIcon>
                        <HomeIcon color={isActive('/Student/dashboard') || location.pathname === '/' ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Student/subjects" sx={itemSx(isActive('/Student/subjects'))}>
                    <ListItemIcon>
                        <AssignmentIcon color={isActive('/Student/subjects') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Subjects" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Student/attendance" sx={itemSx(isActive('/Student/attendance'))}>
                    <ListItemIcon>
                        <ClassOutlinedIcon color={isActive('/Student/attendance') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Attendance" />
                </ListItemButton>                <ListItemButton component={Link} to="/Student/complain" sx={itemSx(isActive('/Student/complain'))}>
                    <ListItemIcon>
                        <AnnouncementOutlinedIcon color={isActive('/Student/complain') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Complain" />
                </ListItemButton>
                <Divider sx={{ my: 1 }} />
                <ListSubheader component="div" inset>
                    New Features
                </ListSubheader>
                <ListItemButton component={Link} to="/Student/events" sx={itemSx(isActive('/Student/events'))}>
                    <ListItemIcon>
                        <CalendarMonthIcon color={isActive('/Student/events') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Events Calendar" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Student/resources" sx={itemSx(isActive('/Student/resources'))}>
                    <ListItemIcon>
                        <FolderIcon color={isActive('/Student/resources') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Learning Resources" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Student/assignments" sx={itemSx(isActive('/Student/assignments'))}>
                    <ListItemIcon>
                        <AssignmentTurnedInIcon color={isActive('/Student/assignments') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Assignments" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Student/messages" sx={itemSx(isActive('/Student/messages'))}>
                    <ListItemIcon>
                        <MessageIcon color={isActive('/Student/messages') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Messages" />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
                <ListSubheader component="div" inset>
                    User
                </ListSubheader>
                <ListItemButton component={Link} to="/Student/profile" sx={itemSx(isActive('/Student/profile'))}>
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon color={isActive('/Student/profile') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                </ListItemButton>
                <ListItemButton component={Link} to="/logout" sx={itemSx(isActive('/logout'))}>
                    <ListItemIcon>
                        <ExitToAppIcon color={isActive('/logout') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </React.Fragment>
        </>
    )
}

export default StudentSideBar