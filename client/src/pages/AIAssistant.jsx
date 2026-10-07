import React, { useState, useEffect, useRef } from 'react';
import { aiAPI, progressAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import IBMBadge from '../components/IBMBadge';
import Spinner from '../components/Spinner';

const suggestions = [
  "What should I study today?",
  "What are my weakest topics?",
  "How should I revise before my exam?",
  "Explain recursion in simple terms",
  "How am I doing overall?",
  "Give me a 1-hour study plan",
  "Which subject needs the most attention?"
];

const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your IBM StudyMate AI Assistant, powered by IBM watsonx.ai.\n\nI know your learning profile and progress. Ask me anything about your studies!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const res = await aiAPI.chat(msg);
      setMessages(prev => [...prev, { role: 'ai', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Sorry, I encountered an error. Please try again in a moment.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🤖 AI Study Assistant</h1>
          <p className="page-subtitle">Ask anything about your studies — I know your progress and goals</p>
        </div>
        <IBMBadge />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, alignItems: 'start' }}>
        {/* Chat */}
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role === 'user' ? 'user' : 'ai'}`}>
                {msg.role === 'ai' && (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0f62fe', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                    🤖
                  </div>
                )}
                <div className="message-bubble">{msg.content}</div>
                {msg.role === 'user' && (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gray-20)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                    👤
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="message ai">
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0f62fe', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🤖</div>
                <div className="message-bubble" style={{ background: 'var(--gray-10)' }}>
                  <Spinner size={16} label="Thinking..." />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              className="chat-input"
              placeholder="Ask me anything about your studies..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoFocus
            />
            <button
              className="btn btn-primary"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{ borderRadius: 24, padding: '10px 20px' }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Sidebar: suggestions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card">
            <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 12 }}>💡 Quick Questions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {suggestions.map(s => (
                <button
                  key={s}
                  className="btn btn-secondary btn-sm"
                  style={{ textAlign: 'left', fontSize: '0.8rem', lineHeight: 1.3, height: 'auto', padding: '8px 10px', whiteSpace: 'normal' }}
                  onClick={() => sendMessage(s)}
                  disabled={loading}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ fontSize: '0.8125rem' }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>ℹ️ About This Assistant</div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              This AI assistant is powered by <strong>IBM watsonx.ai</strong> (Granite model). It uses your profile, progress data, and weak topics to give personalized study advice.
            </p>
            <div style={{ marginTop: 10 }}>
              <IBMBadge />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
