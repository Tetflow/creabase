import React, { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowDownToLine, History, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const WalletWidget = ({ userRole }) => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/wallet/balance`, {
        withCredentials: true
      });
      setWallet(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/wallet/transactions`, {
        withCredentials: true
      });
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) < 100) {
      alert('Minimum top-up amount is ₹100');
      return;
    }

    setProcessing(true);
    try {
      await axios.post(
        `${BACKEND_URL}/api/wallet/topup`,
        { amount: parseFloat(topUpAmount), payment_method: 'cashfree' },
        { withCredentials: true }
      );
      alert('Wallet topped up successfully!');
      setTopUpAmount('');
      setShowTopUp(false);
      fetchWallet();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to top up wallet');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < 500) {
      alert('Minimum withdrawal amount is ₹500');
      return;
    }

    setProcessing(true);
    try {
      await axios.post(
        `${BACKEND_URL}/api/wallet/withdraw`,
        { amount: parseFloat(withdrawAmount), bank_account_id: 'default' },
        { withCredentials: true }
      );
      alert('Withdrawal request submitted! Processing time: 2-3 business days');
      setWithdrawAmount('');
      setShowWithdraw(false);
      fetchWallet();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to request withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-[#E5E5E5] rounded w-24 mb-4"></div>
        <div className="h-10 bg-[#E5E5E5] rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#C6A2FF] to-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6" strokeWidth={3} />
          <h3 className="text-lg font-black">Wallet Balance</h3>
        </div>
        <Dialog open={showTransactions} onOpenChange={(open) => {
          setShowTransactions(open);
          if (open) fetchTransactions();
        }}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
            >
              <History className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Transaction History</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {transactions.length === 0 ? (
                <p className="text-center text-[#4A4A4A] py-8">No transactions yet</p>
              ) : (
                transactions.map((txn) => (
                  <div
                    key={txn.transaction_id}
                    className="bg-white border-2 border-[#0A0A0A] rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold">{txn.description}</p>
                      <p className="text-sm text-[#4A4A4A]">{formatDate(txn.created_at)}</p>
                      <p className="text-xs font-bold mt-1">
                        {txn.transaction_type.toUpperCase()}
                      </p>
                    </div>
                    <div className={`text-xl font-black ${txn.transaction_type === 'credit' || txn.transaction_type === 'topup' || txn.transaction_type === 'payout' ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.transaction_type === 'credit' || txn.transaction_type === 'topup' || txn.transaction_type === 'payout' ? '+' : '-'}
                      {formatAmount(txn.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <p className="text-4xl font-black mb-2">{formatAmount(wallet?.balance || 0)}</p>
        <p className="text-sm font-bold opacity-80">Available Balance</p>
      </div>

      <div className="flex gap-3">
        {userRole === 'business' && (
          <Dialog open={showTopUp} onOpenChange={setShowTopUp}>
            <DialogTrigger asChild>
              <Button
                className="flex-1 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Top Up
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Top Up Wallet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block font-bold mb-2">Amount (₹)</label>
                  <Input
                    type="number"
                    min="100"
                    step="100"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="Minimum ₹100"
                    className="border-2 border-[#0A0A0A]"
                  />
                  <p className="text-sm text-[#4A4A4A] mt-2">Minimum top-up amount: ₹100</p>
                </div>
                <Button
                  onClick={handleTopUp}
                  disabled={processing}
                  className="w-full bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                >
                  {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  {processing ? 'Processing...' : 'Add Funds'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {userRole === 'creator' && (
          <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
            <DialogTrigger asChild>
              <Button
                className="flex-1 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
              >
                <ArrowDownToLine className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Withdraw Funds</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block font-bold mb-2">Amount (₹)</label>
                  <Input
                    type="number"
                    min="500"
                    step="100"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Minimum ₹500"
                    className="border-2 border-[#0A0A0A]"
                  />
                  <p className="text-sm text-[#4A4A4A] mt-2">
                    Minimum withdrawal: ₹500<br />
                    Processing time: 2-3 business days
                  </p>
                </div>
                <Button
                  onClick={handleWithdraw}
                  disabled={processing}
                  className="w-full bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                >
                  {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowDownToLine className="w-4 h-4 mr-2" />}
                  {processing ? 'Processing...' : 'Request Withdrawal'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default WalletWidget;
