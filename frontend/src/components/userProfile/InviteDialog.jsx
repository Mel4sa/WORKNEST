import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Typography 
} from "@mui/material";

function InviteDialog({ 
  open, 
  onClose, 
  user, 
  projects, 
  currentUser,
  selectedProject, 
  setSelectedProject,
  inviteMessage, 
  setInviteMessage,
  onSendInvite 
}) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        bgcolor: "#6b0f1a", 
        color: "white",
        borderRadius: "4px 4px 0 0"
      }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "white" }}>
          {user?.fullname} kullanıcısını projeye davet et
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mt: 3 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel sx={{ color: "#6b0f1a" }}>Projeleriniz</InputLabel>
            <Select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              label="Projeleriniz"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#6b0f1a"
                  },
                  "&:hover fieldset": {
                    borderColor: "#8c1c2b"
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#6b0f1a"
                  }
                }
              }}
            >
              {(() => {
                // Sadece proje lideri olduğu ve aktif projeleri filtrele
                const ownedProjects = projects.filter(project => 
                  project.owner?._id === currentUser?._id && 
                  project.status !== 'cancelled' && 
                  project.status !== 'completed'
                );
                
                return ownedProjects.length === 0 ? (
                  <MenuItem disabled>
                    <Typography color="textSecondary">
                      Henüz lider olduğunuz proje yok
                    </Typography>
                  </MenuItem>
                ) : (
                  ownedProjects.map((project) => (
                    <MenuItem key={project._id} value={project._id}>
                      <Box>
                        <Typography variant="body1" fontWeight="500">
                          {project.title}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {project.description?.substring(0, 50)}...
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                );
              })()}
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Davet Mesajı (İsteğe bağlı)"
              value={inviteMessage}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setInviteMessage(e.target.value);
                }
              }}
              placeholder="Projeye katılmaya davet ediliyorsunuz!"
              inputProps={{ maxLength: 100 }}
              helperText={`${inviteMessage.length}/100 karakter`}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#6b0f1a"
                  },
                  "&:hover fieldset": {
                    borderColor: "#8c1c2b"
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#6b0f1a"
                  }
                },
                "& .MuiInputLabel-root": {
                  color: "#6b0f1a",
                  "&.Mui-focused": {
                    color: "#6b0f1a"
                  }
                },
                "& .MuiFormHelperText-root": {
                  color: inviteMessage.length > 75 ? "#d32f2f" : "#666",
                  textAlign: "right"
                }
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={onClose}
          sx={{
            color: "#6b0f1a",
            "&:hover": {
              backgroundColor: "rgba(107, 15, 26, 0.04)"
            }
          }}
        >
          İptal
        </Button>
        <Button 
          onClick={onSendInvite}
          variant="contained"
          disabled={!selectedProject || projects.find(p => p._id === selectedProject)?.status === 'cancelled' || projects.find(p => p._id === selectedProject)?.status === 'completed'}
          sx={{
            background: "#6b0f1a",
            "&:hover": {
              background: "#8c1c2b"
            },
            "&:disabled": {
              background: "#ccc"
            }
          }}
        >
          Davet Gönder
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default InviteDialog;
