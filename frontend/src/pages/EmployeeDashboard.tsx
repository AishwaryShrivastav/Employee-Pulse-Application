/**
 * Employee Dashboard Component
 * 
 * This component serves as the main dashboard for employee users.
 * It displays surveys that require completion and those already completed,
 * allowing users to start new surveys or view their previous responses.
 * Features include:
 * - Tab navigation between pending and completed surveys
 * - Sorting of surveys by due date and submission status
 * - Direct navigation to individual surveys
 * - Response history viewing capability
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  useTheme,
  useMediaQuery,
  Divider,
  Button,
  Stack,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { Layout } from '../components/Layout';
import { SurveyCard } from '../components/SurveyCard';
import { surveyAPI } from '../services/api';
import { isPast, format } from 'date-fns';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartData } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { SurveyResponse } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Survey interface
 * Defines the structure of a survey displayed on the dashboard
 */
interface Survey {
  id: string;               // Unique identifier for the survey
  title: string;            // Survey title
  description: string;      // Survey description
  createdAt: string;        // When the survey was created
  status: 'Pending' | 'Submitted'; // Current status of the survey for this user
  submittedAt: string | null; // When the survey was submitted, if applicable
  questionCount: number;    // Number of questions in the survey
  isActive: boolean;        // Whether the survey is currently active
  dueDate: string;          // Deadline for survey completion
}

type ChartDataType = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
};

