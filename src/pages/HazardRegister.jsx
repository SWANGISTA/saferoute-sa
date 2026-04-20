import { useMemo, useState } from 'react';
import { hazardList } from '../data/mockData';

const statusStyles = {
  Open: 'bg-[#C0392B]/10 text-[#F1948A]',
  'In Progress': 'bg-[#F39C12]/10 text-[#F7DC6F]',
  Closed: 'bg-[#2ECC71]/10 text-[#ABEBC6]'
};

const HazardRegister = () => {
  const [severityFilter, setSeverityFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  const filteredHazards = useMemo(() => {
    return hazardList.filter((hazard) => {
      const severityMatch = severityFilter === 'All' || hazard.severity === severityFilter;
      const dateMatch = dateFilter === 'All' || (dateFilter === 'Last 7 days' && new Date(hazard.reported) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      return severityMatch && dateMatch;
    });
  }, [severityFilter, dateFilter]);

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-[#20355f] bg-[#0f234d]/90 p-6">
        <h2 className="text-2xl font-semibold">Hazard Register</h2>
        <p className="mt-2 text-slate-400">Review hazards and manage status by severity and date.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.35fr]">
        <div className="rounded-[32px] border border-[#20355f] bg-[#11254d]/90 p-6 overflow-x-auto">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Logged hazards</h3>
              <p className="text-slate-400">Active hazard records for the network.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="rounded-2xl px-4 py-3">
                <option>All</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="rounded-2xl px-4 py-3">
                <option>All</option>
                <option>Last 7 days</option>
              </select>
            </div>
          </div>

          <table className="min-w-full divide-y divide-[#20355f] text-left text-sm text-slate-200">
            <thead>
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reported</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#20355f]">
              {filteredHazards.map((hazard) => (
                <tr key={hazard.id} className="bg-[#0c1e42] hover:bg-[#132d57]">
                  <td className="px-4 py-4 font-medium text-slate-100">{hazard.id}</td>
                  <td className="px-4 py-4 text-slate-300">{hazard.location}</td>
                  <td className="px-4 py-4 text-slate-300">{hazard.severity}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[hazard.status]}`}>
                      {hazard.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{hazard.reported}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6 rounded-[32px] border border-[#20355f] bg-[#11254d]/90 p-6">
          <div>
            <h3 className="text-xl font-semibold">Hazard summary</h3>
            <p className="mt-2 text-slate-400">Key risk levels and latest closure targets.</p>
          </div>
          <div className="rounded-3xl border border-[#20355f] bg-[#0f234d] p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Critical focus</p>
            <p className="mt-4 text-lg font-semibold">Investigate 5 highest-risk hazards this week.</p>
          </div>
          <div className="rounded-3xl border border-[#20355f] bg-[#0f234d] p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Completed</p>
            <p className="mt-4 text-lg font-semibold">35% closed since last review.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HazardRegister;
