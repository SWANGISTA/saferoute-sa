import { Fragment, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const mockRoutes = [
  { name: 'City Loop via Safe Corridor', score: 87, distance: '4.2 km', time: '52 min' },
  { name: 'Main Street Direct', score: 72, distance: '3.1 km', time: '38 min' },
  { name: 'Riverside Bypass', score: 91, distance: '5.8 km', time: '68 min' },
  { name: 'Northern Ring Road', score: 65, distance: '6.3 km', time: '74 min' }
];

const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjRlOWMxZjlhYTY1MzQxOGFhOWRiZWRkNDA1YTY1MWZmIiwiaCI6Im11cm11cjY0In0=';

const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const getBadgeClasses = (score) => {
  if (score >= 85) return 'bg-emerald-500/15 text-emerald-300';
  if (score >= 70) return 'bg-amber-500/15 text-amber-300';
  return 'bg-rose-500/15 text-rose-300';
};

const mockIncidents = [
  {
    id: 1,
    type: 'Accident',
    location: 'N1 Highway near Mokopane',
    lat: -24.1047,
    lng: 29.0053,
    time: '30m ago',
    severity: 'High',
    description: 'Multi-vehicle accident blocking right lane. Emergency services on scene.'
  },
  {
    id: 2,
    type: 'Road Hazard',
    location: 'R71 between Tzaneen and Polokwane',
    lat: -23.95,
    lng: 29.72,
    time: '1h ago',
    severity: 'Medium',
    description: 'Large pothole reported in left lane. Slow down and drive carefully.'
  },
  {
    id: 3,
    type: 'Unrest',
    location: 'Tzaneen CBD entrance',
    lat: -23.8332,
    lng: 30.159,
    time: '2h ago',
    severity: 'High',
    description: 'Community protest blocking main entrance to Tzaneen. Use alternative routes.'
  }
];

const incidentImpact = {
  Accident: 'Heavy traffic likely — expect delays',
  Crime: 'High risk area — travel with caution',
  'Road Hazard': 'Road damage reported — slow down',
  Flooding: 'Road may be impassable',
  Unrest: 'Road may be blocked — consider alternative'
};

const incidentIconMap = {
  Accident: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  Crime: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  'Road Hazard': new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  Flooding: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  Unrest: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
};

const getStepIcon = (type) => {
  switch (type) {
    case 1:
      return '→';
    case 0:
      return '←';
    case 2:
      return '↑';
    case 5:
      return '↗';
    case 6:
      return '↙';
    case 11:
      return '🏁';
    default:
      return '↑';
  }
};

const formatDistance = (meters) => {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
};

const getDistanceToSegment = (point, segmentStart, segmentEnd) => {
  const [px, py] = point;
  const [x1, y1] = segmentStart;
  const [x2, y2] = segmentEnd;
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) {
    return getDistanceMeters(px, py, x1, y1);
  }
  const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
  const clampT = Math.max(0, Math.min(1, t));
  const closestX = x1 + clampT * dx;
  const closestY = y1 + clampT * dy;
  return getDistanceMeters(px, py, closestX, closestY);
};

const getDistanceToRoute = (routePositions, incident) => {
  let minDistance = Infinity;
  routePositions.forEach((position, index) => {
    if (index === routePositions.length - 1) return;
    const segmentStart = position;
    const segmentEnd = routePositions[index + 1];
    const distance = getDistanceToSegment([incident.lat, incident.lng], segmentStart, segmentEnd);
    if (distance < minDistance) minDistance = distance;
  });
  return minDistance;
};

const formatTime = (seconds) => {
  const minutes = Math.round(seconds / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return `${hours}h ${remainder}m`;
  }
  return `${minutes} min`;
};

const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const RouteBounds = ({ positions }) => {
  const map = useMap();

  useEffect(() => {
    if (positions?.length) {
      map.fitBounds(positions, { padding: [40, 40] });
    }
  }, [map, positions]);

  return null;
};

