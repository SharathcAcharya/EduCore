import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar,
  Avatar,
  useTheme,
  Skeleton
} from '@mui/material';
import { 
  Message as MessageIcon,
  AddTask as AddTaskIcon,
  PersonAdd as PersonAddIcon,
  Grade as GradeIcon,
  UploadFile as UploadFileIcon,
  History as HistoryIcon,
  Event as CalendarIcon,
  Announcement as NoticeIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { formatDistanceToNow } from 'date-fns';

// Styled components
const ActivityPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '10px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  overflow: 'hidden'
}));

const ActivityHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}));

const ActivityItem = styled(ListItem)(({ theme }) => ({
  borderRadius: '8px',
  marginBottom: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-2px)'
  }
}));

// Helper function to get activity icon based on type
const getActivityIcon = (type) => {
  switch (type) {
    case 'message':
      return <MessageIcon />;
    case 'assignment':
      return <AddTaskIcon />;
    case 'user':
      return <PersonAddIcon />;
    case 'grade':
      return <GradeIcon />;
    case 'upload':
      return <UploadFileIcon />;
    case 'calendar':
      return <CalendarIcon />;
    case 'notice':
      return <NoticeIcon />;
    case 'comment':
      return <CommentIcon />;
    default:
      return <HistoryIcon />;
  }
};

// Helper function to get activity color based on type
const getActivityColor = (type, theme) => {
  switch (type) {
    case 'message':
      return theme.palette.info.main;
    case 'assignment':
      return theme.palette.secondary.main;
    case 'user':
      return theme.palette.success.main;
    case 'grade':
      return theme.palette.warning.main;
    case 'upload':
      return theme.palette.primary.main;
    case 'calendar':
      return theme.palette.primary.dark;
    case 'notice':
      return theme.palette.warning.dark;
    case 'comment':
      return theme.palette.info.dark;
    default:
      return theme.palette.grey[500];
  }
};

// Mock activities data - in a real app, this would come from the backend
const mockActivities = [
  { 
    id: 1, 
    message: 'New assignment posted in Mathematics', 
    time: new Date(new Date().setHours(new Date().getHours() - 2)),
    type: 'assignment',
    user: 'Teacher Johnson'
  },
  { 
    id: 2, 
    message: 'New student registered', 
    time: new Date(new Date().setHours(new Date().getHours() - 5)),
    type: 'user',
    user: 'Admin'
  },
  { 
    id: 3, 
    message: 'Grades updated for Science class', 
    time: new Date(new Date().setHours(new Date().getHours() - 12)),
    type: 'grade',
    user: 'Teacher Smith'
  },
  { 
    id: 4, 
    message: 'New message from parent', 
    time: new Date(new Date().setDate(new Date().getDate() - 1)),
    type: 'message',
    user: 'Mr. Davis'
  },
  { 
    id: 5, 
    message: 'New study material uploaded', 
    time: new Date(new Date().setDate(new Date().getDate() - 2)),
    type: 'upload',
    user: 'Teacher Wilson'
  }
];

const RecentActivity = ({ activities = mockActivities, loading = false }) => {
  const theme = useTheme();

  // Render loading skeleton
  const renderSkeleton = () => (
    <Box sx={{ width: '100%' }}>
      {[1, 2, 3, 4].map((item) => (
        <Box key={item} sx={{ display: 'flex', mb: 2, alignItems: 'flex-start' }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Box sx={{ width: '100%' }}>
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="40%" height={18} />
            <Skeleton variant="text" width="30%" height={16} />
          </Box>
        </Box>
      ))}
    </Box>
  );

  return (
    <ActivityPaper sx={{
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      }
    }}>
      <ActivityHeader>
        <HistoryIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
        <Typography variant="h6" component="h2" fontWeight="bold">
          Recent Activity
        </Typography>
      </ActivityHeader>
      
      <Divider sx={{ mb: 2 }} />
      
      {loading ? (
        renderSkeleton()
      ) : activities.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', py: 4 }}>
          <HistoryIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
          <Typography variant="body1" color="textSecondary">
            No recent activities
          </Typography>
        </Box>
      ) : (
        <List sx={{ overflow: 'auto', flexGrow: 1 }}>
          {activities.map((activity) => (
            <ActivityItem key={activity.id} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getActivityColor(activity.type, theme) }}>
                  {getActivityIcon(activity.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" fontWeight="medium">
                    {activity.message}
                  </Typography>
                }
                secondary={
                  <Box component="span" sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" component="span">
                      by {activity.user}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="span">
                      {formatDistanceToNow(activity.time, { addSuffix: true })}
                    </Typography>
                  </Box>
                }
              />
            </ActivityItem>
          ))}
        </List>
      )}
    </ActivityPaper>
  );
};

export default RecentActivity;
