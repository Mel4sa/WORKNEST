import React, { useState, useEffect, useRef } from 'react';
import axios from '../lib/axios';

const AIAnalyzer = () => {
  const [projects, setProjects] = useState([]);
  const [mainMode, setMainMode] = useState('chat'); // 'chat' veya 'matching'
  const [currentProject, setCurrentProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [candidateMatches, setCandidateMatches] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Projeleri çek ve ilk projeyi otomatik seç
    axios.get('/projects')
      .then(res => {
        setProjects(res.data);
        // İlk projeyi otomatik seç ve chatı başlat
        if (res.data && res.data.length > 0) {
          const firstProject = res.data[0];
          setCurrentProject(firstProject);
          setMessages([
            {
              type: 'ai',
              text: `Merhaba! "${firstProject.name || firstProject.title}" projesi hakkında sana yardımcı olmak için buradayım. Projeni analiz etmek, ekip üyeleri önerisi almak veya başka konularda konuşabilirsin. Bana ne hakkında sormak istediğini söyle!`,
            },
          ]);
        }
      })
      .catch(() => setProjects([]));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectProject = (projectId) => {
    const project = projects.find(p => (p._id || p.id) === projectId);
    if (project) {
      setCurrentProject(project);
      setMessages([
        {
          type: 'ai',
          text: `Merhaba! "${project.name || project.title}" projesi hakkında sana yardımcı olmak için buradayım. Projeni analiz etmek, ekip üyeleri önerisi almak veya başka konularda konuşabilirsin. Bana ne hakkında sormak istediğini söyle!`,
        },
      ]);
      setError(null);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
    setLoading(true);
    setError(null);

    try {
      const projectContext = currentProject?.idea || currentProject?.description || currentProject?.name;
      const response = await axios.post('/ai/analyze', {
        projectContext,
        message: userMsg,
        projectId: currentProject?._id || currentProject?.id,
      });

      const aiResponse = response.data.result || response.data.message || 'Yanıt oluşturulamadı.';
      setMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
      setError(errorMsg);
      setMessages(prev => [...prev, { type: 'ai', text: `❌ ${errorMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchCandidates = async (projectId) => {
    setMatchLoading(true);
    setError(null);
    try {
      const response = await axios.post('/ai/match-candidates', { projectId });
      setCandidateMatches(response.data.data.candidateMatches || []);
      setMainMode('matching');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Eşleştirme başarısız oldu.';
      setError(errorMsg);
    } finally {
      setMatchLoading(false);
    }
  };

  // Chat Mode - DIREK AÇILIYOR
  if (mainMode === 'chat' && currentProject) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '90vh',
          maxWidth: '800px',
          margin: '0 auto',
          background: '#fff',
          borderRadius: '14px',
          boxShadow: '0 2px 16px #0001',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px', background: '#4f46e5', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>🤖 AI Proje Analisti</h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>{currentProject.name || currentProject.title}</p>
          </div>
          <button
            onClick={() => {
              setMainMode('matching');
              handleMatchCandidates(currentProject._id || currentProject.id);
            }}
            disabled={matchLoading}
            style={{
              padding: '8px 16px',
              background: matchLoading ? '#d1d5db' : '#fff',
              color: '#4f46e5',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: matchLoading ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              whiteSpace: 'nowrap',
            }}
            title="Adayları eşleştir"
          >
            {matchLoading ? '⏳' : '👥 Aday Bul'}
          </button>
        </div>

        {/* Messages Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#f9fafb',
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '8px',
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: msg.type === 'user' ? '#4f46e5' : '#e5e7eb',
                  color: msg.type === 'user' ? '#fff' : '#1f2937',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#6b7280' }}>
              <div style={{ width: '8px', height: '8px', background: '#6b7280', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
              <div style={{ width: '8px', height: '8px', background: '#6b7280', borderRadius: '50%', animation: 'pulse 1s infinite 0.2s' }} />
              <div style={{ width: '8px', height: '8px', background: '#6b7280', borderRadius: '50%', animation: 'pulse 1s infinite 0.4s' }} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: '16px',
            background: '#fff',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Soru Sorma Kısmı */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && !loading && handleSendMessage()}
              placeholder="Sorun veya yorum yaz..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#4f46e5')}
              onBlur={e => (e.target.style.borderColor = '#d1d5db')}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              style={{
                padding: '12px 20px',
                background: loading || !inputMessage.trim() ? '#d1d5db' : '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: loading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                transition: 'background 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              Gönder
            </button>
          </div>

          {/* Proje Seçim Dropdown - Alt Tarafa */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontWeight: '600', color: '#374151', fontSize: '13px', whiteSpace: 'nowrap' }}>📁 Proje:</label>
            <select
              value={currentProject._id || currentProject.id || ''}
              onChange={e => handleSelectProject(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                background: '#fff',
              }}
              onFocus={e => (e.target.style.borderColor = '#4f46e5')}
              onBlur={e => (e.target.style.borderColor = '#d1d5db')}
            >
              {projects.map(project => (
                <option key={project._id || project.id} value={project._id || project.id}>
                  {project.name || project.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#dc2626', borderTop: '1px solid #fecaca', fontSize: '13px' }}>
            ⚠️ {error}
          </div>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // Matching Results View
  if (mainMode === 'matching' && candidateMatches.length > 0) {
    return (
      <div
        style={{
          maxWidth: '1000px',
          margin: '20px auto',
          padding: '20px',
          background: '#fff',
          borderRadius: '14px',
          boxShadow: '0 2px 16px #0001',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', color: '#1f2937' }}>👥 Aday Eşleştirmesi</h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>
              {currentProject?.name || currentProject?.title || 'Proje'} için en uygun adaylar
            </p>
          </div>
          <button
            onClick={() => {
              setMainMode('chat');
              setCandidateMatches([]);
            }}
            style={{
              padding: '10px 20px',
              background: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ← Chat'e Dön
          </button>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          {candidateMatches.map((candidate, idx) => (
            <div
              key={idx}
              style={{
                padding: '20px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                background: candidate.matchPercentage >= 70 ? '#f0fdf4' : '#fef3f2',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px #00000015')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#1f2937' }}>{candidate.userName}</h3>
                  <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Aday ID: {candidate.userId}</p>
                </div>
                <div
                  style={{
                    padding: '8px 16px',
                    background: candidate.matchPercentage >= 70 ? '#10b981' : candidate.matchPercentage >= 50 ? '#f59e0b' : '#ef4444',
                    color: '#fff',
                    borderRadius: '20px',
                    fontWeight: '700',
                    fontSize: '16px',
                  }}
                >
                  {candidate.matchPercentage}%
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#374151', fontSize: '14px' }}>✅ Güçlü Yönleri:</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {candidate.strengths.map((strength, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '6px 12px',
                          background: '#d1fae5',
                          color: '#065f46',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '500',
                        }}
                      >
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#374151', fontSize: '14px' }}>📈 Geliştirilecek Alanlar:</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {candidate.areasToImprove.map((area, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '6px 12px',
                          background: '#fef3c7',
                          color: '#92400e',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '500',
                        }}
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ padding: '12px', background: '#f3f4f6', borderRadius: '8px', borderLeft: '4px solid #4f46e5' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#1f2937', lineHeight: '1.6' }}>
                  <strong>💡 Tavsiye:</strong> {candidate.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default AIAnalyzer;
