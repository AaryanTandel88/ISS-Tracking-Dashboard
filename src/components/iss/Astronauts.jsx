import { Users, RefreshCw } from 'lucide-react';

export default function Astronauts({ data, onRefresh }) {
  const craftColors = {
    'ISS': '#3b82f6',
    'Shenzhou': '#ef4444',
    'Tiangong': '#f59e0b',
  };

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Users size={18} color="#8b5cf6" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>People in Space</div>
            {data && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {data.number} astronaut{data.number !== 1 ? 's' : ''} currently in orbit
              </div>
            )}
          </div>
        </div>
        <button className="btn-ghost" onClick={onRefresh} style={{ fontSize: 12, padding: '6px 12px' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {!data ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 36, width: 150, borderRadius: 8 }} />
          ))}
        </div>
      ) : (
        <>
          {/* Count pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: 10, padding: '8px 16px', marginBottom: 14,
          }}>
            <span style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Orbitron, sans-serif', color: '#a78bfa' }}>
              {data.number}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 100, lineHeight: 1.4 }}>
              people currently in space
            </span>
          </div>

          {/* Names list */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.people.map((person, i) => {
              const craftColor = craftColors[person.craft] || '#64748b';
              return (
                <div key={i} style={{
                  background: `${craftColor}12`,
                  border: `1px solid ${craftColor}30`,
                  borderRadius: 8, padding: '6px 12px',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 16 }}>👨‍🚀</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{person.name}</div>
                    <div style={{ fontSize: 10, color: craftColor, fontWeight: 600, letterSpacing: 0.5 }}>{person.craft}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
