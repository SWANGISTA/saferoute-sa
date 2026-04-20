const StatCard = ({ label, value }) => {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
      <p className="text-sm uppercase tracking-[0.28em] text-slate-400">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
};

export default StatCard;
