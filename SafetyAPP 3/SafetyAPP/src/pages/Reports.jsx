const Reports = () => {
  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-[#20355f] bg-[#0f234d]/90 p-6">
        <h2 className="text-2xl font-semibold">Reports</h2>
        <p className="mt-2 text-slate-400">Dashboard placeholders for charts and analytics.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[32px] border border-[#20355f] bg-[#11254d]/90 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Incident trend</h3>
              <p className="text-slate-400">Dummy area for future chart visualization.</p>
            </div>
            <span className="rounded-2xl bg-[#153a72] px-3 py-1 text-sm text-slate-300">Monthly</span>
          </div>
          <div className="mt-8 h-72 rounded-[28px] bg-[#0b1b3b] p-8 text-slate-500">
            <p className="text-center text-lg font-semibold">Chart area</p>
            <p className="mt-3 text-center text-sm">Add line or bar chart here with incident metrics.</p>
          </div>
        </div>

        <div className="rounded-[32px] border border-[#20355f] bg-[#11254d]/90 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Hazard breakdown</h3>
              <p className="text-slate-400">Planned analytics panel for severity distribution.</p>
            </div>
            <span className="rounded-2xl bg-[#153a72] px-3 py-1 text-sm text-slate-300">Summary</span>
          </div>
          <div className="mt-8 h-72 rounded-[28px] bg-[#0b1b3b] p-8 text-slate-500">
            <p className="text-center text-lg font-semibold">Chart area</p>
            <p className="mt-3 text-center text-sm">Use this space for pie or donut charts later.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
