import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 10, padding: '10px 14px',
        fontSize: 13, color: 'var(--text-primary)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
        <div style={{ fontWeight: 700, color: '#f59e0b', fontFamily: 'Orbitron, sans-serif' }}>
          {payload[0].value?.toLocaleString()} km/h
        </div>
      </div>
    );
  }
  return null;
};

export default function IssSpeedChart({ data }) {
  if (!data || data.length < 2) {
    return (
      <div style={{
        height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', fontSize: 13, flexDirection: 'column', gap: 8,
      }}>
        <div style={{ fontSize: 32 }}>📡</div>
        <span>Collecting speed data... (need at least 2 measurements)</span>
      </div>
    );
  }

  const avg = Math.round(data.reduce((s, d) => s + d.speed, 0) / data.length);

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Avg: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{avg.toLocaleString()} km/h</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Max: <span style={{ color: '#ef4444', fontWeight: 700 }}>
            {Math.max(...data.map(d => d.speed)).toLocaleString()} km/h
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Points: <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{data.length}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="speedGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.4} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border-color)' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={avg} stroke="#f59e0b" strokeDasharray="4 4" opacity={0.5} />
          <Line
            type="monotone"
            dataKey="speed"
            stroke="url(#speedGradient)"
            strokeWidth={2.5}
            dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#f59e0b', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
