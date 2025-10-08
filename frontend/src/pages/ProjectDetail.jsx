import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Chip, Stack, Avatar, AvatarGroup, LinearProgress, Tooltip } from "@mui/material";

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);           // Çubuğun kendisi
  const [displayProgress, setDisplayProgress] = useState(0); // Yazıdaki yüzde
  const animationRef = useRef();

  const projectData = {
    1: {
      name: "Portföy Sitesi",
      owner: "Melisa Yılmaz",
      members: ["Melisa Yılmaz", "Ahmet Demir", "Ayşe Kaya"],
      status: "Geliştirme Aşamasında",
      description: "Bu proje benim kişisel portföy sitem. React ve MUI kullanıldı.",
      endDate: "2025-12-01",
      startDate: "2025-10-01"
    },
    2: {
      name: "Todo Uygulaması",
      owner: "Ahmet Demir",
      members: ["Ahmet Demir", "Ayşe Kaya"],
      status: "Planlama Aşamasında",
      description: "Basit bir todo uygulaması. Kullanıcılar görev ekleyip silebiliyor.",
      endDate: "2025-10-20",
      startDate: "2025-10-05"
    },
    3: {
      name: "Blog Platformu",
      owner: "Ayşe Kaya",
      members: ["Ayşe Kaya", "Melisa Yılmaz"],
      status: "Tamamlandı",
      description: "Kendi bloglarını oluşturabileceğin ve paylaşabileceğin platform.",
      endDate: "2025-09-15",
      startDate: "2025-07-01"
    },
  };

  const project = projectData[Number(id)];

  useEffect(() => {
    if (!project) return;

    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const now = new Date();

    let targetProgress = ((now - start) / (end - start)) * 100;
    targetProgress = Math.min(Math.max(targetProgress, 0), 100);

    let current = 0;

    const step = () => {
      const increment = Math.max(targetProgress / 20, 0.5); // her frame’de ilerleme
      current = Math.min(current + increment, targetProgress);
      setProgress(current);

      // Yazıyı smooth güncelle
      setDisplayProgress(prev => {
        const diff = current - prev;
        return prev + diff * 0.2; // yavaş yavaş yaklaş
      });

      if (current < targetProgress) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        setDisplayProgress(targetProgress); // son değere kesin ulaştır
      }
    };

    animationRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationRef.current);
  }, [project]);

  if (!project) {
    return (
      <Box sx={{ padding: "40px", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h5">Proje bulunamadı!</Typography>
          <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate(-1)}>
            Geri Dön
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: { xs: "20px", md: "60px" }, minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      <Typography variant="h2" sx={{ fontWeight: "bold", mb: 3 }}>
        {project.name}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Owner: {project.owner}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
        {project.description}
      </Typography>

      {/* İlerleme Çubuğu */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Proje İlerleme Durumu
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 12,
            borderRadius: 6,
            backgroundColor: "#e0e0e0",
            "& .MuiLinearProgress-bar": {
              borderRadius: 6,
              background: "linear-gradient(90deg, #003fd3, #00d4ff)",
              transition: "all 0.3s ease-in-out",
            },
          }}
        />
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          %{Math.round(displayProgress)} tamamlandı - Bitiş Tarihi: {project.endDate}
        </Typography>
      </Box>

      {/* Bilgi etiketleri ve üyeler */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
        <Chip label={`Durum: ${project.status}`} color="primary" />
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body2" sx={{ mr: 1 }}>Üyeler:</Typography>
          <AvatarGroup max={4}>
            {project.members.map((member, idx) => (
              <Tooltip key={idx} title={member} arrow>
                <Avatar sx={{ cursor: "pointer" }}>
                  {member.split(" ").map(n => n[0]).join("")}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
        </Box>
      </Stack>

      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#003fd3ff", "&:hover": { backgroundColor: "#002bb5" }, textTransform: "none", borderRadius: 3, padding: "8px 24px" }}
          onClick={() => navigate(-1)}
        >
          Geri Dön
        </Button>
      </Box>
    </Box>
  );
}

export default ProjectDetail;