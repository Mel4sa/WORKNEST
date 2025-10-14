import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
  Stack,
  Chip
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

function TeamMembersList({ project, swipedMember, onSwipeStart, onRemoveMember, currentUser, onCancelProject, onDeleteProject }) {
  return (
    <Card sx={{ 
      borderRadius: "20px", 
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)", 
      height: { xs: "auto", lg: "600px" },
      display: "flex",
      flexDirection: "column"
    }}>
      <CardContent sx={{ 
        p: 3,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "auto"
      }}>
        {/* Takım Başlığı ve Durum */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: "600", color: "#6b0f1a" }}>
            Takım Üyeleri
          </Typography>
          <Chip
            label={
              project.status === "completed" ? "Tamamlandı" :
              project.status === "ongoing" ? "Devam Ediyor" :
              project.status === "planned" ? "Planlanıyor" :
              project.status === "cancelled" ? "İptal Edildi" :
              project.status === "on_hold" ? "Beklemede" :
              "Beklemede"
            }
            sx={{
              background: 
                project.status === "completed" ? "linear-gradient(45deg, #4caf50, #66bb6a)" :
                project.status === "ongoing" ? "linear-gradient(45deg, #ff9800, #ffb74d)" :
                project.status === "planned" ? "linear-gradient(45deg, #2196f3, #42a5f5)" :
                project.status === "cancelled" ? "linear-gradient(45deg, #f44336, #ef5350)" :
                project.status === "on_hold" ? "linear-gradient(45deg, #9e9e9e, #bdbdbd)" :
                "linear-gradient(45deg, #9e9e9e, #bdbdbd)",
              color: "#fff",
              fontWeight: "600",
              fontSize: "0.8rem"
            }}
          />
        </Box>

        {/* Üye Sayısı */}
        <Typography variant="body2" sx={{ color: "#666", mb: 3 }}>
          {(() => {
            const regularMembers = project.members?.filter(member => {
              const memberUserId = member.user?._id || member._id;
              return memberUserId !== project.owner?._id;
            }).length || 0;
            const totalMembers = regularMembers + 1; // +1 proje lideri için
            return `${totalMembers} üye (1 lider + ${regularMembers} üye)`;
          })()}
        </Typography>

        {/* Üyeler Listesi */}
        <Box sx={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: 2,
          flex: 1,
          overflow: "auto"
        }}>
          {/* Proje Lideri */}
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 2,
            p: 2,
            backgroundColor: "#f8f9fa",
            borderRadius: "12px",
            border: "2px solid #6b0f1a"
          }}>
            <Avatar 
              src={project.owner?.profileImage}
              sx={{ width: 45, height: 45 }}
            >
              {project.owner?.fullname?.[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: "600" }}>
                {project.owner?.fullname}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b0f1a", fontWeight: "500" }}>
                Proje Lideri
              </Typography>
            </Box>
          </Box>

          {/* Diğer Üyeler */}
          {project.members && project.members.length > 0 ? (
            project.members
              .filter(member => {
                // Proje liderini üyeler listesinden çıkar
                const memberUserId = member.user?._id || member._id;
                return memberUserId !== project.owner?._id;
              })
              .map((member, idx) => (
              <Box 
                key={idx} 
                sx={{ 
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "12px"
                }}
              >
                {/* Silme butonu arka planı */}
                <Box 
                  sx={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    height: "100%",
                    width: "80px",
                    backgroundColor: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "12px",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "#b91c1c"
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const memberId = member.user?._id || member._id;
                    console.log("🔍 Silinecek üye bilgileri:", {
                      memberId,
                      memberObject: member,
                      userObject: member.user
                    });
                    onRemoveMember(memberId);
                  }}
                >
                  <Typography sx={{ color: "#fff", fontWeight: "bold", fontSize: "0.9rem" }}>
                    Sil
                  </Typography>
                </Box>
                
                {/* Üye kartı */}
                <Box 
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 2,
                    p: 2,
                    backgroundColor: "#f8f9fa",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    position: "relative",
                    zIndex: 1,
                    transition: "transform 0.3s ease",
                    transform: swipedMember === (member.user?._id || member._id) ? "translateX(-80px)" : "translateX(0)",
                    cursor: "grab",
                    "&:active": {
                      cursor: "grabbing"
                    }
                  }}
                  onTouchStart={(e) => onSwipeStart(e, member.user?._id || member._id)}
                  onMouseDown={(e) => onSwipeStart(e, member.user?._id || member._id)}
                  onClick={() => {
                    // Eğer zaten kaydırılmışsa kaydırmayı kapat
                    if (swipedMember === (member.user?._id || member._id)) {
                      onSwipeStart({ type: 'mousedown', clientX: 0 }, null);
                    }
                  }}
                >
                  <Avatar 
                    src={member.user?.profileImage || member.profileImage}
                    sx={{ width: 45, height: 45 }}
                  >
                    {(member.user?.fullname || member.fullname)?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: "500" }}>
                      {member.user?.fullname || member.fullname}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.user?.title || "Takım Üyesi"}
                    </Typography>
                    {member.user?.department && (
                      <Typography variant="caption" sx={{ color: "#666", fontSize: "0.75rem" }}>
                        {member.user.department}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Kaydırma ipucu */}
                  {swipedMember !== (member.user?._id || member._id) && (
                    <Typography variant="caption" sx={{ 
                      color: "#666", 
                      fontSize: "0.7rem", 
                      opacity: 0.7,
                      ml: "auto"
                    }}>
                      ← Kaydır
                    </Typography>
                  )}
                </Box>
              </Box>
            ))
          ) : (
            <Box sx={{ 
              textAlign: "center", 
              py: 3,
              border: "2px dashed #e5e7eb",
              borderRadius: "12px"
            }}>
              <Typography variant="body2" color="text.secondary">
                Henüz başka takım üyesi yok
              </Typography>
            </Box>
          )}
        </Box>

        {/* Proje Yönetim Butonları - Sadece proje sahibi için */}
        {currentUser && project.owner?._id === currentUser._id && (
          <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #e5e7eb" }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#2c3e50", fontWeight: 600 }}>
              Proje Yönetimi
            </Typography>
            <Stack spacing={2}>
              {project.status !== "completed" && project.status !== "cancelled" && (
                <Button
                  variant="outlined"
                  color="warning"
                  fullWidth
                  sx={{
                    borderRadius: "12px",
                    py: 1.5,
                    borderColor: "#f59e0b",
                    color: "#f59e0b",
                    fontWeight: "600",
                    "&:hover": {
                      borderColor: "#d97706",
                      backgroundColor: "rgba(245, 158, 11, 0.04)",
                      transform: "translateY(-1px)"
                    },
                    transition: "all 0.3s ease"
                  }}
                  onClick={onCancelProject}
                >
                  Projeyi İptal Et
                </Button>
              )}
              
              <Button
                variant="outlined"
                color="error"
                fullWidth
                sx={{
                  borderRadius: "12px",
                  py: 1.5,
                  borderColor: "#dc2626",
                  color: "#dc2626",
                  fontWeight: "600",
                  "&:hover": {
                    borderColor: "#b91c1c",
                    backgroundColor: "rgba(220, 38, 38, 0.04)",
                    transform: "translateY(-1px)"
                  },
                  transition: "all 0.3s ease"
                }}
                onClick={onDeleteProject}
              >
                Projeyi Sil
              </Button>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default TeamMembersList;
