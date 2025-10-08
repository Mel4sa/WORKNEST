import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Grid, Button, CardActions, Box } from "@mui/material";

function Projects() {
  const navigate = useNavigate();

  const projectList = [
    { id: 1, name: "Portföy Sitesi", owner: "Melisa" },
    { id: 2, name: "Todo Uygulaması", owner: "Ahmet" },
    { id: 3, name: "Blog Platformu", owner: "Ayşe" },
  ];

  const handleDetailClick = (id) => {
    navigate(`/projects/${id}`);
  };

  return (
    <Box sx={{ padding: "30px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Grid container spacing={4}>
        {projectList.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                cursor: "pointer",
                background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                color: "#fff",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.2)",
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {project.name}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Owner: {project.owner}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end", padding: "16px" }}>
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  onClick={() => handleDetailClick(project.id)}
                  sx={{
                    textTransform: "none",
                    fontWeight: "bold",
                    backgroundColor: "#fff",
                    color: "#2575fc",
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                    },
                  }}
                >
                  Detay Gör
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Projects;