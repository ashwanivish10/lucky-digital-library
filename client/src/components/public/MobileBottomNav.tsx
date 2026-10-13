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
                    size={20}
                    className={
                      isActive
                        ? 'text-[#087d99] stroke-[2.4]'
                        : 'text-[#65788c] stroke-[1.8]'
                    }
                  />
                  {isActive && (
                    <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-[#13b8c8]" />
                  )}
                </div>
                <span
                  className={`text-[10px] mt-0.5 tracking-tight ${
                    isActive ? 'font-bold text-[#087d99]' : 'font-medium text-[#65788c]'
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
