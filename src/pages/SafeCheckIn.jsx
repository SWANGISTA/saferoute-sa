import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, Marker, TileLayer, CircleMarker } from 'react-leaflet';
import { FiShield, FiHeart, FiPhone, FiMapPin, FiXCircle, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { dispatchSOSAlert } from '../utils/sosEvents';
import { pushAlertHistory } from '../utils/alertStorage';

const areaRiskZones = [
  { name: 'Soshanguve Block L', lat: -25.5272, lng: 28.0945, score: 42 },
  { name: 'Ga-Rankuwa', lat: -25.6167, lng: 27.9833, score: 31 },
  { name: 'Johannesburg CBD', lat: -26.2041, lng: 28.0473, score: 18 },
  { name: 'Pretoria East', lat: -25.7479, lng: 28.3500, score: 78 },
  { name: 'Sandton', lat: -26.1076, lng: 28.0567, score: 71 },
  { name: 'Tzaneen', lat: -23.8332, lng: 30.1590, score: 74 },
  { name: 'Polokwane CBD', lat: -23.9045, lng: 29.4689, score: 61 }
];

const safeZonesByArea = {
  'Soshanguve Block L': { name: 'Soshanguve Police Station', distance: '800m' },
  'Ga-Rankuwa': { name: 'Ga-Rankuwa Clinic', distance: '1.1km' },
  'Johannesburg CBD': { name: 'Joburg EMS Station', distance: '650m' },
  'Pretoria East': { name: 'Pretoria East Police Station', distance: '1.0km' },
  'Sandton': { name: 'Sandton Hospital', distance: '900m' },
  'Tzaneen': { name: 'Tzaneen Hospital', distance: '2.0km' },
  'Polokwane CBD': { name: 'Polokwane Police Station', distance: '1.2km' }
};

const baseAreaScores = areaRiskZones.reduce((acc, area) => {
  acc[area.name] = area.score;
  return acc;
}, {});

const STORAGE_KEY = 'safecheckin_contacts_v1';

const getDistance = (from, to) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371000 * c;
};

const findNearestArea = (position) => {
  if (!position) return null;
  return areaRiskZones.reduce((closest, area) => {
    const distance = getDistance(position, { lat: area.lat, lng: area.lng });
    if (!closest || distance < closest.distance) {
      return { area, distance };
    }
    return closest;
  }, null)?.area;
};

