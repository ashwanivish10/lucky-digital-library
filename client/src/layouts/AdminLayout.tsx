import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  PlusCircle,
  Settings,
  MessageSquare,
  Menu,
  X,
  LogOut,
  ChevronDown,
  User as UserIcon,
  Bell,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../lib/utils';
import { messagesApi } from '../lib/api';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Automatically close mobile sidebar when route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Poll/fetch unread messages count
  useEffect(() => {
    let isMounted = true;
    const fetchCount = () => {
      messagesApi
        .getUnreadCount()
        .then((res) => {
          if (isMounted && typeof res.data?.count === 'number') {
            setUnreadCount(res.data.count);
          }
        })
        .catch(() => {});
    };

    fetchCount();
    const timer = setInterval(fetchCount, 25000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      // ignore
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path === '/admin/students') return 'Students Directory';
    if (path === '/admin/students/add') return 'Add Student';
    if (path.startsWith('/admin/students/') && path.includes('/edit')) return 'Edit Student';
    if (path.startsWith('/admin/students/')) return 'Student Details';
    if (path === '/admin/approvals') return 'Pending Approvals';
    if (path === '/admin/payments') return 'Payments';
    if (path === '/admin/payments/record') return 'Record Payment';
    if (path === '/admin/payments/reports') return 'Financial Reports';
    if (path === '/admin/memberships') return 'Memberships';
    if (path === '/admin/messages') return 'Messages & Inquiries';
    if (path === '/admin/settings') return 'Library Settings';
    return 'Admin Portal';
  };

  interface NavItem {
    label: string;
    path: string;
    icon: React.ElementType;
    end?: boolean;
    badge?: number;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      title: 'Dashboard',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
      ],
    },
    {
      title: 'Students',
      items: [
        { label: 'All Students', path: '/admin/students', icon: Users, end: true },
        { label: 'Add Student', path: '/admin/students/add', icon: UserPlus },
      ],
    },
    {
      title: 'Finance',
      items: [
        { label: 'Payments', path: '/admin/payments', icon: CreditCard, end: true },
        { label: 'Record Payment', path: '/admin/payments/record', icon: PlusCircle },
      ],
    },
    {
      title: 'Library',
      items: [
        { label: 'Messages', path: '/admin/messages', icon: MessageSquare, badge: unreadCount },
        { label: 'Settings', path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="admin-shell relative flex min-h-screen bg-[#faf6f0] font-sans">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 transition-opacity md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full max-h-screen flex-col border-r border-white/10 bg-[#071521] text-white transition-transform duration-300 ease-in-out md:static md:h-screen md:sticky md:top-0 md:translate-x-0 ${
          sidebarCollapsed ? 'md:w-[72px] md:min-w-[72px]' : 'md:w-[260px] md:min-w-[260px]'
        } w-[280px] min-w-[280px] ${
          mobileSidebarOpen
            ? 'translate-x-0 shadow-2xl pointer-events-auto visible'
            : '-translate-x-full pointer-events-none md:pointer-events-auto max-md:invisible'
        }`}
      >
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#e8d5a8] to-transparent" />

        {/* Logo Section */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 min-w-[36px] items-center justify-center rounded-xl border border-[#e8d5a8]/25 bg-gradient-to-br from-[#f5ead4] via-[#e8d5a8] to-[#d4b87a] text-lg font-black text-[#071521] shadow-[0_8px_22px_rgba(93,196,255,0.2)]">
              L
            </div>
            <div className={`truncate ${sidebarCollapsed ? 'md:hidden' : 'block'}`}>
              <span className="block font-[family-name:var(--font-ui)] text-sm font-black leading-tight tracking-[-0.04em] text-white">
                Lucky Digital Library
              </span>
              <span className="mt-0.5 block font-[family-name:var(--font-ui)] text-[9px] font-bold uppercase tracking-[0.18em] text-[#e8d5a8]">
                Admin Portal
              </span>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            type="button"
            className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="px-2">
              <div
                className={`px-4 py-2 md:px-3 md:py-1.5 font-[family-name:var(--font-ui)] text-[9px] font-bold uppercase tracking-[0.2em] text-[#e8d5a8]/50 ${
                  sidebarCollapsed ? 'md:hidden' : 'block'
                }`}
              >
                {section.title}
              </div>
              <div className="space-y-1.5 md:space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={({ isActive }) =>
                        `relative flex items-center gap-3 rounded-xl min-h-[48px] px-4 py-3 md:min-h-0 md:px-3 md:py-2.5 text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-[#e8d5a8]/10 text-[#e8d5a8] ring-1 ring-inset ring-[#e8d5a8]/15 font-semibold'
                            : 'text-white/65 hover:bg-white/5 hover:text-white'
                        } ${sidebarCollapsed ? 'md:justify-center md:px-0' : ''}`
                      }
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <div className="relative flex items-center justify-center">
                        <Icon size={18} className="flex-shrink-0" />
                        {sidebarCollapsed && item.badge && item.badge > 0 ? (
                          <span className="hidden md:block absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#c2a66e] ring-2 ring-[#071521]" />
                        ) : null}
                      </div>
                      <span className={`truncate flex-1 ${sidebarCollapsed ? 'md:hidden' : 'block'}`}>
                        {item.label}
                      </span>
                      {item.badge && item.badge > 0 ? (
                        <span
                          className={`ml-auto inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c2a66e] text-[#071521] ${
                            sidebarCollapsed ? 'md:hidden' : 'inline-flex'
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom View Public Site link */}
        <div className="border-t border-white/10 p-3">
          <NavLink
            to="/"
            target="_blank"
            className={`flex items-center gap-2.5 rounded-xl min-h-[48px] px-4 py-3 md:min-h-0 md:px-3 md:py-2.5 text-xs text-[#e8d5a8] transition-all hover:bg-white/5 hover:text-white ${
              sidebarCollapsed ? 'md:justify-center md:px-0' : ''
            }`}
            title="View Public Site"
          >
            <ExternalLink size={16} className="flex-shrink-0" />
            <span className={`font-medium tracking-wide ${sidebarCollapsed ? 'md:hidden' : 'inline'}`}>
              View Public Site
            </span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col bg-[#faf6f0] md:h-screen md:overflow-hidden">
        {/* TopBar */}
        <header className="sticky top-0 z-30 flex h-16 min-w-0 flex-shrink-0 items-center justify-between gap-2 border-b border-[#e8dcc8] bg-white px-3 shadow-[0_2px_8px_rgba(7,21,33,0.04)] sm:px-4 md:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {/* Collapse toggle on Desktop */}
            <button
              type="button"
              className="hidden rounded-lg p-2 text-[#294055] transition-colors hover:bg-[#f1f7fa] md:flex"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label="Toggle sidebar collapse"
            >
              <Menu size={18} />
            </button>

            <h1 className="min-w-0 flex-1 truncate font-[family-name:var(--font-ui)] text-base font-black tracking-[-0.04em] text-[#2c1f0e] sm:text-lg md:text-xl">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Add Student Link Button */}
            <Link
              to="/admin/students/add"
              className="hidden min-h-[44px] items-center gap-1.5 rounded-xl border border-[#e8d5a8]/30 bg-gradient-to-r from-[#071521] via-[#0d2235] to-[#14324c] px-3.5 py-2 text-xs font-bold text-[#e8d5a8] shadow-sm transition-all hover:border-[#e8d5a8]/60 hover:text-white sm:inline-flex"
              title="Enroll student with seat selection, custom timing, fee & receipt"
            >
              <Sparkles size={14} className="text-[#e8d5a8]" />
              <span className="hidden sm:inline">Add Student</span>
              <span className="sm:hidden">+ Enroll</span>
            </Link>

            {/* Messages Quick Access */}
            <button
              type="button"
              onClick={() => navigate('/admin/messages')}
              className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#8a7a60] transition-colors hover:bg-[#f1f7fa] hover:text-[#a38b52]"
              title="Messages & Inquiries"
              aria-label="Messages"
            >
              <MessageSquare size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c2a66e] px-1 text-[9px] font-bold text-[#071521]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification / Approvals */}
            <button
              type="button"
              onClick={() => navigate('/admin/approvals')}
              className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#8a7a60] transition-colors hover:bg-[#f1f7fa] hover:text-[#a38b52]"
              title="Pending Approvals"
              aria-label="Approvals"
            >
              <Bell size={19} />
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                type="button"
                className="flex min-h-[44px] items-center gap-2 rounded-xl border border-transparent p-1 transition-colors hover:border-[#e8dcc8] hover:bg-[#f8fbfd]"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-label="User profile menu"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8d5a8]/30 bg-[#0b2032] text-xs font-bold text-[#e8d5a8] shadow-sm">
                  {user?.name ? getInitials(user.name) : <UserIcon size={15} />}
                </div>
                <div className="hidden md:block text-left pr-1">
                  <div className="text-xs font-semibold leading-tight text-[#2c1f0e]">
                    {user?.name || 'Admin'}
                  </div>
                  <div className="font-[family-name:var(--font-ui)] text-[9px] font-bold uppercase leading-tight tracking-[0.12em] text-[#a38b52]">
                    {user?.role || 'Administrator'}
                  </div>
                </div>
                <ChevronDown size={14} className="text-[#8a7a60] hidden md:block" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 z-40 mt-2 w-56 animate-fade-in rounded-2xl border border-[#e8dcc8] bg-white py-1.5 text-sm shadow-xl">
                    <div className="border-b border-[#e6eef3] px-4 py-2.5">
                      <div className="truncate font-semibold text-[#2c1f0e]">{user?.name}</div>
                      <div className="truncate text-xs text-[#8a7a60]">{user?.email}</div>
                    </div>
                    <NavLink
                      to="/admin/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#294055] transition-colors hover:bg-[#faf6f0]"
                    >
                      <Settings size={15} className="text-[#8a7a60]" />
                      Settings
                    </NavLink>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-left font-medium text-[#b42336] transition-colors hover:bg-red-50"
                    >
                      <LogOut size={15} />
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="w-full max-w-full flex-1 bg-[#faf6f0] p-4 pb-28 sm:p-5 md:overflow-y-auto md:p-8 md:pb-8">
          <Outlet />
        </main>

        {/* Admin Mobile Bottom Navigation Bar (md:hidden) */}
        <nav
          className="mobile-bottom-nav md:hidden"
          aria-label="Admin Bottom Navigation"
        >
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `mobile-bottom-nav-item flex-1 ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <LayoutDashboard
                  size={22}
                  className={`transition-transform duration-200 ${
                    isActive ? 'text-[#a38b52] stroke-[2.4] scale-110' : 'text-[#8a7a60] stroke-[1.8]'
                  }`}
                />
                <span
                  className={`text-[11px] mt-0.5 tracking-tight transition-colors duration-200 ${
                    isActive ? 'font-bold text-[#a38b52]' : 'font-medium text-[#8a7a60]'
                  }`}
                >
                  Dashboard
                </span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/admin/students"
            end
            className={({ isActive }) =>
              `mobile-bottom-nav-item flex-1 ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Users
                  size={22}
                  className={`transition-transform duration-200 ${
                    isActive ? 'text-[#a38b52] stroke-[2.4] scale-110' : 'text-[#8a7a60] stroke-[1.8]'
                  }`}
                />
                <span
                  className={`text-[11px] mt-0.5 tracking-tight transition-colors duration-200 ${
                    isActive ? 'font-bold text-[#a38b52]' : 'font-medium text-[#8a7a60]'
                  }`}
                >
                  Students
                </span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/admin/students/add"
            className={({ isActive }) =>
              `mobile-bottom-nav-item flex-1 ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#a38b52] to-[#c2a66e] text-white shadow-[0_4px_12px_rgba(8,125,153,0.35)] -mt-3 transition-transform active:scale-95">
                  <UserPlus size={18} className="!w-[18px] !h-[18px]" />
                </div>
                <span
                  className={`text-[11px] mt-0.5 tracking-tight transition-colors duration-200 ${
                    isActive ? 'font-bold text-[#a38b52]' : 'font-medium text-[#8a7a60]'
                  }`}
                >
                  Add New
                </span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/admin/payments"
            end
            className={({ isActive }) =>
              `mobile-bottom-nav-item flex-1 ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <CreditCard
                  size={22}
                  className={`transition-transform duration-200 ${
                    isActive ? 'text-[#a38b52] stroke-[2.4] scale-110' : 'text-[#8a7a60] stroke-[1.8]'
                  }`}
                />
                <span
                  className={`text-[11px] mt-0.5 tracking-tight transition-colors duration-200 ${
                    isActive ? 'font-bold text-[#a38b52]' : 'font-medium text-[#8a7a60]'
                  }`}
                >
                  Payments
                </span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `mobile-bottom-nav-item flex-1 ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Settings
                  size={22}
                  className={`transition-transform duration-200 ${
                    isActive ? 'text-[#a38b52] stroke-[2.4] scale-110' : 'text-[#8a7a60] stroke-[1.8]'
                  }`}
                />
                <span
                  className={`text-[11px] mt-0.5 tracking-tight transition-colors duration-200 ${
                    isActive ? 'font-bold text-[#a38b52]' : 'font-medium text-[#8a7a60]'
                  }`}
                >
                  Settings
                </span>
              </>
            )}
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default AdminLayout;
