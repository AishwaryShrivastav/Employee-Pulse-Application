import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import { AutoGraph as InsightIcon } from '@mui/icons-material';
import { adminAPI } from '../../services/api';

interface AIInsightsResponse {
  insights: string;
  isEnabled: boolean;
}

const AIInsights: React.FC = () => {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await adminAPI.getAIInsights();
        setInsights(response.insights);
        setIsEnabled(response.isEnabled);
      } catch (err) {
        console.error('Failed to fetch AI insights:', err);
        setError('Failed to fetch AI insights. Please try again later.');
        setIsEnabled(false); // Disable on error to show warning state
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  // Show loading state while initial fetch is happening
  if (loading || isEnabled === null) {
    return (
      <Card sx={{ mb: 3, background: '#f8f9fa' }}>
        <CardContent>
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InsightIcon sx={{ mr: 1 }} color="primary" />
            AI Insights
          </Typography>
          <CircularProgress size={20} sx={{ ml: 2 }} />
        </CardContent>
      </Card>
    );
  }

  // Show warning state when disabled or error
  if (!isEnabled || error) {
    return (
      <Card sx={{ mb: 3, background: '#f8f9fa' }}>
        <CardContent>
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InsightIcon sx={{ mr: 1 }} color="primary" />
            AI Insights
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            {error || insights || 'AI insights are temporarily disabled. Please try again later.'}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Show insights when available
  return (
    <Card sx={{ mb: 3, background: '#f8f9fa' }}>
      <CardContent>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <InsightIcon sx={{ mr: 1 }} color="primary" />
          AI Insights
        </Typography>
        {insights === 'No survey responses available for analysis.' ? (
          <Typography variant="body1" color="text.secondary">
            No survey responses available yet. AI insights will be generated automatically once employees start submitting their responses.
          </Typography>
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