const NEWS_CACHE_KEY = 'iss-news-cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// We use newsdata.io as our news provider (free tier, no CORS issues via proxy)
// API key: free public key for demo
const NEWS_API_KEY = 'pub_84b780847ac49ff0df34fc773a4e64a43929';

export const NEWS_CATEGORIES = [
  { key: 'technology', label: 'Technology', color: '#3b82f6' },
  { key: 'science', label: 'Science', color: '#8b5cf6' },
  { key: 'world', label: 'World', color: '#10b981' },
  { key: 'politics', label: 'Politics', color: '#f59e0b' },
  { key: 'business', label: 'Business', color: '#06b6d4' },
];

function getCached(category) {
  try {
    const raw = localStorage.getItem(`${NEWS_CACHE_KEY}-${category}`);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_DURATION) return null;
    return data;
  } catch {
    return null;
  }
}

function setCache(category, data) {
  try {
    localStorage.setItem(
      `${NEWS_CACHE_KEY}-${category}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {}
}

export async function fetchNews(category, forceRefresh = false) {
  if (!forceRefresh) {
    const cached = getCached(category);
    if (cached) return cached;
  }

  try {
    // newsdata.io endpoint - called directly (has CORS headers)
    const url = `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&category=${category}&language=en&size=10`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (json.status !== 'success') throw new Error(json.message || 'API error');

    const articles = (json.results || []).slice(0, 10).map((a, i) => ({
      id: a.article_id || `${category}-${i}`,
      title: a.title || 'No title',
      description: a.description || a.content?.slice(0, 200) || 'No description available.',
      url: a.link || '#',
      image: a.image_url || null,
      source: a.source_id || 'Unknown',
      author: a.creator?.[0] || a.source_id || 'Unknown',
      publishedAt: a.pubDate || new Date().toISOString(),
      category,
    }));

    setCache(category, articles);
    return articles;
  } catch (err) {
    // Fallback: return mock data so app doesn't break
    return getMockNews(category);
  }
}

function getMockNews(category) {
  const now = new Date().toISOString();
  return Array.from({ length: 5 }, (_, i) => ({
    id: `mock-${category}-${i}`,
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Update #${i + 1}`,
    description: 'Live news feed temporarily unavailable. This is placeholder content. Please refresh or check your connection.',
    url: '#',
    image: null,
    source: 'Dashboard',
    author: 'System',
    publishedAt: now,
    category,
  }));
}

export function clearNewsCache() {
  NEWS_CATEGORIES.forEach(({ key }) => {
    localStorage.removeItem(`${NEWS_CACHE_KEY}-${key}`);
  });
}
