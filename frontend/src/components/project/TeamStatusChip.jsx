import React from "react";
import { Chip } from "@mui/material";

const statusMap = {
  completed: { label: "Tamamlandı", color: "linear-gradient(45deg, #4caf50, #66bb6a)" },
  ongoing: { label: "Devam Ediyor", color: "linear-gradient(45deg, #ff9800, #ffb74d)" },
  planned: { label: "Planlanıyor", color: "linear-gradient(45deg, #2196f3, #42a5f5)" },
  cancelled: { label: "İptal Edildi", color: "linear-gradient(45deg, #f44336, #ef5350)" },
  on_hold: { label: "Beklemede", color: "linear-gradient(45deg, #9e9e9e, #bdbdbd)" },
  default: { label: "Beklemede", color: "linear-gradient(45deg, #9e9e9e, #bdbdbd)" }
};

export default function TeamStatusChip({ status }) {
  const { label, color } = statusMap[status] || statusMap.default;
  return (
    <Chip
      label={label}
      sx={{
        background: color,
        color: "#fff",
        fontWeight: 600,
        fontSize: "0.95rem",
        px: 2,
        height: 40,
        width: "100%",
        borderRadius: 2
      }}
    />
  );
}
