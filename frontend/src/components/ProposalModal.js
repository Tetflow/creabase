import React, { useState } from 'react';
import { X, DollarSign, Clock, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

const ProposalModal = ({ isOpen, onClose, project, onSubmitSuccess }) => {
  const [amount, setAmount] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!deliveryDays || parseInt(deliveryDays) <= 0) {
      setError('Please enter valid delivery days');
      return;
    }

    if (!message.trim()) {
      setError('Please include a cover letter');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          project_id: project.project_id,
          amount: parseFloat(amount),
          delivery_days: parseInt(deliveryDays),
          message: message.trim()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (onSubmitSuccess) {
          onSubmitSuccess(data);
        }
        onClose();
        // Reset form
        setAmount('');
        setDeliveryDays('');
        setMessage('');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to submit proposal');
      }
    } catch (err) {
      console.error('Error submitting proposal:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl border-2 border-[#0A0A0A] shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-[#0A0A0A]">
          <h2 className="text-2xl font-black">Submit Proposal</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Info */}
          <div className="bg-gray-50 border-2 border-[#0A0A0A] rounded-lg p-4">
            <p className="text-sm font-bold text-gray-600 mb-1">Project</p>
            <p className="font-black text-lg">{project.title}</p>
            <p className="text-sm text-gray-600 mt-2">{project.description}</p>
            {project.budget && (
              <p className="text-sm font-bold text-purple-600 mt-2">
                Budget: ₹{project.budget.toLocaleString()}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block font-bold mb-2">
              Your Bid Amount (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5000"
                min="100"
                className="border-2 border-[#0A0A0A] pl-10"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Enter your proposed amount for this project
            </p>
          </div>

          {/* Delivery Time */}
          <div>
            <label className="block font-bold mb-2">
              Delivery Time (Days) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="number"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                placeholder="7"
                min="1"
                className="border-2 border-[#0A0A0A] pl-10"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              How many days will you need to complete this project?
            </p>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block font-bold mb-2">
              Cover Letter <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain why you're the best fit for this project. Highlight your relevant experience and approach..."
                className="border-2 border-[#0A0A0A] pl-10 min-h-[150px]"
                maxLength={1000}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{message.length}/1000 characters</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3">
              <p className="text-red-700 font-bold text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#A78BFA] hover:bg-[#9333EA] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Proposal'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProposalModal;
