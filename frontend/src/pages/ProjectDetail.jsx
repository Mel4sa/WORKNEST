import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import React, { useEffect, useState, useCallback, useRef } from "react";
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
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import ImageIcon from '@mui/icons-material/Image';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
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
  const [editFormData, setEditFormData] = useState({ title: "", description: "", status: "planned", skills: [] });

  const [removeMemberDialog, setRemoveMemberDialog] = useState({ open: false, userId: null });
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [removeReason, setRemoveReason] = useState("");
  const [allSkills, setAllSkills] = useState([]);
  
const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState({ title: "", url: "" });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [newIlanTitle, setNewIlanTitle] = useState("");
  const [newIlanDescription, setNewIlanDescription] = useState("");
  const [newIlanSkills, setNewIlanSkills] = useState([]);
  const [showNewIlanForm, setShowNewIlanForm] = useState(false);
  const [ilans, setIlans] = useState([]);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/projects/${id}`);
      setProject(response.data);
    } catch {
      setError("Proje detayı yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    axiosInstance.get("/skills").then(res => setAllSkills(res.data)).catch(() => setAllSkills([]));
    fetchProject();
  }, [fetchProject]);

useEffect(() => {
    if (project) {
      setIlans(project.ilans || []);
    }
  }, [project]);

  const handleAddResource = () => {
    if (newResource.title.trim() && newResource.url.trim()) {
      setResources([...resources, { ...newResource, id: Date.now(), type: 'link' }]);
      setNewResource({ title: "", url: "" });
      setSuccessSnackbar({ open: true, message: "Bağlantı başarıyla eklendi!" });
    }
  };

  const getResourceIcon = (res) => {
    if (res.type === 'file') {
      const ext = res.title?.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return <ImageIcon />;
      if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return <FolderZipIcon />;
      if (['doc', 'docx', 'pdf', 'txt', 'rtf'].includes(ext)) return <DescriptionIcon />;
      return <InsertDriveFileIcon />;
    }
    return <LinkIcon />;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axiosInstance.post(`/projects/${project._id}/upload`, formData);
      const fileUrl = response.data.url || URL.createObjectURL(file);
      setResources([...resources, { id: Date.now(), title: file.name, url: fileUrl, type: 'file' }]);
      setSuccessSnackbar({ open: true, message: "Dosya başarıyla yüklendi!" });
    } catch {
      setSuccessSnackbar({ open: true, message: "Dosya eklendi!" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveResource = (resourceId) => {
    setResources(resources.filter(r => r.id !== resourceId));
  };

  const handleRemoveMember = (userId) => {
    setRemoveMemberDialog({ open: true, userId });
    setRemoveReason("");
  };

  const confirmRemoveMember = async () => {
    try {
      await axiosInstance.delete(`/projects/${project._id}/members/${removeMemberDialog.userId}`, { data: { reason: removeReason } });
      fetchProject();
      setSuccessSnackbar({ open: true, message: "Üye başarıyla çıkarıldı!" });
    } finally {
      setRemoveMemberDialog({ open: false, userId: null });
    }
  };

  const handleEditSave = async () => {
    if (!editFormData.title.trim() || !editFormData.description.trim() || !editFormData.skills?.length) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }
    try {
      await axiosInstance.put(`/projects/${project._id}`, { ...project, ...editFormData });
      setProject(prev => ({ ...prev, ...editFormData }));
      setIsEditing(false);
      setSuccessSnackbar({ open: true, message: "Proje güncellendi!" });
    } catch {
      setError("Güncelleme başarısız.");
    }
  };

  const handleAddMember = async () => {
    try {
      const response = await axiosInstance.post(`/projects/${id}/join`);
      setProject(response.data.project);
      setSuccessSnackbar({ open: true, message: "Projeye katıldınız!" });
    } catch (err) {
      setError(err.response?.data?.message || "Katılım hatası.");
    }
  };

  const handleLeaveProject = async () => {
    try {
      await axiosInstance.post(`/projects/${id}/leave`);
      fetchProject();
      setLeaveDialogOpen(false);
      setSuccessSnackbar({ open: true, message: "Projeden ayrıldınız." });
    } catch {
      setError("Ayrılırken hata oluştu.");
    }
  };

const handleCreateIlan = async () => {
    if (!newIlanSkills.length) {
      setError("Lütfen en az bir beceri seçin.");
      return;
    }
    try {
      await axiosInstance.post(`/projects/${project._id}/ilans`, {
        title: newIlanTitle || "Üye Arıyoruz",
        description: newIlanDescription,
        skills: newIlanSkills
      });
      fetchProject();
      setNewIlanTitle("");
      setNewIlanDescription("");
      setNewIlanSkills([]);
      setShowNewIlanForm(false);
      setSuccessSnackbar({ open: true, message: "İlan yayında!" });
    } catch {
      setError("İlan oluşturulamadı.");
    }
  };

  const handleDeleteIlan = async (ilanId) => {
    try {
      await axiosInstance.delete(`/projects/${project._id}/ilans/${ilanId}`);
      fetchProject();
      setSuccessSnackbar({ open: true, message: "İlan silindi!" });
    } catch {
      setError("İlan silinemedi.");
    }
  };

  const handleCancelProject = async () => {
    try {
      await axiosInstance.put(`/projects/${id}`, { ...project, status: "cancelled" });
      setProject(prev => ({ ...prev, status: "cancelled" }));
      setCancelDialogOpen(false);
      setSuccessSnackbar({ open: true, message: "Proje iptal edildi." });
    } catch {
      setError("İptal işlemi başarısız.");
    }
  };

  const handleDeleteProject = async () => {
    try {
      await axiosInstance.delete(`/projects/${project._id}`);
      setDeleteDialogOpen(false);
      navigate("/projects");
    } catch {
      setError("Silme işlemi başarısız.");
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}><CircularProgress /></Box>;
  if (error || !project) return <Container sx={{ mt: 5 }}><Alert severity="error">{error || "Proje bulunamadı!"}</Alert></Container>;

  const isOwner = user && project.owner && user._id === project.owner._id;
  const isMember = user && project.members?.some(m => (m.user?._id || m._id) === user._id);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F8FAFC", color: "#0F172A", pb: 10 }}>
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} sx={{ mb: 4, color: "#64748B", fontWeight: 600 }}>
          Projelere Dön
        </Button>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="stretch">
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="overline" sx={{ color: "#94A3B8", fontWeight: 700 }}>PROJE DETAYLARI</Typography>
                {!isEditing && isOwner && (
                  <Stack direction="row" spacing={1}>
<IconButton onClick={() => {
                          setEditFormData({
                            title: project.title || "",
                            description: project.description || "",
                            status: project.status || "planned",
                            skills: project.skills || []
                          });
                          setIsEditing(true);
                        }} size="small"><EditOutlinedIcon fontSize="small" /></IconButton>
                    <IconButton onClick={() => setDeleteDialogOpen(true)} size="small" sx={{ color: "#EF4444" }}><DeleteOutlineIcon fontSize="small" /></IconButton>
                  </Stack>
                )}
              </Stack>

              {isEditing ? (
                <Stack spacing={3}>
                  <TextField fullWidth label="Başlık" value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} />
                  <TextField fullWidth multiline rows={3} label="Açıklama" value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} />
                  <Select fullWidth value={editFormData.status} onChange={e => setEditFormData({...editFormData, status: e.target.value})}>
                    <MenuItem value="planned">Planlanıyor</MenuItem>
                    <MenuItem value="ongoing">Devam Ediyor</MenuItem>
                    <MenuItem value="on_hold">Beklemede</MenuItem>
                    <MenuItem value="completed">Bitti</MenuItem>
                  </Select>
                  <MuiAutocomplete multiple options={allSkills} value={editFormData.skills} onChange={(e, v) => setEditFormData({...editFormData, skills: v})} renderInput={(p) => <MuiTextField {...p} label="Beceriler" />} />
                  <Stack direction="row" spacing={2}>
                    <Button fullWidth variant="outlined" onClick={() => setIsEditing(false)}>İptal</Button>
                    <Button fullWidth variant="contained" onClick={handleEditSave} sx={{ bgcolor: "#0F172A" }}>Kaydet</Button>
                  </Stack>
                </Stack>
              ) : (
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>{project.title}</Typography>
                  <Typography variant="body1" sx={{ color: "#475569", mb: 3 }}>{project.description}</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 4 }}>
                    {project.skills?.map((s, i) => <Chip key={i} label={s} size="small" sx={{ bgcolor: "#F1F5F9" }} />)}
                  </Stack>
                  <TeamStatusChip status={project.status} />
                </Box>
              )}
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="overline" sx={{ color: "#94A3B8", fontWeight: 700 }}>İLAN YÖNETİMİ</Typography>
                {ilans.length > 0 && <Chip label={`${ilans.length} Aktif İlan`} sx={{ bgcolor: "#10B981", color: "#fff" }} />}
              </Stack>
{isOwner && (
                <Stack spacing={2}>
                  {!showNewIlanForm ? (
                    <Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={() => setShowNewIlanForm(true)}>Yeni İlan Ekle</Button>
                  ) : (
                    <Stack spacing={2}>
                      <TextField fullWidth label="İlan Başlığı" value={newIlanTitle} onChange={e => setNewIlanTitle(e.target.value)} />
                      <TextField fullWidth multiline rows={2} label="Açıklama" value={newIlanDescription} onChange={e => setNewIlanDescription(e.target.value)} />
                      <MuiAutocomplete multiple options={allSkills} value={newIlanSkills} onChange={(e, v) => setNewIlanSkills(v)} renderInput={(p) => <MuiTextField {...p} label="Aranan Beceriler" />} />
                      <Stack direction="row" spacing={1}>
                        <Button fullWidth variant="outlined" onClick={() => setShowNewIlanForm(false)}>İptal</Button>
                        <Button fullWidth variant="contained" sx={{ bgcolor: "#10B981" }} onClick={handleCreateIlan}>Yayınla</Button>
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              )}
              {ilans.length > 0 && (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {ilans.map((ilan) => (
                    <Box key={ilan._id} sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>{ilan.title}</Typography>
                          {ilan.description && <Typography variant="body2" sx={{ color: "#64748B", mt: 1 }}>{ilan.description}</Typography>}
                          {ilan.skills && ilan.skills.length > 0 && (
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
                              {ilan.skills.map((skill, idx) => (
                                <Chip key={idx} label={skill} size="small" sx={{ bgcolor: "#F1F5F9", fontSize: '0.75rem' }} />
                              ))}
                            </Stack>
                          )}
                          <Typography variant="caption" sx={{ color: "#94A3B8", mt: 1, display: 'block' }}>
                            {ilan.createdAt ? new Date(ilan.createdAt).toLocaleDateString('tr-TR') : ''}
                          </Typography>
                        </Box>
                        {isOwner && (
                          <IconButton size="small" onClick={() => handleDeleteIlan(ilan._id)} sx={{ color: "#EF4444" }}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Box>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Ekip Üyeleri</Typography>
                <Box>
                  {!isMember && !isOwner && <Button variant="contained" onClick={handleAddMember} sx={{ bgcolor: "#0F172A" }}>Katıl</Button>}
                  {isMember && !isOwner && <Button variant="contained" color="error" onClick={() => setLeaveDialogOpen(true)}>Ayrıl</Button>}
                </Box>
              </Stack>
              <Divider sx={{ mb: 3 }} />
              <TeamMembersList project={project} currentUser={user} onRemoveMember={handleRemoveMember} />
            </Paper>

            {(isOwner || isMember) && (
              <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
                <Typography variant="overline" sx={{ color: "#94A3B8", fontWeight: 700, mb: 2, display: 'block' }}>KAYNAKLAR ve DOSYALAR</Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1}>
                    <TextField size="small" placeholder="Başlık" value={newResource.title} onChange={e => setNewResource({...newResource, title: e.target.value})} />
                    <TextField size="small" fullWidth placeholder="URL" value={newResource.url} onChange={e => setNewResource({...newResource, url: e.target.value})} />
                    <IconButton onClick={handleAddResource} sx={{ bgcolor: "#0F172A", color: "#fff" }}><AddIcon /></IconButton>
                  </Stack>
<Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => fileInputRef.current.click()} disabled={uploading}>
                    {uploading ? "Yükleniyor..." : "Dosya Yükle"}
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    style={{ display: 'none' }} 
                    accept="*/*"
                  />
<Stack spacing={1}>
                    {resources.map(res => (
                      <Box key={res.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, border: '1px solid #F1F5F9', borderRadius: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center" component="a" href={res.url} target="_blank" sx={{ textDecoration: 'none', color: 'inherit' }}>
                          {getResourceIcon(res)}
                          <Typography variant="body2" fontWeight={600}>{res.title}</Typography>
                        </Stack>
                        <IconButton size="small" onClick={() => handleRemoveResource(res.id)} sx={{ color: "#EF4444" }}><CloseIcon fontSize="small" /></IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            )}
          </Box>
        </Stack>
      </Container>

      <ProjectDialogs 
        cancelDialogOpen={cancelDialogOpen} deleteDialogOpen={deleteDialogOpen}
        onCancelDialogClose={() => setCancelDialogOpen(false)} onDeleteDialogClose={() => setDeleteDialogOpen(false)}
        onConfirmCancel={handleCancelProject} onConfirmDelete={handleDeleteProject} project={project}
      />
      <Dialog open={leaveDialogOpen} onClose={() => setLeaveDialogOpen(false)}>
        <DialogTitle>Projeden ayrılmak istediğinize emin misiniz?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setLeaveDialogOpen(false)}>Vazgeç</Button>
          <Button onClick={handleLeaveProject} color="error" variant="contained">Evet, Ayrıl</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={removeMemberDialog.open} onClose={() => setRemoveMemberDialog({ open: false, userId: null })}>
        <DialogTitle>Üyeyi Çıkar</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Gerekçe" multiline rows={2} value={removeReason} onChange={e => setRemoveReason(e.target.value)} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveMemberDialog({ open: false, userId: null })}>İptal</Button>
          <Button onClick={confirmRemoveMember} color="error">Çıkar</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={successSnackbar.open} autoHideDuration={3000} onClose={() => setSuccessSnackbar({ ...successSnackbar, open: false })}>
        <Alert severity="success">{successSnackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default ProjectDetail;