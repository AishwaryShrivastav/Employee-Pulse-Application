import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Question, QuestionType } from '../types';

interface Survey {
  id?: string;
  title: string;
  description: string;
  questions: Question[];
}

interface SurveyFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (survey: Survey) => void;
  initialData?: Survey;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [survey, setSurvey] = useState<Survey>(
    initialData || {
      title: '',
      description: '',
      questions: [],
    }
  );

  const handleAddQuestion = () => {
    setSurvey({
      ...survey,
      questions: [
        ...survey.questions,
        { text: '', type: QuestionType.TEXT, options: [] },
      ],
    });
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...survey.questions];
    newQuestions.splice(index, 1);
    setSurvey({ ...survey, questions: newQuestions });
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...survey.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
      ...(field === 'type' && value !== QuestionType.CHOICE ? { options: [] } : {}),
    };
    setSurvey({ ...survey, questions: newQuestions });
  };

  const handleOptionsChange = (index: number, optionsText: string) => {
    const options = optionsText.split(',').map(opt => opt.trim());
    const newQuestions = [...survey.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      options,
    };
    setSurvey({ ...survey, questions: newQuestions });
  };

  const handleSubmit = () => {
    onSubmit(survey);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {initialData ? 'Edit Survey' : 'Create New Survey'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Survey Title"
            value={survey.title}
            onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={survey.description}
            onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
            fullWidth
            multiline
            rows={2}
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Questions
            </Typography>
            {survey.questions.map((question, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  mb: 3,
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label={`Question ${index + 1}`}
                    value={question.text}
                    onChange={(e) =>
                      handleQuestionChange(index, 'text', e.target.value)
                    }
                    fullWidth
                    required
                  />
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={question.type}
                      label="Type"
                      onChange={(e) =>
                        handleQuestionChange(index, 'type', e.target.value)
                      }
                    >
                      <MenuItem value={QuestionType.TEXT}>Text</MenuItem>
                      <MenuItem value={QuestionType.RATING}>Rating</MenuItem>
                      <MenuItem value={QuestionType.CHOICE}>Multiple Choice</MenuItem>
                    </Select>
                  </FormControl>
                  <IconButton
                    onClick={() => handleRemoveQuestion(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                {question.type === QuestionType.CHOICE && (
                  <TextField
                    label="Options (comma-separated)"
                    value={question.options?.join(', ') || ''}
                    onChange={(e) => handleOptionsChange(index, e.target.value)}
                    fullWidth
                    helperText="Enter options separated by commas"
                  />
                )}
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddQuestion}
              variant="outlined"
              sx={{ mt: 1 }}
            >
              Add Question
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!survey.title || survey.questions.length === 0}
        >
          {initialData ? 'Update' : 'Create'} Survey
        </Button>
      </DialogActions>
    </Dialog>
  );
};
