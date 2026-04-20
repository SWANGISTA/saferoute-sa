import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const IncidentReport = () => {
  const { search } = useLocation();
  const [location, setLocation] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(search);
    const area = params.get('area') || '';
    setLocation(area);
  }, [search]);

  return (
    <div className="pb-28 xl:pb-0">
      <div className="space-y-6 rounded-[32px] border border-white/10 bg-[#112936]/90 p-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Incident Report</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Report an unsafe area</h1>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-[28px] border border-white/10 bg-[#0d2830] p-6">
            <label className="text-sm text-slate-300">Incident type</label>
            <select className="w-full rounded-3xl border border-white/10 bg-[#112936] px-4 py-3 text-white">
              <option>Crime</option>
              <option>Road Hazard</option>
              <option>Flooding</option>
              <option>Protest</option>
              <option>Broken Infrastructure</option>
              <option>Other</option>
            </select>
            <label className="text-sm text-slate-300">Location</label>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-[#112936] px-4 py-3 text-white"
              placeholder="Auto-detect or pin on map"
            />
            <label className="text-sm text-slate-300">Photo upload</label>
            <input type="file" className="w-full text-sm text-slate-200" />
          </div>
          <div className="space-y-4 rounded-[28px] border border-white/10 bg-[#0d2830] p-6">
            <label className="text-sm text-slate-300">Description</label>
            <textarea className="h-40 w-full rounded-3xl border border-white/10 bg-[#112936] p-4 text-white" placeholder="Describe what you observed" />
            <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-[#112936] px-4 py-3 text-sm text-slate-200">
              <span>Submit anonymously</span>
              <input type="checkbox" className="h-5 w-5 accent-[#00b4d8]" />
            </div>
            <button className="w-full rounded-full bg-[#00b4d8] px-6 py-3 text-sm font-semibold text-[#0f2027]">Submit report</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentReport;
