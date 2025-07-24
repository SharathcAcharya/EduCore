import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  useTheme,
  LinearProgress
} from '@mui/material';
import CountUp from 'react-countup';
import { styled } from '@mui/material/styles';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

// Styled components
const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  }
}));

const IconContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color'
})(({ theme, color }) => ({
  position: 'absolute',
  top: '15px',
  right: '15px',
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: `${color}20`,
  color: color,
}));

const BackgroundIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color'
})(({ theme, color }) => ({
  position: 'absolute',
  bottom: '-15px',
  right: '-15px',
  fontSize: '150px',
  opacity: 0.05,
  color: color,
  display: 'flex'
}));

const StatsValue = styled(Box)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'flex-end'
}));

const StatsLabel = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 'medium',
  marginBottom: theme.spacing(1.5),
  color: theme.palette.text.secondary
}));

const ProgressLabel = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  fontSize: '0.75rem'
}));

const ChangeIndicator = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isPositive'
})(({ theme, isPositive }) => ({
  display: 'flex',
  alignItems: 'center',
  color: isPositive ? theme.palette.success.main : theme.palette.error.main,
  fontSize: '0.875rem',
  fontWeight: 'medium',
  marginTop: theme.spacing(1)
}));

const EnhancedStatsCard = ({ 
  title, 
  value, 
  icon, 
  color, 
  changeValue = 0, 
  target = null,
  progress = null,
  suffix = '',
  duration = 2
}) => {
  const theme = useTheme();
  
  // Determine if the change is positive
  const isPositive = changeValue >= 0;
  
  // Determine the color of the card
  const cardColor = theme.palette[color]?.main || color || theme.palette.primary.main;
  
  return (
    <StatCard>
      <IconContainer color={cardColor}>
        {icon}
      </IconContainer>
      
      <StatsLabel variant="body1">
        {title}
      </StatsLabel>
      
      <StatsValue>
        <CountUp 
          start={0} 
          end={value} 
          duration={duration} 
          suffix={suffix}
          style={{ fontWeight: 'bold' }}
        />
      </StatsValue>
      
      {progress !== null && (
        <>
          <ProgressLabel>
            <Typography variant="caption" fontWeight="medium" color="textSecondary">
              Progress
            </Typography>
            <Typography variant="caption" fontWeight="medium" color="textSecondary">
              {progress}% of {target}
            </Typography>
          </ProgressLabel>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: `${cardColor}20`,
              '& .MuiLinearProgress-bar': {
                backgroundColor: cardColor
              }
            }} 
          />
        </>
      )}
      
      {changeValue !== null && (
        <ChangeIndicator isPositive={isPositive}>
          {isPositive ? <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> : <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />}
          <Typography variant="caption" fontWeight="medium">
            {isPositive ? '+' : ''}{changeValue}% from last month
          </Typography>
        </ChangeIndicator>
      )}
      
      <BackgroundIcon color={cardColor}>
        {icon}
      </BackgroundIcon>
    </StatCard>
  );
};

export default EnhancedStatsCard;
