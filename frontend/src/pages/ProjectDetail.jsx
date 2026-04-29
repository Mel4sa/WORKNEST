import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import React, { useEffect, useState, useCallback } from "react";
import { TextField as MuiTextField, Chip, Autocomplete as MuiAutocomplete } from '@mui/material';
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  MenuItem,
  Select,
  Stack,
  Divider,
  Container,
  Paper,
  IconButton,
  Tooltip
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import axiosInstance from "../lib/axios";
import useAuthStore from "../store/useAuthStore";
import TeamMembersList from "../components/project/TeamMembersList";
import ProjectDialogs from "../components/project/ProjectDialogs";
import TeamStatusChip from "../components/project/TeamStatusChip";

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [successSnackbar, setSuccessSnackbar] = useState({ open: false, message: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    status: "planned",
    skills: []
  });

  
  const [removeMemberDialog, setRemoveMemberDialog] = useState({ open: false, userId: null });
  const [removeReason, setRemoveReason] = useState("");

  const [allSkills, setAllSkills] = useState([]);
  useEffect(() => {
    axiosInstance.get("/skills").then(res => setAllSkills(res.data)).catch(() => setAllSkills([]));
  }, []);

  const handleRemoveMember = (userId) => {
    setRemoveMemberDialog({ open: true, userId });
    setRemoveReason("");
  };

  const confirmRemoveMember = async () => {
    const userId = removeMemberDialog.userId;
    if (!userId) return;
    try {
      await axiosInstance.delete(`/projects/${project._id}/members/${userId}`,
        { data: { reason: removeReason } } // opsiyonel gerekçe
      );
      fetchProject();
      setSuccessSnackbar({ open: true, message: "Üye başarıyla çıkarıldı!" });
    } catch (err) {
      setError(err.response?.data?.message || "Üye silinirken bir hata oluştu.");
    } finally {
      setRemoveMemberDialog({ open: false, userId: null });
      setRemoveReason("");
    }
  };

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/projects/${id}`);
      setProject(response.data);
    } catch (err) {
      console.error("Proje detayı yüklenemedi:", err);
      setError("Proje detayı yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleCancelProject = async () => {
    try {
      await axiosInstance.put(`/projects/${id}`, {
        ...project,
        status: "cancelled"
      });
      setProject(prev => ({ ...prev, status: "cancelled" }));
        setCancelDialogOpen(false);
        setSuccessSnackbar({ open: true, message: "Proje başarıyla iptal edildi!" });
    } catch (err) {
      console.error("Proje iptal edilemedi:", err);
      setError("Proje iptal edilemedi. Lütfen tekrar deneyin.");
    }
  };

  const handleDeleteProject = async () => {
    try {
      await axiosInstance.delete(`/projects/${project._id}`);
      setDeleteDialogOpen(false);
      navigate("/projects");
    } catch (err) {
      console.error("Proje silinirken hata:", err);
      setError(err.response?.data?.message || "Proje silinirken bir hata oluştu.");
      setDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  }

  const handleEditClick = () => {
    setEditFormData({
      title: capitalizeWords(project.title),
      description: project.description || "",
      status: project.status || "planned",
      skills: project.skills || []
    });
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    if (!editFormData.title.trim() || !editFormData.description.trim()) {
      setError("Başlık ve açıklama boş olamaz.");
      return;
    }
    if (!editFormData.skills || editFormData.skills.length === 0) {
      setError("En az bir beceri eklemelisiniz.");
      return;
    }
    const capitalizedTitle = capitalizeWords(editFormData.title);
    try {
      await axiosInstance.put(`/projects/${project._id}`, {
        ...project,
        title: capitalizedTitle,
        description: editFormData.description,
        status: editFormData.status,
        skills: editFormData.skills
      });
      setProject(prev => ({ ...prev, title: capitalizedTitle, description: editFormData.description, status: editFormData.status, skills: editFormData.skills }));
      setIsEditing(false);
      setSuccessSnackbar({ open: true, message: "Proje başarıyla güncellendi!" });
    } catch (err) {
      setError(err?.response?.data?.message || "Proje güncellenemedi. Lütfen tekrar deneyin.");
    }
  };

  const handleAddMember = async () => {
    try {
      const response = await axiosInstance.post(`/projects/${id}/join`);
      setProject(response.data.project);
      setSuccessSnackbar({ open: true, message: "Projeye başarıyla katıldınız!" });
    } catch (err) {
      setError(err.response?.data?.message || "Üye eklenemedi. Lütfen tekrar deneyin.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "F8FAFC" }}>
        <CircularProgress sx={{ color: "#0F172A" }} />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="md" sx={{ pt: 10, minHeight: "100vh" }}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error || "Proje bulunamadı!"}
        </Alert>
        <Button variant="text" onClick={() => navigate(-1)} sx={{ color: "#0F172A", fontWeight: 600 }}>
          <ArrowBackIcon sx={{ mr: 1, fontSize: 20 }} /> Geri Dön
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F8FAFC", color: "#0F172A", pb: 10 }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 } }}>
        
        <Button
          disableRipple
          variant="text"
          onClick={() => navigate(-1)}
          sx={{
            color: "#64748B",
            fontWeight: 600,
            mb: 4,
            px: 0,
            "&:hover": { color: "#0F172A", backgroundColor: "transparent" }
          }}
        >
          <ArrowBackIcon sx={{ mr: 1, fontSize: 20 }} /> Projelere Dön
        </Button>

        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={4} 
          alignItems="stretch"
          sx={{ width: '100%' }}
        >
          
          <Box sx={{ flex: 1, width: { xs: '100%', md: '50%' } }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 3, md: 4 }, 
                height: "100%", 
                borderRadius: 4, 
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="overline" sx={{ color: "#94A3B8", fontWeight: 700, display: "block" }}>
                  PROJE DETAYLARI
                </Typography>
                
                {!isEditing && user && project.owner && user._id === project.owner._id && (
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Projeyi Düzenle" placement="top">
                      <IconButton 
                        onClick={handleEditClick} 
                        size="small"
                        sx={{ color: "#64748B", "&:hover": { color: "#0F172A", bgcolor: "#F1F5F9" } }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Projeyi Sil" placement="top">
                      <IconButton 
                        onClick={() => setDeleteDialogOpen(true)} 
                        size="small"
                        sx={{ color: "#EF4444", "&:hover": { color: "#DC2626", bgcolor: "#FEF2F2" } }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                )}
              </Stack>

              {isEditing ? (
                <Stack spacing={3} sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Proje Başlığı"
                    variant="outlined"
                    value={editFormData.title}
                    onChange={e => setEditFormData(f => ({ ...f, title: capitalizeWords(e.target.value) }))}
                    sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0F172A" } }}
                  />
                  <TextField
                    fullWidth
                    label="Proje Açıklaması"
                    variant="outlined"
                    multiline
                    minRows={3}
                    value={editFormData.description}
                    onChange={e => setEditFormData(f => ({ ...f, description: e.target.value }))}
                    sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0F172A" }, mb: 1 }}
                  />
                  <Select
                    fullWidth
                    variant="outlined"
                    value={editFormData.status}
                    onChange={e => setEditFormData(f => ({ ...f, status: e.target.value }))}
                    sx={{ "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0F172A" } }}
                  >
                    <MenuItem value="planned">Planlanıyor</MenuItem>
                    <MenuItem value="ongoing">Devam Ediyor</MenuItem>
                    <MenuItem value="on_hold">Beklemede</MenuItem>
                    <MenuItem value="completed">Bitti</MenuItem>
                    <MenuItem value="cancelled">İptal Edildi</MenuItem>
                  </Select>

                  <MuiAutocomplete
                    multiple
                    freeSolo
                    options={allSkills}
                    value={editFormData.skills}
                    onChange={(e, newValue) => setEditFormData(f => ({ ...f, skills: newValue }))}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <MuiTextField
                        {...params}
                        variant="outlined"
                        label="Proje Becerileri"
                        placeholder="Beceri ekle..."
                        sx={{ mt: 1 }}
                      />
                    )}
                  />
                  <Stack direction="row" spacing={2} sx={{ pt: 2, mt: 'auto' }}>
                    <Button 
                      fullWidth
                      variant="outlined"
                      onClick={() => setIsEditing(false)} 
                      sx={{ color: "#64748B", borderColor: "#CBD5E1", fontWeight: 600, "&:hover": { bgcolor: "#F1F5F9" } }}
                    >
                      <CloseIcon sx={{ mr: 0.5, fontSize: 18 }} /> İptal
                    </Button>
                    <Button 
                      fullWidth
                      variant="contained" 
                      onClick={handleEditSave} 
                      disableElevation
                      sx={{ bgcolor: "#0F172A", color: "#fff", fontWeight: 600, "&:hover": { bgcolor: "#334155" } }}
                    >
                      <CheckIcon sx={{ mr: 0.5, fontSize: 18 }} /> Kaydet
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, letterSpacing: "-0.02em", wordBreak: "break-word" }}>
                      {project.title}
                    </Typography>
                    {project.description && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#64748B', mb: 0.5 }}>
                          Açıklama
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#444", fontWeight: 400 }}>
                          {project.description}
                        </Typography>
                      </Box>
                    )}

                    {project.skills && project.skills.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: '#64748B', fontWeight: 600, mb: 0.5 }}>
                          Proje Becerileri
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {project.skills.map((skill, idx) => (
                            <Box key={idx} sx={{
                              px: 1.5, py: 0.5, mr: 1, mb: 1,
                              bgcolor: '#F1F5F9',
                              borderRadius: 2,
                              fontSize: '1rem',
                              color: '#222',
                              fontWeight: 400,
                              border: '1px solid #E2E8F0',
                              fontFamily: 'inherit',
                              letterSpacing: 0,
                              display: 'inline-block'
                            }}>
                              {skill}
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ 
                    mt: 'auto', 
                    pt: 4, 
                    width: '100%', 
                    display: 'flex',
                    '& > *': {
                      width: '100% !important',
                      justifyContent: 'center !important',
                      height: 'auto !important',
                      minHeight: '48px !important',
                      fontSize: '1.1rem !important',
                      fontWeight: '700 !important',
                      borderRadius: '12px !important',
                    },
                    '& .MuiChip-label': {
                      width: '100%',
                      textAlign: 'center'
                    }
                  }}>
                    <TeamStatusChip status={project.status} />
                  </Box>

                </Box>
              )}
            </Paper>
          </Box>

          <Box sx={{ flex: 1, width: { xs: '100%', md: '50%' } }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 3, md: 4 }, 
                height: "100%", 
                borderRadius: 4, 
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF"
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="overline" sx={{ color: "#94A3B8", fontWeight: 700, display: "block" }}>
                    TAKIM YÖNETİMİ
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                    Üyeler
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={handleAddMember}
                  disableElevation
                  disabled={
                    !user || !project || !project.owner ||
                    user._id === project.owner._id ||
                    (project.members && project.members.some(
                      m => (m.user?._id || m._id) === user._id
                    ))
                  }
                  sx={{
                    bgcolor: "#0F172A",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 3,
                    "&:hover": { bgcolor: "#334155" },
                    opacity:
                      !user || !project || !project.owner ||
                      user._id === project.owner._id ||
                      (project.members && project.members.some(
                        m => (m.user?._id || m._id) === user._id
                      ))
                        ? 0.5 : 1,
                    cursor:
                      !user || !project || !project.owner ||
                      user._id === project.owner._id ||
                      (project.members && project.members.some(
                        m => (m.user?._id || m._id) === user._id
                      ))
                        ? "not-allowed" : "pointer"
                  }}
                >
                  <AddIcon sx={{ mr: 0.5, fontSize: 18 }} /> Katıl
                </Button>
              </Stack>

              <Divider sx={{ mb: 3, borderColor: "#F1F5F9" }} />

              <Box sx={{ 
                width: "100%",
                "& .MuiPaper-root, & .MuiCard-root, & > div": {
                  boxShadow: "none !important",
                  border: "none !important",
                  backgroundColor: "transparent !important",
                  paddingLeft: "0 !important",
                  paddingRight: "0 !important",
                }
              }}>
                <TeamMembersList
                  project={project}
                  currentUser={user}
                  onRemoveMember={handleRemoveMember}
                />
                    {/* Üye çıkarma onay dialogu */}
                    <Dialog open={removeMemberDialog.open} onClose={() => setRemoveMemberDialog({ open: false, userId: null })}>
                      <DialogTitle>Üyeyi Çıkar</DialogTitle>
                      <DialogContent>
                        <Typography mb={2}>Bu üyeyi projeden çıkarmak istediğinize emin misiniz?</Typography>
                        <TextField
                          label="Gerekçe (opsiyonel)"
                          fullWidth
                          multiline
                          minRows={2}
                          value={removeReason}
                          onChange={e => setRemoveReason(e.target.value)}
                          placeholder="İsterseniz çıkarma sebebini yazabilirsiniz..."
                          sx={{ mt: 1 }}
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => setRemoveMemberDialog({ open: false, userId: null })}>
                          Vazgeç
                        </Button>
                        <Button onClick={confirmRemoveMember} color="error" variant="contained">
                          Evet, Çıkar
                        </Button>
                      </DialogActions>
                    </Dialog>
              </Box>
            </Paper>
          </Box>

        </Stack>
      </Container>

      <ProjectDialogs
        cancelDialogOpen={cancelDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        onCancelDialogClose={() => setCancelDialogOpen(false)}
        onDeleteDialogClose={() => setDeleteDialogOpen(false)}
        onConfirmCancel={handleCancelProject}
        onConfirmDelete={handleDeleteProject}
        project={project}
      />

      <Snackbar
        open={successSnackbar.open}
        autoHideDuration={4000}
        onClose={() => setSuccessSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccessSnackbar({ open: false, message: '' })} 
          severity="success" 
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {successSnackbar.message}
        </Alert>
      </Snackbar>
  </Box>
  );
}

export default ProjectDetail;