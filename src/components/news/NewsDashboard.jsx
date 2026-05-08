import { useState, useEffect, useCallback } from 'react';
import { fetchNews, NEWS_CATEGORIES, clearNewsCache } from '../../services/newsService';
import { toast } from '../Toast';
import NewsCard from './NewsCard';
import NewsDistributionChart from '../charts/NewsDistributionChart';
import { Newspaper, Search, RefreshCw, SlidersHorizontal } from 'lucide-react';

export default function NewsDashboard({ onArticlesUpdate }) {
  const [articlesByCategory, setArticlesByCategory] = useState({});
  const [activeCategory, setActiveCategory] = useState('technology');
  const [loadingCategories, setLoadingCategories] = useState({});
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'source'

  const loadCategory = useCallback(async (key, force = false) => {
    setLoadingCategories(prev => ({ ...prev, [key]: true }));
    try {
      const articles = await fetchNews(key, force);
      setArticlesByCategory(prev => ({ ...prev, [key]: articles }));
      if (force) toast.success(`${key} news refreshed!`);
    } catch (err) {
      toast.error(`Failed to load ${key} news`);
    } finally {
      setLoadingCategories(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  // Load all categories on mount
  useEffect(() => {
    NEWS_CATEGORIES.forEach(cat => loadCategory(cat.key));
  }, [loadCategory]);

  // Notify parent (for chatbot)
  useEffect(() => {
    const allArticles = Object.values(articlesByCategory).flat();
    if (onArticlesUpdate) onArticlesUpdate(allArticles);
  }, [articlesByCategory, onArticlesUpdate]);

  const handleRefreshAll = () => {
    clearNewsCache();
    NEWS_CATEGORIES.forEach(cat => loadCategory(cat.key, true));
    toast.info('Refreshing all news categories...');
  };

  const handleRefreshCategory = () => {
    loadCategory(activeCategory, true);
  };

  const handleChartCategoryClick = (key) => {
    setActiveCategory(key);
    toast.info(`Showing ${key} articles`);
  };

  // Get current articles with search + sort
  const currentArticles = (() => {
    let arts = articlesByCategory[activeCategory] || [];
    if (search.trim()) {
      const q = search.toLowerCase();
      arts = arts.filter(a =>
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.source?.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'date') {
      arts = [...arts].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    } else if (sortBy === 'source') {
      arts = [...arts].sort((a, b) => a.source?.localeCompare(b.source));
    }
    return arts.slice(0, 10);
  })();

  const isLoading = loadingCategories[activeCategory];

  return (
    <section>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Newspaper size={20} color="white" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              News Dashboard
            </h2>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {Object.values(articlesByCategory).flat().length} articles across {NEWS_CATEGORIES.length} categories
            </div>
          </div>
        </div>
        <button className="btn-ghost" onClick={handleRefreshAll}>
          <RefreshCw size={14} /> Refresh All
        </button>
      </div>

      {/* Chart + controls row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, marginBottom: 20 }}>
        {/* Search + sort */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-title">Search & Filter</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
              <Search size={14} style={{
                position: 'absolute', left: 10, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)',
              }} />
              <input
                className="search-input"
                style={{ paddingLeft: 32 }}
                placeholder="Search articles..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SlidersHorizontal size={14} color="var(--text-muted)" />
              <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="date">Sort by Date</option>
                <option value="source">Sort by Source</option>
              </select>
            </div>
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {NEWS_CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    border: `1px solid ${isActive ? cat.color : 'var(--border-color)'}`,
                    background: isActive ? `${cat.color}22` : 'transparent',
                    color: isActive ? cat.color : 'var(--text-muted)',
                  }}
                >
                  {loadingCategories[cat.key] ? '⟳ ' : ''}{cat.label}
                  {articlesByCategory[cat.key] ? ` (${articlesByCategory[cat.key].length})` : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="card" style={{ padding: 16 }}>
          <div className="section-title">Distribution</div>
          <NewsDistributionChart
            articlesByCategory={articlesByCategory}
            onCategoryClick={handleChartCategoryClick}
          />
        </div>
      </div>

      {/* Category header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
          {NEWS_CATEGORIES.find(c => c.key === activeCategory)?.label} News
          {search && <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 400 }}> — searching "{search}"</span>}
        </div>
        <button className="btn-ghost" onClick={handleRefreshCategory} disabled={isLoading} style={{ fontSize: 12, padding: '6px 12px' }}>
          <RefreshCw size={12} style={{ animation: isLoading ? 'spin-slow 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Articles grid */}
      {isLoading && !currentArticles.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card" style={{ overflow: 'hidden' }}>
              <div className="skeleton" style={{ height: 160, borderRadius: 0 }} />
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="skeleton" style={{ height: 14, width: '80%' }} />
                <div className="skeleton" style={{ height: 14, width: '60%' }} />
                <div className="skeleton" style={{ height: 50, width: '100%' }} />
                <div className="skeleton" style={{ height: 28, width: 100, borderRadius: 8 }} />
              </div>
            </div>
          ))}
        </div>
      ) : currentArticles.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          color: 'var(--text-muted)', fontSize: 14,
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          No articles found{search ? ` for "${search}"` : ''}.
          <button className="btn-primary" onClick={() => { setSearch(''); handleRefreshCategory(); }} style={{ margin: '12px auto 0', display: 'flex' }}>
            Clear & Reload
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {currentArticles.map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}
