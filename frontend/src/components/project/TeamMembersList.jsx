import React from "react";

import {
  Box,
  Typography,
  Avatar,
  Button
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

function TeamMembersList({ project, onRemoveMember, currentUser }) {

return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Avatar
          src={project.owner?.profileImage}
          sx={{ width: 50, height: 50, border: "2px solid #6b0f1a" }}
        >
          {project.owner?.fullname?.[0]}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#6b0f1a' }}>
            {project.owner?.fullname}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Proje Lideri
          </Typography>
        </Box>
      </Box>
      {project.members && project.members.length > 0 ? (
        project.members
          .filter(member => {
            const memberUserId = member.user?._id || member._id;
            return memberUserId !== project.owner?._id;
          })
          .map((member, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 1.5,
              minHeight: "60px",
              mb: 1.5,
              borderBottom: "1px solid #F1F5F9",
              "&:last-child": { borderBottom: "none" }
            }}
          >
            <Avatar
              src={member.user?.profileImage || member.profileImage}
              sx={{ width: 40, height: 40 }}
            >
              {(member.user?.fullname || member.fullname)?.[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: 500, color: '#1E293B' }}
              >
                {member.user?.fullname || member.fullname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {member.user?.title || "Takım Üyesi"}
              </Typography>
            </Box>
            {currentUser && project.owner && currentUser._id === project.owner._id ? (
              <Button
                variant="text"
                color="error"
                size="small"
                sx={{ minWidth: 32, width: 32, height: 32 }}
                onClick={() => onRemoveMember(member.user?._id || member._id)}
              >
                <DeleteIcon fontSize="small" />
              </Button>
            ) : (
              <Button
                variant="text"
                color="error"
                size="small"
                sx={{ minWidth: 32, width: 32, height: 32 }}
                disabled
              >
                <DeleteIcon fontSize="small" />
              </Button>
            )}
          </Box>
        ))
      ) : (
        <Box sx={{ textAlign: "center", py: 3, border: "2px dashed #E2E8F0", borderRadius: "12px", mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Henüz başka takım üyesi yok
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default TeamMembersList;
