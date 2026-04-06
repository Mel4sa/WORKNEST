import axios from "../lib/axios";
import { useEffect, useState } from "react";

export default function useSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("/api/skills")
      .then(res => setSkills(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  // Yeni skill ekleme fonksiyonu
  const addSkill = async (name) => {
    try {
      const res = await axios.post("/api/skills", { name });
      setSkills(prev => prev.includes(res.data) ? prev : [...prev, res.data]);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return { skills, loading, error, addSkill };
}
