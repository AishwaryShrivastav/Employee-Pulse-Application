import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Breadcrumbs,
  Link,
  LinearProgress,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  FormGroup,
  Alert,
  Stack,
} from '@mui/material';
import { NavigateNext, NavigateBefore } from '@mui/icons-material';
import { Layout } from '../components/Layout';
import { surveyAPI } from '../services/api';

interface Question {
  id: string;
  index: number;
  text: string;
  type: 'rating' | 'text' | 'choice';
  options: string[];
  required: boolean;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  questions: Question[];
}

export const SurveyView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      const data = await surveyAPI.getSurvey(id!);
      setSurvey(data);
      // Initialize answers object
      const initialAnswers: Record<string, string | string[]> = {};
      data.questions.forEach((q: Question) => {
        initialAnswers[q.id] = q.type === 'choice' ? [] : '';
      });
      setAnswers(initialAnswers);
    } catch (err) {
      console.error('Error fetching survey:', err);
      setError('Failed to load survey. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSingleChoiceChange = (questionId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: event.target.value
    }));
  };

  const handleTextChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleMultipleChoiceChange = (questionId: string, option: string) => {
    setAnswers(prev => {
      const currentAnswers = (prev[questionId] as string[]) || [];
      const newAnswers = currentAnswers.includes(option)
        ? currentAnswers.filter(a => a !== option)
        : [...currentAnswers, option];
      return {
        ...prev,
        [questionId]: newAnswers
      };
    });
  };

  const validateAnswers = (): boolean => {
    if (!survey) return false;
    
    return survey.questions.every(question => {
      if (!question.required) return true;
      
      const answer = answers[question.id];
      if (Array.isArray(answer)) {
        return answer.length > 0;
      }
      return !!answer;
    });
  };

  const isCurrentQuestionAnswered = (): boolean => {
    if (!survey) return false;
    const currentQuestion = survey.questions[currentQuestionIndex];
    
    const answer = answers[currentQuestion.id];
    if (currentQuestion.required) {
      if (Array.isArray(answer)) {
        return answer.length > 0;
      }
      return !!answer;
    }
    return true;
  };

  const handleNext = () => {
    if (!isCurrentQuestionAnswered()) {
      setError('Please answer this question before proceeding.');
      return;
    }
    setError(null);
    if (currentQuestionIndex < (survey?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!survey) return;

    if (!validateAnswers()) {
      setError('Please answer all required questions before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const formattedAnswers = Object.entries(answers)
        .filter(([_, value]) => {
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          return value !== '';
        })
        .map(([questionId, value]) => {
          // Find the question to get its index
          const question = survey.questions.find(q => q.id === questionId);
          return {
            questionIndex: question?.index || 0,
            value: Array.isArray(value) ? value.join(', ') : value
          };
        });

      await surveyAPI.submitResponse(survey.id, formattedAnswers);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Error submitting survey:', err);
      setError(err.response?.data?.message || 'Failed to submit survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography>Loading survey...</Typography>
        </Box>
      </Layout>
    );
  }

  if (!survey) {
    return (
      <Layout>
        <Container>
          <Alert severity="error">Survey not found</Alert>
        </Container>
      </Layout>
    );
  }

  const currentQuestion = survey.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / survey.totalQuestions) * 100;

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
          <Link color="inherit" onClick={() => navigate('/dashboard')} sx={{ cursor: 'pointer' }}>
            Dashboard
          </Link>
          <Link color="inherit" onClick={() => navigate(`/surveys/${survey.id}`)} sx={{ cursor: 'pointer' }}>
            {survey.title}
          </Link>
          <Typography color="text.primary">
            Question {currentQuestionIndex + 1}
          </Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {survey.title}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              Question {currentQuestionIndex + 1} of {survey.totalQuestions}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {currentQuestion.text}
              {currentQuestion.required && (
                <Typography component="span" color="error" sx={{ ml: 1 }}>
                  *
                </Typography>
              )}
            </Typography>

            <FormControl component="fieldset" fullWidth>
              {currentQuestion.type === 'choice' ? (
                <RadioGroup
                  value={answers[currentQuestion.id] || ''}
                  onChange={handleSingleChoiceChange(currentQuestion.id)}
                >
                  {currentQuestion.options.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
              ) : currentQuestion.type === 'rating' ? (
                <RadioGroup
                  row
                  value={answers[currentQuestion.id] || ''}
                  onChange={handleSingleChoiceChange(currentQuestion.id)}
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <FormControlLabel
                      key={rating}
                      value={rating.toString()}
                      control={<Radio />}
                      label={rating.toString()}
                    />
                  ))}
                </RadioGroup>
              ) : (
                <textarea
                  value={answers[currentQuestion.id] as string || ''}
                  onChange={(e) => handleTextChange(currentQuestion.id, e.target.value)}
                  rows={4}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontFamily: 'inherit',
                    fontSize: 'inherit'
                  }}
                />
              )}
            </FormControl>
          </Box>

          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || submitting}
              startIcon={<NavigateBefore />}
            >
              Previous
            </Button>
            {currentQuestionIndex === survey.questions.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={submitting || !validateAnswers()}
              >
                {submitting ? 'Submitting...' : 'Submit Survey'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isCurrentQuestionAnswered()}
                endIcon={<NavigateNext />}
              >
                Next
              </Button>
            )}
          </Stack>
        </Paper>
      </Container>
    </Layout>
  );
}; 