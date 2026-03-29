import React, { useState, useEffect } from 'react';
import { Search, Wallet, TrendingUp, TrendingDown, History, Plus, Minus, AlertCircle, X, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminWalletManagement = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [adjustmentType, setAdjustmentType] = useState('credit');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, [search, roleFilter]);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/wallets`, {
        params: { search, role: roleFilter },
        withCredentials: true
      });
      setWallets(response.data.wallets || []);
    } catch (err) {
      console.error('Failed to fetch wallets:', err);
      setError('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (userId) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/admin/wallets/${userId}/transactions`,
        { withCredentials: true }
      );
      setTransactions(response.data.transactions || []);
      setShowTransactionsModal(true);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Failed to load transaction history');
    }
  };

  const handleAdjustWallet = async () => {
    if (!selectedWallet) return;
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!reason || reason.trim().length < 5) {
      setError('Please provide a reason (minimum 5 characters)');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/admin/wallets/${selectedWallet.user_id}/adjust`,
        {
          amount: parseFloat(amount),
          adjustment_type: adjustmentType,
          reason: reason.trim(),
          notes: notes.trim()
        },
        { withCredentials: true }
      );
      
      setSuccess(
        `₹${amount} ${adjustmentType === 'credit' ? 'credited to' : 'debited from'} ${selectedWallet.name}'s wallet`
      );
      setShowAdjustModal(false);
      setAmount('');
      setReason('');
      setNotes('');
      fetchWallets();
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to adjust wallet balance');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-[#FFB4B4]';
      case 'creator': return 'bg-[#C6A2FF]';
      case 'business': return 'bg-[#B4F8C8]';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">Wallet Management</h1>
          <p className="text-sm text-[#4A4A4A] font-medium">
            Monitor and manage user wallet balances
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="bg-[#FF9B9B] border-2 border-[#0A0A0A] mb-6">
            <AlertCircle className="h-4 w-4" strokeWidth={3} />
            <AlertDescription className="font-bold">{error}</AlertDescription>
            <button onClick={() => setError(null)} className="absolute top-4 right-4">
              <X className="w-4 h-4" strokeWidth={3} />
            </button>
          </Alert>
        )}

        {success && (
          <Alert className="bg-[#B4F8C8] border-2 border-[#0A0A0A] mb-6">
            <CheckCircle className="h-4 w-4" strokeWidth={3} />
            <AlertDescription className="font-bold">{success}</AlertDescription>
            <button onClick={() => setSuccess(null)} className="absolute top-4 right-4">
              <X className="w-4 h-4" strokeWidth={3} />
            </button>
          </Alert>
        )}

        {/* Filters */}
        <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4A4A4A] w-5 h-5" strokeWidth={3} />
              <Input
                type="text"
                placeholder="Search by name, email, or user ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 border-2 border-[#0A0A0A] font-bold"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="border-2 border-[#0A0A0A] font-bold">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="creator">Creators</SelectItem>
                <SelectItem value="business">Businesses</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Wallets List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A0A0A]"></div>
          </div>
        ) : wallets.length === 0 ? (
          <div className="bg-white border-2 border-[#0A0A0A] rounded-xl p-12 text-center">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-[#4A4A4A]" strokeWidth={2} />
            <h3 className="text-xl font-black mb-2">No Wallets Found</h3>
            <p className="text-[#4A4A4A] font-medium">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {wallets.map((wallet) => (
              <div
                key={wallet.user_id}
                className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6 hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg p-3">
                      <Wallet className="w-6 h-6" strokeWidth={3} />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-black">{wallet.name}</h3>
                        <span className={`${getRoleBadgeColor(wallet.role)} px-2 py-1 rounded text-xs font-black border border-[#0A0A0A]`}>
                          {wallet.role.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-[#4A4A4A] font-medium">{wallet.email}</p>
                      <p className="text-xs text-[#4A4A4A] font-medium">ID: {wallet.user_id}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-[#4A4A4A] font-medium mb-1">Balance</p>
                      <p className="text-3xl font-black">{formatCurrency(wallet.balance)}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedWallet(wallet);
                          setAdjustmentType('credit');
                          setShowAdjustModal(true);
                        }}
                        className="bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                      >
                        <Plus className="w-4 h-4 mr-1" strokeWidth={3} />
                        Credit
                      </Button>
                      
                      <Button
                        onClick={() => {
                          setSelectedWallet(wallet);
                          setAdjustmentType('debit');
                          setShowAdjustModal(true);
                        }}
                        className="bg-[#FF9B9B] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                      >
                        <Minus className="w-4 h-4 mr-1" strokeWidth={3} />
                        Debit
                      </Button>
                      
                      <Button
                        onClick={() => {
                          setSelectedWallet(wallet);
                          fetchTransactions(wallet.user_id);
                        }}
                        className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                      >
                        <History className="w-4 h-4" strokeWidth={3} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Adjust Balance Modal */}
        {showAdjustModal && selectedWallet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black">Adjust Wallet Balance</h2>
                <button onClick={() => setShowAdjustModal(false)}>
                  <X className="w-6 h-6" strokeWidth={3} />
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg">
                <p className="font-bold">{selectedWallet.name}</p>
                <p className="text-sm text-[#4A4A4A] font-medium">{selectedWallet.email}</p>
                <p className="text-lg font-black mt-2">Current: {formatCurrency(selectedWallet.balance)}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Adjustment Type</label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setAdjustmentType('credit')}
                      className={`flex-1 ${adjustmentType === 'credit' ? 'bg-[#B4F8C8]' : 'bg-white'} border-2 border-[#0A0A0A] font-bold`}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" strokeWidth={3} />
                      Credit (Add)
                    </Button>
                    <Button
                      onClick={() => setAdjustmentType('debit')}
                      className={`flex-1 ${adjustmentType === 'debit' ? 'bg-[#FF9B9B]' : 'bg-white'} border-2 border-[#0A0A0A] font-bold`}
                    >
                      <TrendingDown className="w-4 h-4 mr-2" strokeWidth={3} />
                      Debit (Subtract)
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-2">Amount (₹)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border-2 border-[#0A0A0A] font-bold"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-2">Reason *</label>
                  <Textarea
                    placeholder="Enter reason for adjustment (minimum 5 characters)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="border-2 border-[#0A0A0A] font-bold"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-2">Additional Notes (Optional)</label>
                  <Textarea
                    placeholder="Any additional details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="border-2 border-[#0A0A0A] font-bold"
                    rows={2}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleAdjustWallet}
                    disabled={submitting}
                    className="flex-1 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                  >
                    {submitting ? 'Processing...' : 'Confirm Adjustment'}
                  </Button>
                  <Button
                    onClick={() => setShowAdjustModal(false)}
                    className="bg-white border-2 border-[#0A0A0A] font-bold"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Modal */}
        {showTransactionsModal && selectedWallet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4">
                <h2 className="text-2xl font-black">Transaction History</h2>
                <button onClick={() => setShowTransactionsModal(false)}>
                  <X className="w-6 h-6" strokeWidth={3} />
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg">
                <p className="font-bold">{selectedWallet.name}</p>
                <p className="text-sm text-[#4A4A4A] font-medium">{selectedWallet.email}</p>
              </div>
              
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 mx-auto mb-2 text-[#4A4A4A]" strokeWidth={2} />
                  <p className="text-[#4A4A4A] font-medium">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((txn) => (
                    <div
                      key={txn.transaction_id}
                      className="border-2 border-[#0A0A0A] rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs font-black border border-[#0A0A0A] ${
                              txn.type?.includes('credit') || txn.type === 'topup' ? 'bg-[#B4F8C8]' : 'bg-[#FF9B9B]'
                            }`}>
                              {txn.type?.toUpperCase().replace('_', ' ')}
                            </span>
                            <span className="text-xs text-[#4A4A4A] font-medium">
                              {formatDate(txn.created_at)}
                            </span>
                          </div>
                          <p className="text-sm font-bold mb-1">{txn.description}</p>
                          {txn.metadata?.adjusted_by_email && (
                            <p className="text-xs text-[#4A4A4A] font-medium">
                              By: {txn.metadata.adjusted_by_email}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-black ${
                            txn.type?.includes('credit') || txn.type === 'topup' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {txn.type?.includes('credit') || txn.type === 'topup' ? '+' : '-'}
                            {formatCurrency(txn.amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWalletManagement;
