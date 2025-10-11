import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Button
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

function TeamMembersList({ project, swipedMember, setSwipedMember, onRemoveMember }) {
  const handleMemberAction = (member) => {
    if (swipedMember === member._id) {
      onRemoveMember(member._id);
    } else {
      setSwipedMember(null);
    }
  };

  const handleSwipeStart = (member, startX) => {
    const handleMove = (currentX) => {
      const deltaX = startX - currentX;
      
      if (deltaX > 30) {
        setSwipedMember(member._id);
      } else if (deltaX < -10) {
        setSwipedMember(null);
      }
    };

    return handleMove;
  };

  return (
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
        project.members.map((member, idx) => (
          <Box 
            key={idx} 
            sx={{ 
              position: "relative",
              overflow: "hidden",
              borderRadius: "12px"
            }}
          >
            {/* Silme butonu arka planı */}
            <Box sx={{
              position: "absolute",
              right: 0,
              top: 0,
              height: "100%",
              width: "80px",
              backgroundColor: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px"
            }}>
              <DeleteIcon sx={{ color: "#fff" }} />
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
                transform: swipedMember === member._id ? "translateX(-80px)" : "translateX(0)",
                cursor: "grab",
                "&:active": {
                  cursor: "grabbing"
                }
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                const startX = e.touches[0].clientX;
                const handleMove = handleSwipeStart(member, startX);
                
                const handleTouchMove = (e) => {
                  e.preventDefault();
                  handleMove(e.touches[0].clientX);
                };
                
                const handleTouchEnd = (e) => {
                  e.preventDefault();
                  document.removeEventListener('touchmove', handleTouchMove, { passive: false });
                  document.removeEventListener('touchend', handleTouchEnd, { passive: false });
                };
                
                document.addEventListener('touchmove', handleTouchMove, { passive: false });
                document.addEventListener('touchend', handleTouchEnd, { passive: false });
              }}
              onMouseDown={(e) => {
                const startX = e.clientX;
                const handleMove = handleSwipeStart(member, startX);
                
                const handleMouseMove = (e) => {
                  handleMove(e.clientX);
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
              onClick={() => handleMemberAction(member)}
            >
              <Avatar 
                src={member.profileImage}
                sx={{ width: 45, height: 45 }}
              >
                {member.fullname?.[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: "500" }}>
                  {member.fullname}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Takım Üyesi
                </Typography>
              </Box>
              
              {/* Kaydırma ipucu veya test butonu */}
              {swipedMember !== member._id ? (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                  <Typography variant="caption" sx={{ 
                    color: "#999", 
                    fontSize: "0.7rem",
                    fontStyle: "italic"
                  }}>
                    ← Kaydır
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSwipedMember(member._id);
                    }}
                    sx={{
                      fontSize: "0.7rem",
                      py: 0.5,
                      px: 1,
                      minWidth: "auto"
                    }}
                  >
                    Test
                  </Button>
                </Box>
              ) : (
                <Typography variant="caption" sx={{ 
                  color: "#dc2626", 
                  fontSize: "0.8rem",
                  fontWeight: "600"
                }}>
                  Sil
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
  );
}

export default TeamMembersList;
