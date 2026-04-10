import { Snackbar, Alert } from "@mui/material";

export default function ProfileSnackbar({ open, message, severity = "success", onClose }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3500}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{ 
        zIndex: 30000, 
        mt: '72px' 
      }}
    >
      <Alert 
        severity={severity} 
        variant="filled" 
        onClose={onClose} 
        sx={{ 
          width: "100%",
          boxShadow: 3
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}