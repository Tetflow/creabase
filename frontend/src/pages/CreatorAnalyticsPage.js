import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Wallet, 
  Briefcase, 
  Star, 
  Eye, 
  Clock, 
  Award,
  ArrowLeft,
  LogOut,
  DollarSign,
  BarChart3,
  Target
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import EmptyState from '../components/EmptyState';
import { PageLoadingSkeleton } from '../components/Skeletons';
import BottomNav from '../components/BottomNav';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CreatorAnalyticsPage = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/analytics/creator`, {
        withCredentials: true
      });
      setAnalytics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError(error.response?.data?.detail || 'Failed to load analytics');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-[#FFE57F]',
      in_progress: 'bg-[#C6A2FF]',
      delivered: 'bg-[#B4F8C8]',
      completed: 'bg-[#B4F8C8]',
      declined: 'bg-[#FF6B6B]'
    };
    return colors[status] || 'bg-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] has-bottom-nav">
        <nav className="sticky top-0 z-50 bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-black">Analytics</h1>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <PageLoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] has-bottom-nav">
        <nav className="sticky top-0 z-50 bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-3xl font-black">Analytics</h1>
            <Button onClick={() => navigate('/creator-dashboard')} className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <EmptyState
            icon={BarChart3}
            title="No Analytics Available"
            description={error}
            action={{
              label: 'Go to Dashboard',
              onClick: () => navigate('/creator-dashboard')
            }}
          />
        </div>
        <BottomNav currentPage="analytics" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] has-bottom-nav">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/creator-dashboard')}
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all p-3"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={3} />
            </Button>
            <TrendingUp className="w-8 h-8" strokeWidth={3} />
            <h1 className="text-3xl font-black tracking-tight">Analytics</h1>
          </div>
          <div className="hidden md:block">
            <Button
              onClick={handleLogout}
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
            >
              <LogOut className="w-4 h-4" strokeWidth={3} />
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Badge */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-black">{analytics.creator_name}</h2>
            <Badge className={`${getStatusColor('completed')} border-2 border-[#0A0A0A] px-3 py-1 font-black text-sm uppercase`}>
              <Award className="w-4 h-4 mr-1" strokeWidth={3} />
              {analytics.badge}
            </Badge>
          </div>
          <p className="text-[#4A4A4A] font-medium">Your performance dashboard</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Earnings */}
          <div className="bg-gradient-to-br from-[#B4F8C8] to-[#A0E7B8] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-6 h-6" strokeWidth={3} />
              <p className="font-bold text-sm uppercase">Total Earnings</p>
            </div>
            <p className="text-4xl font-black mb-2">{formatCurrency(analytics.wallet.total_earnings)}</p>
            <p className="text-sm font-medium text-[#4A4A4A]">
              {formatCurrency(analytics.wallet.this_month)} this month
            </p>
          </div>

          {/* Current Balance */}
          <div className="bg-gradient-to-br from-[#C6A2FF] to-[#B692EF] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-6 h-6" strokeWidth={3} />
              <p className="font-bold text-sm uppercase">Wallet Balance</p>
            </div>
            <p className="text-4xl font-black mb-2">{formatCurrency(analytics.wallet.current_balance)}</p>
            <p className="text-sm font-medium text-[#4A4A4A]">
              {formatCurrency(analytics.wallet.avg_per_project)} avg/project
            </p>
          </div>

          {/* Projects Completed */}
          <div className="bg-gradient-to-br from-[#FFE57F] to-[#FFD966] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-6 h-6" strokeWidth={3} />
              <p className="font-bold text-sm uppercase">Projects</p>
            </div>
            <p className="text-4xl font-black mb-2">{analytics.projects.by_status.completed}</p>
            <p className="text-sm font-medium text-[#4A4A4A]">
              {analytics.projects.total} total ({analytics.projects.completion_rate}% completed)
            </p>
          </div>

          {/* Rating */}
          <div className="bg-gradient-to-br from-[#FFB4B4] to-[#FFA0A0] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-6 h-6" strokeWidth={3} />
              <p className="font-bold text-sm uppercase">Rating</p>
            </div>
            <p className="text-4xl font-black mb-2">
              {analytics.reputation.average_rating > 0 ? analytics.reputation.average_rating.toFixed(1) : 'N/A'}
            </p>
            <p className="text-sm font-medium text-[#4A4A4A]">
              {analytics.reputation.total_reviews} reviews
            </p>
          </div>
        </div>

        {/* Earnings Chart */}
        <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" strokeWidth={3} />
            Earnings Over Time
          </h3>
          <div className="space-y-4">
            {analytics.earnings_chart.map((month, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">{month.month}</span>
                  <span className="font-black text-lg">{formatCurrency(month.earnings)}</span>
                </div>
                <div className="bg-[#E5E5E5] border-2 border-[#0A0A0A] rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-[#B4F8C8] border-r-2 border-[#0A0A0A] h-full flex items-center justify-end px-3 transition-all"
                    style={{
                      width: `${Math.min((month.earnings / Math.max(...analytics.earnings_chart.map(m => m.earnings))) * 100, 100)}%`
                    }}
                  >
                    {month.earnings > 0 && (
                      <span className="text-xs font-bold">{month.projects} projects</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Status Distribution */}
          <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8">
            <h3 className="text-2xl font-black mb-6">Project Status</h3>
            <div className="space-y-4">
              {Object.entries(analytics.projects.by_status).map(([status, count]) => (
                count > 0 && (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`${getStatusColor(status)} border-2 border-[#0A0A0A] w-4 h-4 rounded`}></div>
                      <span className="font-bold capitalize">{status.replace('_', ' ')}</span>
                    </div>
                    <span className="text-xl font-black">{count}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8">
            <h3 className="text-2xl font-black mb-6">Performance</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5" strokeWidth={3} />
                  <span className="font-bold">Profile Views</span>
                </div>
                <p className="text-3xl font-black">{analytics.reputation.profile_views}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5" strokeWidth={3} />
                  <span className="font-bold">Avg Response Time</span>
                </div>
                <p className="text-3xl font-black">{analytics.performance.response_time_hours}h</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5" strokeWidth={3} />
                  <span className="font-bold">On-Time Delivery</span>
                </div>
                <p className="text-3xl font-black">{analytics.performance.on_time_delivery}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        {analytics.recent_projects && analytics.recent_projects.length > 0 && (
          <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8">
            <h3 className="text-2xl font-black mb-6">Recent Projects</h3>
            <div className="space-y-4">
              {analytics.recent_projects.map((project) => (
                <div
                  key={project.project_id}
                  className="border-2 border-[#0A0A0A] rounded-lg p-4 flex justify-between items-center hover:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] transition-all"
                >
                  <div>
                    <h4 className="font-black text-lg mb-1">{project.title}</h4>
                    <p className="text-sm text-[#4A4A4A] font-medium">
                      {project.business_name} • {formatCurrency(project.budget)}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(project.status)} border-2 border-[#0A0A0A] px-3 py-1 font-bold text-xs uppercase`}>
                    {project.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentPage="analytics" />
    </div>
  );
};

export default CreatorAnalyticsPage;
