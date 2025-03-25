import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Container, Typography, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { Survey } from '../types';
import { surveyAPI } from '../services/api';
import { SurveyCard } from '../components/SurveyCard';
import { Layout } from '../components/Layout';

const mapSurveyData = (survey: any, statusData: any[]) => ({
  id: survey._id,
  title: survey.title,
  description: survey.description,
  createdAt: survey.createdAt,
  status: statusData.find((s: any) => s.surveyId === survey._id)?.submitted ? 'Submitted' : 'Pending',
  submittedAt: statusData.find((s: any) => s.surveyId === survey._id)?.submittedAt || null,
  questionCount: survey.questions?.length || 0,
  isActive: survey.isActive,
  dueDate: survey.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
});

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [surveysData, statusData] = await Promise.all([
          surveyAPI.getSurveys(),
          surveyAPI.getSurveyStatus(),
        ]);

        const mappedSurveys = surveysData
          .filter((survey: any) => survey.isActive)
          .map((survey: any) => mapSurveyData(survey, statusData));

        setSurveys(mappedSurveys);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load surveys. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStartSurvey = (surveyId: string) => {
    navigate(`/surveys/${surveyId}`);
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
        <Typography variant="h4" component="h1" gutterBottom>
          Available Surveys
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {surveys.length > 0 ? (
            surveys.map((survey) => (
              <Grid item xs={12} sm={6} md={4} key={survey.id}>
                <SurveyCard
                  survey={survey}
                  onStart={() => handleStartSurvey(survey.id)}
                />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">
                No surveys are currently available.
              </Alert>
            </Grid>
          )}
        </Grid>
      </Container>
    </Layout>
  );
};
