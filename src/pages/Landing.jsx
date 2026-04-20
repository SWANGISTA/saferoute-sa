import { useState } from 'react';
import { FiMapPin, FiShield, FiUsers, FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import PrimaryButton from '../components/PrimaryButton';

const stats = [
  { label: 'Reports submitted', value: '10,000+' },
  { label: 'Cities covered', value: '50+' },
  { label: 'Safe routes shared', value: '2,400+' },
  { label: 'Active users', value: '120,000+' }
];

const Landing = () => {
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const navigate = useNavigate();

  const handleFindRoute = (e) => {
    e.preventDefault();
    navigate('/route');
  };

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[#112936] px-6 py-10 xl:px-16 xl:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,180,216,0.25),_transparent_35%)]" />
        <div className="relative mx-auto flex max-w-[1280px] flex-col gap-10 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl space-y-6">
            <span className="inline-block rounded-full border border-[#00b4d855] bg-[#00b4d822] px-4 py-2 text-xs uppercase tracking-[0.36em] text-[#b4f0ff]">
              Stay Safe, Navigate Smart
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl xl:text-6xl">
              SafeRoute SA helps everyday people find safer paths and report unsafe areas.
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-300">
              Plan secure journeys, stay aware of recent incidents, and contribute to safer streets with route guidance designed for commuters, tourists, and anyone on the move.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00b4d855] text-[#0f2027]">
                  <FiMapPin className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm text-slate-400">Trusted routing</p>
                <p className="mt-2 text-lg font-semibold text-white">Smart directions</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00b4d855] text-[#0f2027]">
                  <FiShield className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm text-slate-400">Safety-first</p>
                <p className="mt-2 text-lg font-semibold text-white">Risk-aware plans</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00b4d855] text-[#0f2027]">
                  <FiUsers className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm text-slate-400">Community</p>
                <p className="mt-2 text-lg font-semibold text-white">Crowdsourced data</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00b4d855] text-[#0f2027]">
                  <FiStar className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm text-slate-400">Confidence</p>
                <p className="mt-2 text-lg font-semibold text-white">Safe choices</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-[32px] border border-white/10 bg-[#0d2830] p-8 shadow-xl shadow-black/20 xl:max-w-md">
            <div className="rounded-3xl border border-[#00b4d855] bg-[#0f3b4a]/80 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Route planner</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Find your safest route</h2>
            </div>
            <form className="space-y-4" onSubmit={handleFindRoute}>
              <label className="block text-sm text-slate-300">From</label>
              <input
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                placeholder="Enter starting point"
                className="w-full rounded-3xl border border-white/10 bg-[#112936] px-4 py-3 text-white"
              />
              <label className="block text-sm text-slate-300">To</label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination"
                className="w-full rounded-3xl border border-white/10 bg-[#112936] px-4 py-3 text-white"
              />
              <PrimaryButton type="submit" className="w-full">Find Safe Route</PrimaryButton>
            </form>
            <div className="grid gap-4 sm:grid-cols-2">
              {stats.map((item) => (
                <StatCard key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-[1280px] space-y-4 px-4 xl:px-0">
        <div className="rounded-[32px] border border-white/10 bg-[#112936]/90 p-8 shadow-xl shadow-black/10">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Featured coverage</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Navigate safer city routes with confidence.</h2>
            </div>
            <PrimaryButton onClick={() => navigate('/map')}>Open Safety Map</PrimaryButton>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-[#0d2830] p-6">
              <p className="text-sm text-slate-400">Interactive map</p>
              <p className="mt-3 text-lg font-semibold text-white">See safe zones and recent reports at a glance.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#0d2830] p-6">
              <p className="text-sm text-slate-400">Report unsafe areas</p>
              <p className="mt-3 text-lg font-semibold text-white">Submit incident reports quickly from your phone.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#0d2830] p-6">
              <p className="text-sm text-slate-400">Save routes</p>
              <p className="mt-3 text-lg font-semibold text-white">Keep the safest paths for your daily commute.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
