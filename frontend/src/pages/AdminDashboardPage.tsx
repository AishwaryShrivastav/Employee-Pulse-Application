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
  LinearProgress,
  useTheme,
  useMediaQuery,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  Download as DownloadIcon,
  Add as AddIcon,
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
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';
import AIInsights from '../components/admin/AIInsights';

/**
 * Register required ChartJS components for visualizations
 */
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
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
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  const isLarge = useMediaQuery(theme.breakpoints.down('lg'));
  
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <AIInsights />
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: isSmall ? 2 : 3,
          flexDirection: isSmall ? 'column' : 'row',
          gap: isSmall ? 2 : 0
        }}>
          <Typography 
            variant={isSmall ? "h6" : "h5"} 
            component="h1"
            sx={{ fontWeight: 600 }}
          >
            Admin Dashboard
          </Typography>
          
          <Stack 
            direction={isSmall ? "column" : "row"} 
            spacing={isSmall ? 1 : 2}
            sx={{ 
              width: isSmall ? '100%' : 'auto',
            }}
          >
            {isSmall ? (
              <>
                <IconButton
                  color="primary"
                  onClick={handleSurveyManagement}
                  sx={{ border: 1, borderColor: 'primary.main' }}
                >
                  <Tooltip title="Create Survey">
                    <AddIcon />
                  </Tooltip>
                </IconButton>
                <IconButton
                  color="primary"
                  onClick={handleExport}
                  sx={{ border: 1, borderColor: 'primary.main' }}
                >
                  <Tooltip title="Export Responses">
                    <DownloadIcon />
                  </Tooltip>
                </IconButton>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSurveyManagement}
                  startIcon={<AddIcon />}
                >
                  Create Survey
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleExport}
                  startIcon={<DownloadIcon />}
                >
                  Export Responses
                </Button>
              </>
            )}
          </Stack>
        </Box>

        {/* Metrics Cards */}
        <Grid container spacing={isSmall ? 2 : 3} sx={{ mb: isSmall ? 2 : 3 }}>
          {metricsLoading ? (
            <Grid item xs={12}>
              <LinearProgress />
            </Grid>
          ) : metrics && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  elevation={2}
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: isSmall ? 2 : 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <AssessmentIcon color="primary" sx={{ fontSize: isSmall ? 32 : 40 }} />
                      <Box>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                          {metrics.totalSurveys}
                        </Typography>
                        <Typography color="text.secondary" variant={isSmall ? "body2" : "body1"}>
                          Total Surveys
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  elevation={2}
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: isSmall ? 2 : 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <PeopleIcon color="primary" sx={{ fontSize: isSmall ? 32 : 40 }} />
                      <Box>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                          {metrics.activeUsers}
                        </Typography>
                        <Typography color="text.secondary" variant={isSmall ? "body2" : "body1"}>
                          Active Users
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  elevation={2}
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: isSmall ? 2 : 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <CheckCircleIcon color="primary" sx={{ fontSize: isSmall ? 32 : 40 }} />
                      <Box>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                          {metrics.totalResponses}
                        </Typography>
                        <Typography color="text.secondary" variant={isSmall ? "body2" : "body1"}>
                          Total Responses
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  elevation={2}
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: isSmall ? 2 : 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TimelineIcon color="primary" sx={{ fontSize: isSmall ? 32 : 40 }} />
                      <Box>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                          {metrics.participationRate}%
                        </Typography>
                        <Typography color="text.secondary" variant={isSmall ? "body2" : "body1"}>
                          Participation Rate
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>

        {/* Charts */}
        <Grid container spacing={isSmall ? 2 : 3} sx={{ mb: isSmall ? 2 : 3 }}>
          {graphLoading ? (
            <Grid item xs={12}>
              <LinearProgress />
            </Grid>
          ) : (
            <>
              <Grid item xs={12} md={8}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: isSmall ? 2 : 3,
                    height: '100%',
                    minHeight: isSmall ? 300 : 400
                  }}
                >
                  <Typography 
                    variant={isSmall ? "subtitle1" : "h6"} 
                    gutterBottom 
                    sx={{ fontWeight: 600 }}
                  >
                    Participation Trend
                  </Typography>
                  {graphData && (
                    <Box sx={{ height: isSmall ? 250 : 350 }}>
                      <Bar
                        data={participationChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: !isSmall,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                font: {
                                  size: isSmall ? 10 : 12,
                                },
                              },
                            },
                            x: {
                              ticks: {
                                font: {
                                  size: isSmall ? 10 : 12,
                                },
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: isSmall ? 2 : 3,
                    height: '100%',
                    minHeight: isSmall ? 300 : 400
                  }}
                >
                  <Typography 
                    variant={isSmall ? "subtitle1" : "h6"} 
                    gutterBottom 
                    sx={{ fontWeight: 600 }}
                  >
                    Sentiment Distribution
                  </Typography>
                  {metrics && sentimentChartData && (
                    <Box 
                      sx={{ 
                        height: isSmall ? 250 : 350,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Pie
                        data={sentimentChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: isSmall ? 'bottom' : 'right',
                              labels: {
                                font: {
                                  size: isSmall ? 10 : 12,
                                },
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
                </Paper>
              </Grid>
            </>
          )}
        </Grid>

        {/* Recent Responses Table */}
        <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: isSmall ? 350 : 400 }}>
            <Table stickyHeader size={isSmall ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Survey</TableCell>
                  {!isSmall && <TableCell sx={{ fontWeight: 600 }}>Respondent</TableCell>}
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  {!isSmall && <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>}
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : responses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No responses found
                    </TableCell>
                  </TableRow>
                ) : (
                  responses.map((response) => (
                    <TableRow key={response._id} hover>
                      <TableCell sx={{ maxWidth: isSmall ? 120 : 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {typeof response.surveyId === 'object' ? response.surveyId.title : 'Unknown Survey'}
                      </TableCell>
                      {!isSmall && (
                        <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {response.userId.name}
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip
                          label={response.answers.length > 0 ? 'completed' : 'pending'}
                          size={isSmall ? "small" : "medium"}
                          color={response.answers.length > 0 ? 'success' : 'warning'}
                        />
                      </TableCell>
                      {!isSmall && (
                        <TableCell>
                          {new Date(response.submittedAt).toLocaleDateString()}
                        </TableCell>
                      )}
                      <TableCell align="right">
                        {isSmall ? (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewResponses(response.surveyId._id)}
                          >
                            <Tooltip title="View Details">
                              <AssessmentIcon fontSize="small" />
                            </Tooltip>
                          </IconButton>
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleViewResponses(response.surveyId._id)}
                            startIcon={<AssessmentIcon />}
                          >
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={isSmall ? [5, 10] : [5, 10, 25]}
            sx={{
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontSize: isSmall ? '0.75rem' : '0.875rem',
              },
            }}
          />
        </Paper>
      </Container>
    </Layout>
  );
};
