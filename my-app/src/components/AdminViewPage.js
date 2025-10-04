import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Divider,
  Chip,
  Grid,
  Stack,
  Collapse,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStudents, setShowStudents] = useState(false);
  const [showPosts, setShowPosts] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [staffPosts, setStaffPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`https://swap-knowledge.onrender.com/api/admin/admins/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdmin(res.data);

        const pendingRes = await axios.get(
          `https://swap-knowledge.onrender.com/api/admin/pending-requests/${res.data.fullName}/${res.data.department}`
        );
        setPendingRequests(pendingRes.data);

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load admin');
        setLoading(false);
      }
    };

    if (id) fetchAdmin();
    else {
      setError('No admin ID provided');
      setLoading(false);
    }
  }, [id]);

  const fetchStaffPosts = async () => {
    if (!admin || !admin.fullName) return;
    
    setPostsLoading(true);
    setPostsError(null);
    
    try {
      const postRes = await axios.get(`https://swap-knowledge.onrender.com/api/posts?staffName=${encodeURIComponent(admin.fullName)}`);
      
      if (postRes.data && Array.isArray(postRes.data)) {
        setStaffPosts(postRes.data);
      } else if (postRes.data && postRes.data.posts && Array.isArray(postRes.data.posts)) {
        setStaffPosts(postRes.data.posts);
      } else {
        setStaffPosts([]);
      }
    } catch (err) {
      console.error('Error fetching staff posts:', err);
      setPostsError('Failed to load staff posts');
      setStaffPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const togglePostsVisibility = () => {
    if (!showPosts && staffPosts.length === 0) {
      fetchStaffPosts();
    }
    setShowPosts(!showPosts);
  };

  const DetailItem = ({ label, value }) => (
    <Box mb={2}>
      <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
      <Typography variant="body1">{value || 'N/A'}</Typography>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading admin data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>Error: {error}</Alert>
        <Button variant="contained" onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#F5F7FA', minHeight: '100vh' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{
          mb: 2,
          color: '#4A69E0',
          '&:hover': {
            backgroundColor: 'rgba(74, 105, 224, 0.08)'
          }
        }}
      >
        Back to Dashboard
      </Button>

      <Paper sx={{ p: 4, borderRadius: 3, backgroundColor: '#FFFFFF' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Box display="flex" alignItems="center">
            <Avatar
              sx={{
                width: 96,
                height: 96,
                bgcolor: '#DDEEFF',
                color: '#4A69E0',
                fontSize: '2.5rem',
                mr: 3,
                fontWeight: 'bold'
              }}
            >
              {admin.fullName?.charAt(0) || 'A'}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {admin.fullName || 'Admin User'}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip label="Staff" color="primary" variant="outlined" size="small" />
                <Chip
                  label={admin.isActive ? 'Active' : 'Inactive'}
                  color={admin.isActive ? 'success' : 'error'}
                  size="small"
                />
              </Stack>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight="bold" mb={3} color="#4A69E0">
              Personal Information
            </Typography>
            <DetailItem label="Email" value={admin.email} />
            <DetailItem label="Phone" value={admin.phone} />
            <DetailItem label="Gender" value={admin.gender} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight="bold" mb={3} color="#4A69E0">
              Professional Information
            </Typography>
            <DetailItem label="Department" value={admin.department} />
            <DetailItem
              label="Joined On"
              value={admin.joiningDate
                ? new Date(admin.joiningDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'N/A'}
            />

            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Pending Requests
              </Typography>
              <Chip
                label={`${pendingRequests.length} pending`}
                onClick={() => setShowStudents(!showStudents)}
                icon={showStudents ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{
                  backgroundColor: pendingRequests.length > 0 ? '#FFEBD3' : '#E0E0E0',
                  color: pendingRequests.length > 0 ? '#CC8A00' : '#555',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              />
            </Box>

            <Collapse in={showStudents}>
              <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Students Requested:
                </Typography>
                {pendingRequests.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No pending requests.
                  </Typography>
                ) : (
                  pendingRequests.map((student) => (
                    <Box
                      key={student._id}
                      onClick={() => setSelectedStudent(student)}
                      sx={{
                        border: '1px solid #ccc',
                        borderRadius: 2,
                        p: 2,
                        mb: 2,
                        backgroundColor: selectedStudent?._id === student._id ? '#E3EDFF' : '#f9f9f9',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#EDF3FF',
                        }
                      }}
                    >
                      <Typography><strong>Name:</strong> {student.username}</Typography>
                      <Typography><strong>Doubt:</strong> {student.doubt}</Typography>
                      <Typography><strong>Subject:</strong> {student.subject}</Typography>
                      <Typography><strong>Submitted On:</strong> {new Date(student.createdAt).toLocaleString()}</Typography>
                    </Box>
                  ))
                )}
              </Paper>
            </Collapse>
          </Grid>
        </Grid>

        {/* Staff Posts Section - Now Collapsible */}
        <Box mt={6}>
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between" 
            onClick={togglePostsVisibility}
            sx={{ 
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#f5f5f5' },
              p: 1,
              borderRadius: 1
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="#4A69E0">
              Staff Posts ({staffPosts.length})
            </Typography>
            <IconButton size="small">
              {showPosts ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Collapse in={showPosts}>
            {postsLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" py={3}>
                <CircularProgress size={24} />
                <Typography sx={{ ml: 2 }}>Loading posts...</Typography>
              </Box>
            ) : postsError ? (
              <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
                {postsError}
              </Alert>
            ) : staffPosts.length === 0 ? (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                No posts available.
              </Typography>
            ) : (
              <Box sx={{ mt: 2 }}>
                {staffPosts.map((post) => (
                  <Paper key={post._id} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Chip 
                        label={post.userType} 
                        color={post.userType === 'Staff' ? 'primary' : 'secondary'} 
                        size="small" 
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="subtitle2" color="text.secondary">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>{post.topic}</Typography>
                    <Typography variant="body1" paragraph>
                      {post.content}
                    </Typography>
                    
                    {post.fileUrl && (
                      <Box mt={2}>
                        <Button 
                          variant="outlined" 
                          size="small"
                          component="a"
                          href={`https://swap-knowledge.onrender.com${post.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download File
                        </Button>
                      </Box>
                    )}
                    
                    {post.imageUrl && (
                      <Box mt={2}>
                        <img 
                          src={`https://swap-knowledge.onrender.com${post.imageUrl}`} 
                          alt="Post" 
                          style={{ maxWidth: '100%', borderRadius: '8px' }}
                        />
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            )}
          </Collapse>
        </Box>

        {/* Actions */}
        <Box mt={6} display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            onClick={() => {
              if (selectedStudent) {
                navigate(`/admin/message-student/${selectedStudent._id}`, {
                  state: { studentName: selectedStudent.username }
                });
              } else {
                alert('Please select a student first.');
              }
            }}
            sx={{
              borderColor: '#4A69E0',
              color: '#4A69E0',
              px: 4,
              py: 1.2,
              borderRadius: 2,
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: 'rgba(74, 105, 224, 0.08)'
              }
            }}
          >
            Message
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedStudent) {
                navigate(`/admin/view-requests/${selectedStudent._id}`, {
                  state: {
                    studentName: selectedStudent.username,
                    staffName: admin.fullName
                  }
                });
              } else {
                alert('Please select a student first.');
              }
            }}
            sx={{
              backgroundColor: '#4A69E0',
              px: 4,
              py: 1.2,
              borderRadius: 2,
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#3A59D0'
              }
            }}
          >
            View Requests
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminViewPage;