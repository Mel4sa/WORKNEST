import { Box, Typography, Avatar, IconButton } from "@mui/material";
import { GitHub, LinkedIn } from "@mui/icons-material";

function UserProfileHeader({ user }) {
  return (
    <Box sx={{ textAlign: "center", mb: 4 }}>
      <Typography variant="h4" sx={{ 
        fontWeight: "bold", 
        color: "#2c3e50",
        mb: 1
      }}>
        {user.fullname}
      </Typography>
      <Typography variant="h6" sx={{ 
        color: "#6b0f1a", 
        fontWeight: "600",
        mb: 2
      }}>
        {user.username}
      </Typography>
      
      {/* Sosyal Medya İkonları */}
      {((user.github && user.github.trim() !== "") || (user.linkedin && user.linkedin.trim() !== "")) && (
        <Box sx={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: 2, 
          mb: 2 
        }}>
          {user.github && user.github.trim() !== "" && (
            <IconButton
              href={user.github.startsWith("http") ? user.github : `https://${user.github}`}
              target="_blank"
              sx={{ 
                color: "#24292e", 
                backgroundColor: "rgba(36, 41, 46, 0.1)",
                "&:hover": { 
                  backgroundColor: "#24292e", 
                  color: "white",
                  transform: "scale(1.1)",
                  boxShadow: "0 4px 12px rgba(36, 41, 46, 0.3)"
                },
                transition: "all 0.3s ease"
              }}
            >
              <GitHub sx={{ fontSize: 24 }} />
            </IconButton>
          )}
          {user.linkedin && user.linkedin.trim() !== "" && (
            <IconButton
              href={user.linkedin.startsWith("http") ? user.linkedin : `https://${user.linkedin}`}
              target="_blank"
              sx={{ 
                color: "#0077b5", 
                backgroundColor: "rgba(0, 119, 181, 0.1)",
                "&:hover": { 
                  backgroundColor: "#0077b5", 
                  color: "white",
                  transform: "scale(1.1)",
                  boxShadow: "0 4px 12px rgba(0, 119, 181, 0.3)"
                },
                transition: "all 0.3s ease"
              }}
            >
              <LinkedIn sx={{ fontSize: 24 }} />
            </IconButton>
          )}
        </Box>
      )}
      
      {user.title && (
        <Typography variant="body1" sx={{ 
          color: "#666",
          fontStyle: "italic"
        }}>
          {user.title}
        </Typography>
      )}
    </Box>
  );
}

export default UserProfileHeader;
