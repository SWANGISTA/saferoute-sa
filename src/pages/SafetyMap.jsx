import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

const mockIncidents = [
  { id: 1, type: 'Crime', location: 'Central Station', lat: -26.2041, lng: 28.0473, time: '15m ago', severity: 'High' },
  { id: 2, type: 'Road Hazard', location: 'Ocean Drive', lat: -26.1052, lng: 28.0560, time: '40m ago', severity: 'Medium' },
  { id: 3, type: 'Unrest', location: 'City Hall Precinct', lat: -25.7479, lng: 28.1878, time: '1h ago', severity: 'High' },
  { id: 4, type: 'Flooding', location: 'Soweto Highway', lat: -26.2678, lng: 27.8585, time: '2h ago', severity: 'Medium' },
  { id: 5, type: 'Crime', location: 'Soshanguve Block L', lat: -25.5272, lng: 28.0945, time: '30m ago', severity: 'High' }
];

const iconMap = {
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

const severityClasses = {
  High: 'bg-rose-500/10 text-rose-200',
  Medium: 'bg-amber-500/10 text-amber-200',
  Low: 'bg-emerald-500/10 text-emerald-200'
};

const FilterMap = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 10);
    }
  }, [center, map]);

  return null;
};

const SafetyMap = () => {
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [mapCenter, setMapCenter] = useState([-26.2041, 28.0473]);
  const mapRef = useRef(null);
  const markerRefs = useRef({});

  const filteredIncidents = useMemo(() => {
    if (!activeFilter) return mockIncidents;
    return mockIncidents.filter((incident) => incident.type === activeFilter);
  }, [activeFilter]);

  const handleFilterClick = (filter) => {
    setActiveFilter((current) => (current === filter ? null : filter));
    setSelectedIncidentId(null);
  };

  useEffect(() => {
    if (!selectedIncidentId || !mapRef.current) return;
    const incident = mockIncidents.find((item) => item.id === selectedIncidentId);
    if (!incident) return;

    mapRef.current.flyTo([incident.lat, incident.lng], 13, { duration: 0.8 });
    const marker = markerRefs.current[selectedIncidentId];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedIncidentId]);

  const handleReportClick = (incident) => {
    setSelectedIncidentId(incident.id);
  };

  return (
    <div className="space-y-8 pb-28 xl:pb-0">
      <div className="rounded-[32px] border border-white/10 bg-[#112936]/90 p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Safety Map</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Explore safe zones and incident reports</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Crime', 'Road Hazard', 'Flooding', 'Unrest'].map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => handleFilterClick(filter)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'border-[#00b4d8] bg-[#0f2027] shadow-[0_0_20px_rgba(0,180,216,0.25)] text-white'
                      : 'border-white/10 bg-white/5 text-slate-200 hover:bg-[#00b4d8]/20'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#0d2830]/90 p-6">
          <div className="h-[600px] rounded-[28px] bg-[#091421] shadow-inner shadow-black/30">
            <MapContainer
              center={mapCenter}
              zoom={10}
              whenCreated={(map) => {
                mapRef.current = map;
              }}
              className="h-full w-full rounded-[28px]"
              scrollWheelZoom={false}
            >
              <FilterMap center={mapCenter} />
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {filteredIncidents.map((incident) => (
                <Marker
                  key={incident.id}
                  position={[incident.lat, incident.lng]}
                  icon={iconMap[incident.type]}
                  ref={(ref) => {
                    if (ref) markerRefs.current[incident.id] = ref;
                  }}
                >
                  <Popup>
                    <div className="space-y-2 text-left text-sm text-slate-900">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{incident.type}</p>
                      <p className="text-base font-semibold">{incident.location}</p>
                      <p className="text-sm text-slate-600">{incident.time}</p>
                      <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${severityClasses[incident.severity]}`}>
                        Severity: {incident.severity}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="space-y-4 rounded-[32px] border border-white/10 bg-[#112936]/90 p-6">
          <h2 className="text-xl font-semibold text-white">Recent reports</h2>
          <div className="space-y-3">
            {mockIncidents.map((incident) => (
              <button
                key={incident.id}
                type="button"
                onClick={() => handleReportClick(incident)}
                className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                  selectedIncidentId === incident.id
                    ? 'border-[#00b4d8] bg-[#0d3f53] shadow-[0_0_30px_rgba(0,180,216,0.14)]'
                    : 'border-white/10 bg-[#0d2830] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{incident.location}</p>
                    <p className="mt-1 text-sm text-slate-400">{incident.type} • {incident.time}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${severityClasses[incident.severity]}`}>
                    {incident.severity}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyMap;
