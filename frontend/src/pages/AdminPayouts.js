import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPayouts();
  }, [filterStatus]);

  const fetchPayouts = async () => {
    try {
      const url = filterStatus 
        ? `${BACKEND_URL}/api/admin/payouts?status=${filterStatus}`
        : `${BACKEND_URL}/api/admin/payouts`;
      const response = await axios.get(url, { withCredentials: true });
      setPayouts(response.data);
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (payoutId, action) => {
    try {
      const payload = {
        action,
        admin_notes: actionNotes
      };
      
      if (action === 'reject') {
        if (!rejectionReason) {
          alert('Please provide rejection reason');
          return;
        }
        payload.rejection_reason = rejectionReason;
      }

      await axios.post(
        `${BACKEND_URL}/api/admin/payouts/${payoutId}/action`,
        payload,
        { withCredentials: true }
      );

      alert(`Payout ${action}d successfully`);
      setSelectedPayout(null);
      setActionNotes('');
      setRejectionReason('');
      fetchPayouts();
    } catch (error) {
      alert(error.response?.data?.detail || `Failed to ${action} payout`);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black">Payout Management</h1>
          
          <div className="flex items-center gap-2">
            <Filter size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border-2 border-black rounded-lg px-4 py-2 font-bold"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="Pending"
            count={payouts.filter(p => p.status === 'pending').length}
            color="yellow"
            icon={<Clock />}
          />
          <SummaryCard
            title="Approved"
            count={payouts.filter(p => p.status === 'approved').length}
            color="blue"
            icon={<CheckCircle />}
          />
          <SummaryCard
            title="Completed"
            count={payouts.filter(p => p.status === 'completed').length}
            color="green"
            icon={<CheckCircle />}
          />
          <SummaryCard
            title="Rejected"
            count={payouts.filter(p => p.status === 'rejected').length}
            color="red"
            icon={<XCircle />}
          />
        </div>

        {/* Payouts Table */}
        <div className="bg-white border-4 border-black rounded-2xl overflow-hidden shadow-brutal">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-yellow-400 border-b-4 border-black">
                <tr>
                  <th className="px-6 py-4 text-left font-black">Creator</th>
                  <th className="px-6 py-4 text-left font-black">Amount</th>
                  <th className="px-6 py-4 text-left font-black">Wallet Balance</th>
                  <th className="px-6 py-4 text-left font-black">Bank Details</th>
                  <th className="px-6 py-4 text-left font-black">Status</th>
                  <th className="px-6 py-4 text-left font-black">Date</th>
                  <th className="px-6 py-4 text-left font-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout, idx) => (
                  <tr key={idx} className="border-b-2 border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-bold">{payout.creator_name}</p>
                      <p className="text-sm text-gray-600">{payout.creator_email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-lg">₹{payout.amount.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-bold ${payout.sufficient_balance ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{payout.wallet_balance?.toFixed(2)}
                      </p>
                      {!payout.sufficient_balance && (
                        <p className="text-xs text-red-600">Insufficient!</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{payout.bank_details.bank_name}</p>
                      <p className="text-xs text-gray-600">
                        {payout.bank_details.account_holder}
                      </p>
                      <p className="text-xs text-gray-600 font-mono">
                        {payout.bank_details.account_number}
                      </p>
                      <p className="text-xs text-gray-600 font-mono">
                        {payout.bank_details.ifsc_code}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={payout.status} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">
                        {new Date(payout.requested_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(payout.requested_at).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {payout.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedPayout(payout)}
                            className="bg-green-400 hover:bg-green-500 text-black font-bold px-3 py-1 rounded border-2 border-black text-sm"
                          >
                            Review
                          </button>
                        </div>
                      )}
                      {payout.status === 'approved' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Mark as completed? This will deduct from wallet.')) {
                              handleAction(payout.payout_id, 'complete');
                            }
                          }}
                          className="bg-blue-400 hover:bg-blue-500 text-black font-bold px-3 py-1 rounded border-2 border-black text-sm"
                        >
                          Complete
                        </button>
                      )}
                      {(payout.status === 'completed' || payout.status === 'rejected') && (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {payouts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Download size={48} className="mx-auto mb-4 opacity-50" />
              <p>No payout requests found</p>
            </div>
          )}
        </div>

        {/* Review Modal */}
        {selectedPayout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white border-4 border-black rounded-2xl p-8 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-black mb-6">Review Payout Request</h2>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Creator</label>
                    <p className="font-bold">{selectedPayout.creator_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Amount</label>
                    <p className="font-black text-xl">₹{selectedPayout.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Wallet Balance</label>
                    <p className={`font-bold ${selectedPayout.sufficient_balance ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{selectedPayout.wallet_balance?.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Sufficient?</label>
                    <p className={`font-bold ${selectedPayout.sufficient_balance ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedPayout.sufficient_balance ? '✅ Yes' : '❌ No'}
                    </p>
                  </div>
                </div>

                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold mb-2">Bank Details</h3>
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

                <div>
                  <label className="block font-bold mb-2">Admin Notes (Optional)</label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full border-2 border-black rounded-lg px-4 py-2"
                    rows="3"
                    placeholder="Add notes..."
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Rejection Reason (if rejecting)</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full border-2 border-black rounded-lg px-4 py-2"
                    rows="2"
                    placeholder="Required if rejecting..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedPayout(null);
                    setActionNotes('');
                    setRejectionReason('');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 font-bold py-3 px-6 rounded-lg border-2 border-black"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction(selectedPayout.payout_id, 'reject')}
                  className="flex-1 bg-red-400 hover:bg-red-500 font-bold py-3 px-6 rounded-lg border-2 border-black"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAction(selectedPayout.payout_id, 'approve')}
                  className="flex-1 bg-green-400 hover:bg-green-500 font-bold py-3 px-6 rounded-lg border-2 border-black shadow-brutal"
                  disabled={!selectedPayout.sufficient_balance}
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, count, color, icon }) {
  const colors = {
    yellow: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    blue: 'bg-blue-100 border-blue-500 text-blue-700',
    green: 'bg-green-100 border-green-500 text-green-700',
    red: 'bg-red-100 border-red-500 text-red-700'
  };

  return (
    <div className={`${colors[color]} border-4 rounded-2xl p-6 shadow-brutal`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-black">{title}</h3>
        {icon}
      </div>
      <p className="text-4xl font-black">{count}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-500',
    approved: 'bg-blue-100 text-blue-800 border-blue-500',
    processing: 'bg-purple-100 text-purple-800 border-purple-500',
    completed: 'bg-green-100 text-green-800 border-green-500',
    rejected: 'bg-red-100 text-red-800 border-red-500'
  };

  return (
    <span className={`${styles[status]} px-3 py-1 rounded-full border-2 font-bold text-xs uppercase`}>
      {status}
    </span>
  );
}
