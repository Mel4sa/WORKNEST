import React from "react";
import {
  Box,
  Typography,
  Button,
  Stack
} from "@mui/material";

function ProjectActions({ user, project, onCancelProject, onDeleteProject }) {
  if (!user || project.owner?._id !== user._id) {
    return null;
  }

  return (
    <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #e5e7eb" }}>
      <Stack spacing={2}>
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
    </Box>
  );
}

export default ProjectActions;
