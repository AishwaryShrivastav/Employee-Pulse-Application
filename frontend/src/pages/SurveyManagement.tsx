import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Layout } from '../components/Layout';
import { SurveyManagementTable } from '../components/SurveyManagementTable';
import { SurveyForm } from '../components/SurveyForm';
import { surveyAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Survey as GlobalSurvey, Question, QuestionType } from '../types';

interface Survey {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  isActive: boolean;
  createdAt: string;
}

interface FormSurvey {
  id?: string;
  title: string;
  description: string;
  questions: Question[];
}

export const SurveyManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<FormSurvey | null>(null);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await surveyAPI.getSurveys();
      setSurveys(response.map((survey: GlobalSurvey) => ({
        id: survey._id,
        title: survey.title,
        description: survey.description,
        questionCount: survey.questions.length,
        isActive: survey.isActive,
        createdAt: survey.createdAt
      })));
    } catch (err) {
      setError('Failed to load surveys');
      toast.error('Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSurvey = async (surveyData: FormSurvey) => {
    try {
      await surveyAPI.createSurvey(surveyData);
      toast.success('Survey created successfully');
      setIsFormOpen(false);
      fetchSurveys();
    } catch (err) {
      toast.error('Failed to create survey');
    }
  };

  const handleUpdateSurvey = async (surveyData: FormSurvey) => {
    try {
      if (!selectedSurvey?.id) return;
      await surveyAPI.updateSurvey(selectedSurvey.id, surveyData);
      toast.success('Survey updated successfully');
      setIsFormOpen(false);
      setSelectedSurvey(null);
      fetchSurveys();
    } catch (err) {
      toast.error('Failed to update survey');
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await surveyAPI.updateSurveyStatus(id, isActive);
      toast.success(`Survey ${isActive ? 'activated' : 'deactivated'} successfully`);
      fetchSurveys();
    } catch (err) {
      toast.error('Failed to update survey status');
    }
  };

  const handleEdit = async (survey: Survey) => {
    try {
      const fullSurvey = await surveyAPI.getSurvey(survey.id);
      setSelectedSurvey({
        id: fullSurvey.id,
        title: fullSurvey.title,
        description: fullSurvey.description,
        questions: fullSurvey.questions
      });
      setIsFormOpen(true);
    } catch (err) {
      toast.error('Failed to load survey details');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedSurvey(null);
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
      <Container maxWidth="lg">
        <Box 
          component={Paper} 
          elevation={0}
          sx={{ 
            p: { xs: 2, sm: 3 },
            mt: { xs: 2, sm: 3 },
            mb: { xs: 2, sm: 3 },
            borderRadius: 2,
          }}
        >
          <Box 
            display="flex" 
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between" 
            alignItems={{ xs: 'stretch', sm: 'center' }}
            gap={2}
            mb={4}
          >
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              Survey Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsFormOpen(true)}
              size="large"
              fullWidth={isMobile}
              sx={{ 
                py: 1.5,
                px: 3,
                borderRadius: 2,
                boxShadow: theme.shadows[3],
              }}
            >
              Create Survey
            </Button>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}

          <Box sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: theme.shadows[1],
          }}>
            <SurveyManagementTable
              surveys={surveys}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
            />
          </Box>
        </Box>

        <SurveyForm
          open={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={selectedSurvey ? handleUpdateSurvey : handleCreateSurvey}
          initialData={selectedSurvey || undefined}
        />
      </Container>
    </Layout>
  );
}; 