import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Card, CardContent, Button, Chip, Stack } from "@mui/material";

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Örnek proje verileri
  const projectData = {
    1: {
      name: "Portföy Sitesi",
      owner: "Melisa",
      members: ["Melisa", "Ahmet", "Ayşe"],
      status: "Geliştirme Aşamasında",
      description: "Bu proje benim kişisel portföy sitem. React ve MUI kullanıldı.",
      endDate: "2025-12-01",
    },
    2: {
      name: "Todo Uygulaması",
      owner: "Ahmet",
      members: ["Ahmet", "Ayşe"],
      status: "Planlama Aşamasında",
      description: "Basit bir todo uygulaması. Kullanıcılar görev ekleyip silebiliyor.",
      endDate: "2025-10-20",
    },
    3: {
      name: "Blog Platformu",
      owner: "Ayşe",
      members: ["Ayşe", "Melisa"],
      status: "Tamamlandı",
      description: "Kendi bloglarını oluşturabileceğin ve paylaşabileceğin platform.",
      endDate: "2025-09-15",
    },
  };

  const project = projectData[id];

  if (!project) {
    return (
      <Box sx={{ padding: "20px" }}>
        <Typography variant="h5">Proje bulunamadı!</Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2, backgroundColor: "#003fd3ff", "&:hover": { backgroundColor: "#002bb5" } }} 
          onClick={() => navigate(-1)}
        >
          Geri Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: "30px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Card sx={{ maxWidth: 800, width: "100%", mx: "auto", borderRadius: 4, boxShadow: 6, p: 3, backgroundColor: "#fff" }}>
        <CardContent>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
            {project.name}
          </Typography>

          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Owner: {project.owner}
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            {project.description}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
            <Chip label={`Durum: ${project.status}`} color="primary" />
            <Chip label={`Bitiş Tarihi: ${project.endDate}`} color="secondary" />
            <Chip label={`Üyeler: ${project.members.join(", ")}`} variant="outlined" />
          </Stack>

          <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 3 }}>
            <Button 
              variant="contained" 
              sx={{ backgroundColor: "#003fd3ff", "&:hover": { backgroundColor: "#002bb5" }, textTransform: "none" }} 
              onClick={() => navigate(-1)}
            >
              Geri Dön
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ProjectDetail;