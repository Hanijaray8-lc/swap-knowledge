import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { fetchStaffBySubject } from '../api/adminApi';

const SubjectStaffListPage = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const data = await fetchStaffBySubject(subject);
        setStaff(data);
        setError(null);
      } catch (error) {
        console.error('Staff fetch error:', error);
        setError(error.message || 'Failed to fetch staff data');
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };
    loadStaff();
  }, [subject]);

  const handleRowClick = (id) => {
    setSelectedRowId((prev) => (prev === id ? null : id));
  };

  const handleSpeakClick = (staff) => {
    setSelectedStaff(staff);
    setOpenDialog(true);
  };

  const handleChatClick = () => {
    navigate('/student/chat', { state: { staffName: selectedStaff.fullName, subject } });
    setOpenDialog(false);
  };

  const handleDoubtRequestClick = () => {
    navigate(`/form/${subject}/${selectedStaff.fullName}`);
    setOpenDialog(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStaff(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1b0f2e 0%, #2a0f4e 40%, #3e0e60 60%, #a72693 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 4,
        color: '#fff',
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: 3, textShadow: '0px 0px 8px rgba(255,255,255,0.3)' }}
      >
        Staff for Subject: {subject}
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
          <CircularProgress sx={{ color: '#ff00cc' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(255,0,0,0.2)', color: '#fff' }}>
          {error}
        </Alert>
      ) : (
        <TableContainer
          component={Paper}
          elevation={6}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            overflow: 'hidden',
            maxWidth: 800,
            width: '100%',
          }}
        >
          <Table>
            <TableHead
              sx={{
                background: 'linear-gradient(90deg, #6a00ff, #ff007f)',
              }}
            >
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Department</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.length > 0 ? (
                staff.map((s) => (
                  <React.Fragment key={s._id}>
                    <TableRow
                      hover
                      onClick={() => handleRowClick(s._id)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
                      }}
                    >
                      <TableCell sx={{ color: '#fff' }}>{s.fullName || 'N/A'}</TableCell>
                      <TableCell sx={{ color: '#ddd' }}>{s.email || 'N/A'}</TableCell>
                      <TableCell sx={{ color: '#bbb' }}>{s.department || 'N/A'}</TableCell>
                    </TableRow>
                    {selectedRowId === s._id && (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 2 }}>
                          <Button
                            variant="contained"
                            sx={{
                              background: 'linear-gradient(to right, #ff007f, #6a00ff)',
                              color: '#fff',
                              fontWeight: 'bold',
                              px: 3,
                              py: 1,
                              borderRadius: '50px',
                              textTransform: 'none',
                              '&:hover': {
                                background: 'linear-gradient(to right, #ff3399, #8a33ff)',
                              },
                            }}
                            onClick={() => handleSpeakClick(s)}
                          >
                            Connect with Staff →
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3, color: '#ccc' }}>
                    {error ? 'Error loading staff' : 'No staff found for this subject'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #2a0f4e 0%, #3e0e60 100%)',
            color: '#fff',
            borderRadius: '20px',
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          How would you like to connect with {selectedStaff?.fullName}?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ textAlign: 'center', mb: 2 }}>
            Choose your preferred method of communication
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleChatClick}
            sx={{
              background: 'linear-gradient(to right, #6a00ff, #ff007f)',
              color: '#fff',
              fontWeight: 'bold',
              px: 4,
              py: 1,
              borderRadius: '50px',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to right, #8a33ff, #ff3399)',
              },
            }}
          >
            Start Chat
          </Button>
          <Button
            variant="contained"
            onClick={handleDoubtRequestClick}
            sx={{
              background: 'linear-gradient(to right, #ff007f, #6a00ff)',
              color: '#fff',
              fontWeight: 'bold',
              px: 4,
              py: 1,
              borderRadius: '50px',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to right, #ff3399, #8a33ff)',
              },
            }}
          >
            Send Doubt Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubjectStaffListPage;