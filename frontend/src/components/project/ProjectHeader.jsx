import React from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  TextField,
  FormControl,
  Select,
  MenuItem
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

function ProjectHeader({ 
  project, 
  user, 
  isEditing, 
  setIsEditing, 
  editFormData, 
  setEditFormData, 
  editStatusData, 
  setEditStatusData,
  onSave 
}) {
  const handleSave = async () => {
    await onSave();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditFormData({
      title: project.title,
      description: project.description
    });
    setEditStatusData(project.status);
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
      {isEditing ? (
        <TextField
          fullWidth
          value={editFormData.title}
          onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
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
      
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* Durum Chip'i veya Durum Seçici */}
        {isEditing ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={editStatusData}
                onChange={(e) => setEditStatusData(e.target.value)}
                sx={{
                  borderRadius: "12px",
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6b0f1a",
                    borderWidth: "2px"
                  }
                }}
              >
                <MenuItem value="planned">Planlanıyor</MenuItem>
                <MenuItem value="ongoing">Devam Ediyor</MenuItem>
                <MenuItem value="completed">Tamamlandı</MenuItem>
                <MenuItem value="on_hold">Beklemede</MenuItem>
                <MenuItem value="cancelled">İptal Edildi</MenuItem>
              </Select>
            </FormControl>
          </Box>
        ) : (
          <Chip
            label={
              project.status === "completed" ? "Tamamlandı" :
              project.status === "ongoing" ? "Devam Ediyor" :
              project.status === "planned" ? "Planlanıyor" :
              project.status === "cancelled" ? "İptal Edildi" :
              project.status === "on_hold" ? "Beklemede" :
              "Beklemede"
            }
            sx={{
              background: 
                project.status === "completed" ? "linear-gradient(45deg, #4caf50, #66bb6a)" :
                project.status === "ongoing" ? "linear-gradient(45deg, #ff9800, #ffb74d)" :
                project.status === "planned" ? "linear-gradient(45deg, #2196f3, #42a5f5)" :
                project.status === "cancelled" ? "linear-gradient(45deg, #f44336, #ef5350)" :
                project.status === "on_hold" ? "linear-gradient(45deg, #9e9e9e, #bdbdbd)" :
                "linear-gradient(45deg, #9e9e9e, #bdbdbd)",
              color: "#fff",
              fontWeight: "600",
              fontSize: "0.9rem"
            }}
          />
        )}
        
        {/* Tek Düzenleme Butonu - Sadece proje sahibi için */}
        {user && project.owner?._id === user._id && (
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
                  onClick={handleCancel}
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
                onClick={() => setIsEditing(true)}
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
    </Box>
  );
}

export default ProjectHeader;
