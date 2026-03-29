import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Briefcase, MessageCircle, Wallet, BarChart3, Settings, Users, AlertTriangle, DollarSign } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const BottomNav = ({ currentPage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true
      });
      setUserRole(response.data.role);
    } catch (error) {
      console.error('Failed to fetch user role:', error);
    }
  };

  // Navigation items based on user role
  const getNavItemsForRole = () => {
    if (!userRole) return [];
    
    if (userRole === 'admin') {
      return [
        { path: '/admin', icon: Home, label: 'Home' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/payouts', icon: DollarSign, label: 'Payouts' },
        { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/admin/disputes', icon: AlertTriangle, label: 'Disputes' },
      ];
    }
    
    if (userRole === 'creator') {
      return [
        { path: '/creator-dashboard', icon: Home, label: 'Home' },
        { path: '/creator-projects', icon: Briefcase, label: 'Projects' },
        { path: '/chats', icon: MessageCircle, label: 'Chats' },
        { path: '/wallet', icon: Wallet, label: 'Wallet' },
        { path: '/creator-analytics', icon: BarChart3, label: 'Analytics' },
      ];
    }
    
    // Business role
    return [
      { path: '/dashboard', icon: Home, label: 'Home' },
      { path: '/projects', icon: Briefcase, label: 'Projects' },
      { path: '/chats', icon: MessageCircle, label: 'Chats' },
      { path: '/wallet', icon: Wallet, label: 'Wallet' },
      { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    ];
  };

  const navItems = getNavItemsForRole();

  const isActive = (path) => {
    if (currentPage === 'chats' && path === '/chats') return true;
    if (currentPage === 'projects' && (path === '/projects' || path === '/creator-projects')) return true;
    
    // Direct path match or starts with path
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-[#0A0A0A] safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              data-testid={`bottom-nav-${item.label.toLowerCase()}`}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                active 
                  ? 'text-[#0A0A0A]' 
                  : 'text-[#9A9A9A]'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all ${
                active 
                  ? 'bg-[#C6A2FF]' 
                  : ''
              }`}>
                <Icon className="w-5 h-5" strokeWidth={active ? 3 : 2} />
              </div>
              <span className={`text-xs mt-0.5 font-medium ${
                active ? 'font-bold' : ''
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
