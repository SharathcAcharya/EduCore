import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Divider,
  useTheme
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { styled } from '@mui/material/styles';
import { 
  Assessment as AssessmentIcon
} from '@mui/icons-material';

// Styled components
const ChartPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '10px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  overflow: 'hidden'
}));

const ChartHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}));

const CustomTooltip = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1.5),
  borderRadius: 4,
  boxShadow: theme.shadows[3],
  '& .tooltip-label': {
    fontWeight: 'bold',
    marginBottom: theme.spacing(0.5),
    color: theme.palette.text.primary
  },
  '& .tooltip-value': {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 2
  },
  '& .tooltip-bullet': {
    width: 10,
    height: 10,
    borderRadius: '50%',
    marginRight: 8
  }
}));

// Custom tooltip component for the chart
const PerformanceTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  
  if (active && payload && payload.length) {
    return (
      <CustomTooltip>
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <div className="tooltip-value" key={`id-${index}`}>
            <div 
              className="tooltip-bullet" 
              style={{ backgroundColor: entry.color }}
            />
            <span style={{ color: theme.palette.text.secondary }}>
              {entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </CustomTooltip>
    );
  }

  return null;
};

// Sample data for performance chart - would come from backend in real app
const sampleData = [
  {
    name: 'Jan',
    attendance: 85,
    performance: 78,
    assignments: 92,
  },
  {
    name: 'Feb',
    attendance: 88,
    performance: 82,
    assignments: 86,
  },
  {
    name: 'Mar',
    attendance: 90,
    performance: 85,
    assignments: 90,
  },
  {
    name: 'Apr',
    attendance: 92,
    performance: 88,
    assignments: 94,
  },
  {
    name: 'May',
    attendance: 86,
    performance: 90,
    assignments: 91,
  },
  {
    name: 'Jun',
    attendance: 89,
    performance: 94,
    assignments: 87,
  },
];

const PerformanceChart = ({ 
  title = "Performance Overview",
  data = sampleData,
  showAttendance = true,
  showPerformance = true,
  showAssignments = true
}) => {
  const theme = useTheme();

  return (
    <ChartPaper>
      <ChartHeader>
        <AssessmentIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
        <Typography variant="h6" component="h2" fontWeight="bold">
          {title}
        </Typography>
      </ChartHeader>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ flexGrow: 1, width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip content={<PerformanceTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: 10,
                fontSize: 12
              }}
            />
            {showAttendance && (
              <Bar 
                dataKey="attendance" 
                name="Attendance" 
                fill={theme.palette.primary.main} 
                radius={[4, 4, 0, 0]} 
                barSize={20} 
              />
            )}
            {showPerformance && (
              <Bar 
                dataKey="performance" 
                name="Performance" 
                fill={theme.palette.secondary.main} 
                radius={[4, 4, 0, 0]} 
                barSize={20} 
              />
            )}
            {showAssignments && (
              <Bar 
                dataKey="assignments" 
                name="Assignments" 
                fill={theme.palette.success.main} 
                radius={[4, 4, 0, 0]} 
                barSize={20} 
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </ChartPaper>
  );
};

export default PerformanceChart;
