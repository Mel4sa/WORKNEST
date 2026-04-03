import React from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Card,
  CardContent,
  Avatar,
  Divider
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

function ProjectHeader({ 
  project, 
  currentUser, 
  isEditing, 
  editFormData, 
  onEditToggle,
  onFormDataChange,
  onSave,
  onCancel
}) {
  const handleSave = async () => {
    await onSave();
  };

  return (
    <Card sx={{
      borderRadius: "20px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      mb: 3,
      height: { xs: "auto", lg: "600px" },
      display: "flex",
      flexDirection: "column"
    }}>
      <CardContent sx={{
        p: 4,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "auto"
      }}>
        {/* Başlık */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          {isEditing ? (
            <TextField
              fullWidth
              value={editFormData.title}
              onChange={(e) => onFormDataChange({ ...editFormData, title: e.target.value })}
              variant="outlined"
              sx={{
                mr: 2,
                "& .MuiOutlinedInput-root": {
                  fontSize: { xs: "1.8rem", md: "2.5rem" },
                  fontWeight: "bold",
                  color: "#6b0f1a",
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
            <Typography variant="h3" sx={{ fontWeight: "bold", color: "#6b0f1a", fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
              {project.title}
            </Typography>
          )}

          {/* Düzenleme Butonu - Sadece proje sahibi için */}
          {currentUser && project.owner?._id === currentUser._id && (
            <>
              {isEditing ? (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    onClick={handleSave}
                    sx={{
                      backgroundColor: "#4caf50",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "#45a049",
                        transform: "scale(1.1)"
                      },
                      transition: "all 0.2s ease"
                    }}
                  >
                    <SaveIcon />
                  </IconButton>
                  <IconButton
                    onClick={onCancel}
                    sx={{
                      backgroundColor: "#f44336",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "#d32f2f",
                        transform: "scale(1.1)"
                      },
                      transition: "all 0.2s ease"
                    }}
                  >
                    <CancelIcon />
                  </IconButton>
                </Box>
              ) : (
                <IconButton
                  onClick={onEditToggle}
                  sx={{
                    backgroundColor: "#6b0f1a",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#8c1c2b",
                      transform: "scale(1.1)"
                    },
                    transition: "all 0.2s ease"
                  }}
                >
                  <EditIcon />
                </IconButton>
              )}
            </>
          )}
        </Box>

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

        {/* Proje Açıklaması */}
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
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&.Mui-focused fieldset': {
                  borderColor: '#6b0f1a',
                  borderWidth: '2px',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#6b0f1a',
              },
            }}
          />
        ) : (
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, color: '#666' }}>
            {project.description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default ProjectHeader;
