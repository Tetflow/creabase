import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Plus, Download, ArrowUpCircle, ArrowDownCircle, Clock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTopup, setShowTopup] = useState(false);
  const [showPayout, setShowPayout] = useState(false);
  const [topupAmount, setTopupAmount] = useState('1000');
  const [payoutData, setPayoutData] = useState({
    amount: '',
    bank_account_holder: '',
    bank_account_number: '',
    bank_ifsc_code: '',
    bank_name: ''
  });

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/wallet/balance`, {
        withCredentials: true
      });
      setWallet(response.data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount);
    if (amount < 100 || amount > 100000) {
      alert('Amount must be between ₹100 and ₹100,000');
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/wallet/topup`,
        { amount, payment_method: 'cashfree' },
        { withCredentials: true }
      );
      alert(response.data.message);
      setShowTopup(false);
      fetchWallet();
    } catch (error) {
      alert(error.response?.data?.detail || 'Top-up failed');
    }
  };

  const handlePayout = async () => {
    const amount = parseFloat(payoutData.amount);
    if (amount < 500) {
      alert('Minimum payout amount is ₹500');
      return;
    }

    if (!payoutData.bank_account_holder || !payoutData.bank_account_number || 
        !payoutData.bank_ifsc_code || !payoutData.bank_name) {
      alert('Please fill all bank details');
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/wallet/request-payout`,
        payoutData,
        { withCredentials: true }
      );
      alert(response.data.message);
      setShowPayout(false);
      setPayoutData({
        amount: '',
        bank_account_holder: '',
        bank_account_number: '',
        bank_ifsc_code: '',
        bank_name: ''
      });
      fetchWallet();
    } catch (error) {
      alert(error.response?.data?.detail || 'Payout request failed');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white border-4 border-black rounded-2xl shadow-brutal max-w-md">
          <Wallet size={48} className="mx-auto mb-4 text-purple-600" />
          <h2 className="text-2xl font-black mb-2">Login Required</h2>
          <p className="text-gray-600 mb-4">Please login to access your wallet</p>
          <a 
            href="/login/business" 
            className="inline-block bg-purple-600 text-white font-bold px-6 py-3 rounded-lg border-2 border-black hover:bg-purple-700"
          >
            Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 border-4 border-black rounded-2xl p-8 mb-8 shadow-brutal">
          <div className="flex items-center justify-between text-white">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={24} />
                <h1 className="text-xl font-bold">Wallet Balance</h1>
              </div>
              <p className="text-5xl font-black">₹{wallet.balance.toFixed(2)}</p>
              <p className="text-purple-200 text-sm mt-2">Currency: {wallet.currency}</p>
            </div>
            <div className="flex flex-col gap-3">
              {wallet.can_topup && (
                <button
                  onClick={() => setShowTopup(true)}
                  className="bg-white text-purple-600 font-bold px-6 py-3 rounded-lg border-2 border-black shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <Plus size={20} />
                  Top-up
                </button>
              )}
              {wallet.can_withdraw && (
                <button
                  onClick={() => setShowPayout(true)}
                  className="bg-green-400 text-black font-bold px-6 py-3 rounded-lg border-2 border-black shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <Download size={20} />
                  Request Payout
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Top-up Modal */}
        {showTopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white border-4 border-black rounded-2xl p-8 max-w-md w-full m-4">
              <h2 className="text-2xl font-black mb-4">Top-up Wallet</h2>
              <p className="text-gray-600 mb-4">Add balance to your wallet (₹100 - ₹100,000)</p>
              
              <div className="mb-6">
                <label className="block font-bold mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  min="100"
                  max="100000"
                  className="w-full border-2 border-black rounded-lg px-4 py-3 font-bold text-xl"
                  placeholder="1000"
                />
                <div className="flex gap-2 mt-2">
                  {[500, 1000, 2500, 5000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setTopupAmount(amt.toString())}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-lg py-2 font-bold text-sm"
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowTopup(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 font-bold py-3 px-6 rounded-lg border-2 border-black"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTopup}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 font-bold py-3 px-6 rounded-lg border-2 border-black shadow-brutal"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payout Modal */}
        {showPayout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white border-4 border-black rounded-2xl p-8 max-w-md w-full m-4">
              <h2 className="text-2xl font-black mb-4">Request Payout</h2>
              <p className="text-gray-600 mb-4">Minimum ₹500. Processing: 2-3 business days</p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block font-bold mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={payoutData.amount}
                    onChange={(e) => setPayoutData({...payoutData, amount: e.target.value})}
                    min="500"
                    max={wallet.balance}
                    className="w-full border-2 border-black rounded-lg px-4 py-2"
                    placeholder="10000"
                  />
                  <p className="text-sm text-gray-600 mt-1">Available: ₹{wallet.balance.toFixed(2)}</p>
                </div>

                <div>
                  <label className="block font-bold mb-2">Account Holder Name</label>
                  <input
                    type="text"
                    value={payoutData.bank_account_holder}
                    onChange={(e) => setPayoutData({...payoutData, bank_account_holder: e.target.value})}
                    className="w-full border-2 border-black rounded-lg px-4 py-2"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Account Number</label>
                  <input
                    type="text"
                    value={payoutData.bank_account_number}
                    onChange={(e) => setPayoutData({...payoutData, bank_account_number: e.target.value})}
                    className="w-full border-2 border-black rounded-lg px-4 py-2"
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">IFSC Code</label>
                  <input
                    type="text"
                    value={payoutData.bank_ifsc_code}
                    onChange={(e) => setPayoutData({...payoutData, bank_ifsc_code: e.target.value.toUpperCase()})}
                    className="w-full border-2 border-black rounded-lg px-4 py-2"
                    placeholder="HDFC0001234"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={payoutData.bank_name}
                    onChange={(e) => setPayoutData({...payoutData, bank_name: e.target.value})}
                    className="w-full border-2 border-black rounded-lg px-4 py-2"
                    placeholder="HDFC Bank"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPayout(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 font-bold py-3 px-6 rounded-lg border-2 border-black"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayout}
                  className="flex-1 bg-green-400 hover:bg-green-500 font-bold py-3 px-6 rounded-lg border-2 border-black shadow-brutal"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-brutal">
          <h2 className="text-2xl font-black mb-6">Recent Transactions</h2>
          
          {wallet.recent_transactions && wallet.recent_transactions.length > 0 ? (
            <div className="space-y-3">
              {wallet.recent_transactions.map((txn, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div className="flex items-center gap-3">
                    {txn.transaction_type === 'credit' || txn.transaction_type === 'topup' ? (
                      <div className="bg-green-100 p-2 rounded-lg">
                        <ArrowUpCircle className="text-green-600" size={24} />
                      </div>
                    ) : (
                      <div className="bg-red-100 p-2 rounded-lg">
                        <ArrowDownCircle className="text-red-600" size={24} />
                      </div>
                    )}
                    <div>
                      <p className="font-bold">{txn.description || txn.transaction_type}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(txn.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-xl ${txn.transaction_type === 'credit' || txn.transaction_type === 'topup' ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.transaction_type === 'credit' || txn.transaction_type === 'topup' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
