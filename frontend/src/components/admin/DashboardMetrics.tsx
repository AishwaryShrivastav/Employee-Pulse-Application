import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { Assessment, Group, Poll, TrendingUp } from '@mui/icons-material';
import axios from 'axios';

interface DashboardMetric {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  color: string;
}

const DashboardMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeSurveys: 0,
    responseRate: '0%',
    averageSatisfaction: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('/api/admin/dashboard-metrics', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setMetrics(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard metrics:', error);
      }
    };

    fetchMetrics();
  }, []);

  const dashboardMetrics: DashboardMetric[] = [
    {
      icon: <Group />,
      title: 'Total Users',
      value: metrics.totalUsers,
      color: '#2196f3',
    },
    {
      icon: <Poll />,
      title: 'Active Surveys',
      value: metrics.activeSurveys,
      color: '#4caf50',
    },
    {
      icon: <TrendingUp />,
      title: 'Response Rate',
      value: metrics.responseRate,
      color: '#ff9800',
    },
    {
      icon: <Assessment />,
      title: 'Avg. Satisfaction',
      value: metrics.averageSatisfaction.toFixed(1),
      color: '#f44336',
    },
  ];

  return (
    <Grid container spacing={3}>
      {dashboardMetrics.map((metric, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
            }}
          >
            {React.cloneElement(metric.icon as React.ReactElement, {
              sx: { fontSize: 40, color: metric.color, mb: 1 },
            })}
            <Typography variant="h6" component="div">
              {metric.value}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {metric.title}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardMetrics; 