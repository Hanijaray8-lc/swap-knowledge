import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Snackbar,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const isStaff = Boolean(loggedInUser?.fullName);
  const isStudent = Boolean(loggedInUser?.name);

  const [formData, setFormData] = useState({
    userType: isStaff ? "Staff" : "Student",
    topic: "",
    content: "",
    file: null,
    image: null,
    name: isStaff ? loggedInUser.fullName : loggedInUser.name || "",
  });

  useEffect(() => {
    if (formData.userType === "Staff" && isStaff) {
      setFormData((prev) => ({
        ...prev,
        name: loggedInUser.fullName,
      }));
    } else if (formData.userType === "Student" && isStudent) {
      setFormData((prev) => ({
        ...prev,
        name: loggedInUser.name,
      }));
    }
  }, [formData.userType]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      if (name === "userType" || name === "topic" || name === "content") {
        setFormData({ ...formData, [name]: value });
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("userType", formData.userType);
      formDataToSend.append("topic", formData.topic);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("name", formData.name);

      if (formData.userType === "Staff" && loggedInUser.id) {
        formDataToSend.append("staffId", loggedInUser.id);
      }

      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const res = await axios.post("https://swap-knowledge.onrender.com/api/posts", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 10000,
      });

      console.log("✅ Post created:", res.data);

      setSuccessMessage(`${formData.userType}: ${formData.name}`);
      setSuccess(true);

      setTimeout(() => navigate("/social-feed"), 2000);
    } catch (err) {
      console.error("❌ Error creating post:", err);

      if (err.code === "ECONNABORTED") {
        setError("Request timeout. Please try again.");
      } else if (err.response) {
        if (err.response.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(err.response.data?.message || "Failed to create post.");
        }
      } else if (err.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (fieldName) => {
    setFormData({ ...formData, [fieldName]: null });
  };

  const handleCloseSnackbar = () => {
    setError("");
    setSuccess(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          sx={{
            p: 4,
            borderRadius: "25px",
            background: "white",
            boxShadow: "0px 12px 40px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            mb={3}
            sx={{
              background: "linear-gradient(45deg, #667eea, #764ba2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Create a Post
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
              {error}
            </Alert>
          )}

          <TextField
            select
            label="User Type"
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            disabled={loading}
          >
            <MenuItem value="Student">Student</MenuItem>
            <MenuItem value="Staff">Staff</MenuItem>
          </TextField>

          <TextField
            label="Name"
            name="name"
            value={formData.name}
            fullWidth
            sx={{ mb: 2 }}
            disabled={true}
            helperText="Your name is automatically set based on your login"
          />

          <TextField
            label="Topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            disabled={loading}
            required
          />

          <TextField
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            sx={{ mb: 2 }}
            disabled={loading}
            required
          />

          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              component="label"
              fullWidth
              disabled={loading}
              sx={{
                borderRadius: "12px",
                background: "linear-gradient(45deg, #667eea, #764ba2)",
              }}
            >
              Upload File / PDF
              <input type="file" name="file" hidden onChange={handleChange} />
            </Button>
            {formData.file && (
              <Card
                variant="outlined"
                sx={{
                  mt: 1,
                  borderRadius: "12px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                  }}
                >
                  <Typography variant="body2">{formData.file.name}</Typography>
                  <Chip label="Remove" size="small" onClick={() => removeFile("file")} />
                </CardContent>
              </Card>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              component="label"
              fullWidth
              disabled={loading}
              sx={{
                borderRadius: "12px",
                background: "linear-gradient(45deg, #43cea2, #185a9d)",
              }}
            >
              Upload Image
              <input type="file" name="image" hidden onChange={handleChange} accept="image/*" />
            </Button>
            {formData.image && (
              <Card
                variant="outlined"
                sx={{
                  mt: 1,
                  borderRadius: "12px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                  }}
                >
                  <Typography variant="body2">{formData.image.name}</Typography>
                  <Chip label="Remove" size="small" onClick={() => removeFile("image")} />
                </CardContent>
              </Card>
            )}
          </Box>

          <Box textAlign="center">
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !formData.topic || !formData.content}
              sx={{
                borderRadius: "20px",
                px: 4,
                py: 1.5,
                fontWeight: "bold",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                boxShadow: "0px 6px 20px rgba(0,0,0,0.2)",
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Post"}
            </Button>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={`Post created successfully! (${successMessage})`}
      />
    </Box>
  );
}
