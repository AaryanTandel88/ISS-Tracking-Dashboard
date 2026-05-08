import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { NEWS_CATEGORIES } from '../../services/newsService';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 10, padding: '10px 14px',
        fontSize: 13, color: 'var(--text-primary)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontWeight: 700, color: payload[0].payload.fill }}>{payload[0].name}</div>
        <div style={{ color: 'var(--text-muted)' }}>{payload[0].value} articles</div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
    {payload.map((entry, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
        <div style={{ width: 10, height: 10, borderRadius: 3, background: entry.color }} />
        {entry.value}
      </div>
    ))}
  </div>
);

export default function NewsDistributionChart({ articlesByCategory, onCategoryClick }) {
  const data = NEWS_CATEGORIES.map((cat, i) => ({
    name: cat.label,
    value: articlesByCategory[cat.key]?.length || 0,
    fill: COLORS[i % COLORS.length],
    key: cat.key,
  })).filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div style={{
        height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', fontSize: 13, flexDirection: 'column', gap: 8,
      }}>
        <div style={{ fontSize: 32 }}>📰</div>
        <span>Loading news data...</span>
      </div>
    );
  }

  const handleClick = (data) => {
    if (onCategoryClick && data) onCategoryClick(data.key);
  };

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          onClick={handleClick}
          cursor="pointer"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.fill} opacity={0.9} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
