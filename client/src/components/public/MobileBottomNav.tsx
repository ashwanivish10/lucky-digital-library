import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Sparkles, CreditCard, PhoneCall, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const { user, isAdmin } = useAuth();

  const accountPath = user ? (isAdmin ? '/admin' : '/portal') : '/login';
  const accountLabel = user ? (isAdmin ? 'Admin' : 'Portal') : 'Login';

  const navItems = [
    { label: 'Home', path: '/', icon: Home, end: true },
    { label: 'Facilities', path: '/facilities', icon: Sparkles },
    { label: 'Plans', path: '/membership', icon: CreditCard },
    { label: 'Contact', path: '/contact', icon: PhoneCall },
    { label: accountLabel, path: accountPath, icon: User },
  ];

  return (
    <nav
      className="mobile-bottom-nav md:hidden"
      aria-label="Mobile Bottom Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `mobile-bottom-nav-item flex-1 ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative flex items-center justify-center">
                  <Icon
                    size={22}
                    className={`transition-transform duration-200 ${
                      isActive
                        ? 'text-[#a38b52] stroke-[2.4] scale-110'
                        : 'text-[#8a7a60] stroke-[1.8]'
                    }`}
                  />
                </div>
                <span
                  className={`text-[11px] mt-0.5 tracking-tight transition-colors duration-200 ${
                    isActive ? 'font-bold text-[#a38b52]' : 'font-medium text-[#8a7a60]'
                  }`}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
