import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const UsageStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/usage/stats`, {
        withCredentials: true
      });
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
        <p className="font-bold">Loading usage stats...</p>
      </div>
    );
  }

  if (!stats) return null;

  const getProgressColor = () => {
    const percentage = (stats.creators_viewed_this_month / stats.monthly_limit) * 100;
    if (percentage < 50) return 'bg-[#B4F8C8]';
    if (percentage < 80) return 'bg-[#FFE57F]';
    return 'bg-[#FF9B9B]';
  };

  const progressPercentage = Math.min(100, (stats.creators_viewed_this_month / stats.monthly_limit) * 100);

  return (
    <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#C6A2FF] border-2 border-[#0A0A0A] rounded-full p-2">
          <TrendingUp className="w-5 h-5" strokeWidth={3} />
        </div>
        <h3 className="text-2xl font-black">Monthly Usage</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="border-2 border-[#0A0A0A] rounded-lg p-4">
          <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Creators Viewed</p>
          <p className="text-3xl font-black">{stats.creators_viewed_this_month}/{stats.monthly_limit}</p>
        </div>

        <div className="border-2 border-[#0A0A0A] rounded-lg p-4">
          <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Remaining</p>
          <p className="text-3xl font-black">{stats.remaining_in_plan}</p>
        </div>

        {stats.total_payg_spent > 0 && (
          <div className="border-2 border-[#0A0A0A] rounded-lg p-4">
            <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Pay-as-you-go</p>
            <p className="text-3xl font-black">₹{stats.total_payg_spent}</p>
            <p className="text-xs text-[#4A4A4A] mt-1">{stats.payg_creators} extra creators</p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <p className="font-bold text-sm">Usage Progress</p>
          <p className="font-bold text-sm">{progressPercentage.toFixed(0)}%</p>
        </div>
        <div className="h-4 bg-[#FAFAFA] border-2 border-[#0A0A0A] rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-500`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Warning when approaching limit */}
      {stats.remaining_in_plan <= 5 && stats.remaining_in_plan > 0 && (
        <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={3} />
          <div>
            <p className="font-bold">Approaching Monthly Limit</p>
            <p className="text-sm">You have {stats.remaining_in_plan} creator views remaining.</p>
          </div>
        </div>
      )}

      {/* Pay-as-you-go active */}
      {stats.creators_viewed_this_month > stats.monthly_limit && (
        <div className="bg-[#FF9B9B] border-2 border-[#0A0A0A] rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={3} />
          <div>
            <p className="font-bold">Pay-as-you-go Active</p>
            <p className="text-sm">You have exceeded your monthly limit.</p>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t-2 border-[#0A0A0A]">
        <p className="text-sm font-medium text-[#4A4A4A]">
          Next reset: {new Date(stats.next_reset).toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}
        </p>
      </div>
    </div>
  );
};

export default UsageStats;
