const SafetyAlerts = () => {
  return (
    <div className="pb-28 xl:pb-0">
      <div className="space-y-6 rounded-[32px] border border-white/10 bg-[#112936]/90 p-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Safety Alerts</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Alerts near you</h1>
        </div>
        <div className="space-y-4">
          {[
            { type: 'Crime', distance: '1.2km', time: '10m ago', severity: 'High', title: 'Assault reported at Market Street' },
            { type: 'Road Hazard', distance: '2.0km', time: '45m ago', severity: 'Medium', title: 'Flooded lane on Main Road' },
            { type: 'Unrest', distance: '3.4km', time: '1h ago', severity: 'High', title: 'Protest near City Hall' }
          ].map((alert) => (
            <div key={alert.title} className="rounded-3xl border border-white/10 bg-[#0d2830] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{alert.type}</p>
                  <p className="mt-2 font-semibold text-white">{alert.title}</p>
                </div>
                <span className="rounded-full bg-[#00b4d822] px-3 py-1 text-sm font-semibold text-[#d7ffff]">{alert.severity}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span>{alert.distance}</span>
                <span>{alert.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SafetyAlerts;
