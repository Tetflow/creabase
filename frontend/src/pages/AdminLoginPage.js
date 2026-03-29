import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      const user = response.data.user;

      // Check if user is admin
      if (user.role !== 'admin') {
        setError('Access denied. Admin credentials required.');
        setLoading(false);
        return;
      }

      // Navigate to admin dashboard
      navigate('/admin', { state: { user }, replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12" strokeWidth={3} />
            <h1 className="text-4xl font-black tracking-tight">Creabase</h1>
          </div>
          <p className="text-lg font-bold text-[#4A4A4A]">Admin Access</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border-2 border-[#0A0A0A] shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8">
          <div className="text-center mb-6">
            <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-black mb-2">Admin Login</h2>
            <p className="text-sm font-medium text-[#4A4A4A]">Enter your credentials to access the admin dashboard</p>
          </div>

          {error && (
            <div className="bg-[#FFB4B4] border-2 border-[#0A0A0A] rounded-lg p-4 mb-6">
              <p className="text-sm font-bold text-[#AA0000]">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block font-bold mb-2 text-sm">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4A4A]" strokeWidth={2} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@creabase.com"
                  required
                  className="border-2 border-[#0A0A0A] h-12 pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4A4A]" strokeWidth={2} />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="border-2 border-[#0A0A0A] h-12 pl-11"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold text-lg py-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm font-bold text-[#4A4A4A] hover:text-[#0A0A0A] transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs font-medium text-[#4A4A4A]">
            Admin access only. Unauthorized access attempts are logged.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
