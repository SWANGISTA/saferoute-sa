import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mockAreaScores = [
  {
    name: 'Soshanguve Block L',
    city: 'Pretoria',
    score: 42,
    incidents: 8,
    lastIncident: '2 hours ago',
    members: 1240,
    trend: 'worse',
    trendCount: 3,
    breakdown: { Crime: 4, 'Road Hazard': 2, Unrest: 1, Flooding: 1 },
    nearby: [
      { name: 'Pretoria East', score: 78 },
      { name: 'Soshanguve Block K', score: 45 },
      { name: 'Ga-Rankuwa', score: 31 }
    ]
  },
  {
    name: 'Polokwane CBD',
    city: 'Limpopo',
    score: 61,
    incidents: 5,
    lastIncident: '5 hours ago',
    members: 3200,
    trend: 'improving',
    trendCount: 5,
    breakdown: { Crime: 2, 'Road Hazard': 2, Unrest: 0, Flooding: 1 },
    nearby: [
      { name: 'Bendor', score: 82 },
      { name: 'Mankweng', score: 38 },
      { name: 'Seshego', score: 44 }
    ]
  },
  {
    name: 'Tzaneen',
    city: 'Limpopo',
    score: 74,
    incidents: 3,
    lastIncident: '1 day ago',
    members: 890,
    trend: 'stable',
    trendCount: 0,
    breakdown: { Crime: 1, 'Road Hazard': 1, Unrest: 0, Flooding: 1 },
    nearby: [
      { name: 'Letsitele', score: 85 },
      { name: 'Haenertsburg', score: 90 },
      { name: 'Giyani', score: 35 }
    ]
  },
  {
    name: 'Johannesburg CBD',
    city: 'Gauteng',
    score: 18,
    incidents: 24,
    lastIncident: '10 minutes ago',
    members: 15600,
    trend: 'worse',
    trendCount: 8,
    breakdown: { Crime: 15, 'Road Hazard': 4, Unrest: 3, Flooding: 2 },
    nearby: [
      { name: 'Sandton', score: 71 },
      { name: 'Soweto', score: 29 },
      { name: 'Alexandra', score: 22 }
    ]
  }
];

const scoreMeta = (score) => {
  if (score >= 80) return { label: 'Safe', color: '#22c55e', icon: '🟢' };
  if (score >= 60) return { label: 'Low Risk', color: '#eab308', icon: '🟡' };
  if (score >= 40) return { label: 'Moderate Risk', color: '#f97316', icon: '🟠' };
  if (score >= 20) return { label: 'High Risk', color: '#ef4444', icon: '🔴' };
  return { label: 'Extreme Risk', color: '#7f1d1d', icon: '⚫' };
};

const trendText = (trend, value) => {
  if (trend === 'worse') return `📈 Getting worse — ${value} more incidents than last month`;
  if (trend === 'improving') return `📉 Improving — ${value} fewer incidents than last month`;
  return '➡️ Stable — similar to last month';
};

const findBestMatch = (query) => {
  const normalized = query.trim().toLowerCase();
  return (
    mockAreaScores.find((area) =>
      [area.name, area.city].some((value) => value.toLowerCase().includes(normalized))
    ) || null
  );
};

const guessFromCoordinates = ({ latitude, longitude }) => {
  if (latitude && longitude) {
    if (latitude > -26 && latitude < -24 && longitude > 27 && longitude < 29) {
      return mockAreaScores[0];
    }
    if (latitude > -26.5 && latitude < -25 && longitude > 27.5 && longitude < 28.5) {
      return mockAreaScores[3];
    }
    if (latitude > -25 && latitude < -23 && longitude > 28 && longitude < 30) {
      return mockAreaScores[1];
    }
    return mockAreaScores[2];
  }
  return mockAreaScores[0];
};

