import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Menu, X, User, Wallet, Settings, LogOut, Home, Users, BarChart3, DollarSign, ChevronDown, Briefcase, MessageSquare, AlertTriangle, FileText, TrendingUp } from 'lucide-react';
import Logo from './Logo';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function Header() {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUser();
  }, [location.pathname]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true
      });
      setUser(response.data);
    } catch (error) {
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = user ? (
    user.role === 'admin' ? [
      { icon: <Home size={18} />, label: 'Dashboard', path: '/admin' },
      { icon: <Users size={18} />, label: 'Users', path: '/admin/users' },
      { icon: <Wallet size={18} />, label: 'Wallets', path: '/admin/wallets' },
      { icon: <DollarSign size={18} />, label: 'Payouts', path: '/admin/payouts' },
      { icon: <AlertTriangle size={18} />, label: 'Disputes', path: '/admin/disputes' },
      { icon: <BarChart3 size={18} />, label: 'Analytics', path: '/admin/analytics' },
      { icon: <Settings size={18} />, label: 'Settings', path: '/admin/settings' },
    ] : user.role === 'creator' ? [
      { icon: <Home size={18} />, label: 'Dashboard', path: '/creator-dashboard' },
      { icon: <Briefcase size={18} />, label: 'Projects', path: '/creator-projects' },
      { icon: <MessageSquare size={18} />, label: 'Chats', path: '/chats' },
      { icon: <TrendingUp size={18} />, label: 'Analytics', path: '/creator-analytics' },
      { icon: <Wallet size={18} />, label: 'Wallet', path: '/wallet' },
      { icon: <AlertTriangle size={18} />, label: 'Disputes', path: '/disputes' },
    ] : [
      { icon: <Home size={18} />, label: 'Dashboard', path: '/dashboard' },
      { icon: <Briefcase size={18} />, label: 'Projects', path: '/projects' },
      { icon: <MessageSquare size={18} />, label: 'Chats', path: '/chats' },
      { icon: <TrendingUp size={18} />, label: 'Analytics', path: '/analytics' },
      { icon: <Wallet size={18} />, label: 'Wallet', path: '/wallet' },
      { icon: <AlertTriangle size={18} />, label: 'Disputes', path: '/disputes' },
      { icon: <Settings size={18} />, label: 'Settings', path: '/business/settings' },
    ]
  ) : [];

  return (
    <header className="bg-white border-b-4 border-black sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="small" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 overflow-x-auto max-w-3xl scrollbar-hide">
            {user ? (
              <>
                {/* Navigation Items */}
                <div className="flex items-center gap-2 flex-nowrap">
                  {navItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigate(item.path)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
                        location.pathname === item.path
                          ? 'bg-yellow-400 text-black border-2 border-black shadow-brutal-sm'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
                
                {/* Subscription Button - Only for Business and Creator */}
                {user.role !== 'admin' && user.subscription_status !== 'active' && (
                  <button
                    onClick={() => navigate('/pricing')}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-bold border-2 border-black shadow-brutal-sm hover:shadow-none transition-all text-sm"
                  >
                    ⚡ Subscribe
                  </button>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-black bg-white hover:bg-gray-50 font-bold text-sm"
                  >
                    <User size={18} />
                    <span className="max-w-[100px] truncate">{user.email?.split('@')[0] || user.role}</span>
                    <ChevronDown size={16} />
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black shadow-brutal rounded-lg overflow-hidden">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 font-bold text-sm flex items-center gap-2"
                      >
                        <User size={16} />
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-bold text-sm flex items-center gap-2 border-t-2 border-gray-200"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/pricing')}
                  className="text-gray-700 hover:text-black font-bold text-sm"
                >
                  Pricing
                </button>
                
                {/* Login Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-lg border-2 border-black shadow-brutal-sm hover:shadow-none transition-all flex items-center gap-2"
                  >
                    Get Started
                    <ChevronDown size={16} />
                  </button>

                  {/* Login Dropdown Menu */}
                  {showLoginDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-black shadow-brutal rounded-lg overflow-hidden">
                      <button
                        onClick={() => {
                          navigate('/login/business');
                          setShowLoginDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-purple-50 font-bold text-sm border-b-2 border-gray-200"
                      >
                        🏢 Login as Business
                      </button>
                      <button
                        onClick={() => {
                          navigate('/login/creator');
                          setShowLoginDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-green-50 font-bold text-sm"
                      >
                        ✨ Login as Creator
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg border-2 border-black hover:bg-gray-100"
            onClick={() => setShowMenu(!showMenu)}
          >
            {showMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="md:hidden py-4 border-t-2 border-gray-200">
            {user ? (
              <div className="space-y-2">
                {/* Navigation Items */}
                {navItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      navigate(item.path);
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold ${
                      location.pathname === item.path
                        ? 'bg-yellow-400 text-black border-2 border-black'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
                
                {/* Subscription Button */}
                {user.role !== 'admin' && user.subscription_status !== 'active' && (
                  <button
                    onClick={() => {
                      navigate('/pricing');
                      setShowMenu(false);
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-3 rounded-lg font-bold border-2 border-black shadow-brutal-sm"
                  >
                    ⚡ Subscribe
                  </button>
                )}

                {/* Profile */}
                <button
                  onClick={() => {
                    navigate('/profile');
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-bold"
                >
                  <User size={18} />
                  Profile
                </button>

                {/* Logout */}
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-bold border-t-2 border-gray-200"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigate('/pricing');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg font-bold"
                >
                  Pricing
                </button>
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Login As</div>
                <button
                  onClick={() => {
                    navigate('/login/business');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg font-bold border-2 border-black"
                >
                  🏢 Business
                </button>
                <button
                  onClick={() => {
                    navigate('/login/creator');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg font-bold border-2 border-black"
                >
                  ✨ Creator
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
