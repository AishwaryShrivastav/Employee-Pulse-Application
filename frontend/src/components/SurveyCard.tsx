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
} from '@mui/material';
import { format, isPast, formatDistanceToNow } from 'date-fns';
import { Assignment, CheckCircle, Schedule, Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface SurveyCardProps {
  survey: {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    status: 'Pending' | 'Submitted';
    submittedAt: string | null;
    questionCount: number;
    dueDate: string;
  };
  onStart: () => void;
  onViewResponse?: () => void;
}

export const SurveyCard: React.FC<SurveyCardProps> = ({ survey, onStart, onViewResponse }) => {
  const isSubmitted = survey.status === 'Submitted';
  const isDueSoon = !isSubmitted && new Date(survey.dueDate) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days
  const isOverdue = !isSubmitted && isPast(new Date(survey.dueDate));
  const navigate = useNavigate(); // Get the navigate function from React Router

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

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: 6,
        },
        cursor: 'pointer',
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
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h2" gutterBottom>
            {survey.title}
          </Typography>
          {getStatusChip()}
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {survey.description}
        </Typography>

        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Assignment fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {survey.questionCount} Questions
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Created: {format(new Date(survey.createdAt), 'MMM d, yyyy')}
        </Typography>
        
        {isSubmitted && survey.submittedAt ? (
          <Typography variant="body2" color="text.secondary">
            Submitted: {format(new Date(survey.submittedAt), 'MMM d, yyyy')}
          </Typography>
        ) : (
          <Tooltip title={format(new Date(survey.dueDate), 'MMM d, yyyy, h:mm a')}>
            <Typography variant="body2" color={isOverdue ? "error.main" : "text.secondary"}>
              Due: {formatDistanceToNow(new Date(survey.dueDate), { addSuffix: true })}
            </Typography>
          </Tooltip>
        )}
      </CardContent>

      <CardActions>
        <Button
          fullWidth
          variant="contained"
          color={isSubmitted ? 'secondary' : isOverdue ? 'error' : isDueSoon ? 'warning' : 'primary'}
          onClick={(e) => {
            // Stop event propagation completely
            e.preventDefault();
            e.stopPropagation();
            
            // Log with more visibility
            console.log('%c BUTTON CLICKED: View Response Button Handler', 'background: #ff0000; color: #ffffff; font-weight: bold; font-size: 18px; padding: 10px;');
            console.log('Survey details:', { 
              id: survey.id,
              title: survey.title,
              status: survey.status,
              isSubmitted,
              hasHandler: !!onViewResponse
            });
            
            // For submitted surveys, we need to handle the response view
            if (isSubmitted) {
              if (onViewResponse) {
                console.log('%c CALLING onViewResponse HANDLER NOW', 'background: #00ff00; color: #000000; font-weight: bold; font-size: 18px; padding: 10px;');
                
                // Call handler directly without setTimeout
                try {
                  onViewResponse();
                  
                  // Log after handler is called
                  console.log('%c onViewResponse handler has been called', 'background: #00ff00; color: #000000; font-size: 14px;');
                } catch (error) {
                  console.error('Error calling onViewResponse handler:', error);
                }
              } else {
                console.error('%c NO onViewResponse HANDLER PROVIDED - USING DIRECT NAVIGATION', 'background: #ff0000; color: #ffffff; font-weight: bold; font-size: 18px; padding: 10px;');
                // Direct navigation fallback
                try {
                  navigate(`/response-history?surveyId=${survey.id}`);
                } catch (error) {
                  console.error('Error using direct navigation:', error);
                }
              }
            } else if (onStart) {
              // For pending surveys
              console.log('%c Executing onStart handler', 'background: #0000ff; color: #ffffff; font-size: 14px');
              onStart();
            }
          }}
        >
          {isSubmitted ? 'View Response' : 'Start Survey'}
        </Button>
      </CardActions>
    </Card>
  );
}; 