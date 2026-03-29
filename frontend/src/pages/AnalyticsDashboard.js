import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, ArrowLeft, TrendingUp, DollarSign, Eye, Star, 
  Briefcase, Clock, CheckCircle, BarChart3, PieChart
} from 'lucide-react';
import { Button } from '../components/ui/button';
import BottomNav from '../components/BottomNav';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatorId, setCreatorId] = useState(null);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    try {
      const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true
      });
      setUser(userRes.data);
      
      if (userRes.data.role === 'business') {
        await fetchBusinessAnalytics();
      } else if (userRes.data.role === 'creator') {
        await fetchCreatorAnalytics(userRes.data.user_id);
      }
      
      await fetchOrderStats();
      setLoading(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/');
    }
  };

  const fetchBusinessAnalytics = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/analytics/business`, {
        withCredentials: true
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch business analytics:', error);
    }
  };

  const fetchCreatorAnalytics = async (userId) => {
    try {
      // First get creator profile
      const creatorsRes = await axios.get(`${BACKEND_URL}/api/admin/creators`, {
        withCredentials: true
      }).catch(() => null);
      
      // For creators, we need to find their creator_id
      // This is a simplified version - in production, you'd have a better way to link user to creator
      if (creatorsRes && creatorsRes.data) {
        const myCreator = creatorsRes.data.find(c => c.submitted_by === userId);
        if (myCreator) {
          setCreatorId(myCreator.creator_id);
          const response = await axios.get(`${BACKEND_URL}/api/analytics/creator/${myCreator.creator_id}`, {
            withCredentials: true
          });
          setAnalytics(response.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch creator analytics:', error);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/orders/stats/summary`, {
        withCredentials: true
      });
      setOrderStats(response.data);
    } catch (error) {
      console.error('Failed to fetch order stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#0A0A0A] border-t-[#C6A2FF] rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-bold">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const isBusiness = user?.role === 'business';
  const isCreator = user?.role === 'creator';

  return (
    <div className="min-h-screen bg-[#FAFAFA] has-bottom-nav">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-button"
              onClick={() => navigate('/dashboard')}
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={3} />
            </Button>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8" strokeWidth={3} />
              <h1 className="text-3xl font-black tracking-tight">Analytics Dashboard</h1>
            </div>
          </div>
          <span className="bg-[#C6A2FF] border-2 border-[#0A0A0A] px-4 py-2 rounded-lg font-bold capitalize">
            {user?.role}
          </span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Business Analytics */}
        {isBusiness && analytics && (
          <>
            <h2 className="text-3xl font-black mb-8">Business Overview</h2>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Briefcase className="w-6 h-6 text-[#C6A2FF]" strokeWidth={3} />
                  <p className="text-xs font-bold uppercase text-[#4A4A4A]">Total Projects</p>
                </div>
                <p className="text-4xl font-black">{analytics.projects?.total || 0}</p>
                <p className="text-sm text-[#4A4A4A] mt-2">
                  {analytics.projects?.active || 0} active
                </p>
              </div>

              <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-6 h-6" strokeWidth={3} />
                  <p className="text-xs font-bold uppercase text-[#4A4A4A]">Total Spent</p>
                </div>
                <p className="text-4xl font-black">₹{analytics.spending?.total_spent || 0}</p>
                <p className="text-sm text-[#4A4A4A] mt-2">
                  Avg: ₹{analytics.spending?.avg_project_value || 0}
                </p>
              </div>

              <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="w-6 h-6" strokeWidth={3} />
                  <p className="text-xs font-bold uppercase text-[#4A4A4A]">Creators Contacted</p>
                </div>
                <p className="text-4xl font-black">{analytics.creators?.contacted || 0}</p>
                <p className="text-sm text-[#4A4A4A] mt-2">
                  {analytics.creators?.viewed_this_month || 0} this month
                </p>
              </div>

              <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" strokeWidth={3} />
                  <p className="text-xs font-bold uppercase text-[#4A4A4A]">Completion Rate</p>
                </div>
                <p className="text-4xl font-black">{analytics.projects?.completion_rate?.toFixed(0) || 0}%</p>
                <p className="text-sm text-[#4A4A4A] mt-2">
                  {analytics.projects?.completed || 0} completed
                </p>
              </div>
            </div>

            {/* Subscription Info */}
            <div className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8 mb-12">
              <h3 className="text-2xl font-black mb-4">Subscription Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-bold uppercase text-[#4A4A4A] mb-1">Current Plan</p>
                  <p className="text-2xl font-black capitalize">{analytics.subscription?.plan || 'Free'}</p>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase text-[#4A4A4A] mb-1">Status</p>
                  <p className="text-2xl font-black capitalize">{analytics.subscription?.status || 'Inactive'}</p>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase text-[#4A4A4A] mb-1">Pay-as-you-go Spent</p>
                  <p className="text-2xl font-black">₹{analytics.spending?.payg_spent || 0}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Creator Analytics */}
        {isCreator && analytics && (
          <>
            <h2 className="text-3xl font-black mb-8">Creator Performance</h2>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Briefcase className="w-6 h-6 text-[#C6A2FF]" strokeWidth={3} />
                  <p className="text-xs font-bold uppercase text-[#4A4A4A]">Total Projects</p>
                </div>
                <p className="text-4xl font-black">{analytics.projects?.total || 0}</p>
                <p className="text-sm text-[#4A4A4A] mt-2">
                  {analytics.projects?.active || 0} active
                </p>
              </div>

              <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-6 h-6" strokeWidth={3} />
                  <p className="text-xs font-bold uppercase text-[#4A4A4A]">Total Earnings</p>
                </div>
                <p className="text-4xl font-black">₹{analytics.earnings?.total || 0}</p>
                <p className="text-sm text-[#4A4A4A] mt-2">
                  Avg: ₹{analytics.earnings?.avg_per_project || 0}
                </p>
              </div>

              <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-6 h-6" strokeWidth={3} />
                  <p className="text-xs font-bold uppercase text-[#4A4A4A]">Average Rating</p>
                </div>
                <p className="text-4xl font-black">{analytics.reputation?.average_rating || 0}</p>
                <p className="text-sm text-[#4A4A4A] mt-2">
                  {analytics.reputation?.total_reviews || 0} reviews
                </p>
              </div>

              <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="w-6 h-6 text-[#C6A2FF]" strokeWidth={3} />
                  <p className="text-xs font-bold uppercase text-[#4A4A4A]">Profile Views</p>
                </div>
                <p className="text-4xl font-black">{analytics.engagement?.profile_views || 0}</p>
                <p className="text-sm text-[#4A4A4A] mt-2">
                  Avg response: {analytics.engagement?.avg_response_time_hours || 0}h
                </p>
              </div>
            </div>

            {/* Badge Display */}
            {analytics.reputation?.badge && (
              <div 
                className="border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8 mb-12"
                style={{ backgroundColor: analytics.reputation?.badge_info?.color || '#FFFFFF' }}
              >
                <h3 className="text-2xl font-black mb-4">Your Creator Badge</h3>
                <div className="flex items-center gap-4">
                  <span className="text-6xl">{analytics.reputation?.badge_info?.icon}</span>
                  <div>
                    <p className="text-3xl font-black">{analytics.reputation?.badge_info?.label}</p>
                    <p className="text-[#4A4A4A] font-medium mt-2">
                      Based on {analytics.projects?.completed || 0} completed projects and {analytics.reputation?.average_rating || 0} average rating
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Status */}
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8 mb-12">
              <h3 className="text-2xl font-black mb-6">Verification Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`border-2 border-[#0A0A0A] rounded-xl p-6 ${analytics.verification?.status === 'verified' ? 'bg-[#B4F8C8]' : 'bg-[#FAFAFA]'}`}>
                  <p className="text-sm font-bold uppercase text-[#4A4A4A] mb-1">Profile Status</p>
                  <p className="text-xl font-black capitalize">{analytics.verification?.status || 'Unverified'}</p>
                </div>
                <div className={`border-2 border-[#0A0A0A] rounded-xl p-6 ${analytics.verification?.youtube_verified ? 'bg-[#B4F8C8]' : 'bg-[#FAFAFA]'}`}>
                  <p className="text-sm font-bold uppercase text-[#4A4A4A] mb-1">YouTube</p>
                  <p className="text-xl font-black">{analytics.verification?.youtube_verified ? 'Verified' : 'Not Verified'}</p>
                </div>
                <div className={`border-2 border-[#0A0A0A] rounded-xl p-6 ${analytics.verification?.instagram_verified ? 'bg-[#B4F8C8]' : 'bg-[#FAFAFA]'}`}>
                  <p className="text-sm font-bold uppercase text-[#4A4A4A] mb-1">Instagram</p>
                  <p className="text-xl font-black">{analytics.verification?.instagram_verified ? 'Verified' : 'Not Verified'}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Order Statistics - Common for both */}
        {orderStats && (
          <>
            <h2 className="text-3xl font-black mb-8">Order Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
              <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-4 text-center">
                <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Total</p>
                <p className="text-2xl font-black">{orderStats.total_orders}</p>
              </div>
              <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-4 text-center">
                <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Pending</p>
                <p className="text-2xl font-black">{orderStats.pending}</p>
              </div>
              <div className="bg-[#A0E7E5] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-4 text-center">
                <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Active</p>
                <p className="text-2xl font-black">{orderStats.active}</p>
              </div>
              <div className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-4 text-center">
                <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Delivered</p>
                <p className="text-2xl font-black">{orderStats.delivered}</p>
              </div>
              <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-4 text-center">
                <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Completed</p>
                <p className="text-2xl font-black">{orderStats.completed}</p>
              </div>
              <div className="bg-[#FF9B9B] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-4 text-center">
                <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Disputed</p>
                <p className="text-2xl font-black">{orderStats.disputed}</p>
              </div>
              <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-4 text-center">
                <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Total Value</p>
                <p className="text-2xl font-black">₹{orderStats.total_value}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
              <div className="flex justify-between items-center mb-3">
                <p className="font-bold">Completion Rate</p>
                <p className="font-black text-xl">{orderStats.completion_rate}%</p>
              </div>
              <div className="w-full h-6 bg-[#FAFAFA] border-2 border-[#0A0A0A] rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-[#B4F8C8] transition-all duration-500"
                  style={{ width: `${orderStats.completion_rate}%` }}
                ></div>
              </div>
            </div>
          </>
        )}

        {/* No Analytics Available */}
        {!analytics && !loading && (
          <div className="text-center py-20">
            <PieChart className="w-16 h-16 mx-auto mb-4 opacity-50" strokeWidth={2} />
            <p className="text-xl font-bold">No analytics data available yet</p>
            <p className="text-[#4A4A4A]">Start creating projects or completing orders to see your analytics</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
};

export default AnalyticsDashboard;
