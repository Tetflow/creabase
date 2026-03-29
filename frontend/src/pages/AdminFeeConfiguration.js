import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, DollarSign, Percent, Users, Crown, AlertCircle, CheckCircle, History, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminFeeConfiguration = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    escrow_fee_percentage: 10.0,
    gst_percentage: 18.0,
    business_subscription_monthly: 999.0,
    business_subscription_yearly: 9999.0,
    creator_premium_monthly: 99.0,
    creator_premium_yearly: 999.0,
    monthly_creator_limit: 25
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/admin/platform-config`,
        { withCredentials: true }
      );
      
      if (response.data.config) {
        setConfig(response.data.config);
        setFormData({
          escrow_fee_percentage: response.data.config.escrow_fee_percentage || 10.0,
          gst_percentage: response.data.config.gst_percentage || 18.0,
          business_subscription_monthly: response.data.config.business_subscription_monthly || 999.0,
          business_subscription_yearly: response.data.config.business_subscription_yearly || 9999.0,
          creator_premium_monthly: response.data.config.creator_premium_monthly || 99.0,
          creator_premium_yearly: response.data.config.creator_premium_yearly || 999.0,
          monthly_creator_limit: response.data.config.monthly_creator_limit || 25
        });
      }
    } catch (err) {
      console.error('Failed to fetch config:', err);
      setError('Failed to load platform configuration');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/admin/platform-config/history`,
        { withCredentials: true }
      );
      setHistory(response.data.history || []);
      setShowHistory(true);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError('Failed to load configuration history');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate ranges
    if (formData.escrow_fee_percentage < 0 || formData.escrow_fee_percentage > 100) {
      setError('Escrow fee must be between 0-100%');
      return;
    }
    
    if (formData.gst_percentage < 0 || formData.gst_percentage > 100) {
      setError('GST must be between 0-100%');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await axios.put(
        `${BACKEND_URL}/api/admin/platform-config`,
        formData,
        { withCredentials: true }
      );
      
      setSuccess('Platform configuration updated successfully');
      setEditing(false);
      fetchConfig();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update configuration');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'monthly_creator_limit' ? parseInt(value) || 0 : parseFloat(value) || 0
    }));
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount).toFixed(2)}`;
  const formatPercent = (value) => `${parseFloat(value).toFixed(2)}%`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
            <Settings className="w-6 h-6" strokeWidth={3} />
            <h1 className="text-2xl font-black">Fee Configuration</h1>
          </div>
          
          <Button
            onClick={fetchHistory}
            className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
          >
            <History className="w-4 h-4 mr-2" strokeWidth={3} />
            History
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-black mb-2">Platform Fee Settings</h2>
          <p className="text-sm text-[#4A4A4A] font-medium">
            Configure subscription pricing and transaction fees
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

        {!editing ? (
          // View Mode
          <div className="space-y-6">
            {/* Transaction Fees */}
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg p-3">
                  <Percent className="w-6 h-6" strokeWidth={3} />
                </div>
                <h3 className="text-xl font-black">Transaction Fees</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#4A4A4A] font-medium mb-1">Platform Fee (Escrow)</p>
                  <p className="text-2xl font-black">{formatPercent(config.escrow_fee_percentage)}</p>
                </div>
                <div>
                  <p className="text-sm text-[#4A4A4A] font-medium mb-1">GST on Platform Fee</p>
                  <p className="text-2xl font-black">{formatPercent(config.gst_percentage)}</p>
                </div>
              </div>
            </div>

            {/* Business Subscription */}
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-lg p-3">
                  <Users className="w-6 h-6" strokeWidth={3} />
                </div>
                <h3 className="text-xl font-black">Business Subscription</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-[#4A4A4A] font-medium mb-1">Monthly Plan</p>
                  <p className="text-2xl font-black">{formatCurrency(config.business_subscription_monthly)}</p>
                </div>
                <div>
                  <p className="text-sm text-[#4A4A4A] font-medium mb-1">Yearly Plan</p>
                  <p className="text-2xl font-black">{formatCurrency(config.business_subscription_yearly)}</p>
                </div>
                <div>
                  <p className="text-sm text-[#4A4A4A] font-medium mb-1">Free Tier Limit</p>
                  <p className="text-2xl font-black">{config.monthly_creator_limit} creators/month</p>
                </div>
              </div>
            </div>

            {/* Creator Premium */}
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#FFD700] border-2 border-[#0A0A0A] rounded-lg p-3">
                  <Crown className="w-6 h-6" strokeWidth={3} />
                </div>
                <h3 className="text-xl font-black">Creator Premium</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#4A4A4A] font-medium mb-1">Monthly Plan</p>
                  <p className="text-2xl font-black">{formatCurrency(config.creator_premium_monthly)}</p>
                </div>
                <div>
                  <p className="text-sm text-[#4A4A4A] font-medium mb-1">Yearly Plan</p>
                  <p className="text-2xl font-black">{formatCurrency(config.creator_premium_yearly)}</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setEditing(true)}
              className="w-full bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
            >
              Edit Configuration
            </Button>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Fees */}
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
              <h3 className="text-xl font-black mb-6">Transaction Fees</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Platform Fee (%) *</label>
                  <Input
                    type="number"
                    name="escrow_fee_percentage"
                    value={formData.escrow_fee_percentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="border-2 border-[#0A0A0A] font-bold"
                    required
                  />
                  <p className="text-xs text-[#4A4A4A] font-medium mt-1">Fee charged on transactions (0-100%)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-2">GST (%) *</label>
                  <Input
                    type="number"
                    name="gst_percentage"
                    value={formData.gst_percentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="border-2 border-[#0A0A0A] font-bold"
                    required
                  />
                  <p className="text-xs text-[#4A4A4A] font-medium mt-1">GST on platform fee (0-100%)</p>
                </div>
              </div>
            </div>

            {/* Business Subscription */}
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
              <h3 className="text-xl font-black mb-6">Business Subscription</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Monthly (₹) *</label>
                  <Input
                    type="number"
                    name="business_subscription_monthly"
                    value={formData.business_subscription_monthly}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="border-2 border-[#0A0A0A] font-bold"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-2">Yearly (₹) *</label>
                  <Input
                    type="number"
                    name="business_subscription_yearly"
                    value={formData.business_subscription_yearly}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="border-2 border-[#0A0A0A] font-bold"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-2">Free Tier Limit *</label>
                  <Input
                    type="number"
                    name="monthly_creator_limit"
                    value={formData.monthly_creator_limit}
                    onChange={handleChange}
                    min="0"
                    className="border-2 border-[#0A0A0A] font-bold"
                    required
                  />
                  <p className="text-xs text-[#4A4A4A] font-medium mt-1">Creators per month</p>
                </div>
              </div>
            </div>

            {/* Creator Premium */}
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
              <h3 className="text-xl font-black mb-6">Creator Premium</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Monthly (₹) *</label>
                  <Input
                    type="number"
                    name="creator_premium_monthly"
                    value={formData.creator_premium_monthly}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="border-2 border-[#0A0A0A] font-bold"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-2">Yearly (₹) *</label>
                  <Input
                    type="number"
                    name="creator_premium_yearly"
                    value={formData.creator_premium_yearly}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="border-2 border-[#0A0A0A] font-bold"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" strokeWidth={3} />
                <div className="text-sm font-medium">
                  <p className="font-bold mb-1">Warning</p>
                  <p className="text-[#4A4A4A]">
                    Changes will affect all new subscriptions and transactions immediately. 
                    Existing active subscriptions will not be affected until renewal.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError(null);
                  fetchConfig();
                }}
                className="bg-white border-2 border-[#0A0A0A] font-bold"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-[#0A0A0A] shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4">
              <h2 className="text-2xl font-black">Configuration History</h2>
              <button onClick={() => setShowHistory(false)}>
                <X className="w-6 h-6" strokeWidth={3} />
              </button>
            </div>
            
            {history.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 mx-auto mb-2 text-[#4A4A4A]" strokeWidth={2} />
                <p className="text-[#4A4A4A] font-medium">No configuration changes yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry, index) => (
                  <div
                    key={index}
                    className="border-2 border-[#0A0A0A] rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-black">{entry.changed_by_email}</p>
                        <p className="text-xs text-[#4A4A4A] font-medium">
                          {formatDate(entry.changed_at)}
                        </p>
                      </div>
                    </div>
                    
                    {Object.keys(entry.changes || {}).length > 0 && (
                      <div className="mt-3 space-y-2">
                        {Object.entries(entry.changes).map(([key, change]) => (
                          <div key={key} className="text-sm">
                            <span className="font-bold capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="text-red-600 ml-2">{change.old}</span>
                            <span className="mx-2">→</span>
                            <span className="text-green-600">{change.new}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeeConfiguration;
