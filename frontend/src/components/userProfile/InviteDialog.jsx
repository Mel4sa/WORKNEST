import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  FormControl, 
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
      PaperProps={{
        sx: {
          borderRadius: "12px"
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: "1px solid #e2e8f0",
        pb: 2
      }}>
        <Typography variant="h6" sx={{ fontWeight: "700", color: "#2c3e50" }}>
          {user?.fullname} adlı kullanıcıyı projeye davet et
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ 
            fontWeight: "700", 
            color: "#2c3e50",
            mb: 1,
            textTransform: "uppercase",
            fontSize: "0.75rem",
            letterSpacing: "0.5px"
          }}>
            Proje Seçin
          </Typography>
          <FormControl fullWidth>
            <Select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              displayEmpty
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#e2e8f0"
                  },
                  "&:hover fieldset": {
                    borderColor: "#cbd5e1"
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#6b0f1a",
                    borderWidth: "2px"
                  }
                }
              }}
            >
              <MenuItem value="">
                <Typography variant="body2" color="textSecondary">
                  Bir proje seçin...
                </Typography>
              </MenuItem>
              {projects.length === 0 ? (
                <MenuItem disabled>
                  <Typography variant="body2" color="textSecondary">
                    Proje bulunamadı
                  </Typography>
                </MenuItem>
              ) : (
                projects.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    <Typography variant="body2" fontWeight="500">
                      {project.title}
                    </Typography>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Box>
        
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Davet Mesajı (İsteğe bağlı)"
          value={inviteMessage}
          onChange={(e) => {
            if (e.target.value.length <= 100) {
              setInviteMessage(e.target.value);
            }
          }}
          placeholder="Projeye katılmaya davet ediliyorsunuz!"
          helperText={`${inviteMessage.length}/100 karakter`}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#e2e8f0"
              },
              "&:hover fieldset": {
                borderColor: "#cbd5e1"
              },
              "&.Mui-focused fieldset": {
                borderColor: "#6b0f1a",
                borderWidth: "2px"
              }
            },
            "& .MuiInputLabel-root": {
              color: "#64748b",
              "&.Mui-focused": {
                color: "#6b0f1a"
              }
            }
          }}
        />
      </DialogContent>
      
      <DialogActions sx={{ p: 2.5, borderTop: "1px solid #e2e8f0", gap: 1 }}>
        <Button 
          onClick={onClose}
          sx={{
            textTransform: "none",
            color: "#64748b",
            "&:hover": {
              backgroundColor: "#f1f5f9"
            }
          }}
        >
          İptal
        </Button>
        <Button 
          onClick={onSendInvite}
          variant="contained"
          disabled={!selectedProject}
          sx={{
            textTransform: "none",
            background: "#6b0f1a",
            color: "white",
            fontWeight: "600",
            "&:hover": {
              background: "#8c1c2b"
            },
            "&:disabled": {
              background: "#cbd5e1",
              color: "#94a3b8"
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
