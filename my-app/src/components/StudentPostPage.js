import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Snackbar,
  Chip
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function StudentPostPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const studentUser = JSON.parse(localStorage.getItem("studentUser") || "{}");
  const studentName = studentUser?.name || "Student";

  const [formData, setFormData] = useState({
    userType: "Student",
    topic: "",
    content: "",
    file: null,
    image: null,
    name: studentName,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    if (!formData.topic) {
      setError("Topic is required");
      setLoading(false);
      return;
    }
    if (!formData.content) {
      setError("Content is required");
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val) formDataToSend.append(key, val);
      });

      await axios.post("https://swap-knowledge.onrender.com/api/posts", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      setTimeout(() => navigate("/social-feed"), 2000);
    } catch (err) {
      setError("Failed to create post. Try again.");
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
        background: "linear-gradient(160deg, #8E2DE2 0%, #4A00E0 100%)",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          sx={{
            p: 4,
            borderRadius: "25px",
            background: "rgba(255, 255, 255, 0.95)",
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ color: "#6A1B9A", mb: 3 }}
          >
            ✨ Create Post
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Your Name"
            value={formData.name}
            fullWidth
            sx={{ mb: 2 }}
            disabled
          />

          <TextField
            label="Topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 3 }}
            placeholder="Enter your post topic..."
          />

          {/* Content */}
          <TextField
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            sx={{ mb: 3 }}
            placeholder="Write your post..."
          />

          <Box sx={{ mb: 3 }}>
            <Button variant="contained" component="label" fullWidth>
              Upload File / PDF
              <input type="file" name="file" hidden onChange={handleChange} />
            </Button>
            {formData.file && (
              <Chip
                label={formData.file.name}
                onDelete={() => removeFile("file")}
                sx={{ mt: 2 }}
              />
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Button variant="outlined" component="label" fullWidth>
              Upload Image
              <input type="file" name="image" hidden onChange={handleChange} />
            </Button>
            {formData.image && (
              <Chip
                label={formData.image.name}
                onDelete={() => removeFile("image")}
                sx={{ mt: 2 }}
              />
            )}
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              borderRadius: "30px",
              py: 1.5,
              fontSize: "1rem",
              background: "linear-gradient(45deg,#7b1fa2,#512da8)",
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Create Post"
            )}
          </Button>
        </Paper>
      </Container>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="✅ Post created successfully!"
      />
    </Box>
  );
}
