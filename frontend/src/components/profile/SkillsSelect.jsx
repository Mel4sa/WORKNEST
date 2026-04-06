

import { useState, useEffect } from "react";
import { Box, Typography, Chip, Stack, Autocomplete, TextField } from "@mui/material";
import axios from "../../lib/axios";

  const SkillsSelect = ({ skills = [], onChange }) => {
    const [inputValue, setInputValue] = useState("");
    const [allSkills, setAllSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
  axios.get("skills")
        .then(res => {
          setAllSkills(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Skill yükleme hatası:", err);
          setLoading(false);
        });
    }, []);


    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const handleAddSkill = async (event, newValue, reason) => {
      let skillToAdd = typeof newValue === 'string' ? newValue.trim() : newValue?.trim();
      if (skillToAdd) skillToAdd = capitalize(skillToAdd);
      if (skillToAdd && !skills.includes(skillToAdd)) {
        try {
          await axios.post('skills', { name: skillToAdd });
        } catch (err) {}
        onChange([...skills, skillToAdd]);
        // Eklenen skill'i autocomplete seçeneklerine de ekle
        setAllSkills((prev) => prev.includes(skillToAdd) ? prev : [...prev, skillToAdd]);
      }
      setInputValue("");
    };

    const handleDeleteSkill = (skillToDelete) => {
      onChange(skills.filter((skill) => skill !== skillToDelete));
    };

    const handleKeyDown = async (event) => {
      if (event.key === 'Enter' && inputValue.trim()) {
        event.preventDefault();
        let skillToAdd = inputValue.trim();
        if (skillToAdd) skillToAdd = capitalize(skillToAdd);
        if (skillToAdd && !skills.includes(skillToAdd)) {
          try {
            await axios.post('skills', { name: skillToAdd });
          } catch (err) {}
          onChange([...skills, skillToAdd]);
          setAllSkills((prev) => prev.includes(skillToAdd) ? prev : [...prev, skillToAdd]);
        }
        setInputValue("");
      }
    };

    const availableOptions = allSkills.filter(skill => !skills.includes(skill));

    return (
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: "#6b0f1a" }}>
          Yetenekler
        </Typography>
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
        <Autocomplete
          freeSolo
          options={availableOptions}
          value=""
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
          onChange={handleAddSkill}
          loading={loading}
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
            <Box component="li" {...props}>{option}</Box>
          )}
          noOptionsText="Yeni yetenek eklemek için yazın ve Enter'a basın"
          loadingText="Yükleniyor..."
          clearOnEscape
          clearOnBlur
          blurOnSelect
          selectOnFocus
          handleHomeEndKeys
        />
        <Typography variant="caption" sx={{ color: "#666", mt: 2, display: "block" }}>
          Popüler yetenekleri seçebilir veya kendi yeteneğinizi yazıp Enter'a basabilirsiniz
        </Typography>
      </Box>
    );
  };

  export default SkillsSelect;
        
