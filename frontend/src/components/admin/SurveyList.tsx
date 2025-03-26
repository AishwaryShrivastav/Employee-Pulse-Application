import React, { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import axios from 'axios';

interface Survey {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  responseCount: number;
}

const SurveyList: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await axios.get('/api/admin/surveys', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setSurveys(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch surveys');
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  if (loading) {
    return <Typography>Loading surveys...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell align="right">Responses</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {surveys.map((survey) => (
            <TableRow key={survey.id}>
              <TableCell>{survey.title}</TableCell>
              <TableCell>{survey.description}</TableCell>
              <TableCell>{new Date(survey.startDate).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(survey.endDate).toLocaleDateString()}</TableCell>
              <TableCell align="right">{survey.responseCount}</TableCell>
            </TableRow>
          ))}
          {surveys.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No surveys found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SurveyList; 