import { useState, useRef, useEffect, useCallback } from 'react';
import { chatWithMistral } from '../../services/huggingface';
import { toast } from '../Toast';
import { MessageCircle, X, Send, Trash2, Bot, User, Loader2 } from 'lucide-react';

const CHAT_STORAGE_KEY = 'iss-chat-history';
const MAX_MESSAGES = 30;

const SUGGESTIONS = [
  'Where is the ISS right now?',
  'How fast is the ISS moving?',
  'Who is in space currently?',
  'What are the latest technology news?',
  'Summarize the top news headline.',
];

export default function Chatbot({ dashboardContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const saveMessages = (msgs) => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_MESSAGES)));
    } catch {}
  };

  const sendMessage = useCallback(async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || isTyping) return;

    const newMessages = [...messages, { role: 'user', content: userMsg, time: new Date().toISOString() }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);
    saveMessages(newMessages);

    try {
      const reply = await chatWithMistral(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        dashboardContext || {}
      );
      const updated = [...newMessages, { role: 'assistant', content: reply, time: new Date().toISOString() }];
      setMessages(updated.slice(-MAX_MESSAGES));
      saveMessages(updated);
    } catch (err) {
      const errorMsg = [...newMessages, {
        role: 'assistant',
        content: '⚠️ I had trouble connecting to the AI service. Please try again.',
        time: new Date().toISOString(),
        isError: true,
      }];
      setMessages(errorMsg);
      saveMessages(errorMsg);
      toast.error('Chatbot connection failed');
    } finally {
      setIsTyping(false);
    }
  }, [input, messages, isTyping, dashboardContext]);

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
    toast.success('Chat cleared');
  };

  const formatTime = (iso) => {
    try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
          width: 58, height: 58, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(59,130,246,0.5)',
          transition: 'all 0.3s ease',
          animation: 'pulse-glow 3s ease-in-out infinite',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(59,130,246,0.7)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.5)'; }}
        title="Open AI Chatbot"
      >
        {isOpen ? <X size={22} color="white" /> : <MessageCircle size={22} color="white" />}
        {messages.length > 0 && !isOpen && (
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 18, height: 18,
            borderRadius: '50%', background: '#ef4444',
            border: '2px solid var(--bg-primary)',
            fontSize: 9, fontWeight: 700, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {Math.min(messages.length, 9)}+
          </div>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 100, right: 28, zIndex: 999,
          width: 380, maxHeight: 560,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          animation: 'slide-up 0.3s ease',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 18px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={18} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>ISS AI Assistant</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Powered by Mistral-7B · Dashboard data only</div>
            </div>
            <button
              onClick={clearChat}
              style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#f87171',
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
              }}
              title="Clear chat"
            >
              <Trash2 size={12} /> Clear
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🤖</div>
                <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>Hi! I'm your ISS Dashboard AI</div>
                <div style={{ marginBottom: 16, fontSize: 12 }}>I can only answer questions based on the current dashboard data.</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s)}
                      style={{
                        background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                        borderRadius: 10, padding: '8px 12px', fontSize: 12, cursor: 'pointer',
                        color: 'var(--text-secondary)', textAlign: 'left', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.color = '#3b82f6'; }}
                      onMouseLeave={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.color = 'var(--text-secondary)'; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, maxWidth: '88%' }}>
                    {msg.role === 'assistant' && (
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Bot size={14} color="white" />
                      </div>
                    )}
                    <div style={{
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                        : msg.isError ? 'rgba(239,68,68,0.1)' : 'var(--bg-secondary)',
                      border: msg.isError ? '1px solid rgba(239,68,68,0.3)' : 'none',
                      color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '10px 14px',
                      fontSize: 13, lineHeight: 1.6,
                    }}>
                      {msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: 'rgba(100,116,139,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <User size={14} color="var(--text-muted)" />
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, paddingLeft: msg.role === 'assistant' ? 36 : 0, paddingRight: msg.role === 'user' ? 36 : 0 }}>
                    {formatTime(msg.time)}
                  </div>
                </div>
              ))
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Bot size={14} color="white" />
                </div>
                <div style={{
                  background: 'var(--bg-secondary)', borderRadius: '16px 16px 16px 4px',
                  padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: '50%', background: '#3b82f6',
                      animation: `typing-bounce 1.2s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px', borderTop: '1px solid var(--border-color)',
            display: 'flex', gap: 8,
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask about ISS or news..."
              disabled={isTyping}
              style={{
                flex: 1,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = '#3b82f6'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              style={{
                width: 42, height: 42, borderRadius: 12, border: 'none',
                background: (!input.trim() || isTyping) ? 'var(--bg-secondary)' : 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                cursor: (!input.trim() || isTyping) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              {isTyping ? <Loader2 size={16} color="#64748b" style={{ animation: 'spin-slow 1s linear infinite' }} /> : <Send size={16} color={(!input.trim()) ? '#64748b' : 'white'} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
