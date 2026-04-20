import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#081a36] via-[#122856] to-[#0d2152] px-4">
      <div className="w-full max-w-md rounded-[32px] border border-[#23365a] bg-[#102654]/95 p-10 shadow-2xl shadow-black/40">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gijima-red text-3xl">G</div>
          <h2 className="mt-6 text-3xl font-semibold">SafeRoute SA</h2>
          <p className="mt-2 text-slate-300">Gijima workplace safety platform</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Username</label>
            <input
              name="username"
              type="text"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="w-full px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Password</label>
            <input
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-3"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-2xl bg-gijima-red px-4 py-3 text-base text-white transition hover:bg-[#a83229]"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
