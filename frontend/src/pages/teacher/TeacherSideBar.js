import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FolderIcon from '@mui/icons-material/Folder';
import MessageIcon from '@mui/icons-material/Message';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useSelector } from 'react-redux';

const TeacherSideBar = () => {
    const { currentUser } = useSelector((state) => state.user);
    const sclassName = currentUser.teachSclass

    const location = useLocation();
    const itemSx = (active) => ({
        borderRadius: 3,
        mb: 0.5,
        px: 1.5,
        py: 1,
        color: active ? 'primary.main' : 'text.secondary',
        background: active ? 'linear-gradient(135deg, rgba(76, 201, 240, 0.14), rgba(247,37,133,0.08))' : 'transparent',
        boxShadow: active ? '0 10px 24px rgba(4, 7, 7, 0.12)' : 'none',
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
                <ListItemButton component={Link} to="/" sx={itemSx(isActive('/Teacher/dashboard') || location.pathname === '/')}>
                    <ListItemIcon>
                        <HomeIcon color={isActive('/Teacher/dashboard') || location.pathname === '/' ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/class" sx={itemSx(isActive('/Teacher/class'))}>
                    <ListItemIcon>
                        <ClassOutlinedIcon color={isActive('/Teacher/class') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary={`Class ${sclassName.sclassName}`} />
                </ListItemButton>                <ListItemButton component={Link} to="/Teacher/complain" sx={itemSx(isActive('/Teacher/complain'))}>
                    <ListItemIcon>
                        <AnnouncementOutlinedIcon color={isActive('/Teacher/complain') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Complain" />
                </ListItemButton>
                <Divider sx={{ my: 1 }} />
                <ListSubheader component="div" inset>
                    New Features
                </ListSubheader>
                <ListItemButton component={Link} to="/Teacher/events" sx={itemSx(isActive('/Teacher/events'))}>
                    <ListItemIcon>
                        <CalendarMonthIcon color={isActive('/Teacher/events') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Events Calendar" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/resources" sx={itemSx(isActive('/Teacher/resources'))}>
                    <ListItemIcon>
                        <FolderIcon color={isActive('/Teacher/resources') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Learning Resources" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/assignments" sx={itemSx(isActive('/Teacher/assignments'))}>
                    <ListItemIcon>
                        <AssignmentTurnedInIcon color={isActive('/Teacher/assignments') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Assignments" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/messages" sx={itemSx(isActive('/Teacher/messages'))}>
                    <ListItemIcon>
                        <MessageIcon color={isActive('/Teacher/messages') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Messages" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/analytics" sx={itemSx(isActive('/Teacher/analytics'))}>
                    <ListItemIcon>
                        <BarChartIcon color={isActive('/Teacher/analytics') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Analytics" />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
                <ListSubheader component="div" inset>
                    User
                </ListSubheader>
                <ListItemButton component={Link} to="/Teacher/profile" sx={itemSx(isActive('/Teacher/profile'))}>
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon color={isActive('/Teacher/profile') ? 'primary' : 'inherit'} />
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

export default TeacherSideBar