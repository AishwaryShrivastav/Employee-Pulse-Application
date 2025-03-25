import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Assessment,
  People,
  TrendingUp,
  Assignment,
} from '@mui/icons-material';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Layout } from '../components/Layout';
import { adminAPI } from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardMetrics {
  totalSurveys: number;
  totalResponses: number;
  activeUsers: number;
  participationRate: number;
  averageSentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  recentActivity: {
    newSurveys: number;
    newResponses: number;
    pendingResponses: number;
  };
}

interface ChartData {
  participationTrend: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  };
  responseDistribution: Array<{
    label: string;
    value: number;
  }>;
}

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, graphData] = await Promise.all([
        adminAPI.getDashboardMetrics(),
        adminAPI.getSurveyParticipationGraph(),
      ]);
      setMetrics(metricsData);
      setChartData(graphData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" component="h2" ml={1}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="p">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container>
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        </Container>
      </Layout>
    );
  }

  if (!metrics || !chartData) return null;

  const participationChartData = {
    labels: chartData.participationTrend.labels,
    datasets: chartData.participationTrend.datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      fill: false,
      borderColor: index === 0 ? '#2196f3' : '#4caf50',
      tension: 0.1,
    })),
  };

  const responseDistributionData = {
    labels: chartData.responseDistribution.map(item => item.label),
    datasets: [{
      data: chartData.responseDistribution.map(item => item.value),
      backgroundColor: [
        '#4caf50',
        '#8bc34a',
        '#ffeb3b',
        '#ff9800',
        '#f44336',
      ],
    }],
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Surveys"
              value={metrics.totalSurveys}
              icon={<Assignment color="primary" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Responses"
              value={metrics.totalResponses}
              icon={<Assessment color="secondary" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Users"
              value={metrics.activeUsers}
              icon={<People color="success" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Participation Rate"
              value={`${metrics.participationRate}%`}
              icon={<TrendingUp color="info" />}
            />
          </Grid>

          {/* Sentiment Progress */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Sentiment Analysis
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography color="textSecondary" gutterBottom>
                  Positive
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={metrics.averageSentiment.positive}
                  color="success"
                  sx={{ mb: 1, height: 10, borderRadius: 5 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography color="textSecondary" gutterBottom>
                  Neutral
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={metrics.averageSentiment.neutral}
                  color="primary"
                  sx={{ mb: 1, height: 10, borderRadius: 5 }}
                />
              </Box>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Negative
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={metrics.averageSentiment.negative}
                  color="error"
                  sx={{ mb: 1, height: 10, borderRadius: 5 }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Survey Participation Trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line
                  data={participationChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Response Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <Pie
                  data={responseDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
}; 