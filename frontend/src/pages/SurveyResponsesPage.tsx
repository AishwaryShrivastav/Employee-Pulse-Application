import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Divider, 
  List, 
  ListItem, 
  Button, 
  CircularProgress, 
  Alert,
  Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Layout } from '../components/Layout';
import { surveyAPI } from '../services/api';
import { SurveyResponse, Survey } from '../types';

// Create an interface for the survey data returned by the API
interface SurveyData {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  questions: {
    id: string;
    index: number;
    text: string;
    type: string;
    options?: string[];
    required: boolean;
  }[];
}

export const SurveyResponsesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Survey ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching survey responses for survey ID:', id);
        
        // Fetch the survey details first
        const surveyData = await surveyAPI.getSurvey(id);
        setSurvey(surveyData);
        console.log('Survey details:', surveyData);
        
        // Fetch responses for this specific survey
        const responsesData = await surveyAPI.getSurveyResponses(id);
        console.log('Survey responses:', responsesData);
        
        if (Array.isArray(responsesData)) {
          setResponses(responsesData);
          
          if (responsesData.length === 0) {
            console.log('No responses found for this survey');
          }
        } else {
          console.error('Unexpected response format:', responsesData);
          setError('Received unexpected data format from server');
        }
      } catch (error: any) { // Type error as any to access properties
        console.error('Error fetching data:', error);
        if (error.response) {
          setError(`Error ${error.response.status}: ${error.response.data?.message || 'Failed to fetch survey responses'}`);
        } else if (error.request) {
          setError('Network error: Failed to connect to server');
        } else {
          setError('Failed to fetch survey responses. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getQuestionText = (response: SurveyResponse, questionIndex: number): string => {
    // If we have the survey data with questions, use it
    if (survey && survey.questions && survey.questions[questionIndex]) {
      return survey.questions[questionIndex].text;
    }
    
    // Otherwise try to get from the response object
    if (typeof response.surveyId === 'object' && 
        response.surveyId.questions && 
        Array.isArray(response.surveyId.questions) &&
        response.surveyId.questions[questionIndex]) {
      return response.surveyId.questions[questionIndex].text;
    }
    
    // Default fallback
    return `Question ${questionIndex + 1}`;
  };

  const getUserName = (response: SurveyResponse): string => {
    if (response.userId && typeof response.userId === 'object' && response.userId.name) {
      return response.userId.name;
    }
    
    // Check for userName property or return Anonymous
    return 'Anonymous User';
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

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            {survey ? `Responses: ${survey.title}` : 'Survey Responses'}
          </Typography>
          
          <Button 
            variant="outlined" 
            onClick={() => navigate('/survey-management')}
            startIcon={<ArrowBackIcon />}
          >
            Back to Survey Management
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}
        
        {!loading && responses.length === 0 && (
          <Alert severity="info" sx={{ my: 2 }}>
            No responses have been submitted for this survey yet.
          </Alert>
        )}
        
        {responses.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Total Responses: {responses.length}
            </Typography>
            
            <Grid container spacing={3}>
              {responses.map((response, responseIndex) => (
                <Grid item xs={12} key={response._id}>
                  <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Response #{responseIndex + 1} - {getUserName(response)}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Submitted on: {new Date(response.submittedAt || '').toLocaleString()}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <List>
                      {response.answers.map((answer, answerIndex) => (
                        <ListItem key={answerIndex} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {getQuestionText(response, answer.questionIndex)}
                          </Typography>
                          <Typography variant="body1">
                            {answer.value}
                          </Typography>
                          <Divider sx={{ width: '100%', my: 1 }} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Layout>
  );
}; 