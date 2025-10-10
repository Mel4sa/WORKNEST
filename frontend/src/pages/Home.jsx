import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Divider
} from "@mui/material";
import axiosInstance from "../lib/axios";

function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAllProjects = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/projects");
      setProjects(response.data.projects);
    } catch (err) {
      console.error("Projeler yüklenemedi:", err);
      setError("Projeler yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProjects();
  }, []);

  const handleProjectClick = (id) => {
    navigate(`/projects/${id}`);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh" 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Tüm Projeler
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <List>
        {projects.map((project, index) => (
          <Box key={project._id}>
            <ListItem
              sx={{ cursor: "pointer", "&:hover": { bgcolor: "#f5f5f5" } }}
              onClick={() => handleProjectClick(project._id)}
            >
              <ListItemText
                primary={project.title}
                secondary={`${project.owner?.fullname} - ${project.description}`}
              />
            </ListItem>
            {index < projects.length - 1 && <Divider />}
          </Box>
        ))}
      </List>

      {projects.length === 0 && !loading && !error && (
        <Typography>Henüz proje yok.</Typography>
      )}
    </Box>
  );
}

export default Home;