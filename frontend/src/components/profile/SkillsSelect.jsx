import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Autocomplete,
  TextField,
} from "@mui/material";
import skillsData from "../../data/skills.json";

const SkillsSelect = ({ skills = [], onChange }) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddSkill = (event, newValue, reason) => {
    if (reason === 'selectOption' || reason === 'createOption') {
      const skillToAdd = typeof newValue === 'string' ? newValue.trim() : newValue?.trim();
      if (skillToAdd && !skills.includes(skillToAdd)) {
        onChange([...skills, skillToAdd]);
      }
    }
    // Her durumda input'u temizle
    setInputValue("");
  };

  const handleDeleteSkill = (skillToDelete) => {
    onChange(skills.filter((skill) => skill !== skillToDelete));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && inputValue.trim()) {
      event.preventDefault();
      const skillToAdd = inputValue.trim();
      if (skillToAdd && !skills.includes(skillToAdd)) {
        onChange([...skills, skillToAdd]);
      }
      // Input'u her zaman temizle
      setInputValue("");
    }
  };

  // Mevcut yetenekleri hariç tutarak seçenekleri filtrele
  const availableOptions = skillsData.filter(skill => !skills.includes(skill));

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: "#6b0f1a" }}>
        Yetenekler
      </Typography>
      
      {/* Mevcut Yetenekler */}
      {skills.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
          {skills.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              onDelete={() => handleDeleteSkill(skill)}
              sx={{
                mb: 1,
                borderRadius: "12px",
                bgcolor: "#003fd3ff",
                color: "#fff",
                fontWeight: 500,
                "& .MuiChip-deleteIcon": { color: "#fff" },
              }}
            />
          ))}
        </Stack>
      )}

      {/* Yetenek Ekleme Input'u */}
      <Autocomplete
        freeSolo
        options={availableOptions}
        value="" // Boş value ile her zaman temizlenmiş kalır
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={handleAddSkill}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Yetenek Ekle"
            onKeyDown={handleKeyDown}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                "& fieldset": { borderColor: "#003fd3ff" },
                "&:hover fieldset": { borderColor: "#0056b3" },
                "&.Mui-focused fieldset": { borderColor: "#003fd3ff" },
              },
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            {option}
          </Box>
        )}
        noOptionsText="Yeni yetenek eklemek için yazın ve Enter'a basın"
        loadingText="Yükleniyor..."
        clearOnEscape
        clearOnBlur
        blurOnSelect
        selectOnFocus
        handleHomeEndKeys
      />

      {/* Bilgi Notu */}
      <Typography variant="caption" sx={{ color: "#666", mt: 2, display: "block" }}>
        Popüler yetenekleri seçebilir veya kendi yeteneğinizi yazıp Enter'a basabilirsiniz
      </Typography>
    </Box>
  );
};

export default SkillsSelect;
