import React, { useState, useEffect } from 'react';
import axiosInstance from '../lib/axios';
import { BrainCircuit, Loader2, Users, Target, CheckCircle, Sparkles, Send, Briefcase, FileText, XCircle } from 'lucide-react';
import ProfileSnackbar from '../components/profile/ProfileSnackbar';

const AIAnalyzer = () => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [inputType, setInputType] = useState('existing');
  const [selectedProject, setSelectedProject] = useState('');
  const [customProject, setCustomProject] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  
  const [invitedUsers, setInvitedUsers] = useState({});

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const response = await axiosInstance.get("/projects/my-projects");
        setProjects(response.data.projects || []);
      } catch {
        setProjectsError("Projeler yüklenemedi.");
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  const handleAnalyze = async () => {
    if (inputType === 'existing' && !selectedProject) return;
    if (inputType === 'custom' && !customProject) return;
    setIsAnalyzing(true);
    setResult(null);

    let extractedSkills = [];
    if (inputType === 'existing') {
      const selected = projects.find(p => p._id === selectedProject);
      if (selected && selected.skills && selected.skills.length > 0) {
        extractedSkills = selected.skills;
      }
    } else {
      extractedSkills = ["React", "Node.js", "MongoDB", "TypeScript", "REST API", "UI/UX Tasarım"];
    }

    try {
      const usersRes = await axiosInstance.get("/users");
      const users = usersRes.data || [];

      let myId = null;
      try {
        const meRes = await axiosInstance.get("/users/me");
        myId = meRes.data?._id;
      } catch (e) {
        console.warn('Could not fetch current user for excluding from results:', e);
      }

      const candidates = users
        .filter(u => u.skills && Array.isArray(u.skills) && u.skills.length > 0 && (!myId || u._id !== myId))
        .map(u => {
          const matchedSkills = extractedSkills.filter(skill => u.skills.map(s => s.toLowerCase()).includes(skill.toLowerCase()));
          const missingSkills = extractedSkills.filter(skill => !u.skills.map(s => s.toLowerCase()).includes(skill.toLowerCase()));
          const matchScore = extractedSkills.length > 0 ? Math.round((matchedSkills.length / extractedSkills.length) * 100) : 0;
          return {
            id: u._id,
            name: u.fullname || u.username || "Kullanıcı",
            department: u.department || u.email || "-",
            matchScore,
            matchedSkills,
            missingSkills,
            avatar: (u.fullname ? u.fullname.split(" ").map(x=>x[0]).join("") : (u.username ? u.username[0] : "U")).toUpperCase(),
            profileImage: u.profileImage || null
          };
        })
        .filter(c => c.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

      setResult({
        extractedSkills,
        candidates
      });
    } catch  {
      setResult({
        extractedSkills,
        candidates: []
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInvite = async (userId) => {
    if (!selectedProject) return;
    const key = `${selectedProject}_${userId}`;
    setInvitedUsers(prev => ({ ...prev, [key]: 'loading' }));
    try {
      const selected = projects.find(p => p._id === selectedProject);
      const projectTitle = selected?.title || "bir proje";
      const message = `Sizi '${projectTitle}' projesini birlikte yapmak için ekibine davet ediyor!`;
      await axiosInstance.post("/invites/send", {
        projectId: selectedProject,
        receiverId: userId,
        message
      });
      setInvitedUsers(prev => ({ ...prev, [key]: true }));
    } catch (e) {
      setInvitedUsers(prev => ({ ...prev, [key]: false }));
      const errorMsg = e?.response?.data?.message;
      if (errorMsg && errorMsg.includes("zaten bekleyen bir davet")) {
        setSnackbar({ open: true, message: "Bu kullanıcıya zaten bekleyen bir davet var! Lütfen başka birini seçin veya daveti geri çekin.", severity: "error" });
      } else {
        setSnackbar({ open: true, message: "Davet gönderilemedi: " + (errorMsg || "Bir hata oluştu"), severity: "error" });
      }
    }
  };

  const handleRevokeInvite = async (userId) => {
    if (!selectedProject) return;
    const key = `${selectedProject}_${userId}`;
    setInvitedUsers(prev => ({ ...prev, [key]: 'revoking' }));
    try {
      await axiosInstance.post("/invites/revoke", {
        projectId: selectedProject,
        receiverId: userId
      });
      setInvitedUsers(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    } catch (e) {
      setInvitedUsers(prev => ({ ...prev, [key]: true }));
      const errorMsg = e?.response?.data?.message;
      if (
        (e?.response?.status === 404) ||
        (errorMsg && (errorMsg.toLowerCase().includes("not found") || errorMsg.toLowerCase().includes("bulunamadı")))
      ) {
        setSnackbar({ open: true, message: "Davet geri çekme özelliği şu anda desteklenmiyor veya backend'de bu endpoint yok. Lütfen yöneticinize başvurun.", severity: "error" });
      } else {
        setSnackbar({ open: true, message: "Davet geri çekilemedi: " + (errorMsg || "Bir hata oluştu"), severity: "error" });
      }
    }
  };

  return (
    <>
      <ProfileSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      />
      <div className="min-h-screen bg-gradient-to-br from-[#fff6f6] via-[#f4f6f8] to-[#fff6f6] p-6 md:p-12 font-sans text-black">
        <div className="max-w-6xl mx-auto space-y-10">
          <header className="flex flex-col items-center text-center space-y-4 pt-4 pb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-[#a82936] blur-xl opacity-30 rounded-full"></div>
              <div className="relative bg-gradient-to-tr from-[#6b0f1a] to-[#a82936] p-4 rounded-2xl shadow-xl border border-white/20">
                <Users className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-[#a82936] tracking-tight">
                Yapay Zeka ile Ekip Arkadaşı Bul
              </h1>
              <p className="text-black mt-2 font-medium max-w-xl mx-auto">
                Projenizin ihtiyaçlarını yapay zekaya analiz ettirin ve veritabanındaki en uygun becerileri keşfedip ekibinize davet edin.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgba(107,15,26,0.06)] border border-[#a82936]/20 flex flex-col space-y-6 relative overflow-hidden h-fit">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none"></div>

              <div className="relative z-10 flex space-x-2 bg-[#f4e6e8]/60 p-1.5 rounded-xl border border-[#a82936]/20">
                <button 
                  onClick={() => setInputType('existing')}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${inputType === 'existing' ? 'bg-white text-[#6b0f1a] shadow-sm' : 'text-[#a82936] hover:text-[#6b0f1a]'}`}
                >
                  <Briefcase className="w-4 h-4 mr-2" /> Kayıtlı Projelerim
                </button>
                <button 
                  onClick={() => setInputType('custom')}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${inputType === 'custom' ? 'bg-white text-[#a82936] shadow-sm' : 'text-[#6b0f1a] hover:text-[#a82936]'}`}
                >
                  <FileText className="w-4 h-4 mr-2" /> Yeni Fikir
                </button>
              </div>

              <div className="relative z-10 min-h-[160px]">
                {inputType === 'existing' ? (
                  <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                    <label className="block text-sm font-bold text-slate-700">Üzerinde Çalıştığınız Bir Projeyi Seçin</label>
                    {loadingProjects ? (
                      <div className="text-center text-[#a82936] py-4">Projeler yükleniyor...</div>
                    ) : projectsError ? (
                      <div className="text-center text-red-500 py-4">{projectsError}</div>
                    ) : projects.length === 0 ? (
                      <div className="text-center text-[#a82936] py-4">Hiç projeniz yok.</div>
                    ) : (
                      <div className="space-y-2">
                        {projects.map(proj => (
                          <button
                            key={proj._id}
                            onClick={() => setSelectedProject(proj._id)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${selectedProject === proj._id ? 'bg-[#f4e6e8] border-[#a82936] ring-1 ring-[#a82936]' : 'bg-white/50 border-slate-200 hover:border-[#a82936]/40'}`}
                          >
                            <p className={`text-sm font-semibold ${selectedProject === proj._id ? 'text-[#a82936]' : 'text-black'}`}>{proj.title}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-300">
                    <label className="block text-sm font-bold text-slate-700">Yeni Proje Fikrinizi Anlatın</label>
                    <textarea
                      value={customProject}
                      onChange={(e) => setCustomProject(e.target.value)}
                      placeholder="Örn: React, Tailwind ve Node.js kullanarak geliştireceğim kampüs içi kütüphane otomasyonu için veri tabanı mimarisini kuracak ve frontend'e destek olacak birine ihtiyacım var..."
                      className="w-full h-40 p-5 rounded-2xl bg-white/50 border border-[#a82936]/30 focus:bg-white focus:ring-4 focus:ring-[#a82936]/20 focus:border-[#a82936] outline-none transition-all resize-none shadow-inner placeholder:text-[#64748b]"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (inputType === 'existing' && !selectedProject) || (inputType === 'custom' && !customProject)}
                className={`relative z-10 w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center space-x-2 group overflow-hidden ${
                  isAnalyzing || (inputType === 'existing' && !selectedProject) || (inputType === 'custom' && !customProject)
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#6b0f1a] to-[#a82936] hover:from-[#a82936] hover:to-[#6b0f1a] shadow-lg hover:shadow-[#a82936]/30 hover:-translate-y-0.5'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Adaylar Taranıyor...</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-5 h-5 group-hover:animate-pulse" />
                    <span>Analiz Et ve Ekip Öner</span>
                  </>
                )}
              </button>
            </div>

            <div className="lg:col-span-7 bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgba(107,15,26,0.06)] border border-[#6b0f1a]/10 min-h-[500px] flex flex-col relative overflow-hidden">
              
              {!result && !isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-6 m-auto">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                    <Target className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                  </div>
                  <p className="text-center px-8 text-sm font-medium leading-relaxed">
                    Proje seçimi yaptıktan sonra yapay zeka veritabanındaki<br/>öğrenci profillerini tarayarak en uygun adayları listeleyecektir.
                  </p>
                </div>
              )}

              {isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center space-y-6 m-auto">
                  <div className="relative flex items-center justify-center">
                    <div className="w-24 h-24 border-4 border-indigo-100 rounded-full animate-pulse"></div>
                    <div className="w-24 h-24 border-4 border-purple-500 rounded-full border-t-transparent animate-spin absolute"></div>
                    <Sparkles className="w-8 h-8 text-purple-600 absolute animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-xl animate-pulse">
                      Proje Gereksinimleri Çıkarılıyor
                    </p>
                    <p className="text-slate-500 text-sm font-medium">Veritabanındaki yetenek setleriyle eşleştiriliyor...</p>
                  </div>
                </div>
              )}

              {result && !isAnalyzing && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  
                  <div className="bg-[#f4e6e8]/60 border border-[#a82936]/20 p-5 rounded-2xl">
                    <p className="text-xs font-bold text-black uppercase tracking-wider mb-3 flex items-center">
                      <BrainCircuit className="w-4 h-4 mr-2" /> LLM Tarafından Çıkarılan Proje İhtiyaçları
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.extractedSkills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white text-black text-xs font-bold rounded-full border border-[#a82936]/30 shadow-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-4"></div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-black">Önerilen Ekip Arkadaşları</h3>
                    
                    {result.candidates.map((candidate) => (
                      <div key={candidate.id} className="bg-white border border-[#a82936]/20 p-5 rounded-2xl shadow-sm hover:shadow-[#a82936]/10 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          
                          <div className="flex items-center space-x-4">
                            {candidate.profileImage ? (
                              <img
                                src={candidate.profileImage}
                                alt={candidate.name}
                                className="w-12 h-12 rounded-full object-cover border border-[#a82936]/30 bg-white"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f4e6e8] to-[#fff6f6] flex items-center justify-center text-[#a82936] font-bold text-lg border border-[#a82936]/30">
                                {candidate.avatar}
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-black">{candidate.name}</h4>
                              <p className="text-xs text-black font-medium">{candidate.department}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-right mr-2">
                              <span className="text-2xl font-black text-[#a82936]">%{candidate.matchScore}</span>
                              <p className="text-[10px] uppercase font-bold text-black/60">Uyum</p>
                            </div>
                            {(() => {
                              const inviteKey = `${selectedProject}_${candidate.id}`;
                              const invited = invitedUsers[inviteKey] === true;
                              const loading = invitedUsers[inviteKey] === 'loading';
                              const revoking = invitedUsers[inviteKey] === 'revoking';
                              return (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleInvite(candidate.id)}
                                    disabled={invited || loading || revoking}
                                    className={`p-2 rounded-lg font-bold text-sm flex items-center transition-all border ${
                                      invited
                                        ? 'bg-[#f4e6e8] text-[#a82936] border-[#a82936]/30 cursor-not-allowed'
                                        : loading
                                          ? 'bg-slate-200 text-slate-400 border-slate-200 cursor-wait'
                                          : 'bg-gradient-to-r from-[#6b0f1a] to-[#a82936] text-white border-[#a82936]/40 hover:from-[#a82936] hover:to-[#6b0f1a] shadow-sm'
                                    }`}
                                    title="Davet Gönder"
                                  >
                                    {loading ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : invited ? (
                                      <CheckCircle className="w-4 h-4" />
                                    ) : (
                                      <Send className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleRevokeInvite(candidate.id)}
                                    disabled={!invited || revoking}
                                    className={`p-2 rounded-lg font-bold text-sm flex items-center transition-all border ${
                                      !invited
                                        ? 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed'
                                        : revoking
                                          ? 'bg-slate-200 text-slate-400 border-slate-200 cursor-wait'
                                          : 'bg-gradient-to-r from-[#fff6f6] to-[#f4e6e8] text-[#a82936] border-[#a82936]/20 hover:bg-[#f4e6e8]'
                                    }`}
                                    title="Davet Geri Çek"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-black mb-2 flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" /> Eşleşen Beceriler
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {candidate.matchedSkills.map((s, i) => (
                                <span key={i} className="px-2.5 py-1 bg-[#fff6f6] text-black text-[10px] font-bold rounded-md border border-[#a82936]/30">{s}</span>
                              ))}
                            </div>
                          </div>
                          {candidate.missingSkills.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-black/80 mb-2 flex items-center">
                                <XCircle className="w-3 h-3 mr-1" /> Eksik / Geliştirilebilir Beceriler
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {candidate.missingSkills.map((s, i) => (
                                  <span key={i} className="px-2.5 py-1 bg-[#f4e6e8] text-black/80 text-[10px] font-bold rounded-md border border-[#a82936]/20">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 

export default AIAnalyzer;