const SafeRouteFinder = () => {
  const [fromLocation, setFromLocation] = useState('Tzaneen');
  const [toLocation, setToLocation] = useState('Polokwane');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [selectedRouteIncidents, setSelectedRouteIncidents] = useState([]);
  const [routeGeo, setRouteGeo] = useState(null);
  const [coords, setCoords] = useState(null);
  const [steps, setSteps] = useState([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navBanner, setNavBanner] = useState('');
  const [incidentBanner, setIncidentBanner] = useState('');
  const [mapInstance, setMapInstance] = useState(null);
  const watchIdRef = useRef(null);

  const authHeaders = {
    Authorization: ORS_API_KEY,
    'x-api-key': ORS_API_KEY
  };

  const geocodeText = async (text) => {
    const lookup = async (query) => {
      const response = await axios.get('/ors/geocode/search', {
        params: {
          text: query,
          size: 1,
          'boundary.country': 'ZAF'
        },
        headers: authHeaders
      });
      return response.data.features?.[0];
    };

    let feature = await lookup(text);
    if (!feature && !text.toLowerCase().includes('south africa')) {
      feature = await lookup(`${text}, South Africa`);
    }

    if (!feature) {
      throw new Error(`Could not find '${text}' — try adding your province e.g. Tzaneen, Limpopo`);
    }
    const [lng, lat] = feature.geometry.coordinates;
    return [lat, lng];
  };

  const fetchRoute = async (start, end) => {
    const response = await axios.post(
      '/ors/v2/directions/driving-car/geojson',
      {
        coordinates: [
          [start[1], start[0]],
          [end[1], end[0]]
        ],
        alternative_routes: {
          target_count: 3,
          weight_factor: 1.6
        }
      },
      {
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

    const features = response.data.features || [];
    const routeVariants = features.map((feature, index) => {
      const coordsGeo = feature?.geometry?.coordinates || [];
      const positions = coordsGeo.map(([lng, lat]) => [lat, lng]);
      const rawSteps = feature?.properties?.segments?.[0]?.steps || [];
      const steps = rawSteps.map((step) => {
        const stepIndex = step.way_points?.[0] ?? 0;
        return {
          ...step,
          position: positions[stepIndex] || positions[0]
        };
      });
      const summary = feature?.properties?.summary || {};
      const routeLabels = ['Safest Route', 'Fastest Route', 'Shortest Route'];
      const routeScores = [92, 78, 64];
      const badgeColors = ['emerald', 'amber', 'rose'];
      const routeColors = ['#22c55e', '#f59e0b', '#ef4444'];

      const incidents = mockIncidents.filter((incident) => getDistanceToRoute(positions, incident) <= 5000);
      const penalty = Math.min(30, incidents.length * 10);
      const adjustedScore = Math.max(0, (routeScores[index] ?? 75) - penalty);

      return {
        label: routeLabels[index] || `Route ${index + 1}`,
        score: routeScores[index] ?? 75,
        adjustedScore,
        incidents,
        badgeColor: badgeColors[index] || 'slate',
        routeColor: routeColors[index] || '#00b4d8',
        positions,
        steps,
        distance: summary.distance || 0,
        duration: summary.duration || 0
      };
    });

    return routeVariants;
  };

  const handleFindRoute = async (event) => {
    event.preventDefault();
    if (!fromLocation.trim() || !toLocation.trim()) {
      setError('Please enter both a start location and destination');
      setResult(null);
      setRouteGeo(null);
      setCoords(null);
      return;
    }

    if (ORS_API_KEY === 'YOUR_OPENROUTESERVICE_API_KEY') {
      setError('Please configure your OpenRouteService API key in VITE_ORS_API_KEY');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);
    setRoutes([]);
    setSelectedRouteIndex(0);
    setRouteGeo(null);
    setCoords(null);
    setSteps([]);

    setTimeout(async () => {
      try {
        const [fromCoords, toCoords] = await Promise.all([
          geocodeText(fromLocation.trim()),
          geocodeText(toLocation.trim())
        ]);
            const routeVariants = await fetchRoute(fromCoords, toCoords);
        if (!routeVariants.length) {
          throw new Error('No routes were returned. Please try a different pair of locations.');
        }

        const selectedVariant = routeVariants[0];
        const adjustedScore = selectedVariant.adjustedScore;

        setResult({
          name: selectedVariant.label,
          score: adjustedScore,
          distance: formatDistance(selectedVariant.distance),
          time: formatTime(selectedVariant.duration),
          from: fromLocation.trim(),
          to: toLocation.trim(),
          incidentCount: selectedVariant.incidents.length,
          rawScore: selectedVariant.score
        });
        setRoutes(routeVariants);
        setSelectedRouteIndex(0);
        setSelectedRouteIncidents(selectedVariant.incidents);
        setCoords({ from: fromCoords, to: toCoords });
        setRouteGeo(selectedVariant.positions);
        setSteps(selectedVariant.steps);
        setActiveStepIndex(0);
        setNavBanner(selectedVariant.steps[0] ? `Next: ${selectedVariant.steps[0].instruction}` : 'Navigation ready');
        setIncidentBanner('');
        setUserLocation(null);
        setIsNavigating(false);
      } catch (err) {
        setError(err?.message || 'Unable to generate route. Please verify the locations and try again.');
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const selectRoute = (index) => {
    const selected = routes[index];
    if (!selected) return;

    setSelectedRouteIndex(index);
    setSelectedRouteIncidents(selected.incidents || []);
    setRouteGeo(selected.positions);
    setSteps(selected.steps);
    setActiveStepIndex(0);
    setNavBanner(selected.steps[0] ? `Next: ${selected.steps[0].instruction}` : 'Navigation ready');
    setIncidentBanner('');
  };

  const startNavigation = () => {
    if (!steps.length) {
      setError('Search for a route first, then start navigation.');
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setError('');
    setIsNavigating(true);

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const current = [position.coords.latitude, position.coords.longitude];
        setUserLocation(current);
        if (mapInstance) {
          mapInstance.flyTo(current, mapInstance.getZoom(), { duration: 0.7 });
        }
      },
      () => {
        setError('Unable to access location. Please allow location access.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!userLocation || !steps.length) return;

    let bestIndex = 0;
    let bestDistance = Infinity;

    steps.forEach((step, index) => {
      if (!step.position) return;
      const [lat, lng] = step.position;
      const distance = getDistanceMeters(userLocation[0], userLocation[1], lat, lng);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    setActiveStepIndex(bestIndex);
    setNavBanner(`In ${Math.round(bestDistance)}m — ${steps[bestIndex].instruction}`);
  }, [userLocation, steps]);

  useEffect(() => {
    if (!steps.length || !selectedRouteIncidents.length) {
      setIncidentBanner('');
      return;
    }

    const currentStep = steps[activeStepIndex];
    if (!currentStep?.position) {
      setIncidentBanner('');
      return;
    }

    const incidentAhead = selectedRouteIncidents
      .map((incident) => ({
        incident,
        distance: getDistanceMeters(currentStep.position[0], currentStep.position[1], incident.lat, incident.lng)
      }))
      .filter((item) => item.distance <= 4000)
      .sort((a, b) => a.distance - b.distance)[0];

    if (incidentAhead) {
      const kmText = (incidentAhead.distance / 1000).toFixed(1);
      setIncidentBanner(`🚨 In ${kmText}km — ${incidentAhead.incident.type} reported ahead. ${incidentImpact[incidentAhead.incident.type]}`);
    } else {
      setIncidentBanner('');
    }
  }, [activeStepIndex, selectedRouteIncidents, steps]);

  return (
    <div className="pb-28 xl:pb-0">
      <div className="space-y-6 rounded-[32px] border border-white/10 bg-[#112936]/90 p-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Safe Route Finder</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Plan a safer journey</h1>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
          <form onSubmit={handleFindRoute} className="space-y-4 rounded-[28px] border border-white/10 bg-[#0d2830] p-6">
            <label className="text-sm text-slate-300">From</label>
            <input
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-[#112936] px-4 py-3 text-white"
              placeholder="Start location"
            />
            <label className="text-sm text-slate-300">To</label>
            <input
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-[#112936] px-4 py-3 text-white"
              placeholder="Destination"
            />
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <button
              type="submit"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#00b4d8] px-6 py-3 text-sm font-semibold text-[#0f2027] transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? 'Finding Route...' : 'Find Route'}
            </button>
          </form>

          <div className="rounded-[28px] border border-white/10 bg-[#0d2830] p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Suggested route</p>
            <div className="mt-5 space-y-4 rounded-3xl bg-[#112936] p-5">
              {routes.length ? (
                routes.map((route, index) => {
                  const isSelected = index === selectedRouteIndex;
                  return (
                    <div
                      key={route.label}
                      className={`rounded-3xl border px-5 py-4 transition ${
                        isSelected
                          ? 'border-[#00b4d8] bg-[#0d3f53] shadow-[0_0_40px_rgba(0,180,216,0.18)]'
                          : 'border-white/10 bg-[#112936] opacity-90'
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">{route.label}</p>
                          <p className="mt-2 text-lg font-semibold text-white">{formatDistance(route.distance)} · {formatTime(route.duration)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => selectRoute(index)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                            isSelected ? 'bg-white text-[#0f2027]' : 'bg-[#00b4d8] text-[#0f2027] hover:bg-teal-400'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getBadgeClasses(route.adjustedScore)}`}>
                          Score: {route.adjustedScore}%
                        </span>
                        <span className="rounded-full bg-[#0f2027] px-3 py-1 text-sm text-slate-300">{route.label}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  <p className="text-lg font-semibold text-white">City Loop via Safe Corridor</p>
                  <p className="text-slate-300">Recommended route with a safety score of 87%.</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full bg-[#00b4d822] px-3 py-1 text-sm font-semibold text-[#d7ffff]">Score: 87%</span>
                    <span className="rounded-full bg-[#0f2027] px-3 py-1 text-sm text-slate-300">Distance: 4.2 km</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {result && routeGeo && coords && (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[28px] border border-white/10 bg-[#0d2830] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Navigation</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Turn-by-turn directions</h2>
                </div>
                <button
                  type="button"
                  onClick={startNavigation}
                  className="inline-flex items-center justify-center rounded-full bg-[#00b4d8] px-5 py-3 text-sm font-semibold text-[#0f2027] transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isNavigating}
                >
                  {isNavigating ? 'Navigating' : 'Start Navigation'}
                </button>
              </div>
              {incidentBanner && (
                <div className="mb-4 rounded-3xl border border-rose-400/20 bg-[#2c1f24] p-4 text-sm text-rose-100">
                  {incidentBanner}
                </div>
              )}
              {isNavigating && navBanner && (
                <div className="mb-4 rounded-3xl bg-slate-900/80 p-4 text-sm text-sky-200">
                  {navBanner}
                </div>
              )}
              {selectedRouteIncidents.length > 0 && (
                <div className="mb-4 rounded-3xl border border-amber-400/20 bg-[#1b2f3e] p-4 text-sm text-amber-100">
                  <p className="font-semibold text-white">⚠️ Heads up — {selectedRouteIncidents.length} incident{selectedRouteIncidents.length > 1 ? 's' : ''} reported along this route</p>
                  <div className="mt-3 space-y-3">
                    {selectedRouteIncidents.map((incident) => (
                      <div key={incident.id} className="rounded-3xl border border-white/10 bg-[#112936] p-3">
                        <p className="text-sm font-semibold text-white">{incident.type} — {incident.location} — {incident.time}</p>
                        <p className="mt-1 text-sm text-slate-300">{incident.description}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">Expected impact: {incidentImpact[incident.type]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 max-h-[560px] overflow-y-auto space-y-3 pr-1">
                {steps.length ? (
                  steps.map((step, index) => (
                    <div
                      key={`${step.instruction}-${index}`}
                      className={`rounded-3xl border px-4 py-3 ${
                        index === activeStepIndex ? 'border-[#00b4d8] bg-[#0d3f53]' : 'border-white/10 bg-[#112936]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-1 text-2xl">{getStepIcon(step.type)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">{step.instruction}</p>
                          <p className="mt-1 text-xs text-slate-400">{formatDistance(step.distance)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Turn-by-turn directions appear here after you search for a route.</p>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#0d2830] p-4">
              <div style={{ height: '450px', width: '100%' }} className="rounded-[24px] overflow-hidden">
                <MapContainer
                  style={{ height: '100%', width: '100%' }}
                  bounds={routeGeo}
                  scrollWheelZoom={false}
                  whenCreated={setMapInstance}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  <RouteBounds positions={routeGeo} />
                  <Marker position={coords.from} icon={startIcon} />
                  <Marker position={coords.to} icon={endIcon} />
                  {userLocation && (
                    <CircleMarker
                      center={userLocation}
                      pathOptions={{ color: '#38bdf8', fillColor: '#38bdf8' }}
                      radius={8}
                    />
                  )}
                  {selectedRouteIncidents.map((incident) => (
                    <Fragment key={incident.id}>
                      {incident.severity === 'High' && (
                        <CircleMarker
                          key={`ring-${incident.id}`}
                          center={[incident.lat, incident.lng]}
                          pathOptions={{ color: '#ef4444', fillColor: 'rgba(239,68,68,0.1)', weight: 2 }}
                          radius={35}
                        />
                      )}
                      <Marker position={[incident.lat, incident.lng]} icon={incidentIconMap[incident.type] || incidentIconMap.Crime}>
                        <Popup>
                          <div className="space-y-2 text-left text-sm text-slate-900">
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{incident.type}</p>
                            <p className="text-base font-semibold">{incident.location}</p>
                            <p className="text-sm text-slate-600">{incident.time}</p>
                            <p className="text-sm text-slate-700">{incident.description}</p>
                            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">{incidentImpact[incident.type]}</p>
                          </div>
                        </Popup>
                      </Marker>
                    </Fragment>
                  ))}
                  {routes.map((route, index) => (
                    <Polyline
                      key={route.label}
                      positions={route.positions}
                      pathOptions={{
                        color: index === selectedRouteIndex ? route.routeColor : '#64748b',
                        weight: index === selectedRouteIndex ? 6 : 4,
                        opacity: index === selectedRouteIndex ? 1 : 0.35
                      }}
                    />
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafeRouteFinder;
