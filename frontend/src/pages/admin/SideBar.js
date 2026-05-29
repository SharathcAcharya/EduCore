import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import ReportIcon from '@mui/icons-material/Report';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FolderIcon from '@mui/icons-material/Folder';
import MessageIcon from '@mui/icons-material/Message';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BarChartIcon from '@mui/icons-material/BarChart';

const SideBar = () => {
    const location = useLocation();
    const itemSx = (active) => ({
        borderRadius: 3,
        mb: 0.5,
        px: 1.5,
        py: 1,
        color: active ? 'primary.main' : 'text.secondary',
        background: active ? 'linear-gradient(135deg, rgba(67,97,238,0.14), rgba(247,37,133,0.08))' : 'transparent',
        boxShadow: active ? '0 10px 24px rgba(67,97,238,0.12)' : 'none',
        '&:hover': {
            background: 'linear-gradient(135deg, rgba(67,97,238,0.10), rgba(247,37,133,0.05))',
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
                <ListItemButton component={Link} to="/" sx={itemSx(isActive('/Admin/dashboard') || location.pathname === '/')}>
                    <ListItemIcon>
                        <HomeIcon color={isActive('/Admin/dashboard') || location.pathname === '/' ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/classes" sx={itemSx(isActive('/Admin/classes'))}>
                    <ListItemIcon>
                        <ClassOutlinedIcon color={isActive('/Admin/classes') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Classes" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/subjects" sx={itemSx(isActive('/Admin/subjects'))}>
                    <ListItemIcon>
                        <AssignmentIcon color={isActive('/Admin/subjects') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Subjects" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/teachers" sx={itemSx(isActive('/Admin/teachers'))}>
                    <ListItemIcon>
                        <SupervisorAccountOutlinedIcon color={isActive('/Admin/teachers') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Teachers" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/students" sx={itemSx(isActive('/Admin/students'))}>
                    <ListItemIcon>
                        <PersonOutlineIcon color={isActive('/Admin/students') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Students" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/notices" sx={itemSx(isActive('/Admin/notices'))}>
                    <ListItemIcon>
                        <AnnouncementOutlinedIcon color={isActive('/Admin/notices') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Notices" />
                </ListItemButton>                <ListItemButton component={Link} to="/Admin/complains">
                    <ListItemIcon>
                        <ReportIcon color={isActive('/Admin/complains') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Complains" />
                </ListItemButton>
                <Divider sx={{ my: 1 }} />
                <ListSubheader component="div" inset>
                    New Features
                </ListSubheader>
                <ListItemButton component={Link} to="/Admin/events" sx={itemSx(isActive('/Admin/events'))}>
                    <ListItemIcon>
                        <CalendarMonthIcon color={isActive('/Admin/events') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Events Calendar" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/resources" sx={itemSx(isActive('/Admin/resources'))}>
                    <ListItemIcon>
                        <FolderIcon color={isActive('/Admin/resources') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Learning Resources" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/assignments" sx={itemSx(isActive('/Admin/assignments'))}>
                    <ListItemIcon>
                        <AssignmentTurnedInIcon color={isActive('/Admin/assignments') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Assignments" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/messages" sx={itemSx(isActive('/Admin/messages'))}>
                    <ListItemIcon>
                        <MessageIcon color={isActive('/Admin/messages') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Messages" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/analytics" sx={itemSx(isActive('/Admin/analytics'))}>
                    <ListItemIcon>
                        <BarChartIcon color={isActive('/Admin/analytics') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Analytics" />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
                <ListSubheader component="div" inset>
                    User
                </ListSubheader>
                <ListItemButton component={Link} to="/Admin/profile" sx={itemSx(isActive('/Admin/profile'))}>
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon color={isActive('/Admin/profile') ? 'primary' : 'inherit'} />
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

export default SideBar