const getRiskMeta = (score) => {
  if (score >= 80) return { label: 'Safe', color: '#22c55e', icon: '🟢' };
  if (score >= 60) return { label: 'Low Risk', color: '#eab308', icon: '🟡' };
  if (score >= 40) return { label: 'Moderate Risk', color: '#f97316', icon: '🟠' };
  if (score >= 20) return { label: 'High Risk', color: '#ef4444', icon: '🔴' };
  return { label: 'Extreme Risk', color: '#7f1d1d', icon: '⚫' };
};

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}m ${remaining}s`;
};

const TRIP_RATING_KEY = 'safecheckin_trip_ratings_v1';

const SafeCheckIn = () => {
  const [contacts, setContacts] = useState([]);
  const [activeContactIndex, setActiveContactIndex] = useState(0);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationArea, setDestinationArea] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [tripStarted, setTripStarted] = useState(false);
  const [tripSeconds, setTripSeconds] = useState(0);
  const [travelDistance, setTravelDistance] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Ready to start your safe trip');
  const [alertState, setAlertState] = useState('idle');
  const [alertCountdown, setAlertCountdown] = useState(60);
  const [alertSent, setAlertSent] = useState(false);
  const [alertArea, setAlertArea] = useState(null);
  const [summary, setSummary] = useState(null);
  const [showContactManager, setShowContactManager] = useState(false);
  const [error, setError] = useState('');
  const [highRiskBanner, setHighRiskBanner] = useState(null);
  const [preTripSent, setPreTripSent] = useState(false);
  const [preTripConfirmation, setPreTripConfirmation] = useState('');
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [routeSafetyRating, setRouteSafetyRating] = useState(0);
  const [appRating, setAppRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [tripResult, setTripResult] = useState(null);
  const [sosHoldProgress, setSosHoldProgress] = useState(0);
  const [sosHolding, setSosHolding] = useState(false);
  const watchIdRef = useRef(null);
  const lastPositionRef = useRef(null);
  const lastMovementRef = useRef(Date.now());
  const positionsRef = useRef([]);
  const countdownRef = useRef(null);
  const elapsedRef = useRef(null);
  const activeAreaRef = useRef(null);
  const alertTimerRef = useRef(null);
  const sosHoldTimerRef = useRef(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setContacts(parsed);
      } catch {
        setContacts([]);
      }
    }
    syncStoredRatings();
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      clearInterval(countdownRef.current);
      clearInterval(elapsedRef.current);
      clearInterval(alertTimerRef.current);
    };
  }, []);

  const saveContacts = (newContacts) => {
    setContacts(newContacts);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newContacts));
  };

  const addContact = () => {
    setError('');
    if (!contactName.trim() || !contactPhone.trim()) {
      setError('Please enter both name and phone number.');
      return;
    }
    if (contacts.length >= 3) {
      setError('You can add up to 3 emergency contacts.');
      return;
    }
    const next = [...contacts, { name: contactName.trim(), phone: contactPhone.trim() }];
    saveContacts(next);
    setContactName('');
    setContactPhone('');
    setActiveContactIndex(next.length - 1);
    setShowContactManager(false);
  };

  const removeContact = (index) => {
    const next = contacts.filter((_, idx) => idx !== index);
    saveContacts(next);
    setActiveContactIndex(Math.max(0, Math.min(next.length - 1, activeContactIndex)));
  };

  const storeAlertEvent = (payload) => {
    const timestamp = new Date().toISOString();
    const alertRecord = {
      timestamp,
      type: payload.type,
      location: payload.location,
      coords: payload.coords,
      safetyScore: payload.score
    };
    pushAlertHistory(alertRecord);
  };

  const navigate = useNavigate();

  const loadTripRatings = () => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(TRIP_RATING_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveTripRating = (rating) => {
    const current = loadTripRatings();
    const next = [rating, ...current];
    window.localStorage.setItem(TRIP_RATING_KEY, JSON.stringify(next));
    return next;
  };

  const applyAreaRatings = (ratings) => {
    areaRiskZones.forEach((zone) => {
      const base = baseAreaScores[zone.name] ?? zone.score;
      const areaRatings = ratings.filter((item) => item.area === zone.name).map((item) => item.routeSafetyRating);
      if (!areaRatings.length) {
        zone.score = base;
        return;
      }
      const averageRating = areaRatings.reduce((sum, rating) => sum + rating, 0) / areaRatings.length;
      const delta = Math.round((averageRating - 3) * 4);
      zone.score = Math.max(1, Math.min(100, base + delta));
    });
  };

  const syncStoredRatings = () => {
    const ratings = loadTripRatings();
    applyAreaRatings(ratings);
  };

  const sendPreTripNotification = (startLocation, coords, score) => {
    const contact = contacts[activeContactIndex] || { name: 'Clifford', phone: '0792343333' };
    const now = new Date();
    setPreTripSent(true);
    setPreTripConfirmation(`✅ ${contact.name} has been notified about your trip`);
    storeAlertEvent({
      type: 'Pre-trip',
      location: startLocation,
      coords,
      score
    });
  };

  const submitTripRating = () => {
    if (!routeSafetyRating || !appRating) {
      setError('Please select both ratings before submitting.');
      return;
    }
    const tripInfo = tripResult || {};
    const ratingEntry = {
      tripId: new Date().toISOString(),
      destination: tripInfo.destination,
      duration: tripInfo.duration,
      distance: tripInfo.distance,
      routeSafetyRating,
      appRating,
      comment: ratingComment,
      area: tripInfo.area,
      areaScore: tripInfo.areaScore,
      date: tripInfo.date
    };
    saveTripRating(ratingEntry);
    syncStoredRatings();
    setSummary({
      ...tripInfo,
      areas: tripInfo.areas,
      alerts: tripInfo.alerts,
      routeSafetyRating,
      appRating,
      comment: ratingComment
    });
    setRatingModalOpen(false);
    setRouteSafetyRating(0);
    setAppRating(0);
    setRatingComment('');
    setTripResult(null);
  };

  const reportIncidentFromRating = () => {
    const tripInfo = tripResult || {};
    const date = tripInfo.date;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    navigate(`/report?area=${encodeURIComponent(tripInfo.area)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`);
  };

  const startSOSHold = () => {
    if (!tripStarted) return;
    setSosHolding(true);
    setSosHoldProgress(0);
    let elapsed = 0;
    sosHoldTimerRef.current = window.setInterval(() => {
      elapsed += 100;
      const progress = Math.min(100, Math.round((elapsed / 3000) * 100));
      setSosHoldProgress(progress);
      if (progress >= 100) {
        window.clearInterval(sosHoldTimerRef.current);
        setSosHolding(false);
        setSosHoldProgress(0);
        const location = activeAreaRef.current?.name || 'Soshanguve Block L';
        const coords = currentPosition || { lat: -25.5272, lng: 28.0945 };
        const score = activeAreaRef.current?.score ?? 42;
        dispatchSOSAlert({ type: 'SOS', location, coords, score, contact: contacts[activeContactIndex] });
      }
    }, 100);
  };

  const cancelSOSHold = () => {
    setSosHolding(false);
    setSosHoldProgress(0);
    if (sosHoldTimerRef.current) {
      window.clearInterval(sosHoldTimerRef.current);
      sosHoldTimerRef.current = null;
    }
  };

  const validateStart = () => {
    if (!contacts.length) {
      setError('Add an emergency contact before starting your safe trip.');
      return false;
    }
    if (!destination.trim()) {
      setError('Enter a destination before starting your safe trip.');
      return false;
    }
    return true;
  };

  const handleDestinationChange = (value) => {
    setDestination(value);
    const match = areaRiskZones.find((area) =>
      area.name.toLowerCase().includes(value.toLowerCase()) ||
      area.name.toLowerCase() === value.toLowerCase() ||
      area.name.toLowerCase().startsWith(value.toLowerCase())
    );
    setDestinationArea(match || null);
  };

  const startTrip = () => {
    setError('');
    if (!validateStart()) return;
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setTripStarted(true);
    setTripSeconds(0);
    setTravelDistance(0);
    setStatusMessage('✅ Waiting for your first location…');
    setAlertState('idle');
    setAlertSent(false);
    setSummary(null);
    setHighRiskBanner(null);
    setPreTripSent(false);
    setPreTripConfirmation('');
    setSosHolding(false);
    setSosHoldProgress(0);
    positionsRef.current = [];
    lastMovementRef.current = Date.now();
    activeAreaRef.current = null;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const current = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCurrentPosition(current);
        if (!preTripSent) {
          const startArea = findNearestArea(current);
          const startLocation = startArea?.name || 'Soshanguve Block L';
          const startScore = startArea?.score ?? 42;
          sendPreTripNotification(startLocation, current, startScore);
        }
        positionsRef.current.push(current);
        if (lastPositionRef.current) {
          const moved = getDistance(lastPositionRef.current, current);
          if (moved > 50) {
            lastMovementRef.current = Date.now();
            setStatusMessage('✅ You are moving — All good');
          }
          setTravelDistance((prev) => prev + moved);
        }
        lastPositionRef.current = current;

        const nearestArea = findNearestArea(current);
        if (nearestArea) {
          activeAreaRef.current = nearestArea;
          const risk = getRiskMeta(nearestArea.score);
          if (nearestArea.score < 50) {
            setHighRiskBanner({ area: nearestArea.name, zone: safeZonesByArea[nearestArea.name], risk });
          } else {
            setHighRiskBanner(null);
          }
          if (nearestArea.score < 50 && Date.now() - lastMovementRef.current > 10 * 60 * 1000 && alertState === 'idle') {
            setAlertArea(nearestArea);
            setAlertState('pending');
            setAlertCountdown(60);
          }
        }
      },
      (err) => {
        setError('Unable to track location. Please allow location access and try again.');
        console.error(err);
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 }
    );

    watchIdRef.current = id;
    elapsedRef.current = window.setInterval(() => setTripSeconds((prev) => prev + 1), 1000);
    alertTimerRef.current = window.setInterval(() => {
      if (!lastPositionRef.current || !activeAreaRef.current) return;
      if (activeAreaRef.current.score < 50 && Date.now() - lastMovementRef.current > 10 * 60 * 1000 && alertState === 'idle') {
        setAlertArea(activeAreaRef.current);
        setAlertState('pending');
        setAlertCountdown(60);
      }
    }, 30000);
  };

  useEffect(() => {
    if (alertState !== 'pending') return;
    countdownRef.current = window.setInterval(() => {
      setAlertCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          triggerAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [alertState]);

  const triggerAlert = () => {
    const location = alertArea?.name || activeAreaRef.current?.name || 'Soshanguve Block L';
    const coords = currentPosition || { lat: -25.5272, lng: 28.0945 };
    const score = alertArea?.score ?? activeAreaRef.current?.score ?? 42;
    dispatchSOSAlert({ type: 'Auto', location, coords, score, contact: contacts[activeContactIndex] });
    setAlertState('sent');
    setAlertSent(true);
    setStatusMessage('⚠️ Emergency alert sent. Your contact has been notified.');
    clearInterval(countdownRef.current);
  };

  const resolveAlert = () => {
    setAlertState('idle');
    setAlertCountdown(60);
    setStatusMessage('✅ You confirmed you are okay. Monitoring continues.');
    lastMovementRef.current = Date.now();
    setAlertArea(null);
  };

  const endTrip = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    clearInterval(elapsedRef.current);
    clearInterval(alertTimerRef.current);
    clearInterval(countdownRef.current);
    const uniqueAreas = [...new Set(positionsRef.current.map((pos) => findNearestArea(pos)?.name).filter(Boolean))];
    const summaryAreas = uniqueAreas.slice(0, 5).map((name) => {
      const zone = areaRiskZones.find((area) => area.name === name);
      return zone ? { name: zone.name, score: zone.score } : null;
    }).filter(Boolean);
    const areaName = activeAreaRef.current?.name || summaryAreas[0]?.name || 'Soshanguve Block L';
    const areaScore = activeAreaRef.current?.score ?? summaryAreas[0]?.score ?? 42;
    const tripData = {
      destination: destination || 'Soshanguve Crossing Mall',
      duration: formatDuration(tripSeconds),
      distance: `${(travelDistance / 1000).toFixed(1)} km`,
      areas: summaryAreas,
      alerts: alertSent,
      area: areaName,
      areaScore,
      date: new Date().toISOString().slice(0, 10)
    };

    setTripResult(tripData);
    setRatingModalOpen(true);
    setTripStarted(false);
    setCurrentPosition(null);
    setHighRiskBanner(null);
    setStatusMessage('Your trip has ended. Please rate the trip.');
  };

  const selectedContact = contacts[activeContactIndex] || null;

  const areaScore = activeAreaRef.current ? getRiskMeta(activeAreaRef.current.score) : null;
  const destinationPosition = destinationArea ? { lat: destinationArea.lat, lng: destinationArea.lng } : null;

  const mapCenter = useMemo(() => {
    if (currentPosition) return [currentPosition.lat, currentPosition.lng];
    if (destinationPosition) return [destinationPosition.lat, destinationPosition.lng];
    return [-25.5272, 28.0945];
  }, [currentPosition, destinationPosition]);

  return (
    <div className="pb-28 xl:pb-0">
      <div className="space-y-8">
        <div className="rounded-[32px] border border-white/10 bg-[#112936]/90 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">🛡️ Safe Check-In</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Let someone know you're safe</h1>
            </div>
            {selectedContact ? (
              <button
                type="button"
                onClick={() => setShowContactManager((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full bg-[#00b4d8] px-4 py-3 text-sm font-semibold text-[#0f2027] transition hover:bg-teal-400"
              >
                <FiPhone className="h-4 w-4" />
                Change Contact
              </button>
            ) : null}
          </div>

          {!contacts.length ? (
            <div className="mt-6 rounded-[28px] border border-white/10 bg-[#0d2830] p-6">
              <p className="text-sm text-slate-400">Add your first emergency contact to begin.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  className="w-full rounded-3xl border border-white/10 bg-[#112936] px-4 py-3 text-white"
                  placeholder="Contact name"
                />
                <input
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  className="w-full rounded-3xl border border-white/10 bg-[#112936] px-4 py-3 text-white"
                  placeholder="Phone number"
                />
              </div>
              <button
                type="button"
                onClick={addContact}
                className="mt-4 rounded-full bg-[#00b4d8] px-6 py-3 text-sm font-semibold text-[#0f2027] transition hover:bg-teal-400"
              >
                Save contact
              </button>
            </div>
          ) : null}

          {showContactManager && contacts.length > 0 ? (
            <div className="mt-6 space-y-4 rounded-[28px] border border-white/10 bg-[#0d2830] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Emergency contacts</p>
                <button
                  type="button"
                  onClick={() => setShowContactManager(false)}
                  className="rounded-full bg-white/5 px-3 py-2 text-xs text-slate-300"
                >
                  Close
                </button>
              </div>
              {contacts.map((contact, index) => (
                <div
                  key={`${contact.name}-${contact.phone}`}
                  className={`flex items-center justify-between rounded-3xl border border-white/10 p-4 ${index === activeContactIndex ? 'bg-[#0f2027]' : 'bg-[#112936]'}`}
                >
                  <div>
                    <p className="font-semibold text-white">{contact.name}</p>
                    <p className="text-sm text-slate-400">{contact.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveContactIndex(index)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${index === activeContactIndex ? 'bg-[#00b4d8] text-[#0f2027]' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                    >
                      Select
                    </button>
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="rounded-full bg-white/5 px-3 py-2 text-xs text-rose-300 hover:bg-white/10"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-6 rounded-[28px] border border-white/10 bg-[#0d2830] p-6">
            <div className="grid gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Emergency Contact</p>
                <p className="mt-2 text-lg font-semibold text-white">👤 {selectedContact?.name || 'No contact selected'}</p>
                <p className="text-sm text-slate-400">{selectedContact?.phone || 'Add a contact to start.'}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Destination</p>
                <input
                  value={destination}
                  onChange={(event) => handleDestinationChange(event.target.value)}
                  className="mt-3 w-full rounded-3xl border border-white/10 bg-[#112936] px-4 py-4 text-white outline-none focus:border-[#00b4d8]"
                  placeholder="Enter your destination"
                />
              </div>
              <button
                type="button"
                onClick={startTrip}
                disabled={tripStarted || !selectedContact}
                className="w-full rounded-3xl bg-[#00b4d8] px-6 py-4 text-sm font-semibold text-[#0f2027] transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                START SAFE TRIP 🛡️
              </button>
              {preTripConfirmation ? (
                <p className="mt-4 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  {preTripConfirmation}
                </p>
              ) : null}
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
        </div>

        {tripStarted ? (
          <div className="space-y-6">
            {highRiskBanner ? (
              <div className="rounded-[28px] border border-amber-400/20 bg-[#43241f] p-4 text-sm text-amber-100">
                <p className="font-semibold">⚠️ You are entering a moderate risk area</p>
                <p className="mt-2">Nearest safe zone: {highRiskBanner.zone.name} — {highRiskBanner.zone.distance}</p>
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-[0.95fr_0.55fr]">
              <div className="rounded-[32px] border border-white/10 bg-[#112936]/90 p-5">
                <div className="mb-5 flex flex-col gap-3 rounded-[28px] border border-white/10 bg-[#0d2830] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Active trip</p>
                    <p className="mt-2 text-xl font-semibold text-white">{destination || 'Your destination'}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-sky-200">
                    Timer: {formatDuration(tripSeconds)}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[28px] border border-white/10 bg-[#0d2830] p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Current area</p>
                    <p className="mt-2 text-lg font-semibold text-white">{activeAreaRef.current?.name || 'Detecting location...'}</p>
                  </div>
                  <div className="rounded-[28px] border border-white/10 bg-[#0d2830] p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Safety score</p>
                    <p className="mt-2 text-lg font-semibold" style={{ color: areaScore?.color || '#fff' }}>
                      {activeAreaRef.current ? `${activeAreaRef.current.score}/100 — ${areaScore?.label}` : '—'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-[28px] border border-white/10 bg-[#0d2830] p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[#38bdf8] animate-pulse" />
                    <p className="text-sm text-slate-300">Live location tracking is active.</p>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">{statusMessage}</p>
                </div>

                <button
                  type="button"
                  onMouseDown={startSOSHold}
                  onTouchStart={startSOSHold}
                  onMouseUp={cancelSOSHold}
                  onMouseLeave={cancelSOSHold}
                  onTouchEnd={cancelSOSHold}
                  className="mt-6 mb-4 flex w-full items-center justify-center rounded-3xl bg-rose-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-rose-500 active:scale-[0.98]"
                >
                  <div className="relative flex h-14 w-full items-center justify-center rounded-3xl bg-[#7f1d1d] px-4">
                    <div
                      className="absolute inset-0 rounded-3xl border border-white/10"
                      style={{
                        background: `conic-gradient(rgba(255,255,255,0.35) ${sosHoldProgress}%, transparent ${sosHoldProgress}%)`
                      }}
                    />
                    <span className="relative z-10">{sosHolding ? (sosHoldProgress >= 100 ? 'SENDING!' : sosHoldProgress >= 75 ? '3...' : sosHoldProgress >= 50 ? '2...' : sosHoldProgress >= 25 ? '1...' : 'Hold...') : '🆘 SOS EMERGENCY — Hold for 3 seconds'}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={endTrip}
                  className="w-full rounded-3xl bg-rose-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-rose-400"
                >
                  END TRIP
                </button>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-[#112936]/90 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Trip metrics</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{(travelDistance / 1000).toFixed(2)} km</p>
                  </div>
                  <div className="rounded-3xl bg-[#0f2027] px-4 py-3 text-sm text-slate-300">{positionsRef.current.length} points</div>
                </div>
                <div className="space-y-4 rounded-[28px] border border-white/10 bg-[#0d2830] p-4">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Distance traveled</span>
                    <span>{(travelDistance / 1000).toFixed(2)} km</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Alert status</span>
                    <span>{alertSent ? 'Alert sent' : 'Monitoring'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Destination zone</span>
                    <span>{destinationArea?.name || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[#112936]/90 p-4">
              <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false} style={{ minHeight: '380px', borderRadius: '1.5rem' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                {currentPosition ? (
                  <CircleMarker
                    center={[currentPosition.lat, currentPosition.lng]}
                    pathOptions={{ color: '#38bdf8', fillColor: '#38bdf8' }}
                    radius={9}
                  />
                ) : null}
                {destinationPosition ? (
                  <Marker position={[destinationPosition.lat, destinationPosition.lng]} />
                ) : null}
              </MapContainer>
            </div>
          </div>
        ) : null}

        {alertState === 'pending' && alertArea ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
            <div className="w-full max-w-xl rounded-[32px] border border-rose-500/30 bg-[#0f1720] p-6 shadow-[0_0_40px_rgba(239,68,68,0.25)]">
              <p className="text-sm uppercase tracking-[0.3em] text-rose-300">⚠️ ARE YOU OKAY?</p>
              <h2 className="mt-4 text-2xl font-semibold text-white">You haven't moved for 10 minutes</h2>
              <p className="mt-3 text-sm text-slate-300">near {alertArea.name}</p>
              <p className="mt-1 text-sm text-slate-400">(Safety Score: {alertArea.score}/100)</p>
              <p className="mt-4 text-sm text-slate-300">Your emergency contact will be alerted in 60 seconds unless you confirm you're okay.</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={resolveAlert}
                  className="w-full rounded-3xl bg-emerald-500 px-6 py-4 text-sm font-semibold text-[#0f2027] transition hover:bg-emerald-400"
                >
                  ✅ I'M OKAY
                </button>
                <button
                  type="button"
                  onClick={triggerAlert}
                  className="w-full rounded-3xl bg-rose-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-rose-400"
                >
                  🆘 SEND ALERT NOW
                </button>
              </div>
              <p className="mt-4 text-center text-sm text-slate-400">Countdown: {alertCountdown}s</p>
            </div>
          </div>
        ) : null}

        {alertState === 'sent' ? (
          <div className="rounded-[32px] border border-white/10 bg-[#112936]/90 p-6">
            <div className="flex flex-col gap-3 rounded-[28px] border border-rose-400/20 bg-[#1c1315] p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-rose-200">🚨 ALERT SENT</p>
              <h2 className="text-2xl font-semibold text-white">Your emergency contact has been notified</h2>
              <p className="mt-3 text-sm text-slate-300">"Hi, this is an automated alert from SafeRoute SA. {selectedContact?.name || 'Your contact'} has not moved for 10 minutes near {alertArea?.name}, {alertArea?.score}/100. Last known location is being shared."</p>
              <div className="mt-6 space-y-4 rounded-[28px] border border-white/10 bg-[#0d2830] p-4">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Nearest safe zones</p>
                <div className="grid gap-3">
                  <div className="rounded-3xl bg-[#112936] p-4">
                    <p className="text-sm text-slate-300">Police station</p>
                    <p className="mt-1 font-semibold text-white">{safeZonesByArea[alertArea?.name]?.name || 'Nearby station'}</p>
                  </div>
                  <div className="rounded-3xl bg-[#112936] p-4">
                    <p className="text-sm text-slate-300">Hospital</p>
                    <p className="mt-1 font-semibold text-white">Central Medical Hub</p>
                  </div>
                  <div className="rounded-3xl bg-[#112936] p-4">
                    <p className="text-sm text-slate-300">Petrol station</p>
                    <p className="mt-1 font-semibold text-white">SafeFuel Station</p>
                  </div>
                </div>
              </div>
              <button className="mt-4 w-full rounded-3xl bg-rose-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-rose-400">
                CALL 10111
              </button>
            </div>
          </div>
        ) : null}

        {summary ? (
          <div className="rounded-[32px] border border-white/10 bg-[#112936]/90 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">✅ TRIP COMPLETE</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-[#0d2830] p-5">
                <p className="text-sm text-slate-400">Duration</p>
                <p className="mt-2 text-lg font-semibold text-white">{summary.duration}</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-[#0d2830] p-5">
                <p className="text-sm text-slate-400">Distance</p>
                <p className="mt-2 text-lg font-semibold text-white">{summary.distance} km</p>
              </div>
            </div>
            <div className="mt-6 rounded-[28px] border border-white/10 bg-[#0d2830] p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Safety Summary</p>
              <div className="mt-4 space-y-3">
                {summary.areas.map((area) => {
                  const meta = getRiskMeta(area.score);
                  return (
                    <div key={area.name} className="flex items-center justify-between rounded-3xl bg-[#112936] p-4">
                      <div>
                        <p className="font-semibold text-white">{area.name}</p>
                        <p className="text-sm text-slate-400">{meta.label}</p>
                      </div>
                      <p className="font-semibold" style={{ color: meta.color }}>{area.score}/100</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 rounded-[28px] border border-white/10 bg-[#0d2830] p-5 text-sm text-slate-300">
              No alerts triggered {alertSent ? '— alert was sent during this trip.' : '✅'}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="w-full rounded-3xl bg-[#00b4d8] px-6 py-4 text-sm font-semibold text-[#0f2027] transition hover:bg-teal-400"
                onClick={() => {
                  const shareText = `SafeRoute SA Trip: ${summary.duration}, ${summary.distance} km, areas: ${summary.areas.map((area) => area.name).join(', ')}.`;
                  if (navigator.share) {
                    navigator.share({ title: 'SafeRoute SA Trip Summary', text: shareText });
                  } else {
                    navigator.clipboard.writeText(shareText);
                  }
                }}
              >
                SHARE TRIP SUMMARY
              </button>
              <button
                type="button"
                className="w-full rounded-3xl border border-white/10 bg-[#0f1720] px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/5"
                onClick={() => setSummary(null)}
              >
                DONE
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SafeCheckIn;
