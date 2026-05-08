import { useState, useCallback } from 'react';
import useDarkMode from './hooks/useDarkMode';
import Header from './components/Header';
import IssTracker from './components/iss/IssTracker';
import NewsDashboard from './components/news/NewsDashboard';
import Chatbot from './components/chat/Chatbot';
import { ToastContainer } from './components/Toast';

export default function App() {
  const [isDark, setIsDark] = useDarkMode();
  const [activeTab, setActiveTab] = useState('iss');

  // Shared dashboard context for the chatbot
  const [issData, setIssData] = useState({});
  const [newsArticles, setNewsArticles] = useState([]);

  const handleIssDataUpdate = useCallback((data) => {
    setIssData(data);
  }, []);

  const handleNewsUpdate = useCallback((articles) => {
    setNewsArticles(articles);
  }, []);

  const dashboardContext = {
    issPosition: issData.position,
    issSpeed: issData.speed,
    issLocation: issData.location,
    issAstronauts: issData.astronauts,
    issTrajectoryCount: issData.trajectoryCount,
    newsArticles,
  };

  return (
    <>
      <Header
        isDark={isDark}
        onToggleDark={() => setIsDark(d => !d)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', minHeight: 'calc(100vh - 64px)' }}>
        {activeTab === 'iss' && (
          <div className="animate-slide-up">
            <IssTracker onDataUpdate={handleIssDataUpdate} />
          </div>
        )}

        {activeTab === 'news' && (
          <div className="animate-slide-up">
            <NewsDashboard onArticlesUpdate={handleNewsUpdate} />
          </div>
        )}
      </main>

      {/* Floating AI Chatbot */}
      <Chatbot dashboardContext={dashboardContext} />

      {/* Toast notifications */}
      <ToastContainer />
    </>
  );
}
