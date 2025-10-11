import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Divider,
  TextField,
  LinearProgress,
  Card,
  CardContent
} from "@mui/material";

function ProjectInfo({ project, isEditing, editFormData, onFormDataChange, progress }) {
  return (
    <Card sx={{ 
      borderRadius: "20px", 
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)", 
      mb: 3,
      height: { xs: "auto", lg: "auto" },
      display: "flex",
      flexDirection: "column"
    }}>
      <CardContent sx={{ 
        p: 4, 
        flex: 1,
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Proje Lideri */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar 
            src={project.owner?.profileImage}
            sx={{ 
              width: 50, 
              height: 50, 
              mr: 2,
              border: "2px solid #6b0f1a"
            }}
          >
            {project.owner?.fullname?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "600" }}>
              {project.owner?.fullname}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Proje Lideri
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Açıklama */}
        <Typography variant="h6" sx={{ fontWeight: "600", mb: 2 }}>
          Proje Açıklaması
        </Typography>
        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={editFormData.description}
            onChange={(e) => onFormDataChange({ ...editFormData, description: e.target.value })}
            variant="outlined"
            sx={{
              mb: 4,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                "&.Mui-focused fieldset": {
                  borderColor: "#6b0f1a",
                  borderWidth: "2px"
                }
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#6b0f1a"
              }
            }}
          />
        ) : (
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, color: "#666" }}>
            {project.description}
          </Typography>
        )}

        {/* İlerleme Çubuğu */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: "600", mb: 2 }}>
            Proje İlerleme Durumu
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: "#e0e0e0",
              "& .MuiLinearProgress-bar": {
                borderRadius: 6,
                background: "linear-gradient(90deg, #6b0f1a, #8c1c2b)",
                transition: "all 0.3s ease-in-out",
              },
            }}
          />
          <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
            %{Math.round(progress)} tamamlandı
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default ProjectInfo;
