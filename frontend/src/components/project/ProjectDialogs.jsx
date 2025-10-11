import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button
} from "@mui/material";

function ProjectDialogs({ 
  deleteDialogOpen, 
  setDeleteDialogOpen, 
  cancelDialogOpen, 
  setCancelDialogOpen, 
  project, 
  onDeleteProject, 
  onCancelProject 
}) {
  return (
    <>
      {/* Silme Onay Dialog'u */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "20px",
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: "center", 
          fontWeight: "700", 
          color: "#dc2626",
          fontSize: "1.5rem",
          pb: 1
        }}>
          Projeyi Silmek İstediğinize Emin Misiniz?
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: "center", py: 3 }}>
          <Typography variant="body1" sx={{ mb: 2, color: "#666", lineHeight: 1.6 }}>
            <strong>"{project?.title}"</strong> adlı proje kalıcı olarak silinecek.
          </Typography>
          <Typography variant="body2" sx={{ color: "#dc2626", fontWeight: "500" }}>
            Bu işlem geri alınamaz!
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: "12px",
              px: 4,
              py: 1,
              borderColor: "#6b7280",
              color: "#6b7280",
              "&:hover": {
                borderColor: "#4b5563",
                backgroundColor: "rgba(107, 114, 128, 0.04)"
              }
            }}
          >
            İptal
          </Button>
          
          <Button
            onClick={onDeleteProject}
            variant="contained"
            sx={{
              borderRadius: "12px",
              px: 4,
              py: 1,
              backgroundColor: "#dc2626",
              "&:hover": {
                backgroundColor: "#b91c1c"
              }
            }}
          >
            Evet, Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* İptal Onay Dialog'u */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "20px",
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: "center", 
          fontWeight: "700", 
          color: "#f59e0b",
          fontSize: "1.5rem",
          pb: 1
        }}>
          Projeyi İptal Etmek İstediğinize Emin Misiniz?
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: "center", py: 3 }}>
          <Typography variant="body1" sx={{ mb: 2, color: "#666", lineHeight: 1.6 }}>
            <strong>"{project?.title}"</strong> adlı proje iptal edilecek.
          </Typography>
          <Typography variant="body2" sx={{ color: "#f59e0b", fontWeight: "500" }}>
            Proje durumu "İptal Edildi" olarak değiştirilecek.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: "12px",
              px: 4,
              py: 1,
              borderColor: "#6b7280",
              color: "#6b7280",
              "&:hover": {
                borderColor: "#4b5563",
                backgroundColor: "rgba(107, 114, 128, 0.04)"
              }
            }}
          >
            Vazgeç
          </Button>
          
          <Button
            onClick={onCancelProject}
            variant="contained"
            sx={{
              borderRadius: "12px",
              px: 4,
              py: 1,
              backgroundColor: "#f59e0b",
              "&:hover": {
                backgroundColor: "#d97706"
              }
            }}
          >
            Evet, İptal Et
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ProjectDialogs;
