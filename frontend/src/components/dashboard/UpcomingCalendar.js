import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Avatar,
  Chip,
  useTheme,
  CircularProgress,
  Skeleton
} from '@mui/material';
import { 
  Event as EventIcon, 
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  Announcement as AnnouncementIcon,
  CalendarMonth as CalendarIcon,
  Celebration as CelebrationIcon,
  SportsEsports as CompetitionIcon,
  Language as ConferenceIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { formatDistanceToNow } from 'date-fns';

// Styled components
const CalendarPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '10px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  overflow: 'hidden'
}));

const CalendarHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}));

const EventItem = styled(ListItem)(({ theme }) => ({
  borderRadius: '8px',
  marginBottom: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-2px)'
  }
}));

// Mock events data - in a real app, this would come from the backend
const mockEvents = [
  { 
    id: 1, 
    title: 'Parent-Teacher Meeting', 
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    type: 'meeting'
  },
  { 
    id: 2, 
    title: 'Math Quiz', 
    date: new Date(new Date().setDate(new Date().getDate() + 5)),
    type: 'assignment'
  },
  { 
    id: 3, 
    title: 'School Sports Day', 
    date: new Date(new Date().setDate(new Date().getDate() + 8)),
    type: 'school'
  },
  { 
    id: 4, 
    title: 'Term End Announcement', 
    date: new Date(new Date().setDate(new Date().getDate() + 12)),
    type: 'announcement'
  }
];

const getEventIcon = (type) => {
  switch (type) {
    case 'meeting':
      return <EventIcon color="primary" />;
    case 'assignment':
      return <AssignmentIcon color="secondary" />;
    case 'school':
      return <SchoolIcon color="success" />;
    case 'announcement':
      return <AnnouncementIcon color="warning" />;
    case 'celebration':
      return <CelebrationIcon color="info" />;
    case 'competition':
      return <CompetitionIcon color="error" />;
    case 'conference':
      return <ConferenceIcon color="secondary" />;
    default:
      return <EventIcon />;
  }
};

const getEventColor = (type, theme) => {
  switch (type) {
    case 'meeting':
      return theme.palette.primary.main;
    case 'assignment':
      return theme.palette.secondary.main;
    case 'school':
      return theme.palette.success.main;
    case 'announcement':
      return theme.palette.warning.main;
    case 'celebration':
      return theme.palette.info.main;
    case 'competition':
      return theme.palette.error.main;
    case 'conference':
      return theme.palette.secondary.dark;
    default:
      return theme.palette.grey[500];
  }
};

const UpcomingCalendar = ({ userEvents = mockEvents, loading = false }) => {
  const theme = useTheme();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // In a real app, you would fetch events from an API
    // For now, we'll just sort the provided events by date
    if (userEvents && userEvents.length > 0) {
      const sortedEvents = [...userEvents].sort((a, b) => a.date - b.date);
      setEvents(sortedEvents);
    } else {
      setEvents([]);
    }
  }, [userEvents]);

  // Render loading skeleton
  const renderSkeleton = () => (
    <Box sx={{ width: '100%' }}>
      {[1, 2, 3].map((item) => (
        <Box key={item} sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Box sx={{ width: '100%' }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        </Box>
      ))}
    </Box>
  );

  return (
    <CalendarPaper sx={{
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      }
    }}>
      <CalendarHeader>
        <CalendarIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
        <Typography variant="h6" component="h2" fontWeight="bold">
          Upcoming Events
        </Typography>
      </CalendarHeader>
      
      <Divider sx={{ mb: 2 }} />
      
      {loading ? (
        renderSkeleton()
      ) : events.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', py: 4 }}>
          <EventIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
          <Typography variant="body1" color="textSecondary">
            No upcoming events
          </Typography>
        </Box>
      ) : (
        <List sx={{ overflow: 'auto', flexGrow: 1 }}>
          {events.map((event) => (
            <EventItem key={event.id} alignItems="flex-start">
              <ListItemIcon>
                <Avatar sx={{ bgcolor: getEventColor(event.type, theme) }}>
                  {getEventIcon(event.type)}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight="medium">
                    {event.title}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="textSecondary" component="span">
                      {formatDistanceToNow(event.date, { addSuffix: true })}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={event.type.charAt(0).toUpperCase() + event.type.slice(1)} 
                      sx={{ 
                        ml: 1, 
                        backgroundColor: `${getEventColor(event.type, theme)}20`,
                        color: getEventColor(event.type, theme),
                        fontWeight: 'medium',
                        fontSize: '0.7rem'
                      }} 
                    />
                  </>
                }
              />
            </EventItem>
          ))}
        </List>
      )}
    </CalendarPaper>
  );
};

export default UpcomingCalendar;
