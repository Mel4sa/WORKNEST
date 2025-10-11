import { useState, useEffect } from "react";
import { TextField, Autocomplete } from "@mui/material";
import universitiesData from "../../data/universities.json";

export default function UniversitySelect({ value, onChange }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    setOptions(universitiesData);
  }, []);

  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      filterSelectedOptions
      autoHighlight
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "30px", // oval yapıldı
          "&.Mui-focused fieldset": { borderColor: "#915d56" },
          "& fieldset": { borderColor: "#915d56" },
        },
        "& .MuiAutocomplete-inputRoot": {
          padding: "2px 10px !important",
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Üniversite"
          variant="outlined"
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "30px",
              "& fieldset": { borderColor: "#915d56" },
              "&:hover fieldset": { borderColor: "#7a4b45" },
              "&.Mui-focused fieldset": { borderColor: "#7a4b45" },
            },
          }}
        />
      )}
      filterOptions={(options, { inputValue }) =>
        options.filter(option =>
          option.toLowerCase().includes(inputValue.toLowerCase())
        )
      }
    />
  );
}
