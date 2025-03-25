import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert, 
  Card, 
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { SurveyResponse } from '../types';
import { surveyAPI, adminAPI } from '../services/api';
import { Layout } from '../components/Layout';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

/**
 * Register required ChartJS components for visualizations
 */
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

/**
 * Interface for dashboard metrics data structure
 */
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

/**
 * Interface for participation data structure
 */
interface ParticipationData {
  participationTrend: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
    }[];
  };
  responseDistribution: {
    label: string;
    value: number;
  }[];
}

/**
 * AdminDashboardPage Component
 * 
 * A comprehensive dashboard for administrators to view metrics, 
 * visualize survey participation data, and manage responses.
 */
export const AdminDashboardPage: React.FC = () => {
  // User authentication context
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for survey responses data
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [graphLoading, setGraphLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [total, setTotal] = useState(0);
  
  // Dashboard data state
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [graphData, setGraphData] = useState<ParticipationData | null>(null);

  /**
   * Fetch survey responses with pagination
   */
  const fetchResponses = useCallback(async () => {
    try {
      const data = await surveyAPI.getAllResponses(page + 1, rowsPerPage);
      setResponses(data.responses || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch responses:', err);
      setError('Failed to fetch responses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  /**
   * Fetch dashboard metrics data
   */
  const fetchDashboardMetrics = useCallback(async () => {
    try {
      const data = await adminAPI.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
      setError('Failed to load dashboard metrics. Please try again.');
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  /**
   * Fetch participation graph data
   */
  const fetchParticipationData = useCallback(async () => {
    try {
      const data = await adminAPI.getSurveyParticipationGraph();
      setGraphData(data);
    } catch (err) {
      console.error('Failed to fetch participation data:', err);
      setError('Failed to load graph data. Please try again.');
    } finally {
      setGraphLoading(false);
    }
  }, []);

  // Load all data when component mounts
  useEffect(() => {
    fetchResponses();
    fetchDashboardMetrics();
    fetchParticipationData();
  }, [fetchResponses, fetchDashboardMetrics, fetchParticipationData]);

  /**
   * Handle page change for pagination
   */
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  /**
   * Handle rows per page change for pagination
   */
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /**
   * Navigate to survey management page
   */
  const handleSurveyManagement = () => {
    navigate('/survey-management');
  };

  /**
   * Navigate to view response details for a specific survey
   */
  const handleViewResponses = (surveyId: string) => {
    navigate(`/surveys/${surveyId}/responses`);
  };

  /**
   * Export all responses as CSV
   */
  const handleExport = async () => {
    try {
      const blob = await surveyAPI.exportResponses();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'survey-responses.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export responses:', err);
      setError('Failed to export responses. Please try again.');
    }
  };

  // Prepare chart data for sentiment distribution
  const sentimentChartData = metrics ? {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [
          metrics.averageSentiment.positive,
          metrics.averageSentiment.neutral,
          metrics.averageSentiment.negative
        ],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
      },
    ],
  } : null;

  // Prepare chart data for participation trend
  const participationChartData = graphData ? {
    labels: graphData.participationTrend.labels,
    datasets: [
      {
        label: 'Total Responses',
        data: graphData.participationTrend.datasets[0].data,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Unique Participants',
        data: graphData.participationTrend.datasets[1].data,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  } : null;

  // Prepare chart data for response distribution
  const responseDistributionData = graphData ? {
    labels: graphData.responseDistribution.map(item => item.label),
    datasets: [
      {
        data: graphData.responseDistribution.map(item => item.value),
        backgroundColor: [
          '#4caf50',
          '#8bc34a',
          '#ffeb3b',
          '#ff9800',
          '#f44336',
        ],
      },
    ],
  } : null;

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Welcome back, {user?.name}. Here's an overview of your organization's pulse.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DashboardIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    Total Surveys
                  </Typography>
                </Box>
                {metricsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Typography variant="h4" component="div">
                    {metrics?.totalSurveys || 0}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssessmentIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    Responses
                  </Typography>
                </Box>
                {metricsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Typography variant="h4" component="div">
                    {metrics?.totalResponses || 0}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    Active Users
                  </Typography>
                </Box>
                {metricsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Typography variant="h4" component="div">
                    {metrics?.activeUsers || 0}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircleIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    Participation
                  </Typography>
                </Box>
                {metricsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Box>
                    <Typography variant="h4" component="div">
                      {metrics?.participationRate || 0}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={metrics?.participationRate || 0} 
                      color="success"
                      sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Participation Trend (Last 6 Months)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {graphLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : participationChartData ? (
                <Box sx={{ height: 300 }}>
                  <Bar 
                    data={participationChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        tooltip: {
                          mode: 'index',
                          intersect: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }} 
                  />
                </Box>
              ) : (
                <Typography>No data available</Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Grid container spacing={3} direction="column">
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Sentiment Analysis
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {metricsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : sentimentChartData ? (
                    <Box sx={{ height: 200 }}>
                      <Pie 
                        data={sentimentChartData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                          },
                        }} 
                      />
                    </Box>
                  ) : (
                    <Typography>No data available</Typography>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Response Distribution
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {graphLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : responseDistributionData ? (
                    <Box sx={{ height: 200 }}>
                      <Pie 
                        data={responseDistributionData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                          },
                        }} 
                      />
                    </Box>
                  ) : (
                    <Typography>No data available</Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Recent Responses Table */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Recent Survey Responses
            </Typography>
            <Box>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mr: 1 }} 
                onClick={handleSurveyManagement}
              >
                Manage Surveys
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleExport}
              >
                Export Data
              </Button>
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : responses.length > 0 ? (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Survey</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Submitted</TableCell>
                      <TableCell>Answers</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {responses.map((response) => {
                      const surveyTitle = typeof response.surveyId === 'object' 
                        ? response.surveyId.title 
                        : 'Unknown Survey';
                      
                      const userName = typeof response.userId === 'object' 
                        ? response.userId.name 
                        : 'Unknown User';
                      
                      return (
                        <TableRow key={response._id} hover>
                          <TableCell>{surveyTitle}</TableCell>
                          <TableCell>{userName}</TableCell>
                          <TableCell>
                            {new Date(response.submittedAt || '').toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={`${response.answers.length} answers`} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => typeof response.surveyId === 'object' 
                                ? handleViewResponses(response.surveyId._id) 
                                : handleViewResponses(response.surveyId)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          ) : (
            <Alert severity="info">No survey responses found.</Alert>
          )}
        </Paper>
      </Container>
    </Layout>
  );
};
