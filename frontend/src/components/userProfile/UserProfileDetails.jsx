import { Box, Typography, Chip, Stack } from "@mui/material";

function UserProfileDetails({ user }) {
  return (
    <>
      {/* Eğitim Bilgileri */}
      {(user.university || user.department) && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: "600", 
            color: "#2c3e50",
            mb: 2
          }}>
            Eğitim
          </Typography>
          {user.university && (
            <Typography variant="body1" sx={{ mb: 1 }}>
              🎓 {user.university}
            </Typography>
          )}
          {user.department && (
            <Typography variant="body1" sx={{ color: "#666" }}>
              📚 {user.department}
            </Typography>
          )}
        </Box>
      )}

      {/* Hakkında */}
      {user.bio && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: "600", 
            color: "#2c3e50",
            mb: 2
          }}>
            Hakkında
          </Typography>
          <Typography variant="body1" sx={{ 
            lineHeight: 1.8,
            color: "#555"
          }}>
            {user.bio}
          </Typography>
        </Box>
      )}

      {/* Yetenekler */}
      {user.skills && user.skills.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: "600", 
            color: "#2c3e50",
            mb: 2
          }}>
            Yetenekler
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {user.skills.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                sx={{
                  bgcolor: "#f0f9ff",
                  color: "#0369a1",
                  fontWeight: "500",
                  borderRadius: "8px",
                  "&:hover": {
                    bgcolor: "#e0f2fe"
                  }
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Üyelik Tarihi */}
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="body2" sx={{ color: "#666" }}>
          {new Date(user.createdAt).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} tarihinde katıldı
        </Typography>
      </Box>
    </>
  );
}

export default UserProfileDetails;
