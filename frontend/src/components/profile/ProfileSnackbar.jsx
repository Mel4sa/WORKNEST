import { Snackbar, Alert } from "@mui/material";

export default function ProfileSnackbar({ open, message, onClose }) {
  return (
    <Snackbar open={open} autoHideDuration={3000} onClose={onClose}>
      <Alert severity="success">{message}</Alert>
    </Snackbar>
  );
}