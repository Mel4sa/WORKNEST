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
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

function TeamMembersList({ project, onRemoveMember, currentUser }) {

  return (
    <Card>
      <CardContent>
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
                p: 2,
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                minHeight: "76px",
                mb: 1
              }}
            >
              <Avatar
                src={member.user?.profileImage || member.profileImage}
                sx={{ width: 45, height: 45 }}
              >
                {(member.user?.fullname || member.fullname)?.[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500, color: '#6b0f1a' }}
                >
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
              {currentUser && project.owner && currentUser._id === project.owner._id ? (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  sx={{ minWidth: 32, width: 32, height: 32, borderRadius: '50%' }}
                  onClick={() => onRemoveMember(member.user?._id || member._id)}
                >
                  <DeleteIcon fontSize="small" />
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  sx={{ minWidth: 32, width: 32, height: 32, borderRadius: '50%' }}
                  disabled
                >
                  <DeleteIcon fontSize="small" />
                </Button>
              )}
            </Box>
          ))
        ) : (
          <Box sx={{ textAlign: "center", py: 3, border: "2px dashed #e5e7eb", borderRadius: "12px", mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Henüz başka takım üyesi yok
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default TeamMembersList;
