import React from 'react';
import { Container, Grid } from '@mui/material';
import AIInsights from '../../components/admin/AIInsights';
import DashboardMetrics from '../../components/admin/DashboardMetrics';
import SurveyList from '../../components/admin/SurveyList';

const Dashboard: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <AIInsights />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <DashboardMetrics />
        </Grid>
        <Grid item xs={12}>
          <SurveyList />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 