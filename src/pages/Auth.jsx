import { useState } from 'react';

const Auth = () => {
  const [tab, setTab] = useState('login');

  return (
    <div className="min-h-screen px-4 py-12 xl:px-0">
      <div className="mx-auto max-w-3xl rounded-[36px] border border-white/10 bg-[#112936]/90 p-8 shadow-xl shadow-black/20">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Welcome</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Login or create an account</h1>
          </div>
          <div className="flex gap-3 rounded-full bg-white/5 p-1">
            {['login', 'register'].map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  tab === item ? 'bg-[#00b4d8] text-[#0f2027]' : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                {item === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>
        </div>
        <form className="space-y-5">
          {tab === 'register' && (
            <div>
              <label className="mb-2 block text-sm text-slate-300">Name</label>
              <input className="w-full rounded-3xl border border-white/10 bg-[#0d2830] px-4 py-3 text-white" placeholder="Your full name" />
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <input className="w-full rounded-3xl border border-white/10 bg-[#0d2830] px-4 py-3 text-white" placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Password</label>
            <input type="password" className="w-full rounded-3xl border border-white/10 bg-[#0d2830] px-4 py-3 text-white" placeholder="Enter password" />
          </div>
          <button className="w-full rounded-full bg-[#00b4d8] px-6 py-3 text-sm font-semibold text-[#0f2027]">
            {tab === 'login' ? 'Login' : 'Create account'}
          </button>
          <div className="text-center text-sm text-slate-400">or continue as <button className="font-semibold text-white underline">guest</button></div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
