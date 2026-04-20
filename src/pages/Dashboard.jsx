import { overviewCards, recentActivity } from '../data/mockData';

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-[#20355f] bg-[#0f234d]/90 p-6 shadow-lg shadow-black/20">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Dashboard</p>
            <h2 className="mt-2 text-3xl font-semibold">Overview</h2>
            <p className="mt-2 text-slate-300">At a glance status for incidents, hazards and inspections.</p>
          </div>
          <div className="rounded-3xl bg-[#11254d] px-4 py-3 text-sm text-slate-300">Updated 5 minutes ago</div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((item) => (
            <div key={item.label} className="rounded-3xl border border-[#20355f] bg-[#122856] p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="text-2xl">{item.icon}</div>
                <div className="rounded-2xl bg-[#153a72] px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">Live</div>
              </div>
              <p className="mt-6 text-3xl font-semibold">{item.value}</p>
              <p className="mt-2 text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-[32px] border border-[#20355f] bg-[#0f234d]/90 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Incident action plan</h3>
              <p className="text-slate-400">Recent metrics and activity to monitor response.</p>
            </div>
            <span className="rounded-2xl bg-gijima-red/10 px-3 py-1 text-sm text-gijima-red">Priority</span>
          </div>
          <div className="mt-8 space-y-4">
            {recentActivity.map((event) => (
              <div key={event.id} className="rounded-3xl border border-[#20355f] bg-[#11254d] px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{event.title}</p>
                  <span className="text-sm text-slate-400">{event.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-[#20355f] bg-[#0f234d]/90 p-6">
          <h3 className="text-xl font-semibold">Safety pulse</h3>
          <p className="mt-2 text-slate-400">Current workload and inspection readiness.</p>
          <div className="mt-8 space-y-6">
            <div className="rounded-3xl bg-[#11254d] p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Response time</p>
              <div className="mt-4 h-3 rounded-full bg-slate-700">
                <div className="h-3 w-3/4 rounded-full bg-gijima-red" />
              </div>
              <p className="mt-3 text-sm text-slate-300">75% of incidents reviewed within 2 hours.</p>
            </div>
            <div className="rounded-3xl bg-[#11254d] p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Hazard control</p>
              <div className="mt-4 h-3 rounded-full bg-slate-700">
                <div className="h-3 w-1/2 rounded-full bg-[#f39c12]" />
              </div>
              <p className="mt-3 text-sm text-slate-300">Open hazards are being tracked and assigned.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
