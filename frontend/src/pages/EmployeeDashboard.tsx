import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import { Layout } from '../components/Layout';
import { SurveyCard } from '../components/SurveyCard';
import { surveyAPI } from '../services/api';
import { isPast } from 'date-fns';

interface Survey {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: 'Pending' | 'Submitted';
  submittedAt: string | null;
  questionCount: number;
  isActive: boolean;
  dueDate: string;
}

type TabValue = 'pending' | 'completed';

export const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('pending');

  useEffect(() => {
    fetchSurveys();
  }, []);

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

  const handleStartSurvey = (surveyId: string) => {
    console.log('Starting survey with ID:', surveyId);
    navigate(`/surveys/${surveyId}`);
  };

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };

  const filteredAndSortedSurveys = () => {
    const filtered = surveys.filter((survey) => {
      if (activeTab === 'completed') {
        return survey.status === 'Submitted';
      }
      return survey.status === 'Pending';
    });

    return filtered.sort((a, b) => {
      if (activeTab === 'completed') {
        // Sort completed surveys by submission date (most recent first)
        return new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime();
      }
      
      // For pending surveys, prioritize overdue, then due soon
      const aDate = new Date(a.dueDate);
      const bDate = new Date(b.dueDate);
      const now = new Date();
      
      const aOverdue = isPast(aDate);
      const bOverdue = isPast(bDate);
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      // If both are overdue or not overdue, sort by due date
      return aDate.getTime() - bDate.getTime();
    });
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  const sortedSurveys = filteredAndSortedSurveys();

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Surveys
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: 1, 
          borderColor: 'divider', 
          mb: 3 
        }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Pending" value="pending" />
            <Tab label="Completed" value="completed" />
          </Tabs>
          
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => navigate('/response-history')}
            sx={{ mb: 1 }}
          >
            View Response History
          </Button>
        </Box>

        <Grid container spacing={3}>
          {sortedSurveys.length > 0 ? (
            sortedSurveys.map((survey) => {
              // Debug logging for submitted surveys
              if (survey.status === 'Submitted') {
                console.log(`%c Rendering Submitted survey card: ${survey.id} - ${survey.title}`, 
                  'background: #9c27b0; color: white; font-size: 14px;');
              }
              
              return (
                <Grid item xs={12} sm={6} md={4} key={survey.id}>
                  <SurveyCard
                    survey={survey}
                    onStart={() => handleStartSurvey(survey.id)}
                    onViewResponse={() => {
                      console.log(`%c Forced onViewResponse handler for survey: ${survey.id} - Status: ${survey.status}`, 
                        'background: #ff6d00; color: white; font-size: 14px; font-weight: bold;');
                      handleViewResponse(survey.id);
                    }}
                  />
                </Grid>
              );
            })
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">
                {activeTab === 'pending'
                  ? 'No pending surveys available.'
                  : 'No completed surveys yet.'}
              </Alert>
            </Grid>
          )}
        </Grid>
      </Container>
    </Layout>
  );
}; 