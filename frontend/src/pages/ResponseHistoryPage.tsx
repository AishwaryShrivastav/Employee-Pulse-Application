import React, { useEffect, useState, useCallback } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Paper, Button, Chip, List, ListItem, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Layout } from '../components/Layout';
import { surveyAPI } from '../services/api';
import { SurveyResponse } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Define CSS for highlight animation
const highlightStyles = `
  @keyframes highlightPulse {
    0% { background-color: rgba(76, 175, 80, 0.1); }
    50% { background-color: rgba(76, 175, 80, 0.3); }
    100% { background-color: rgba(76, 175, 80, 0.1); }
  }
  
  .highlight-response {
    animation: highlightPulse 2s infinite;
  }
`;

export const ResponseHistoryPage: React.FC = () => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the surveyId directly from URL search params
  const queryParams = new URLSearchParams(location.search);
  const targetSurveyId = queryParams.get('surveyId');
  
  // Log with high visibility 
  console.log('%c ResponseHistoryPage loaded with targetSurveyId: ' + targetSurveyId, 
    'background: #ff00ff; color: #ffffff; font-size: 16px');
  
  // Function to log survey ID check with high visibility
  const logSurveyIdCheck = useCallback((response: SurveyResponse, isMatch: boolean) => {
    const style = isMatch 
      ? 'background: #4caf50; color: white; font-size: 13px; padding: 2px 5px; border-radius: 3px;'
      : 'background: #f44336; color: white; font-size: 13px; padding: 2px 5px; border-radius: 3px;';
    
    const responseId = typeof response.surveyId === 'object' 
      ? response.surveyId._id 
      : response.surveyId;
    
    console.log(
      `%c ID Check: ${isMatch ? 'MATCH' : 'NO MATCH'} | Target: ${targetSurveyId} | Response: ${responseId}`,
      style
    );
  }, [targetSurveyId]);
  
  // Define isTargetSurvey with useCallback to prevent unnecessary re-renders
  const isTargetSurvey = useCallback((response: SurveyResponse): boolean => {
    // Exit early if no target ID or no surveyId in response
    if (!targetSurveyId || !response.surveyId) {
      logSurveyIdCheck(response, false);
      return false;
    }
    
    let isMatch = false;
    
    // Check if response.surveyId is a string
    if (typeof response.surveyId === 'string') {
      isMatch = response.surveyId === targetSurveyId;
    } 
    // Check if response.surveyId is an object with _id
    else if (typeof response.surveyId === 'object' && response.surveyId?._id) {
      isMatch = response.surveyId._id === targetSurveyId;
    }
    
    // Log the result
    logSurveyIdCheck(response, isMatch);
    
    return isMatch;
  }, [targetSurveyId, logSurveyIdCheck]);
  
  // Add CSS styles for highlighting
  useEffect(() => {
    // Create a style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = highlightStyles;
    document.head.appendChild(styleElement);
    
    // Cleanup on component unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Fetch responses on component mount
  useEffect(() => {
    // Log that we're in the ResponseHistoryPage component with the target survey ID
    console.log('%c ResponseHistoryPage: Loaded with targetSurveyId: ' + targetSurveyId, 'background: #222; color: #bada55; font-size: 14px;');
    
    const fetchResponses = async () => {
      setLoading(true);
      try {
        console.log('Checking auth token:', localStorage.getItem('token') ? 'Token exists' : 'No token found');
        console.log('Calling API using surveyAPI.getMyResponses()');
        
        const data = await surveyAPI.getMyResponses();
        console.log('Received responses from API:', data);
        setResponses(data);
        
        // Check if we have a matching response
        const targetResponseIndex = data.findIndex(isTargetSurvey);
        
        // If we found a matching response, scroll to it
        if (targetResponseIndex !== -1) {
          console.log(`%c Found matching survey at index ${targetResponseIndex}. Will scroll to it.`, 'background: #222; color: #bada55; font-size: 14px;');
          
          // Use setTimeout to ensure the DOM has been updated before scrolling
          setTimeout(() => {
            const responseElement = document.getElementById(`response-${targetResponseIndex}`);
            if (responseElement) {
              responseElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
              // Add a highlight class to make it more visible
              responseElement.classList.add('highlight-response');
            }
          }, 500);
        }
      } catch (error: any) { // Type the error as any to allow accessing properties
        console.error('Failed to fetch responses:', error);
        
        // More detailed error logging
        if (error.response) {
          console.error('Error response status:', error.response.status);
          console.error('Error response data:', error.response.data);
          
          // If unauthorized, try to redirect to login
          if (error.response.status === 401) {
            setError('Your session has expired. Please log in again.');
          } else {
            setError(`Failed to fetch your survey responses. Error: ${error.response.status}`);
          }
        } else if (error.request) {
          console.error('No response received:', error.request);
          setError('Failed to connect to the server. Please check your internet connection.');
        } else {
          setError('Failed to fetch your survey responses. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [targetSurveyId, isTargetSurvey]);

  const getSurveyTitle = (response: SurveyResponse): string => {
    if (!response.surveyId) return 'Unknown Survey';
    
    if (typeof response.surveyId === 'string') {
      return 'Survey';
    } else if (typeof response.surveyId === 'object' && response.surveyId.title) {
      return response.surveyId.title;
    }
    
    return 'Unknown Survey';
  };

  const getSurveyIdForDOM = (response: SurveyResponse): string => {
    if (!response.surveyId) return `unknown-${response._id}`;
    
    if (typeof response.surveyId === 'string') {
      return response.surveyId;
    } else if (typeof response.surveyId === 'object' && response.surveyId._id) {
      return response.surveyId._id;
    }
    
    return `unknown-${response._id}`;
  };

  const getQuestionText = (response: SurveyResponse, questionIndex: number): string => {
    // Safety check for undefined surveyId
    if (!response.surveyId) return `Question ${questionIndex + 1}`;
    
    // For string surveyId (no embedded questions)
    if (typeof response.surveyId === 'string') {
      return `Question ${questionIndex + 1}`;
    }
    
    // For object surveyId with questions array
    if (typeof response.surveyId === 'object' && 
        response.surveyId.questions && 
        Array.isArray(response.surveyId.questions) &&
        response.surveyId.questions[questionIndex]) {
      return response.surveyId.questions[questionIndex].text || `Question ${questionIndex + 1}`;
    }
    
    // Default fallback
    return `Question ${questionIndex + 1}`;
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            My Survey Responses
          </Typography>
          
          <Button 
            variant="outlined" 
            onClick={() => navigate('/dashboard')}
            startIcon={<ArrowBackIcon />}
          >
            Back to Dashboard
          </Button>
        </Box>
        
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
        
        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}
        
        {!loading && responses.length === 0 && (
          <Alert severity="info" sx={{ my: 2 }}>
            You haven't submitted any survey responses yet.
          </Alert>
        )}
        
        {responses.map((response, index) => {
          const surveyTitle = typeof response.surveyId === 'object' ? response.surveyId.title : 'Unknown Survey';
          const surveyQuestions = typeof response.surveyId === 'object' && response.surveyId.questions ? response.surveyId.questions : [];
          const isTarget = isTargetSurvey(response);
          
          return (
            <Paper 
              key={response._id} 
              id={`response-${index}`}
              elevation={3} 
              sx={{ 
                p: 3, 
                my: 3, 
                border: isTarget ? '2px solid #4caf50' : 'none',
                position: 'relative',
                transition: 'background-color 0.3s ease'
              }}
              className={isTarget ? 'highlight-response' : ''}
            >
              {isTarget && (
                <Chip 
                  label="Requested Survey" 
                  color="success" 
                  sx={{ 
                    position: 'absolute', 
                    top: 10, 
                    right: 10 
                  }} 
                />
              )}
              
              <Typography variant="h5" component="h2" gutterBottom>
                {surveyTitle}
              </Typography>
              
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Submitted on: {new Date(response.submittedAt || '').toLocaleDateString()}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <List>
                {response.answers.map((answer, i) => {
                  // Find the corresponding question text
                  const questionText = surveyQuestions[answer.questionIndex]?.text || `Question ${answer.questionIndex + 1}`;
                  
                  return (
                    <ListItem key={i} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {questionText}
                      </Typography>
                      <Typography variant="body1">
                        {answer.value}
                      </Typography>
                      <Divider sx={{ width: '100%', my: 1 }} />
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          );
        })}
      </Container>
    </Layout>
  );
}; 