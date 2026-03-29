import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Users, DollarSign, TrendingUp, Crown, Briefcase, CheckCircle, Wallet } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [overviewRes, revenueRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/analytics/overview`, {
          params: { days: parseInt(timeRange) },
          withCredentials: true
        }),
        axios.get(`${BACKEND_URL}/api/admin/analytics/revenue`, {
          params: { days: parseInt(timeRange) },
          withCredentials: true
        })
      ]);
      
      setOverview(overviewRes.data);
      setRevenue(revenueRes.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatNumber = (num) => num.toLocaleString('en-IN');

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className={`bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`${color} border-2 border-[#0A0A0A] rounded-lg p-3`}>
          <Icon className="w-6 h-6" strokeWidth={3} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="w-4 h-4" strokeWidth={3} />
            <span className="text-sm font-bold">+{trend}</span>
          </div>
        )}
      </div>
      <h3 className="text-sm text-[#4A4A4A] font-medium mb-1">{title}</h3>
      <p className="text-3xl font-black mb-1">{value}</p>
      {subtitle && <p className="text-xs text-[#4A4A4A] font-medium">{subtitle}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A0A0A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <nav className="bg-white border-b-2 border-[#0A0A0A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            onClick={() => navigate('/admin')}
            className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={3} />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6" strokeWidth={3} />
            <h1 className="text-2xl font-black">Platform Analytics</h1>
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 border-2 border-[#0A0A0A] font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="0">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-black mb-2">Platform Overview</h2>
          <p className="text-sm text-[#4A4A4A] font-medium">
            {timeRange === '0' ? 'All time statistics' : `Statistics for the last ${timeRange} days`}
          </p>
        </div>

        {/* User Statistics */}
        <div className="mb-8">
          <h3 className="text-2xl font-black mb-4">User Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={formatNumber(overview?.users?.total || 0)}
              subtitle="All registered users"
              icon={Users}
              color="bg-[#C6A2FF]"
            />
            
            <StatCard
              title="Creators"
              value={formatNumber(overview?.users?.creators || 0)}
              subtitle={timeRange !== '0' ? `+${overview?.users?.new_creators || 0} new` : 'Total creators'}
              icon={Users}
              color="bg-[#FFE57F]"
              trend={timeRange !== '0' ? overview?.users?.new_creators : null}
            />
            
            <StatCard
              title="Businesses"
              value={formatNumber(overview?.users?.businesses || 0)}
              subtitle={timeRange !== '0' ? `+${overview?.users?.new_businesses || 0} new` : 'Total businesses'}
              icon={Briefcase}
              color="bg-[#B4F8C8]"
              trend={timeRange !== '0' ? overview?.users?.new_businesses : null}
            />
            
            <StatCard
              title="Premium Creators"
              value={formatNumber(overview?.premium?.total_premium_creators || 0)}
              subtitle="Active premium subscriptions"
              icon={Crown}
              color="bg-[#FFD700]"
            />
          </div>
        </div>

        {/* Project Statistics */}
        <div className="mb-8">
          <h3 className="text-2xl font-black mb-4">Project Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Projects"
              value={formatNumber(overview?.projects?.total || 0)}
              subtitle="All projects created"
              icon={Briefcase}
              color="bg-[#FFB4B4]"
            />
            
            <StatCard
              title="Active Projects"
              value={formatNumber(overview?.projects?.active || 0)}
              subtitle="In progress or pending"
              icon={TrendingUp}
              color="bg-[#FFE57F]"
            />
            
            <StatCard
              title="Completed Projects"
              value={formatNumber(overview?.projects?.completed || 0)}
              subtitle="Successfully completed"
              icon={CheckCircle}
              color="bg-[#B4F8C8]"
            />
          </div>
        </div>

        {/* Financial Statistics */}
        <div className="mb-8">
          <h3 className="text-2xl font-black mb-4">Financial Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(revenue?.total_revenue || 0)}
              subtitle={`${revenue?.payment_count || 0} payments`}
              icon={DollarSign}
              color="bg-[#B4F8C8]"
            />
            
            <StatCard
              title="Platform Fees"
              value={formatCurrency(revenue?.platform_fees || 0)}
              subtitle={`From ${revenue?.completed_projects || 0} projects`}
              icon={DollarSign}
              color="bg-[#FFE57F]"
            />
            
            <StatCard
              title="Premium Subscriptions"
              value={formatCurrency(revenue?.premium_subscriptions || 0)}
              subtitle="Creator premium revenue"
              icon={Crown}
              color="bg-[#FFD700]"
            />
            
            <StatCard
              title="Business Subscriptions"
              value={formatCurrency(revenue?.business_subscriptions || 0)}
              subtitle="Business plan revenue"
              icon={Briefcase}
              color="bg-[#C6A2FF]"
            />
          </div>
        </div>

        {/* Wallet & Transaction Statistics */}
        <div className="mb-8">
          <h3 className="text-2xl font-black mb-4">Wallet & Transactions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="Total Wallet Balance"
              value={formatCurrency(overview?.financial?.total_wallet_balance || 0)}
              subtitle="Combined user wallet balance"
              icon={Wallet}
              color="bg-[#FFB4B4]"
            />
            
            <StatCard
              title="Transaction Volume"
              value={formatCurrency(overview?.financial?.transaction_volume || 0)}
              subtitle={`${formatNumber(overview?.financial?.transaction_count || 0)} transactions`}
              icon={TrendingUp}
              color="bg-[#B4F8C8]"
            />
          </div>
        </div>

        {/* Revenue Breakdown Chart */}
        <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
          <h3 className="text-xl font-black mb-6">Revenue Breakdown</h3>
          
          <div className="space-y-4">
            {[
              {
                label: 'Platform Fees',
                amount: revenue?.platform_fees || 0,
                color: 'bg-[#FFE57F]',
                total: revenue?.total_revenue || 1
              },
              {
                label: 'Premium Subscriptions',
                amount: revenue?.premium_subscriptions || 0,
                color: 'bg-[#FFD700]',
                total: revenue?.total_revenue || 1
              },
              {
                label: 'Business Subscriptions',
                amount: revenue?.business_subscriptions || 0,
                color: 'bg-[#C6A2FF]',
                total: revenue?.total_revenue || 1
              }
            ].map((item, index) => {
              const percentage = revenue?.total_revenue > 0 
                ? (item.amount / revenue.total_revenue * 100).toFixed(1)
                : 0;
              
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">{item.label}</span>
                    <span className="font-black">{formatCurrency(item.amount)} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 border-2 border-[#0A0A0A] rounded-lg h-8 overflow-hidden">
                    <div
                      className={`${item.color} h-full border-r-2 border-[#0A0A0A] transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
