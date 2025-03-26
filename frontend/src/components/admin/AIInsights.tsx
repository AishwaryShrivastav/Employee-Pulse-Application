import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { AutoGraph as InsightIcon } from '@mui/icons-material';
import axios from 'axios';

interface AIInsightsResponse {
  insights: string;
  isEnabled: boolean;
}

const AIInsights: React.FC = () => {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await axios.get<AIInsightsResponse>('/api/admin/insights', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setInsights(response.data.insights);
        setIsEnabled(response.data.isEnabled);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch AI insights');
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (!isEnabled) {
    return null;
  }

  return (
    <Card sx={{ mb: 3, background: '#f8f9fa' }}>
      <CardContent>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <InsightIcon sx={{ mr: 1 }} color="primary" />
          AI Insights
        </Typography>
        
        {loading ? (
          <CircularProgress size={20} sx={{ ml: 2 }} />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
            {insights}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights; 