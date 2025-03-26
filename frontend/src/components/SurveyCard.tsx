import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  CardActions,
  Tooltip,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import { format, isPast, formatDistanceToNow } from 'date-fns';
import {
  Assignment,
  CheckCircle,
  Schedule,
  Warning,
  AccessTime,
  Visibility,
  PlayArrow,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLogger } from '../hooks/useLogger';

interface SurveyCardProps {
  survey: {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    status: 'Pending' | 'Submitted' | 'Overdue';
    submittedAt: string | null;
    questionCount: number;
    dueDate: string;
  };
  onStart: () => void;
  onViewResponse?: () => void;
}

export const SurveyCard: React.FC<SurveyCardProps> = ({ survey, onStart, onViewResponse }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const navigate = useNavigate();
  const logger = useLogger();

  const isSubmitted = survey.status === 'Submitted';
  const isDueSoon = !isSubmitted && new Date(survey.dueDate) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days
  const isOverdue = !isSubmitted && isPast(new Date(survey.dueDate));

  // Debug logging at component initialization
  React.useEffect(() => {
    console.log(`%c SurveyCard initialized for survey: ${survey.id} - ${survey.title}`, 'background: #1976d2; color: white;');
    console.log({
      surveyDetails: {
        id: survey.id,
        title: survey.title,
        status: survey.status,
        isSubmitted
      },
      onViewResponseType: typeof onViewResponse,
      hasHandler: !!onViewResponse,
      onStartType: typeof onStart,
      hasStartHandler: !!onStart
    });
  }, [survey.id, survey.title, survey.status, isSubmitted, onViewResponse, onStart]);

  const handleStartSurvey = () => {
    try {
      logger.log('Starting survey', { surveyId: survey.id });
      if (onStart) {
        onStart();
      } else {
        navigate(`/survey/${survey.id}`);
      }
    } catch (error) {
      logger.error('Error starting survey', { error, surveyId: survey.id });
    }
  };

  const handleViewResponses = () => {
    try {
      logger.log('Viewing responses', { surveyId: survey.id });
      if (onViewResponse) {
        onViewResponse();
      } else {
        navigate(`/survey/${survey.id}/responses`);
      }
    } catch (error) {
      logger.error('Error viewing responses', { error, surveyId: survey.id });
    }
  };

  const getStatusChip = () => {
    if (isSubmitted) {
      return (
        <Chip
          icon={<CheckCircle />}
          label="Completed"
          color="success"
          size="small"
        />
      );
    }
    if (isOverdue) {
      return (
        <Chip
          icon={<Warning />}
          label="Overdue"
          color="error"
          size="small"
        />
      );
    }
    if (isDueSoon) {
      return (
        <Chip
          icon={<Schedule />}
          label="Due Soon"
          color="warning"
          size="small"
        />
      );
    }
    return (
      <Chip
        icon={<Schedule />}
        label="Pending"
        color="primary"
        size="small"
      />
    );
  };

  const getStatusColor = () => {
    switch (survey.status) {
      case 'Submitted':
        return theme.palette.success.main;
      case 'Overdue':
        return theme.palette.error.main;
      default:
        return theme.palette.warning.main;
    }
  };

  const getStatusIcon = () => {
    switch (survey.status) {
      case 'Submitted':
        return <CheckCircle />;
      case 'Overdue':
        return <Warning />;
      default:
        return <Schedule />;
    }
  };

  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={(e) => {
        // Prevent for card click handling when buttons explicitly handle clicks
        if (e.defaultPrevented) return;
        
        console.log('%c Card clicked', 'background: #9c27b0; color: white;');
        
        // For submitted surveys, we need to handle the response view
        if (isSubmitted) {
          if (onViewResponse) {
            console.log('%c Card click - calling onViewResponse handler', 'background: #9c27b0; color: white;');
            onViewResponse();
          } else {
            console.log('%c Card click - no onViewResponse handler, using direct navigation', 'background: #9c27b0; color: white;');
            try {
              navigate(`/response-history?surveyId=${survey.id}`);
            } catch (error) {
              console.error('Error using direct navigation:', error);
            }
          }
        } else if (onStart) {
          // For pending surveys
          console.log('%c Card click - calling onStart handler', 'background: #9c27b0; color: white;');
          onStart();
        }
      }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: isSmall ? 1.5 : 2,
          p: isSmall ? 2 : 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assignment color="primary" />
            <Typography
              variant={isSmall ? "subtitle1" : "h6"}
              component="h2"
              sx={{
                fontWeight: 600,
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              {survey.title}
            </Typography>
          </Box>
          <Chip
            icon={getStatusIcon()}
            label={survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
            size={isSmall ? "small" : "medium"}
            sx={{
              bgcolor: `${getStatusColor()}15`,
              color: getStatusColor(),
              fontWeight: 500,
              '& .MuiChip-icon': {
                color: 'inherit',
              },
            }}
          />
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            flexGrow: 1,
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: isSmall ? 2 : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {survey.description}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'text.secondary',
            mb: 1,
          }}
        >
          <AccessTime fontSize="small" />
          <Typography variant="body2">
            Due: {format(new Date(survey.dueDate), 'MMM d, yyyy')}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: isSmall ? 1 : 2,
            mt: 'auto',
          }}
        >
          {isMobile ? (
            <>
              {survey.status !== 'Submitted' && user?.role !== 'admin' && (
                <Tooltip title="Start Survey">
                  <IconButton
                    color="primary"
                    onClick={handleStartSurvey}
                    size={isSmall ? "small" : "medium"}
                  >
                    <PlayArrow />
                  </IconButton>
                </Tooltip>
              )}
              {(survey.status === 'Submitted' || user?.role === 'admin') && (
                <Tooltip title="View Responses">
                  <IconButton
                    color="primary"
                    onClick={handleViewResponses}
                    size={isSmall ? "small" : "medium"}
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip>
              )}
            </>
          ) : (
            <>
              {survey.status !== 'Submitted' && user?.role !== 'admin' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleStartSurvey}
                  startIcon={<PlayArrow />}
                  fullWidth
                >
                  Start Survey
                </Button>
              )}
              {(survey.status === 'Submitted' || user?.role === 'admin') && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleViewResponses}
                  startIcon={<Visibility />}
                  fullWidth
                >
                  View Responses
                </Button>
              )}
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}; 