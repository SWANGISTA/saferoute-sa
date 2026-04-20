const Profile = () => {
  return (
    <div className="pb-28 xl:pb-0">
      <div className="rounded-[32px] border border-white/10 bg-[#112936]/90 p-6">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6 rounded-[28px] border border-white/10 bg-[#0d2830] p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">User profile</p>
            <h1 className="text-3xl font-semibold text-white">Jane Doe</h1>
            <p className="text-slate-300">jane.doe@example.com</p>
            <div className="space-y-3 rounded-3xl border border-white/10 bg-[#112936] p-5">
              <p className="text-sm text-slate-400">Reports submitted</p>
              <p className="text-2xl font-semibold text-white">18</p>
            </div>
            <div className="space-y-3 rounded-3xl border border-white/10 bg-[#112936] p-5">
              <p className="text-sm text-slate-400">Saved routes</p>
              <p className="text-2xl font-semibold text-white">5</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#112936] p-5">
              <label className="flex items-center justify-between gap-3 text-sm text-slate-300">
                Notification preferences
                <input type="checkbox" className="h-5 w-5 accent-[#00b4d8]" defaultChecked />
              </label>
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-[#0d2830] p-6">
            <h2 className="text-xl font-semibold text-white">Profile details</h2>
            <p className="mt-4 text-slate-300">Name: Jane Doe</p>
            <p className="mt-2 text-slate-300">Email: jane.doe@example.com</p>
            <p className="mt-2 text-slate-300">Saved routes: 5</p>
            <p className="mt-2 text-slate-300">Reports submitted: 18</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
