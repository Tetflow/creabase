import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  ArrowLeft, 
  LogOut,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Search,
  Download,
  AlertCircle,
  Eye
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
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPayouts();
    fetchStats();
  }, [dateRange, filter]);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange !== 'all') params.append('days', dateRange);
      if (filter !== 'all') params.append('status', filter);
      
      const response = await axios.get(`${BACKEND_URL}/api/admin/payouts?${params}`, {
        withCredentials: true
      });
      setPayouts(response.data);
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
    } finally {
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

  const handleAction = async (payoutId, action) => {
    if (action === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        action,
        admin_notes: actionNotes
      };
      
      if (action === 'reject') {
        payload.rejection_reason = rejectionReason;
      }

      await axios.post(
        `${BACKEND_URL}/api/admin/payouts/${payoutId}/action`,
        payload,
        { withCredentials: true }
      );

      alert(`Payout ${action}ed successfully`);
      setSelectedPayout(null);
      setActionNotes('');
      setRejectionReason('');
      fetchPayouts();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.detail || `Failed to ${action} payout`);
    } finally {
      setProcessing(false);
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
    }).format(amount || 0);
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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-[#FFE57F]',
      approved: 'bg-[#A0E7E5]',
      processing: 'bg-[#C6A2FF]',
      completed: 'bg-[#B4F8C8]',
      rejected: 'bg-[#FFB6B9]'
    };
    return colors[status] || 'bg-gray-200';
  };

  const filteredPayouts = payouts.filter(payout => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        payout.creator_name?.toLowerCase().includes(query) ||
        payout.payout_id?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Calculate summary stats
  const summaryStats = {
    pending: payouts.filter(p => p.status === 'pending').length,
    approved: payouts.filter(p => p.status === 'approved').length,
    processing: payouts.filter(p => p.status === 'processing').length,
    completed: payouts.filter(p => p.status === 'completed').length,
    rejected: payouts.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white border-b-4 border-[#0A0A0A] mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/admin')}
                variant="outline"
                className="border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
              >
                <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={3} />
                Back
              </Button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black">Payout Management</h1>
                <p className="text-[#4A4A4A] font-medium">Review and manage creator payout requests</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold hover:bg-red-100"
            >
              <LogOut className="w-4 h-4 mr-2" strokeWidth={3} />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className={`${getStatusColor('pending')} border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-sm">Pending</h3>
              <Clock className="w-5 h-5" strokeWidth={3} />
            </div>
            <p className="text-3xl font-black">{summaryStats.pending}</p>
          </div>
          
          <div className={`${getStatusColor('approved')} border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-sm">Approved</h3>
              <CheckCircle className="w-5 h-5" strokeWidth={3} />
            </div>
            <p className="text-3xl font-black">{summaryStats.approved}</p>
          </div>
          
          <div className={`${getStatusColor('processing')} border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-sm">Processing</h3>
              <TrendingUp className="w-5 h-5" strokeWidth={3} />
            </div>
            <p className="text-3xl font-black">{summaryStats.processing}</p>
          </div>
          
          <div className={`${getStatusColor('completed')} border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-sm">Completed</h3>
              <CheckCircle className="w-5 h-5" strokeWidth={3} />
            </div>
            <p className="text-3xl font-black">{summaryStats.completed}</p>
          </div>
          
          <div className={`${getStatusColor('rejected')} border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-sm">Rejected</h3>
              <XCircle className="w-5 h-5" strokeWidth={3} />
            </div>
            <p className="text-3xl font-black">{summaryStats.rejected}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4A4A]" strokeWidth={2} />
              <Input
                type="text"
                placeholder="Search by creator or payout ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 border-2 border-[#0A0A0A] rounded-md pl-11 font-bold"
              />
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
            <div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full h-12 border-2 border-[#0A0A0A] rounded-md px-3 font-bold bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
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
            description={searchQuery ? "No payouts match your search" : "No payout requests in the selected period"}
          />
        ) : (
          <div className="space-y-4">
            {filteredPayouts.map((payout) => (
              <div
                key={payout.payout_id}
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
                          Payout ID: <span className="font-bold font-mono">{payout.payout_id?.slice(-12)}</span>
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(payout.status)} border-2 border-[#0A0A0A] px-3 py-1 font-black text-xs uppercase`}>
                        {payout.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div>
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Amount</p>
                        <p className="text-lg font-black">{formatCurrency(payout.amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Wallet Balance</p>
                        <p className={`text-lg font-black ${payout.sufficient_balance ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(payout.wallet_balance)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Bank</p>
                        <p className="text-sm font-bold">{payout.bank_details?.bank_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Requested</p>
                        <p className="text-sm font-bold">{formatDate(payout.created_at)}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {payout.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedPayout(payout)}
                          className="bg-[#A0E7E5] hover:bg-[#90D7D5] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
                        >
                          <Eye className="w-4 h-4 mr-2" strokeWidth={3} />
                          Review
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Export Button */}
        {filteredPayouts.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              onClick={() => {
                const csv = [
                  ['Payout ID', 'Creator', 'Amount', 'Status', 'Date'].join(','),
                  ...filteredPayouts.map(p => [
                    p.payout_id,
                    p.creator_name || 'N/A',
                    p.amount,
                    p.status,
                    formatDate(p.created_at)
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

      {/* Review Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-[#0A0A0A] shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-6">Review Payout Request</h2>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Creator</label>
                  <p className="font-bold">{selectedPayout.creator_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Amount</label>
                  <p className="font-black text-xl">{formatCurrency(selectedPayout.amount)}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Wallet Balance</label>
                  <p className={`font-bold ${selectedPayout.sufficient_balance ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(selectedPayout.wallet_balance)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Sufficient Balance?</label>
                  <p className={`font-bold ${selectedPayout.sufficient_balance ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedPayout.sufficient_balance ? '✅ Yes' : '❌ No'}
                  </p>
                </div>
              </div>

              {selectedPayout.bank_details && (
                <div className="border-2 border-[#0A0A0A] rounded-lg p-4 bg-[#FAFAFA]">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Bank Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Account Holder:</span>
                      <p className="font-bold">{selectedPayout.bank_details.account_holder}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Bank Name:</span>
                      <p className="font-bold">{selectedPayout.bank_details.bank_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Account Number:</span>
                      <p className="font-mono font-bold">{selectedPayout.bank_details.account_number}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">IFSC Code:</span>
                      <p className="font-mono font-bold">{selectedPayout.bank_details.ifsc_code}</p>
                    </div>
                  </div>
                </div>
              )}

              {!selectedPayout.sufficient_balance && (
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-900">Insufficient Balance</p>
                    <p className="text-sm text-red-700">The creator does not have sufficient balance for this payout.</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold mb-2">Admin Notes (Optional)</label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full border-2 border-[#0A0A0A] rounded-lg px-4 py-2 font-medium"
                  rows="3"
                  placeholder="Add notes about this payout..."
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Rejection Reason (Required if rejecting)</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full border-2 border-[#0A0A0A] rounded-lg px-4 py-2 font-medium"
                  rows="2"
                  placeholder="Explain why this payout is being rejected..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setSelectedPayout(null);
                  setActionNotes('');
                  setRejectionReason('');
                }}
                disabled={processing}
                variant="outline"
                className="flex-1 border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAction(selectedPayout.payout_id, 'reject')}
                disabled={processing}
                className="flex-1 bg-red-400 hover:bg-red-500 border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
              >
                <XCircle className="w-4 h-4 mr-2" strokeWidth={3} />
                {processing ? 'Processing...' : 'Reject'}
              </Button>
              <Button
                onClick={() => handleAction(selectedPayout.payout_id, 'approve')}
                disabled={processing || !selectedPayout.sufficient_balance}
                className="flex-1 bg-green-400 hover:bg-green-500 border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4 mr-2" strokeWidth={3} />
                {processing ? 'Processing...' : 'Approve'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayoutsPage;