export const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  
  const defaultChartData: ChartDataType = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Survey Participation',
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: theme.palette.primary.main,
    }]
  };

  // State management
  const [surveys, setSurveys] = useState<Survey[]>([]);          // List of available surveys
  const [loading, setLoading] = useState(true);                  // Loading state
  const [error, setError] = useState<string | null>(null);       // Error messages
  const [participationChartData, setParticipationChartData] = useState<ChartDataType>(defaultChartData);
  const [recentResponses, setRecentResponses] = useState<SurveyResponse[]>([]);  // Recent survey responses

  // Load surveys on component mount
  useEffect(() => {
    fetchSurveys();
  }, []);

  /**
   * Fetches available surveys for the current user from the API
   * Filters for active surveys and sets the state
   */
  const fetchSurveys = async () => {
    try {
      setLoading(true);
      console.log('Fetching available surveys...');
      const data = await surveyAPI.getAvailableSurveys();
      
      // Log raw data from API
      console.log('Raw survey data from API:', data);
      
      // Filter active surveys
      const activeSurveys = data.filter((survey: Survey) => survey.isActive);
      console.log('Filtered active surveys:', activeSurveys);
      
      // Log status of each survey
      activeSurveys.forEach((survey: Survey) => {
        console.log(`Survey ${survey.id} - ${survey.title} has status: ${survey.status}`);
      });
      
      setSurveys(activeSurveys);
    } catch (err) {
      console.error('Error fetching surveys:', err);
      setError('Failed to load surveys. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigates to the survey view page to start completing a survey
   */
  const handleStartSurvey = (surveyId: string) => {
    console.log('Starting survey with ID:', surveyId);
    navigate(`/surveys/${surveyId}`);
  };

  /**
   * Navigates to the response history page to view a specific survey response
   */
  const handleViewResponse = (surveyId: string) => {
    // Log with high visibility
    console.log('%c ViewResponse button clicked for surveyId: ' + surveyId, 'background: #ff00ff; color: #ffffff; font-size: 16px; font-weight: bold; padding: 5px;');
    
    try {
      // Direct navigation with URL parameters but using React Router's navigate
      console.log('Redirecting to response history page with surveyId:', surveyId);
      
      // Use React Router's navigate instead of direct window.location
      navigate(`/response-history?surveyId=${surveyId}`);
      
      // Log after redirect
      console.log('Navigation initiated');
    } catch (error) {
      console.error('Error during navigation:', error);
    }
  };

  // Filter and sort available surveys
  const availableSurveys = surveys
    .filter(survey => survey.status === 'Pending')
    .sort((a, b) => {
      const aDate = new Date(a.dueDate);
      const bDate = new Date(b.dueDate);
      const now = new Date();
      
      const aOverdue = isPast(aDate);
      const bOverdue = isPast(bDate);
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      return aDate.getTime() - bDate.getTime();
    });

  // Filter and sort completed surveys
  const completedSurveys = surveys
    .filter(survey => survey.status === 'Submitted')
    .sort((a, b) => 
      new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime()
    );

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  // Main component render
  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: isSmall ? 2 : 4 }}>
        <Box sx={{ mb: isSmall ? 2 : 4 }}>
          <Typography 
            variant={isSmall ? "h5" : "h4"} 
            component="h1" 
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            My Surveys
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage your survey responses
          </Typography>
        </Box>

        {/* Display error message if present */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: isSmall ? 2 : 3,
              fontSize: isSmall ? '0.875rem' : '1rem'
            }}
          >
            {error}
          </Alert>
        )}

        {/* Available Surveys Section */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: isSmall ? 2 : 3, 
            mb: isSmall ? 2 : 3,
            borderRadius: 2
          }}
        >
          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={1} 
            sx={{ mb: 2 }}
          >
            <AssignmentIcon color="primary" />
            <Typography variant={isSmall ? "h6" : "h5"} sx={{ fontWeight: 600 }}>
              Available Surveys
            </Typography>
            <Chip 
              label={availableSurveys.length} 
              size={isSmall ? "small" : "medium"}
              color="primary"
            />
          </Stack>

          {availableSurveys.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No pending surveys available at the moment.
            </Alert>
          ) : (
            <Grid container spacing={isSmall ? 2 : 3}>
              {availableSurveys.map((survey) => (
                <Grid item xs={12} sm={6} md={4} key={survey.id}>
                  <Paper 
                    elevation={3}
                    sx={{
                      p: isSmall ? 2 : 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {survey.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {survey.description}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Due: {format(new Date(survey.dueDate), 'MMM d, yyyy')}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box sx={{ mt: 'auto' }}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={() => handleStartSurvey(survey.id)}
                        startIcon={<PlayArrowIcon />}
                        size={isSmall ? "small" : "medium"}
                      >
                        Start Survey
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        {/* Completed Surveys Section */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: isSmall ? 2 : 3,
            borderRadius: 2
          }}
        >
          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={1} 
            sx={{ mb: 2 }}
          >
            <CheckCircleIcon color="success" />
            <Typography variant={isSmall ? "h6" : "h5"} sx={{ fontWeight: 600 }}>
              Completed Surveys
            </Typography>
            <Chip 
              label={completedSurveys.length} 
              size={isSmall ? "small" : "medium"}
              color="success"
            />
          </Stack>

          {completedSurveys.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              You haven't completed any surveys yet.
            </Alert>
          ) : (
            <Grid container spacing={isSmall ? 2 : 3}>
              {completedSurveys.map((survey) => (
                <Grid item xs={12} sm={6} md={4} key={survey.id}>
                  <Paper 
                    elevation={3}
                    sx={{
                      p: isSmall ? 2 : 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {survey.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {survey.description}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CheckCircleIcon fontSize="small" color="success" />
                        <Typography variant="body2" color="success.main">
                          Completed on {format(new Date(survey.submittedAt!), 'MMM d, yyyy')}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box sx={{ mt: 'auto' }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        onClick={() => handleViewResponse(survey.id)}
                        startIcon={<VisibilityIcon />}
                        size={isSmall ? "small" : "medium"}
                      >
                        View Response
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        {/* Chart Section */}
        <Paper elevation={2} sx={{ p: isSmall ? 2 : 3, mt: 3, borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <AssignmentIcon color="primary" />
            <Typography variant={isSmall ? "h6" : "h5"} sx={{ fontWeight: 600 }}>
              Survey Participation
            </Typography>
          </Stack>
          <Box sx={{ height: isSmall ? 250 : 350 }}>
            <Bar
              data={participationChartData as unknown as ChartData<'bar', number[], string>}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Monthly Survey Participation'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </Box>
        </Paper>

        {/* Recent Responses Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Survey Title</TableCell>
                {!isSmall && <TableCell>Submitted On</TableCell>}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentResponses.map((response) => (
                <TableRow key={response._id} hover>
                  <TableCell sx={{ maxWidth: isSmall ? 120 : 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {response.surveyId.title}
                  </TableCell>
                  {!isSmall && (
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {format(new Date(response.submittedAt), 'MMM d, yyyy')}
                    </TableCell>
                  )}
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewResponse(response._id)}
                      startIcon={<VisibilityIcon />}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Layout>
  );
}; 