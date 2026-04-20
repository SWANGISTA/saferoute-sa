const SavedRoutes = () => {
  return (
    <div className="pb-28 xl:pb-0">
      <div className="space-y-6 rounded-[32px] border border-white/10 bg-[#112936]/90 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Saved routes</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Your trusted routes</h1>
          </div>
          <button className="rounded-full bg-[#00b4d8] px-5 py-3 text-sm font-semibold text-[#0f2027]">Add new route</button>
        </div>
        <div className="space-y-4">
          {[
            { name: 'Central Safe Loop', from: 'Central Station', to: 'Green Park', score: 87, status: 'Safe', alerts: true },
            { name: 'Waterfront Commute', from: 'Riverfront Walk', to: 'City Hall', score: 72, status: 'Caution', alerts: false },
            { name: 'Tourist Safe Path', from: 'Museum Quarter', to: 'Historic Market', score: 94, status: 'Very Safe', alerts: true }
          ].map((route) => (
            <div key={route.name} className="rounded-3xl border border-white/10 bg-[#0d2830] p-5 xl:flex xl:items-center xl:justify-between xl:gap-6">
              <div>
                <p className="text-sm text-slate-400">{route.name}</p>
                <p className="mt-2 text-lg font-semibold text-white">{route.from} → {route.to}</p>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 xl:mt-0">
                <span className="rounded-full bg-[#00b4d822] px-3 py-1 text-sm text-[#d7ffff]">{route.status}</span>
                <span className="rounded-full bg-[#0f2027] px-3 py-1 text-sm text-slate-300">{route.score}% safe</span>
                <button className={`rounded-full px-3 py-1 text-sm font-semibold ${route.alerts ? 'bg-[#00b4d8] text-[#0f2027]' : 'bg-white/5 text-slate-300'}`}>
                  {route.alerts ? 'Alerts On' : 'Alerts Off'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedRoutes;
