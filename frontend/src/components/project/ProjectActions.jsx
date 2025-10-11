import React from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent
} from "@mui/material";

function ProjectActions({ currentUser, project, onCancelProject, onDeleteProject }) {
  if (!currentUser || project.owner?._id !== currentUser._id || project.status === "completed" || project.status === "cancelled") {
    return null;
  }

  return (
    <Card sx={{ 
      borderRadius: "20px", 
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)", 
      mb: 3,
      background: "linear-gradient(135deg, #fff5f5 0%, #fff 100%)"
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "#2c3e50", fontWeight: 600 }}>
          Proje Yönetimi
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button
            variant="outlined"
            color="warning"
            fullWidth
            sx={{
              borderRadius: "12px",
              py: 1.5,
              borderColor: "#f59e0b",
              color: "#f59e0b",
              fontWeight: "600",
              "&:hover": {
                borderColor: "#d97706",
                backgroundColor: "rgba(245, 158, 11, 0.04)",
                transform: "translateY(-1px)"
              },
              transition: "all 0.3s ease"
            }}
            onClick={onCancelProject}
          >
            Projeyi İptal Et
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            fullWidth
            sx={{
              borderRadius: "12px",
              py: 1.5,
              borderColor: "#dc2626",
              color: "#dc2626",
              fontWeight: "600",
              "&:hover": {
                borderColor: "#b91c1c",
                backgroundColor: "rgba(220, 38, 38, 0.04)",
                transform: "translateY(-1px)"
              },
              transition: "all 0.3s ease"
            }}
            onClick={onDeleteProject}
          >
            Projeyi Sil
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default ProjectActions;
