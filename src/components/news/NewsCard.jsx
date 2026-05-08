import { ExternalLink, Calendar, User, Globe } from 'lucide-react';

const CATEGORY_COLORS = {
  technology: '#3b82f6',
  science: '#8b5cf6',
  world: '#10b981',
  politics: '#f59e0b',
  business: '#06b6d4',
};

const PLACEHOLDER_IMAGES = {
  technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
  science: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80',
  world: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400&q=80',
  politics: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&q=80',
  business: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
};

export default function NewsCard({ article }) {
  const catColor = CATEGORY_COLORS[article.category] || '#3b82f6';
  const imgSrc = article.image || PLACEHOLDER_IMAGES[article.category] || PLACEHOLDER_IMAGES.world;

  const formatDate = (str) => {
    try {
      return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return str; }
  };

  return (
    <div className="card" style={{
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s ease',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 12px 32px ${catColor}20`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Image */}
      <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
        <img
          src={imgSrc}
          alt={article.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = PLACEHOLDER_IMAGES.world; }}
        />
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: `${catColor}cc`, borderRadius: 6,
          padding: '3px 10px', fontSize: 10, fontWeight: 700,
          color: 'white', letterSpacing: 1, textTransform: 'uppercase',
        }}>
          {article.category}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{
          fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
          lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.title}
        </h3>

        <p style={{
          fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1,
        }}>
          {article.description}
        </p>

        {/* Meta */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
            <Globe size={11} /> {article.source}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
            <User size={11} /> {article.author}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
            <Calendar size={11} /> {formatDate(article.publishedAt)}
          </div>
        </div>

        {/* Read more */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 8, padding: '7px 14px',
            background: `${catColor}18`, border: `1px solid ${catColor}40`,
            borderRadius: 8, fontSize: 12, fontWeight: 600, color: catColor,
            textDecoration: 'none', transition: 'all 0.2s ease',
            alignSelf: 'flex-start',
          }}
          onMouseEnter={e => { e.target.style.background = `${catColor}30`; }}
          onMouseLeave={e => { e.target.style.background = `${catColor}18`; }}
        >
          <ExternalLink size={12} /> Read More
        </a>
      </div>
    </div>
  );
}
