import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Switch,
  Tooltip,
  Typography,
  TablePagination,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Box,
  Chip,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { format } from 'date-fns';

interface Survey {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  isActive: boolean;
  createdAt: string;
}

interface SurveyManagementTableProps {
  surveys: Survey[];
  onEdit: (survey: Survey) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

export const SurveyManagementTable: React.FC<SurveyManagementTableProps> = ({
  surveys,
  onEdit,
  onToggleStatus,
}) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const MobileCard = ({ survey }: { survey: Survey }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
            {survey.title}
          </Typography>
          <Switch
            checked={survey.isActive}
            onChange={(e) => onToggleStatus(survey.id, e.target.checked)}
            color="primary"
            size="small"
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {survey.description}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Box>
            <Chip
              label={`${survey.questionCount} Questions`}
              size="small"
              sx={{ mr: 1 }}
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Created: {format(new Date(survey.createdAt), 'MMM d, yyyy')}
            </Typography>
          </Box>
          <IconButton
            onClick={() => onEdit(survey)}
            size="small"
            sx={{ 
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              }
            }}
          >
            <EditIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  if (isMobile) {
    return (
      <Box>
        {surveys
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((survey) => (
            <MobileCard key={survey.id} survey={survey} />
          ))}
        <TablePagination
          component="div"
          count={surveys.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Questions</TableCell>
              <TableCell align="center">Created</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {surveys
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((survey) => (
                <TableRow key={survey.id} hover>
                  <TableCell>
                    <Typography variant="subtitle1">{survey.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary" noWrap sx={{ maxWidth: 200 }}>
                      {survey.description}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={survey.questionCount} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    {format(new Date(survey.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={survey.isActive}
                      onChange={(e) => onToggleStatus(survey.id, e.target.checked)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit Survey">
                      <IconButton 
                        onClick={() => onEdit(survey)} 
                        size="small"
                        sx={{ 
                          backgroundColor: theme.palette.primary.main,
                          color: 'white',
                          '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                          }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={surveys.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  );
}; 