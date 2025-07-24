import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Divider, 
  Grid,
  Button,
  useTheme
} from '@mui/material';
import { 
  Add as AddIcon,
  Message as MessageIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Announcement as AnnouncementIcon,
  Event as EventIcon,
  School as SchoolIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Styled components
const ActionsPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '10px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
}));

const ActionsHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: theme.spacing(1.5),
  fontWeight: 'bold',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  minHeight: '100px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  textTransform: 'none',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '2rem',
    marginBottom: theme.spacing(1)
  }
}));

// Default action buttons for different roles
const adminActions = [
  {
    id: 'add-student',
    title: 'Add Student',
    icon: <PersonIcon />,
    path: '/admin/addstudent',
    color: 'primary'
  },
  {
    id: 'add-teacher',
    title: 'Add Teacher',
    icon: <PersonIcon />,
    path: '/admin/addteacher',
    color: 'secondary'
  },
  {
    id: 'add-notice',
    title: 'Add Notice',
    icon: <AnnouncementIcon />,
    path: '/admin/addnotice',
    color: 'warning'
  },
  {
    id: 'message',
    title: 'Messages',
    icon: <MessageIcon />,
    path: '/admin/messages',
    color: 'info'
  }
];

const teacherActions = [
  {
    id: 'take-attendance',
    title: 'Take Attendance',
    icon: <PersonIcon />,
    path: '/teacher/attendance',
    color: 'primary'
  },
  {
    id: 'add-assignment',
    title: 'Add Assignment',
    icon: <AssignmentIcon />,
    path: '/teacher/addassignment',
    color: 'secondary'
  },
  {
    id: 'add-event',
    title: 'Add Event',
    icon: <EventIcon />,
    path: '/teacher/addevent',
    color: 'success'
  },
  {
    id: 'message',
    title: 'Messages',
    icon: <MessageIcon />,
    path: '/teacher/messages',
    color: 'info'
  }
];

const studentActions = [
  {
    id: 'view-assignments',
    title: 'Assignments',
    icon: <AssignmentIcon />,
    path: '/student/viewassignment',
    color: 'primary'
  },
  {
    id: 'view-subjects',
    title: 'My Subjects',
    icon: <SchoolIcon />,
    path: '/student/subjects',
    color: 'secondary'
  },
  {
    id: 'view-attendance',
    title: 'My Attendance',
    icon: <DashboardIcon />,
    path: '/student/attendance',
    color: 'success'
  },
  {
    id: 'message',
    title: 'Messages',
    icon: <MessageIcon />,
    path: '/student/messages',
    color: 'info'
  }
];

const QuickActions = ({ role = 'admin' }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Select actions based on user role
  const getActions = () => {
    switch(role.toLowerCase()) {
      case 'admin':
        return adminActions;
      case 'teacher':
        return teacherActions;
      case 'student':
        return studentActions;
      default:
        return adminActions;
    }
  };
  
  const actions = getActions();

  const handleActionClick = (path) => {
    navigate(path);
  };

  return (
    <ActionsPaper>
      <ActionsHeader>
        <AddIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
        <Typography variant="h6" component="h2" fontWeight="bold">
          Quick Actions
        </Typography>
      </ActionsHeader>
      
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {actions.map((action) => (
          <Grid item xs={6} md={3} key={action.id}>
            <ActionButton
              variant="contained"
              color={action.color}
              onClick={() => handleActionClick(action.path)}
              sx={{ 
                backgroundColor: `${theme.palette[action.color].main}`,
                '&:hover': {
                  backgroundColor: `${theme.palette[action.color].dark}`,
                }
              }}
            >
              {action.icon}
              <Typography variant="subtitle2">
                {action.title}
              </Typography>
            </ActionButton>
          </Grid>
        ))}
      </Grid>
    </ActionsPaper>
  );
};

export default QuickActions;
