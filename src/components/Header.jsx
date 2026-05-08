import { Satellite, Sun, Moon, Activity } from 'lucide-react';

export default function Header({ isDark, onToggleDark, activeTab, onTabChange }) {
  const tabs = [
    { key: 'iss', label: 'ISS Tracker', icon: '🛸' },
    { key: 'news', label: 'News', icon: '📰' },
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 500,
      background: isDark ? 'rgba(10,15,30,0.85)' : 'rgba(240,244,255,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-color)',
    }}>
      <div style={{
        maxWidth: 1400, margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(59,130,246,0.4)',
          }}>
            <Satellite size={18} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: 1 }}>
              ISS LIVE
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, marginTop: -2 }}>
              DASHBOARD
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              style={{
                padding: '6px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', border: 'none', transition: 'all 0.2s ease',
                background: activeTab === tab.key
                  ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))'
                  : 'transparent',
                color: activeTab === tab.key ? 'var(--accent-blue)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.key ? '2px solid var(--accent-blue)' : '2px solid transparent',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Live indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 20, padding: '4px 10px',
          }}>
            <Activity size={12} color="#10b981" style={{ animation: 'pulse-glow 2s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', letterSpacing: 1 }}>LIVE</span>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDark}
            style={{
              width: 40, height: 40, borderRadius: 10, border: '1px solid var(--border-color)',
              background: 'var(--bg-card)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease', color: 'var(--text-secondary)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.color = 'var(--accent-blue)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
