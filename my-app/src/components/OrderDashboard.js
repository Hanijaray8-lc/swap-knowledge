import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Button,
  TableBody,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { fetchAdmins } from '../api/adminApi';
import axios from 'axios';

const AdminUserDashboard = () => {
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingCounts, setPendingCounts] = useState({});
  const [loginOpen, setLoginOpen] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
      setLoginOpen(!loggedIn);
      
      if (loggedIn) {
        loadData();
      }
    };

    checkLoginStatus();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetchAdmins();
      setAdmins(res);
      
      const token = localStorage.getItem('authToken');
      const pendingRes = await axios.get(
        'https://swap-knowledge.onrender.com/api/admin/pending-requests',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const counts = {};
      pendingRes.data.forEach((item) => {
        counts[`${item.fullName}-${item.department}`] = item.count;
      });
      setPendingCounts(counts);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };



  const handleLogout = () => {
  localStorage.removeItem('isAdminLoggedIn');
  setIsLoggedIn(false);
  setLoginOpen(true);
  setCredentials({ email: '', password: '' });

  // Navigate to ManagerLogin page
  navigate('/manager');
};


  const filteredAdmins = admins.filter((user) =>
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBadgeStyle = (value) => {
    return {
      backgroundColor: value > 0 ? '#FFEBD3' : '#E0E0E0',
      color: value > 0 ? '#CC8A00' : '#555',
      padding: '4px 10px',
      borderRadius: '16px',
      fontWeight: 'bold',
      fontSize: '0.75rem',
      display: 'inline-block',
      minWidth: '90px',
      textAlign: 'center',
    };
  };

  return (
    <>
      <Dialog 
        open={loginOpen} 
        maxWidth="sm" 
        fullWidth
        onClose={() => {}} 
        disableEscapeKeyDown 
      >
        
        
       
      </Dialog>

      {isLoggedIn && (
        <Box sx={{ p: 3, backgroundColor: '#F5F7FA', minHeight: '100vh' }}>
          <Paper
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              mb: 3,
              backgroundColor: '#FFFFFF',
              borderRadius: 2,
              boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Welcome Back
                <Typography variant="body2" color="text.secondary">
                  SwapKnowledge!
                </Typography>
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <Button
                variant="contained"
                color="primary"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 2,
                  py: 1,
                  mr: 1
                }}
                onClick={() => navigate('/student-details')}
              >
                Student Details
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 2,
                  py: 1,
                }}
                onClick={handleLogout}
              >
                Logout
              </Button>

              <IconButton>
                <NotificationsNoneIcon sx={{ color: '#666' }} />
              </IconButton>
            </Box>
          </Paper>

          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E0E0E0',
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
              flexWrap="wrap"
              gap={2}
            >
              <Typography variant="h6" fontWeight="bold">
                Registered Admin Users (Staff)
              </Typography>
              <Box display="flex" gap={2}>
                <TextField
                  label="Search by Department"
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#999' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#F5F7FA',
                    },
                  }}
                />
              </Box>
            </Box>

            <Table>
              <TableHead sx={{ backgroundColor: '#F5F7FA' }}>
                <TableRow>
                  <TableCell>
                    <b>Name</b>
                  </TableCell>
                  <TableCell>
                    <b>Email</b>
                  </TableCell>
                  <TableCell>
                    <b>Phone</b>
                  </TableCell>
                  <TableCell>
                    <b>Gender</b>
                  </TableCell>
                  <TableCell>
                    <b>Department</b>
                  </TableCell>
                  <TableCell>
                    <b>Joined</b>
                  </TableCell>
                  <TableCell>
                    <b>Pending Requests</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAdmins.length > 0 ? (
                  filteredAdmins.map((user, index) => {
                    const countKey = `${user.fullName}-${user.department}`;
                    const pending = pendingCounts[countKey] || 0;

                    return (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ bgcolor: '#DDEEFF', mr: 1.5 }}>
                              {user.fullName?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography fontWeight="medium">
                                {user.fullName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {user.designation}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.gender}</TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>
                          {new Date(user.joiningDate).toLocaleDateString('en-US')}
                        </TableCell>
                        <TableCell>
                          <span style={getBadgeStyle(pending)}>
                            {pending > 0
                              ? `${pending} request${pending > 1 ? 's' : ''}`
                              : 'No requests'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No admin found for this department.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}
    </>
  );
};

export default AdminUserDashboard;