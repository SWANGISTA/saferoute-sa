import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/incident-report', label: 'Incident Report' },
  { to: '/hazard-register', label: 'Hazard Register' },
  { to: '/inspection-checklist', label: 'Checklist' },
  { to: '/reports', label: 'Reports' }
];

const Sidebar = () => {
  return (
    <aside className="hidden xl:flex xl:w-72 xl:flex-col bg-[#11254d] border-r border-[#20355f]">
      <div className="px-6 py-8 border-b border-[#20355f]">
        <div className="text-gijima-red text-sm uppercase tracking-[0.24em]">SafeRoute SA</div>
        <h1 className="mt-4 text-2xl font-semibold">Gijima Safety</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive ? 'bg-gijima-red text-white shadow-lg shadow-gijima-red/20' : 'text-slate-200 hover:bg-[#163560]'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-6 border-t border-[#20355f] text-sm text-slate-400">
        Corporate safety workspace for occupational health and safety.
      </div>
    </aside>
  );
};

export default Sidebar;
