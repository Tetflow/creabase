import React, { useState, useEffect } from 'react';
import { Building2, CreditCard, AlertCircle, CheckCircle, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const RefundBankDetailsCard = () => {
  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    branch_name: '',
    account_type: 'savings'
  });

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/business/bank-details`,
        { withCredentials: true }
      );
      
      if (response.data.bank_details) {
        setBankDetails(response.data.bank_details);
        setFormData({
          account_holder_name: response.data.bank_details.account_holder_name || '',
          account_number: response.data.bank_details.account_number_full || '',
          ifsc_code: response.data.bank_details.ifsc_code || '',
          bank_name: response.data.bank_details.bank_name || '',
          branch_name: response.data.bank_details.branch_name || '',
          account_type: response.data.bank_details.account_type || 'savings'
        });
      } else {
        setEditing(true); // No bank details, start in edit mode
      }
    } catch (err) {
      console.error('Failed to fetch bank details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate form
    if (!formData.account_holder_name.trim()) {
      setError('Account holder name is required');
      return;
    }
    
    if (!formData.account_number.trim()) {
      setError('Account number is required');
      return;
    }
    
    if (!formData.ifsc_code.trim()) {
      setError('IFSC code is required');
      return;
    }
    
    if (!formData.bank_name.trim()) {
      setError('Bank name is required');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await axios.post(
        `${BACKEND_URL}/api/business/bank-details`,
        formData,
        { withCredentials: true }
      );
      
      setSuccess(bankDetails ? 'Bank details updated successfully' : 'Bank details saved successfully');
      setEditing(false);
      fetchBankDetails();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save bank details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your bank details?')) {
      return;
    }
    
    try {
      await axios.delete(
        `${BACKEND_URL}/api/business/bank-details`,
        { withCredentials: true }
      );
      
      setSuccess('Bank details deleted successfully');
      setBankDetails(null);
      setEditing(true);
      setFormData({
        account_holder_name: '',
        account_number: '',
        ifsc_code: '',
        bank_name: '',
        branch_name: '',
        account_type: 'savings'
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete bank details');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A0A0A]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black mb-2">Refund Bank Details</h2>
        <p className="text-sm text-[#4A4A4A] font-medium">
          Add your bank account details to receive refunds
        </p>
      </div>

      {error && (
        <Alert className="bg-[#FF9B9B] border-2 border-[#0A0A0A]">
          <AlertCircle className="h-4 w-4" strokeWidth={3} />
          <AlertDescription className="font-bold">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-[#B4F8C8] border-2 border-[#0A0A0A]">
          <CheckCircle className="h-4 w-4" strokeWidth={3} />
          <AlertDescription className="font-bold">{success}</AlertDescription>
        </Alert>
      )}

      {!editing && bankDetails ? (
        // View Mode
        <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-lg p-3">
              <Building2 className="w-6 h-6" strokeWidth={3} />
            </div>
            <h3 className="text-xl font-black">Saved Bank Account</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#4A4A4A] font-medium mb-1">Account Holder Name</p>
                <p className="text-lg font-black">{bankDetails.account_holder_name}</p>
              </div>

              <div>
                <p className="text-sm text-[#4A4A4A] font-medium mb-1">Account Type</p>
                <p className="text-lg font-black capitalize">{bankDetails.account_type}</p>
              </div>

              <div>
                <p className="text-sm text-[#4A4A4A] font-medium mb-1">Account Number</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-black">
                    {showAccountNumber ? formData.account_number : bankDetails.account_number}
                  </p>
                  <button
                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                    className="text-[#4A4A4A] hover:text-[#0A0A0A]"
                  >
                    {showAccountNumber ? (
                      <EyeOff className="w-4 h-4" strokeWidth={3} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={3} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-[#4A4A4A] font-medium mb-1">IFSC Code</p>
                <p className="text-lg font-black">{bankDetails.ifsc_code}</p>
              </div>

              <div>
                <p className="text-sm text-[#4A4A4A] font-medium mb-1">Bank Name</p>
                <p className="text-lg font-black">{bankDetails.bank_name}</p>
              </div>

              {bankDetails.branch_name && (
                <div>
                  <p className="text-sm text-[#4A4A4A] font-medium mb-1">Branch Name</p>
                  <p className="text-lg font-black">{bankDetails.branch_name}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setEditing(true)}
                className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
              >
                Edit Details
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-[#FF9B9B] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
              >
                <Trash2 className="w-4 h-4 mr-2" strokeWidth={3} />
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Edit Mode
        <form onSubmit={handleSubmit} className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg p-3">
              <CreditCard className="w-6 h-6" strokeWidth={3} />
            </div>
            <h3 className="text-xl font-black">
              {bankDetails ? 'Update Bank Details' : 'Add Bank Details'}
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Account Holder Name *</label>
              <Input
                type="text"
                name="account_holder_name"
                value={formData.account_holder_name}
                onChange={handleChange}
                placeholder="John Doe"
                className="border-2 border-[#0A0A0A] font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Account Type *</label>
              <Select
                value={formData.account_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, account_type: value }))}
              >
                <SelectTrigger className="border-2 border-[#0A0A0A] font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings Account</SelectItem>
                  <SelectItem value="current">Current Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Account Number *</label>
              <Input
                type="text"
                name="account_number"
                value={formData.account_number}
                onChange={handleChange}
                placeholder="123456789012"
                className="border-2 border-[#0A0A0A] font-bold"
                required
              />
              <p className="text-xs text-[#4A4A4A] font-medium mt-1">
                9-18 digit account number
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">IFSC Code *</label>
              <Input
                type="text"
                name="ifsc_code"
                value={formData.ifsc_code}
                onChange={handleChange}
                placeholder="SBIN0001234"
                className="border-2 border-[#0A0A0A] font-bold uppercase"
                maxLength={11}
                required
              />
              <p className="text-xs text-[#4A4A4A] font-medium mt-1">
                11-character IFSC code (e.g., SBIN0001234)
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Bank Name *</label>
              <Input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                placeholder="State Bank of India"
                className="border-2 border-[#0A0A0A] font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Branch Name (Optional)</label>
              <Input
                type="text"
                name="branch_name"
                value={formData.branch_name}
                onChange={handleChange}
                placeholder="Mumbai Main Branch"
                className="border-2 border-[#0A0A0A] font-bold"
              />
            </div>

            <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" strokeWidth={3} />
                <div className="text-sm font-medium">
                  <p className="font-bold mb-1">Security Note</p>
                  <p className="text-[#4A4A4A]">
                    Your bank details are stored securely and will only be used for processing refunds. 
                    We never share your banking information with third parties.
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
                {submitting ? 'Saving...' : 'Save Bank Details'}
              </Button>
              {bankDetails && (
                <Button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setError(null);
                  }}
                  className="bg-white border-2 border-[#0A0A0A] font-bold"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default RefundBankDetailsCard;
