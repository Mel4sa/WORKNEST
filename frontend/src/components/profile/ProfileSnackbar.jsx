import { Snackbar, Alert } from "@mui/material";

export default function ProfileSnackbar({ open, message, severity = "success", onClose }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
  anchorOrigin={{ vertical: "bottom", horizontal: "center" }} // ekranın alt ortası
      sx={{ zIndex: 2000 }}
    >
      <Alert severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}