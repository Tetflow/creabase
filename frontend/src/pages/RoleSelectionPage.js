import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Briefcase, UserCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to home if no user
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    if (!user || !user.user_id) {
      alert('Session expired. Please login again.');
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      // Update user role in backend
      await axios.patch(
        `${BACKEND_URL}/api/users/${user.user_id}/role`,
        { role: selectedRole },
        { withCredentials: true }
      );

      // Navigate based on role
      if (selectedRole === 'creator') {
        navigate('/creator-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to set role. Please try again.');
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <Users className="w-16 h-16 mx-auto mb-4" strokeWidth={3} />
          <h1 className="text-5xl font-black mb-4">Welcome to Creabase!</h1>
          <p className="text-xl text-[#4A4A4A] font-medium">Choose your account type to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-3xl mx-auto">
          {/* Business */}
          <button
            onClick={() => setSelectedRole('business')}
            className={`${
              selectedRole === 'business' ? 'bg-[#C6A2FF]' : 'bg-white'
            } border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 rounded-xl p-8 transition-all text-left`}
          >
            <div className="bg-white border-2 border-[#0A0A0A] rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8" strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-black mb-2">Business</h3>
            <p className="font-medium text-[#4A4A4A]">
              Find and collaborate with content creators for your brand
            </p>
            <ul className="mt-4 space-y-2 text-sm font-bold">
              <li>✓ Search verified creators</li>
              <li>✓ Access contact info</li>
              <li>✓ Create projects</li>
              <li>✓ Chat with creators</li>
            </ul>
          </button>

          {/* Creator */}
          <button
            onClick={() => setSelectedRole('creator')}
            className={`${
              selectedRole === 'creator' ? 'bg-[#B4F8C8]' : 'bg-white'
            } border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 rounded-xl p-8 transition-all text-left`}
          >
            <div className="bg-white border-2 border-[#0A0A0A] rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <UserCheck className="w-8 h-8" strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-black mb-2">Creator</h3>
            <p className="font-medium text-[#4A4A4A]">
              Showcase your work and get collaboration opportunities
            </p>
            <ul className="mt-4 space-y-2 text-sm font-bold">
              <li>✓ Create profile</li>
              <li>✓ Verify accounts</li>
              <li>✓ Receive projects</li>
              <li>✓ Get paid securely</li>
            </ul>
          </button>
        </div>

        <div className="text-center">
          <Button
            onClick={handleRoleSelection}
            disabled={!selectedRole || loading}
            className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold text-lg px-12 py-6 transition-all"
          >
            {loading ? 'Setting up...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
