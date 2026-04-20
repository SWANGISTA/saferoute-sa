import { NavLink } from 'react-router-dom';
import { FiMap, FiShield, FiHeart, FiPlusCircle, FiBell, FiUser } from 'react-icons/fi';

const items = [
  { to: '/map', label: 'Map', icon: FiMap },
  { to: '/route', label: 'Route', icon: FiShield },
  { to: '/checkin', label: 'Check-In', icon: FiHeart },
  { to: '/report', label: 'Report', icon: FiPlusCircle },
  { to: '/alerts', label: 'Alerts', icon: FiBell },
  { to: '/profile', label: 'Profile', icon: FiUser }
];

const BottomNav = () => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-[1400px] justify-between gap-2 border-t border-white/10 bg-[#0f2027]/95 px-4 py-3 xl:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 rounded-3xl px-3 py-2 text-center text-[11px] font-semibold transition ${
                isActive ? 'bg-[#00b4d8] text-[#0f2027]' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="mx-auto h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
