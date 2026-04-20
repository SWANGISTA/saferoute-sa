import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Dashboard' },
  { to: '/incident-report', label: 'Report' },
  { to: '/hazard-register', label: 'Hazards' },
  { to: '/inspection-checklist', label: 'Checklist' },
  { to: '/reports', label: 'Reports' }
];

const MobileBottomNav = () => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-2 border-t border-[#20355f] bg-[#0f234d] px-4 py-3 xl:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex-1 rounded-2xl px-3 py-2 text-center text-xs font-semibold ${
              isActive ? 'bg-gijima-red text-white' : 'text-slate-300 hover:bg-[#163560]'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
