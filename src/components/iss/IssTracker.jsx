import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchISSPosition, fetchAstronauts, calculateSpeed, reverseGeocode } from '../../services/issService';
import { toast } from '../Toast';
import IssMap from './IssMap';
import Astronauts from './Astronauts';
import IssSpeedChart from '../charts/IssSpeedChart';
import { RefreshCw, Satellite, Zap, MapPin, Activity, Globe } from 'lucide-react';

const MAX_TRAJECTORY = 15;
const MAX_SPEED_HISTORY = 30;

export default function IssTracker({ onDataUpdate }) {
  const [position, setPosition] = useState(null);
  const [trajectory, setTrajectory] = useState([]);
  const [speed, setSpeed] = useState(null);
  const speedRef = useRef(null);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [location, setLocation] = useState('Calculating...');
  const [astronauts, setAstronauts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const prevPosRef = useRef(null);
  const prevTimeRef = useRef(null);
  const intervalRef = useRef(null);

  const updatePosition = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const pos = await fetchISSPosition();

      // Calculate speed
      let currentSpeed = speedRef.current;
      if (prevPosRef.current && prevTimeRef.current) {
        const timeDiff = pos.timestamp - prevTimeRef.current;
        if (timeDiff > 0) {
          currentSpeed = calculateSpeed(prevPosRef.current, pos, timeDiff);
        }
      }
      prevPosRef.current = pos;
      prevTimeRef.current = pos.timestamp;

      setPosition(pos);
      setTrajectory(prev => {
        const next = [...prev, pos];
        return next.slice(-MAX_TRAJECTORY);
      });

      if (currentSpeed !== null && currentSpeed > 0) {
        speedRef.current = currentSpeed;
        setSpeed(currentSpeed);
        setSpeedHistory(prev => {
          const entry = {
            speed: currentSpeed,
            time: new Date(pos.timestamp * 1000).toLocaleTimeString(),
          };
          return [...prev, entry].slice(-MAX_SPEED_HISTORY);
        });
      }

      setLastUpdated(new Date());
      setError(null);
      setLoading(false);

      // Reverse geocode (async, don't block)
      reverseGeocode(pos.lat, pos.lng).then(name => {
        setLocation(name || 'Over Ocean');
      });

      return { pos, currentSpeed };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      if (!silent) toast.error('Failed to fetch ISS position');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAstros = useCallback(async () => {
    try {
      const data = await fetchAstronauts();
      setAstronauts(data);
    } catch {
      toast.error('Failed to fetch astronaut data');
    }
  }, []);

  const handleManualRefresh = async () => {
    toast.info('Refreshing ISS data...');
    await updatePosition(false);
  };

  // Initial load
  useEffect(() => {
    updatePosition();
    fetchAstros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll every 15 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => updatePosition(true), 15000);
    return () => clearInterval(intervalRef.current);
  }, [updatePosition]);

  // Notify parent of data changes for chatbot context
  useEffect(() => {
    if (onDataUpdate) {
      onDataUpdate({ position, speed, location, astronauts, trajectoryCount: trajectory.length });
    }
  }, [position, speed, location, astronauts, trajectory.length, onDataUpdate]);

  const StatCard = ({ icon: Icon, label, value, color, unit }) => (
    <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
        {loading && !value ? (
          <div className="skeleton" style={{ height: 22, width: 100, marginTop: 4 }} />
        ) : (
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Orbitron, sans-serif', marginTop: 2 }}>
            {value ?? '—'} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>{unit}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Satellite size={20} color="white" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              ISS Live Tracker
            </h2>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Connecting...'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge badge-green" style={{ animation: 'pulse-glow 2s infinite' }}>● LIVE</span>
          <button className="btn-ghost" onClick={handleManualRefresh} disabled={loading}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin-slow 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 10, color: '#f87171', fontSize: 14,
        }}>
          ⚠️ {error}
          <button className="btn-ghost" onClick={() => updatePosition(false)} style={{ marginLeft: 'auto', fontSize: 12, padding: '4px 10px' }}>Retry</button>
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        <StatCard icon={Globe} label="Latitude" value={position ? position.lat.toFixed(4) + '°' : null} color="#3b82f6" />
        <StatCard icon={Globe} label="Longitude" value={position ? position.lng.toFixed(4) + '°' : null} color="#06b6d4" />
        <StatCard icon={Zap} label="Speed" value={speed ? speed.toLocaleString() : null} unit="km/h" color="#f59e0b" />
        <StatCard icon={MapPin} label="Location" value={location} color="#10b981" />
        <StatCard icon={Activity} label="Positions Tracked" value={trajectory.length} color="#8b5cf6" />
      </div>

      {/* Map */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20, minHeight: 380 }}>
        <IssMap position={position} trajectory={trajectory} loading={loading} />
      </div>

      {/* Speed Chart */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>ISS Speed Over Time</div>
        <IssSpeedChart data={speedHistory} />
      </div>

      {/* Astronauts */}
      <Astronauts data={astronauts} onRefresh={fetchAstros} />
    </section>
  );
}
