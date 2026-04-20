import { NavLink } from 'react-router-dom';
import { FiMap, FiShield, FiHeart, FiBell, FiUser } from 'react-icons/fi';
import Logo from './Logo';

const navItems = [
  { to: '/map', label: 'Map', icon: FiMap },
  { to: '/route', label: 'Route', icon: FiShield },
  { to: '/score', label: 'Score', icon: FiShield },
  { to: '/checkin', label: 'Check-In', icon: FiHeart },
  { to: '/alerts', label: 'Alerts', icon: FiBell },
  { to: '/profile', label: 'Profile', icon: FiUser }
];

const TopNavbar = () => {
  return (
    <header className="border-b border-white/10 bg-[#0f2027]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center">
          <div className="block md:hidden">
            <Logo size="small" />
          </div>
          <div className="hidden md:block">
            <Logo size="large" />
          </div>
        </div>
        <nav className="hidden xl:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-[#00b4d8] text-[#0f2027]' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default TopNavbar;
