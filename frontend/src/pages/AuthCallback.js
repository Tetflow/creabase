import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      try {
        const hash = window.location.hash;
        const sessionId = new URLSearchParams(hash.substring(1)).get('session_id');

        if (!sessionId) {
          navigate('/');
          return;
        }

        const response = await axios.post(
          `${BACKEND_URL}/api/auth/session`,
          { session_id: sessionId },
          { withCredentials: true }
        );

        const user = response.data;
        
        // Check if there's an intended role from login page
        const intendedRole = searchParams.get('role') || sessionStorage.getItem('intended_role');
        sessionStorage.removeItem('intended_role'); // Clear it after use
        
        // If user is new or logging in with specific role intent
        if (intendedRole && user.role !== intendedRole) {
          // Update user role based on intended role
          try {
            await axios.patch(
              `${BACKEND_URL}/api/users/${user.user_id}/role`,
              { role: intendedRole },
              { withCredentials: true }
            );
            user.role = intendedRole;
          } catch (error) {
            console.error('Failed to update role:', error);
          }
        }
        
        // Check if user needs to select role (new user with default 'business' role)
        if (!intendedRole && user.role === 'business' && !user.subscription_status) {
          // New user - show role selection
          navigate('/select-role', { state: { user }, replace: true });
          return;
        }
        
        // Navigate based on role
        if (user.role === 'admin') {
          navigate('/admin', { state: { user }, replace: true });
        } else if (user.role === 'creator') {
          navigate('/creator-dashboard', { state: { user }, replace: true });
        } else {
          navigate('/dashboard', { state: { user }, replace: true });
        }
      } catch (error) {
        console.error('Session exchange failed:', error);
        navigate('/');
      }
    };

    processSession();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="text-center">
        <div className="inline-block w-16 h-16 border-4 border-[#0A0A0A] border-t-[#C6A2FF] rounded-full animate-spin mb-4"></div>
        <p className="text-xl font-bold">Authenticating...</p>
      </div>
    </div>
  );
};

export default AuthCallback;