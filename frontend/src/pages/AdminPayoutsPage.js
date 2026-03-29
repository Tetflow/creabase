import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  ArrowLeft, 
  LogOut,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Calendar,
  Search,
  Download,
  Shield
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import EmptyState from '../components/EmptyState';
import { ListSkeleton } from '../components/Skeletons';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminPayoutsPage = () => {
  const navigate = useNavigate();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    fetchPayouts();
    fetchStats();
  }, [dateRange]);

  const fetchPayouts = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/payouts?days=${dateRange}`, {
        withCredentials: true
      });
      setPayouts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/payout-stats?days=${dateRange}`, {
        withCredentials: true
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPayouts = payouts.filter(payout => {
    // Filter by status
    if (filter === 'pending' && payout.status !== 'pending') return false;
    if (filter === 'completed' && payout.status !== 'completed') return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        payout.creator_name?.toLowerCase().includes(query) ||
        payout.project_title?.toLowerCase().includes(query) ||
        payout.transaction_id?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-[#FFE57F]',
      completed: 'bg-[#B4F8C8]',
      failed: 'bg-[#FF6B6B]'
    };
    return colors[status] || 'bg-white';
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <nav className="sticky top-0 z-50 bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/admin')}
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={3} />
            </Button>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" strokeWidth={3} />
              <h1 className="text-3xl font-black tracking-tight">Payout Management</h1>
            </div>
          </div>
          <Button onClick={handleLogout} className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold">
            <LogOut className="w-4 h-4" strokeWidth={3} />
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-6 h-6 text-[#4A4A4A]" strokeWidth={3} />
                <p className="text-xs font-bold uppercase text-[#4A4A4A]">Total Payouts</p>
              </div>
              <p className="text-3xl font-black">{formatCurrency(stats.total_amount)}</p>
              <p className="text-sm text-[#4A4A4A] font-medium mt-1">{stats.total_count} transactions</p>
            </div>

            <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-6 h-6 text-[#4A4A4A]" strokeWidth={3} />
                <p className="text-xs font-bold uppercase text-[#4A4A4A]">Completed</p>
              </div>
              <p className="text-3xl font-black">{formatCurrency(stats.completed_amount)}</p>
              <p className="text-sm text-[#4A4A4A] font-medium mt-1">{stats.completed_count} payouts</p>
            </div>

            <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-[#4A4A4A]" strokeWidth={3} />
                <p className="text-xs font-bold uppercase text-[#4A4A4A]">Pending</p>
              </div>
              <p className="text-3xl font-black">{formatCurrency(stats.pending_amount)}</p>
              <p className="text-sm text-[#4A4A4A] font-medium mt-1">{stats.pending_count} payouts</p>
            </div>

            <div className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-[#4A4A4A]" strokeWidth={3} />
                <p className="text-xs font-bold uppercase text-[#4A4A4A]">Avg Payout</p>
              </div>
              <p className="text-3xl font-black">{formatCurrency(stats.average_payout)}</p>
              <p className="text-sm text-[#4A4A4A] font-medium mt-1">per transaction</p>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4A4A]" strokeWidth={3} />
                <Input
                  placeholder="Search by creator, project, or transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-2 border-[#0A0A0A] h-12 pl-10 font-bold"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full h-12 border-2 border-[#0A0A0A] rounded-md px-3 font-bold bg-white"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                onClick={() => setFilter('all')}
                className={`flex-1 ${filter === 'all' ? 'bg-[#0A0A0A] text-white' : 'bg-white'} border-2 border-[#0A0A0A] font-bold`}
              >
                All
              </Button>
              <Button
                onClick={() => setFilter('completed')}
                className={`flex-1 ${filter === 'completed' ? 'bg-[#B4F8C8]' : 'bg-white'} border-2 border-[#0A0A0A] font-bold`}
              >
                Paid
              </Button>
              <Button
                onClick={() => setFilter('pending')}
                className={`flex-1 ${filter === 'pending' ? 'bg-[#FFE57F]' : 'bg-white'} border-2 border-[#0A0A0A] font-bold`}
              >
                Pending
              </Button>
            </div>
          </div>
        </div>

        {/* Payouts List */}
        {loading ? (
          <ListSkeleton count={5} />
        ) : filteredPayouts.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No Payouts Found"
            description={searchQuery ? "No payouts match your search" : `No ${filter} payouts in the selected time period`}
          />
        ) : (
          <div className="space-y-4">
            {filteredPayouts.map((payout) => {
              const statusColor = getStatusColor(payout.status || 'completed');
              
              return (
                <div
                  key={payout.transaction_id}
                  className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* Left Section - Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-black mb-1">
                            {payout.creator_name || 'Unknown Creator'}
                          </h3>
                          <p className="text-sm text-[#4A4A4A] font-medium">
                            Project: <span className="font-bold">{payout.project_title || payout.description}</span>
                          </p>
                        </div>
                        <Badge className={`${statusColor} border-2 border-[#0A0A0A] px-3 py-1 font-black text-xs uppercase`}>
                          {payout.status || 'Completed'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Amount</p>
                          <p className="text-lg font-black">{formatCurrency(payout.amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Transaction ID</p>
                          <p className="text-sm font-bold font-mono">{payout.transaction_id.slice(-12)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Type</p>
                          <p className="text-sm font-bold capitalize">{payout.transaction_type}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Date</p>
                          <p className="text-sm font-bold">{formatDate(payout.created_at)}</p>
                        </div>
                      </div>

                      {payout.description && (
                        <p className="text-sm text-[#4A4A4A] font-medium mt-3">
                          {payout.description}
                        </p>
                      )}
                    </div>

                    {/* Right Section - Balance After */}
                    {payout.balance_after !== undefined && (
                      <div className="bg-[#FAFAFA] border-2 border-[#0A0A0A] rounded-lg p-4 text-center min-w-[140px]">
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Balance After</p>
                        <p className="text-2xl font-black">{formatCurrency(payout.balance_after)}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Export Button */}
        {filteredPayouts.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              onClick={() => {
                // Convert to CSV
                const csv = [
                  ['Transaction ID', 'Creator', 'Project', 'Amount', 'Date', 'Status'].join(','),
                  ...filteredPayouts.map(p => [
                    p.transaction_id,
                    p.creator_name || 'N/A',
                    p.project_title || p.description,
                    p.amount,
                    formatDate(p.created_at),
                    p.status || 'completed'
                  ].join(','))
                ].join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `payouts_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              }}
              className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
            >
              <Download className="w-4 h-4 mr-2" strokeWidth={3} />
              Export to CSV
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayoutsPage;
