import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, CheckCircle, XCircle, Wallet, Settings, BarChart3, AlertTriangle, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [creators, setCreators] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      checkAuth();
    } else {
      fetchData();
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true
      });
      if (response.data.role !== 'admin') {
        navigate('/dashboard');
        return;
      }
      setUser(response.data);
      fetchData();
    } catch (error) {
      navigate('/');
    }
  };

  const fetchData = async () => {
    try {
      const [creatorsRes, statsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/creators`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/admin/stats`, { withCredentials: true })
      ]);
      setCreators(creatorsRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setLoading(false);
    }
  };

  const updateCreatorStatus = async (creatorId, status) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/api/creators/${creatorId}/status?status=${status}`,
        {},
        { withCredentials: true }
      );
      fetchData();
    } catch (error) {
      alert('Failed to update creator status');
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#0A0A0A] border-t-[#C6A2FF] rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2">Admin Dashboard</h1>
          <p className="text-base sm:text-lg text-[#4A4A4A] font-medium">Platform management and oversight</p>
        </div>

        {/* Platform Statistics */}
        {stats && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4">Platform Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
                <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-2">Total Creators</p>
                <p className="text-3xl font-black">{stats.total_creators}</p>
              </div>
              <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
                <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-2">Approved</p>
                <p className="text-3xl font-black">{stats.approved_creators}</p>
              </div>
              <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
                <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-2">Pending</p>
                <p className="text-3xl font-black">{stats.pending_creators}</p>
              </div>
              <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
                <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-2">Total Users</p>
                <p className="text-3xl font-black">{stats.total_users}</p>
              </div>
              <div className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
                <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-2">Subscribers</p>
                <p className="text-3xl font-black">{stats.active_subscribers}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 rounded-xl p-6 text-left font-bold transition-all"
            >
              <Users className="w-8 h-8 mb-3" strokeWidth={3} />
              <h3 className="text-lg font-black mb-2">User Management</h3>
              <p className="text-sm text-[#4A4A4A] font-medium">Manage user accounts and restrictions</p>
            </button>
            
            <button
              onClick={() => navigate('/admin/wallets')}
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 rounded-xl p-6 text-left font-bold transition-all"
            >
              <Wallet className="w-8 h-8 mb-3" strokeWidth={3} />
              <h3 className="text-lg font-black mb-2">Wallet Management</h3>
              <p className="text-sm text-[#4A4A4A] font-medium">Monitor and manage user wallet balances</p>
            </button>
            
            <button
              onClick={() => navigate('/admin/payouts')}
              className="bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 rounded-xl p-6 text-left font-bold transition-all"
            >
              <DollarSign className="w-8 h-8 mb-3" strokeWidth={3} />
              <h3 className="text-lg font-black mb-2">Payout Management</h3>
              <p className="text-sm text-[#4A4A4A] font-medium">View and track creator payouts</p>
            </button>
            
            <button
              onClick={() => navigate('/admin/disputes')}
              className="bg-[#FFB4B4] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 rounded-xl p-6 text-left font-bold transition-all"
            >
              <AlertTriangle className="w-8 h-8 mb-3" strokeWidth={3} />
              <h3 className="text-lg font-black mb-2">Dispute Management</h3>
              <p className="text-sm text-[#4A4A4A] font-medium">Review and resolve user disputes</p>
            </button>
            
            <button
              onClick={() => navigate('/admin/settings')}
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 rounded-xl p-6 text-left font-bold transition-all"
            >
              <Settings className="w-8 h-8 mb-3" strokeWidth={3} />
              <h3 className="text-lg font-black mb-2">Fee Configuration</h3>
              <p className="text-sm text-[#4A4A4A] font-medium">Configure platform fees and pricing</p>
            </button>
            
            <button
              onClick={() => navigate('/admin/analytics')}
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 rounded-xl p-6 text-left font-bold transition-all"
            >
              <BarChart3 className="w-8 h-8 mb-3" strokeWidth={3} />
              <h3 className="text-lg font-black mb-2">Analytics</h3>
              <p className="text-sm text-[#4A4A4A] font-medium">View platform metrics and insights</p>
            </button>
          </div>
        </div>

        {/* Creator Approval List */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Creator Approvals</h2>
          <div className="space-y-4">
            {creators.length === 0 ? (
              <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8 text-center">
                <p className="text-lg font-bold text-[#4A4A4A]">No creators pending approval</p>
              </div>
            ) : (
              creators.map((creator) => (
                <div
                  key={creator.creator_id}
                  data-testid={`admin-creator-card-${creator.creator_id}`}
                  className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6"
                >
                  <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{creator.name}</h3>
                        <span className={`px-3 py-1 text-xs font-bold border-2 border-[#0A0A0A] rounded-lg ${
                          creator.status === 'approved' ? 'bg-[#B4F8C8]' : 
                          creator.status === 'pending' ? 'bg-[#FFE57F]' : 
                          'bg-[#FFB4B4]'
                        }`}>
                          {creator.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-[#4A4A4A] font-medium mb-3">{creator.bio}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm font-bold bg-[#FAFAFA] border border-[#0A0A0A] px-3 py-1 rounded-lg">
                          {creator.email}
                        </span>
                        <span className="text-sm font-bold bg-[#FAFAFA] border border-[#0A0A0A] px-3 py-1 rounded-lg">
                          {creator.phone}
                        </span>
                        {creator.instagram_followers > 0 && (
                          <span className="text-sm font-bold bg-[#B4F8C8] border border-[#0A0A0A] px-3 py-1 rounded-lg">
                            IG: {(creator.instagram_followers / 1000).toFixed(1)}K
                          </span>
                        )}
                        {creator.youtube_subscribers > 0 && (
                          <span className="text-sm font-bold bg-[#FF9B9B] border border-[#0A0A0A] px-3 py-1 rounded-lg">
                            YT: {(creator.youtube_subscribers / 1000).toFixed(1)}K
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {creator.status !== 'approved' && (
                        <Button
                          data-testid={`approve-button-${creator.creator_id}`}
                          onClick={() => updateCreatorStatus(creator.creator_id, 'approved')}
                          className="bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" strokeWidth={3} />
                          Approve
                        </Button>
                      )}
                      {creator.status !== 'rejected' && (
                        <Button
                          data-testid={`reject-button-${creator.creator_id}`}
                          onClick={() => updateCreatorStatus(creator.creator_id, 'rejected')}
                          className="bg-[#FF9B9B] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                        >
                          <XCircle className="w-4 h-4 mr-2" strokeWidth={3} />
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
