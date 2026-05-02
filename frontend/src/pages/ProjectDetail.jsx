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
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    status: "planned",
    skills: []
  });

const [removeMemberDialog, setRemoveMemberDialog] = useState({ open: false, userId: null });
  const [removeReason, setRemoveReason] = useState("");
  const [allSkills, setAllSkills] = useState([]);
  const [lookingForMembers, setLookingForMembers] = useState(false);
  const [lookingForSkills, setLookingForSkills] = useState([]);
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState({ title: "", url: "" });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // State for creating new ilans
  const [newIlanTitle, setNewIlanTitle] = useState("");
  const [newIlanDescription, setNewIlanDescription] = useState("");
  const [newIlanSkills, setNewIlanSkills] = useState([]);
  const [showNewIlanForm, setShowNewIlanForm] = useState(false);

useEffect(() => {
    axiosInstance.get("/skills").then(res => setAllSkills(res.data)).catch(() => setAllSkills([]));
  }, []);

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
      const response = await axiosInstance.post(`/projects/${project._id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const fileUrl = response.data.url || URL.createObjectURL(file);
      setResources([...resources, { 
        id: Date.now(), 
        title: file.name, 
        url: fileUrl,
        type: 'file'
      }]);
      setSuccessSnackbar({ open: true, message: "Dosya başarıyla yüklendi!" });
    } catch {
      const fileUrl = URL.createObjectURL(file);
      setResources([...resources, { 
        id: Date.now(), 
        title: file.name, 
        url: fileUrl,
        type: 'file'
      }]);
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
    const userId = removeMemberDialog.userId;
    if (!userId) return;
    try {
      await axiosInstance.delete(`/projects/${project._id}/members/${userId}`, { data: { reason: removeReason } });
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
    } catch {
      setError("Proje detayı yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleCancelProject = async () => {
    try {
      await axiosInstance.put(`/projects/${id}`, { ...project, status: "cancelled" });
      setProject(prev => ({ ...prev, status: "cancelled" }));
      setCancelDialogOpen(false);
      setSuccessSnackbar({ open: true, message: "Proje başarıyla iptal edildi!" });
    } catch {
      setError("Proje iptal edilemedi.");
    }
  };

  const handleDeleteProject = async () => {
    try {
      await axiosInstance.delete(`/projects/${project._id}`);
      setDeleteDialogOpen(false);
      navigate("/projects");
    } catch (err) {
      setError(err.response?.data?.message || "Proje silinirken hata oluştu.");
      setDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (project) {
      setLookingForMembers(project.lookingForMembers || false);
      setLookingForSkills(project.lookingForSkills || []);
    }
  }, [project]);

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
    if (!editFormData.title.trim() || !editFormData.description.trim() || !editFormData.skills?.length) {
      setError("Lütfen tüm alanları doldurun.");
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
      setSuccessSnackbar({ open: true, message: "Proje güncellendi!" });
    } catch (err) {
      setError(err?.response?.data?.message || "Güncelleme başarısız.");
    }
  };

  const handleAddMember = async () => {
    try {
      const response = await axiosInstance.post(`/projects/${id}/join`);
      setProject(response.data.project);
      setSuccessSnackbar({ open: true, message: "Projeye katıldınız!" });
    } catch (err) {
      setError(err.response?.data?.message || "Hata oluştu.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "#F8FAFC" }}>
        <CircularProgress sx={{ color: "#0F172A" }} />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="md" sx={{ pt: 10, minHeight: "100vh" }}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error || "Proje bulunamadı!"}</Alert>
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
          sx={{ color: "#64748B", fontWeight: 600, mb: 4, px: 0, "&:hover": { color: "#0F172A", backgroundColor: "transparent" } }}
        >
          <ArrowBackIcon sx={{ mr: 1, fontSize: 20 }} /> Projelere Dön
        </Button>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="stretch">
          <Box sx={{ flex: 1, width: { xs: '100%', md: '50%' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="overline" sx={{ color: "#94A3B8", fontWeight: 700 }}>PROJE DETAYLARI</Typography>
                {!isEditing && user && project.owner && user._id === project.owner._id && (
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Düzenle"><IconButton onClick={handleEditClick} size="small"><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Sil"><IconButton onClick={() => setDeleteDialogOpen(true)} size="small" sx={{ color: "#EF4444" }}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
                  </Stack>
                )}
              </Stack>

              {isEditing ? (
                <Stack spacing={3}>
                  <TextField fullWidth label="Başlık" value={editFormData.title} onChange={e => setEditFormData(f => ({ ...f, title: capitalizeWords(e.target.value) }))} />
                  <TextField fullWidth multiline minRows={3} label="Açıklama" value={editFormData.description} onChange={e => setEditFormData(f => ({ ...f, description: e.target.value }))} />
                  <Select fullWidth value={editFormData.status} onChange={e => setEditFormData(f => ({ ...f, status: e.target.value }))}>
                    <MenuItem value="planned">Planlanıyor</MenuItem>
                    <MenuItem value="ongoing">Devam Ediyor</MenuItem>
                    <MenuItem value="on_hold">Beklemede</MenuItem>
                    <MenuItem value="completed">Bitti</MenuItem>
                    <MenuItem value="cancelled">İptal Edildi</MenuItem>
                  </Select>
                  <MuiAutocomplete multiple freeSolo options={allSkills} value={editFormData.skills} onChange={(e, v) => setEditFormData(f => ({ ...f, skills: v }))}
                    renderTags={(v, p) => v.map((opt, i) => <Chip variant="outlined" label={opt} {...p({ index: i })} />)}
                    renderInput={(p) => <MuiTextField {...p} label="Beceriler" />} />
                  <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                    <Button fullWidth variant="outlined" onClick={() => setIsEditing(false)} sx={{ color: "#64748B" }}>İptal</Button>
                    <Button fullWidth variant="contained" onClick={handleEditSave} sx={{ bgcolor: "#0F172A" }}>Kaydet</Button>
                  </Stack>
                </Stack>
              ) : (
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>{project.title}</Typography>
                  <Typography variant="body1" sx={{ color: "#475569", mb: 3 }}>{project.description}</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 4 }}>
                    {project.skills?.map((s, i) => (
                      <Chip key={i} label={s} size="small" sx={{ bgcolor: "#F1F5F9", fontWeight: 500 }} />
                    ))}
                  </Stack>
                  <TeamStatusChip status={project.status} />
                </Box>
              )}
            </Paper>

<Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="overline" sx={{ color: "#94A3B8", fontWeight: 700 }}>İLAN VER</Typography>
                {lookingForMembers && (
                  <Chip 
                    icon={<GroupAddIcon />} 
                    label={`${project.ilans?.length || 1} İlan Yayında`} 
                    sx={{ bgcolor: "#10B981", color: "#fff", fontWeight: 600 }} 
                  />
                )}
              </Stack>
              
              {/* Display existing ilans */}
              {project.ilans && project.ilans.length > 0 && (
                <Stack spacing={2} sx={{ mb: 3 }}>
                  {project.ilans.map((ilan, idx) => (
                    <Box key={ilan._id || idx} sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: ilan.isActive ? "#ECFDF5" : "#F3F4F6", 
                      border: `1px solid ${ilan.isActive ? "#10B981" : "#E5E7EB"}`
                    }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <GroupAddIcon sx={{ color: ilan.isActive ? "#10B981" : "#9CA3AF", fontSize: 18 }} />
                            <Typography variant="body2" sx={{ color: ilan.isActive ? "#065F46" : "#6B7280", fontWeight: 600 }}>
                              {ilan.title || "Üye Arıyoruz"}
                            </Typography>
                            <Chip 
                              label={ilan.isActive ? "Aktif" : "Pasif"} 
                              size="small" 
                              sx={{ 
                                bgcolor: ilan.isActive ? "#10B981" : "#9CA3AF", 
                                color: "#fff", 
                                fontSize: "0.65rem",
                                height: 20
                              }} 
                            />
                          </Stack>
                          {ilan.description && (
                            <Typography variant="body2" sx={{ color: "#6B7280", fontSize: "0.8rem", mb: 1 }}>
                              {ilan.description}
                            </Typography>
                          )}
                          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                            {(ilan.skills?.length > 0 ? ilan.skills : project.skills)?.slice(0, 5).map((skill, i) => (
                              <Chip key={i} label={skill} size="small" sx={{ bgcolor: "#FFFFFF", color: "#065F46", fontSize: "0.65rem", height: 20 }} />
                            ))}
                          </Stack>
                        </Box>
                        {user && project.owner && user._id === project.owner._id && (
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title={ilan.isActive ? "Pasifleştir" : "Aktifleştir"}>
                              <IconButton 
                                size="small" 
                                onClick={async () => {
                                  try {
                                    await axiosInstance.put(`/projects/${project._id}/ilans/${ilan._id}`, {
                                      isActive: !ilan.isActive
                                    });
                                    fetchProject();
                                    setSuccessSnackbar({ open: true, message: ilan.isActive ? "İlan pasifleştirildi!" : "İlan aktifleştirildi!" });
                                  } catch {
                                    setError("İlan güncellenemedi.");
                                  }
                                }}
                              >
                                {ilan.isActive ? <CloseIcon fontSize="small" /> : <GroupAddIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil">
                              <IconButton 
                                size="small" 
                                sx={{ color: "#EF4444" }}
                                onClick={async () => {
                                  try {
                                    await axiosInstance.delete(`/projects/${project._id}/ilans/${ilan._id}`);
                                    fetchProject();
                                    setSuccessSnackbar({ open: true, message: "İlan silindi!" });
                                  } catch {
                                    setError("İlan silinemedi.");
                                  }
                                }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}

              {/* Legacy single ilan display for backward compatibility */}
              {(!project.ilans || project.ilans.length === 0) && lookingForMembers && (
                <Box sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: "#ECFDF5", border: "1px solid #10B981" }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <GroupAddIcon sx={{ color: "#10B981", fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: "#065F46", fontWeight: 600 }}>
                      Üye Arıyoruz!
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 0.5 }}>
                    {(lookingForSkills.length > 0 ? lookingForSkills : project.skills)?.slice(0, 5).map((skill, i) => (
                      <Chip key={i} label={skill} size="small" sx={{ bgcolor: "#FFFFFF", color: "#065F46", fontSize: "0.7rem", height: 22 }} />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Show new ilan form toggle and form */}
              {user && project.owner && user._id === project.owner._id && (
                <Stack spacing={2}>
                  {!showNewIlanForm ? (
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      startIcon={<AddIcon />}
                      onClick={() => setShowNewIlanForm(true)}
                      sx={{ 
                        borderColor: "#10B981", 
                        color: "#10B981",
                        fontWeight: 600,
                        "&:hover": { bgcolor: "#ECFDF5" }
                      }}
                    >
                      Yeni İlan Ekle
                    </Button>
                  ) : (
                    <Stack spacing={2}>
                      <MuiAutocomplete 
                        multiple 
                        freeSolo 
                        options={allSkills} 
value={newIlanSkills}
                        onChange={(e, v) => setNewIlanSkills(v)}
                        renderTags={(v, p) => v.map((opt, i) => <Chip variant="outlined" label={opt} {...p({ index: i })} />)}
                        renderInput={(p) => <MuiTextField {...p} label="Aranan Beceriler" />} 
                      />
                      <Stack direction="row" spacing={2}>
                        <Button 
                          fullWidth 
                          variant="outlined" 
                          onClick={() => {
setShowNewIlanForm(false);
                            setNewIlanTitle("");
                            setNewIlanDescription("");
                            setNewIlanSkills([]);
                          }}
                          sx={{ color: "#64748B" }}
                        >
                          İptal
                        </Button>
                        <Button 
                          fullWidth 
                          variant="contained" 
                          startIcon={<AddIcon />}
disabled={!newIlanSkills?.length}
                          onClick={async () => {
                            if (!newIlanSkills?.length) {
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
                          }}
                          sx={{ 
                            bgcolor: "#10B981", 
                            "&:hover": { bgcolor: "#059669" }
                          }}
                        >
                          İlan Yayınla
                        </Button>
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              )}

              {/* Legacy toggle for backward compatibility - if no ilans array */}
              {(!project.ilans || project.ilans.length === 0) && user && project.owner && user._id === project.owner._id && (
                <Stack spacing={2}>
                  <MuiAutocomplete 
                    multiple 
                    freeSolo 
                    options={allSkills} 
                    value={lookingForSkills} 
                    onChange={(e, v) => setLookingForSkills(v)}
                    renderTags={(v, p) => v.map((opt, i) => <Chip variant="outlined" label={opt} {...p({ index: i })} />)}
                    renderInput={(p) => <MuiTextField {...p} label="Aranan Beceriler" />} 
                  />
                  <Button 
                    fullWidth 
                    variant={lookingForMembers ? "outlined" : "contained"} 
                    startIcon={<GroupAddIcon />}
                    onClick={async () => {
                      if (!lookingForSkills?.length) {
                        setError("Lütfen en az bir beceri seçin.");
                        return;
                      }
                      try {
                        await axiosInstance.put(`/projects/${project._id}`, {
                          lookingForMembers: !lookingForMembers,
                          lookingForSkills: lookingForSkills
                        });
                        setProject(prev => ({ ...prev, lookingForMembers: !lookingForMembers, lookingForSkills: lookingForSkills }));
                        setLookingForMembers(!lookingForMembers);
                        setSuccessSnackbar({ open: true, message: !lookingForMembers ? "İlan yayında!" : "İlan kapatıldı!" });
                      } catch {
                        setError("İlan güncellenemedi.");
                      }
                    }}
                    sx={{ 
                      bgcolor: lookingForMembers ? "transparent" : "#10B981", 
                      color: lookingForMembers ? "#10B981" : "#fff",
                      borderColor: "#10B981",
                      fontWeight: 600,
                      py: 1,
                      "&:hover": { bgcolor: lookingForMembers ? "#ECFDF5" : "#059669" }
                    }}
                  >
                    {lookingForMembers ? "İlanı Kapat" : "İlanı Yayınla"}
                  </Button>
                </Stack>
              )}
            </Paper>
          </Box>

          <Box sx={{ flex: 1, width: { xs: '100%', md: '50%' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="overline" sx={{ color: "#94A3B8", fontWeight: 700 }}>TAKIM YÖNETİMİ</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>Üyeler</Typography>
                </Box>
                <Button variant="contained" onClick={handleAddMember} disableElevation
                  disabled={!user || user._id === project.owner?._id || project.members?.some(m => (m.user?._id || m._id) === user._id)}
                  sx={{ bgcolor: "#0F172A", borderRadius: 2, px: 3 }}>
                  <AddIcon sx={{ mr: 0.5, fontSize: 18 }} /> Katıl
                </Button>
              </Stack>
              <Divider sx={{ mb: 3 }} />
              <TeamMembersList project={project} currentUser={user} onRemoveMember={handleRemoveMember} />
              <Dialog open={removeMemberDialog.open} onClose={() => setRemoveMemberDialog({ open: false, userId: null })}>
                <DialogTitle>Üyeyi Çıkar</DialogTitle>
                <DialogContent>
                  <Typography mb={2}>Bu üyeyi çıkarmak istediğinize emin misiniz?</Typography>
                  <TextField label="Gerekçe" fullWidth multiline minRows={2} value={removeReason} onChange={e => setRemoveReason(e.target.value)} />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setRemoveMemberDialog({ open: false, userId: null })}>Vazgeç</Button>
                  <Button onClick={confirmRemoveMember} color="error" variant="contained">Çıkar</Button>
                </DialogActions>
              </Dialog>
            </Paper>
            
{(user && project.owner && (user._id === project.owner._id || project.members?.some(m => (m.user?._id || m._id) === user._id))) && (
              <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="overline" sx={{ color: "#94A3B8", fontWeight: 700 }}>BAĞLANTILAR VE KAYNAKLAR</Typography>
                </Stack>
                
{(user && project.owner && (user._id === project.owner._id || project.members?.some(m => (m.user?._id || m._id) === user._id))) && (
                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <TextField 
                      size="small" 
                      fullWidth 
                      placeholder="Bağlantı adı (örn: GitHub)" 
                      value={newResource.title} 
                      onChange={e => setNewResource({...newResource, title: e.target.value})} 
                    />
                    <Stack direction="row" spacing={1}>
                      <TextField 
                        size="small" 
                        fullWidth 
                        placeholder="URL (https://...)" 
                        value={newResource.url} 
                        onChange={e => setNewResource({...newResource, url: e.target.value})} 
                      />
                      <Button 
                        variant="contained" 
                        onClick={handleAddResource} 
                        sx={{ bgcolor: "#0F172A", minWidth: "50px" }}
                        disabled={!newResource.title.trim() || !newResource.url.trim()}
                      >
                        <AddIcon />
                      </Button>
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      style={{ display: 'none' }} 
                    />
                    <Stack direction="row" spacing={1}>
                      <Button 
                        variant="outlined" 
                        startIcon={<CloudUploadIcon />} 
                        onClick={() => fileInputRef.current.click()} 
                        disabled={uploading} 
                        sx={{ flex: 1, borderColor: "#E2E8F0", color: "#64748B" }}
                      >
                        {uploading ? "Yükleniyor..." : "Dosya Yükle"}
                      </Button>
                    </Stack>
                  </Stack>
                )}

                <Stack spacing={2}>
                  {resources.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4, px: 2, borderRadius: 3, bgcolor: "#F8FAFC", border: "2px dashed #E2E8F0" }}>
                      <Typography variant="body2" sx={{ color: "#94A3B8", fontWeight: 500 }}>Henüz kaynak eklenmedi</Typography>
                      <Typography variant="caption" sx={{ color: "#CBD5E1", display: 'block', mt: 0.5 }}>Yukarıdaki alanları kullanarak bağlantı veya dosya ekleyebilirsiniz</Typography>
                    </Box>
                  )}
                  {resources.map(res => (
                    <Box key={res.id} sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between", 
                      p: 2, 
                      borderRadius: 3, 
                      border: "1px solid #E2E8F0", 
                      bgcolor: "#FFFFFF",
                      transition: "all 0.2s ease",
                      "&:hover": { 
                        bgcolor: "#F8FAFC",
                        borderColor: "#CBD5E1",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                      } 
                    }}>
                      <Stack direction="row" spacing={2} alignItems="center" component="a" href={res.url} target="_blank" sx={{ textDecoration: "none", color: "inherit", flex: 1 }}>
                        <Box sx={{ 
                          bgcolor: res.type === 'file' ? "#EEF2FF" : "#F0FDF4", 
                          p: 1.5, 
                          borderRadius: 2, 
                          display: "flex",
                          color: res.type === 'file' ? "#4F46E5" : "#16A34A"
                        }}>
                          {getResourceIcon(res)}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1E293B" }}>{res.title}</Typography>
                          <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                            {res.type === 'file' ? 'Dosya' : res.url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
                          </Typography>
                        </Box>
                      </Stack>
{(user && project.owner && (user._id === project.owner._id || project.members?.some(m => (m.user?._id || m._id) === user._id))) && (
                        <IconButton size="small" onClick={() => handleRemoveResource(res.id)} sx={{ color: "#CBD5E1", "&:hover": { color: "#EF4444", bgcolor: "#FEE2E2" } }}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
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

      <Snackbar open={successSnackbar.open} autoHideDuration={4000} onClose={() => setSuccessSnackbar({ ...successSnackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%', borderRadius: 2 }}>{successSnackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default ProjectDetail;