const SafetyScore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();
    const targetArea = findBestMatch(searchQuery);
    if (!searchQuery.trim()) {
      setError('Please enter an area, suburb or city to search.');
      setSelectedArea(null);
      return;
    }
    if (!targetArea) {
      setError('No safety score found for that area. Try another search.');
      setSelectedArea(null);
      return;
    }
    setError('');
    setSelectedArea(targetArea);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const area = guessFromCoordinates(position.coords);
        setSelectedArea(area);
        setSearchQuery(area.name);
        setLoading(false);
      },
      () => {
        setError('Unable to detect your location. Please try again or search manually.');
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 12000 }
    );
  };

  const renderBreakdownBar = (value, maxCount) => {
    const width = maxCount ? `${Math.round((value / maxCount) * 100)}%` : '0%';
    return (
      <div className="mt-2 h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#22c55e]" style={{ width }} />
      </div>
    );
  };

  const reportArea = () => {
    if (!selectedArea) return;
    navigate(`/report?area=${encodeURIComponent(selectedArea.name)}`);
  };

  const currentScore = selectedArea ? scoreMeta(selectedArea.score) : null;
  const maxBreakdown = selectedArea ? Math.max(...Object.values(selectedArea.breakdown)) : 0;

  return (
    <div className="pb-28 xl:pb-0">
      <div className="space-y-8">
        <div className="rounded-[32px] border border-white/10 bg-[#112936]/90 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Community Safety Score</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Search any area for its current safety rating</h1>
            </div>
            <button
              type="button"
              onClick={handleUseMyLocation}
              className="inline-flex items-center justify-center rounded-full bg-[#00b4d8] px-5 py-3 text-sm font-semibold text-[#0f2027] transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? 'Detecting location…' : 'Use my location'}
            </button>
          </div>

          <form onSubmit={handleSearch} className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-[#0d2830] px-5 py-4 text-white outline-none transition focus:border-[#00b4d8]"
              placeholder="Search any area, suburb or city..."
            />
            <button
              type="submit"
              className="rounded-3xl bg-[#00b4d8] px-6 py-4 text-sm font-semibold text-[#0f2027] transition hover:bg-teal-400"
            >
              Search
            </button>
          </form>

          {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
        </div>

        {selectedArea ? (
          <div className="grid gap-6 xl:grid-cols-[0.9fr_0.7fr]">
            <div className="rounded-[32px] border border-white/10 bg-[#112936]/90 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">📍 {selectedArea.name}, {selectedArea.city}</p>
                  <p className="mt-2 text-4xl font-semibold text-white">Safety Score</p>
                </div>
                <div className="grid place-items-center rounded-[28px] border border-white/10 bg-[#0d2830] px-6 py-6 text-center">
                  <div
                    className="relative flex h-44 w-44 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(${currentScore?.color} 0 ${selectedArea.score}%, rgba(255,255,255,0.08) ${selectedArea.score}% 100%)`,
                      transition: 'background 0.5s ease'
                    }}
                  >
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#0f2027] text-center">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Score</p>
                        <p className="mt-2 text-5xl font-semibold text-white">{selectedArea.score}</p>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">/100</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 rounded-[28px] border border-white/10 bg-[#0d2830] p-5">
                <div className="flex items-center justify-between gap-4 rounded-3xl bg-[#112936] p-4">
                  <div>
                    <p className="text-sm text-slate-400">Risk level</p>
                    <p className="mt-1 text-lg font-semibold text-white">{currentScore?.icon} {currentScore?.label}</p>
                  </div>
                  <span className="rounded-full px-3 py-1 text-sm font-semibold text-white" style={{ backgroundColor: currentScore?.color }}>
                    {selectedArea.score}/100
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-[#112936] p-4">
                    <p className="text-sm text-slate-400">Incidents this month</p>
                    <p className="mt-2 text-xl font-semibold text-white">{selectedArea.incidents}</p>
                  </div>
                  <div className="rounded-3xl bg-[#112936] p-4">
                    <p className="text-sm text-slate-400">Last incident</p>
                    <p className="mt-2 text-xl font-semibold text-white">{selectedArea.lastIncident}</p>
                  </div>
                  <div className="rounded-3xl bg-[#112936] p-4">
                    <p className="text-sm text-slate-400">Community members</p>
                    <p className="mt-2 text-xl font-semibold text-white">{selectedArea.members.toLocaleString()}</p>
                  </div>
                  <div className="rounded-3xl bg-[#112936] p-4">
                    <p className="text-sm text-slate-400">Trend vs last month</p>
                    <p className="mt-2 text-xl font-semibold text-white">{trendText(selectedArea.trend, selectedArea.trendCount)}</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={reportArea}
                className="mt-6 w-full rounded-full bg-[#00b4d8] px-6 py-4 text-sm font-semibold text-[#0f2027] transition hover:bg-teal-400"
              >
                Report Incident Here
              </button>
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-[#0d2830] p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Incidents this month</p>
                <div className="mt-5 space-y-4">
                  {Object.entries(selectedArea.breakdown).map(([label, count]) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-sm text-white">
                        <span>{label}</span>
                        <span>{count} report{count !== 1 ? 's' : ''}</span>
                      </div>
                      {renderBreakdownBar(count, maxBreakdown)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[#0d2830] p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Nearby areas</p>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">Compare</span>
                </div>
                <div className="mt-5 space-y-3">
                  {selectedArea.nearby.map((item) => {
                    const meta = scoreMeta(item.score);
                    return (
                      <div key={item.name} className="flex items-center justify-between rounded-3xl bg-[#112936] p-4">
                        <div>
                          <p className="text-sm font-semibold text-white">{item.name}</p>
                          <p className="text-xs text-slate-400">{meta.label}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold" style={{ color: meta.color }}>{item.score}/100</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[32px] border border-white/10 bg-[#112936]/90 p-6 text-center text-slate-300">
            <p className="text-lg font-semibold text-white">Search an area to see the community safety score.</p>
            <p className="mt-3 text-sm text-slate-400">Use the bar above or press &ldquo;Use my location&rdquo; to instantly load local safety data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyScore;
