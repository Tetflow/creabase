import React, { useState, useEffect } from 'react';
import { CreditCard, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const BankDetailsForm = ({ creatorId, onSuccess }) => {
  const [bankDetails, setBankDetails] = useState({
    bank_account_number: '',
    bank_ifsc_code: '',
    bank_account_holder: '',
    bank_name: '',
    upi_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasBankDetails, setHasBankDetails] = useState(false);

  useEffect(() => {
    fetchBankDetails();
  }, [creatorId]);

  const fetchBankDetails = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/creators/${creatorId}/bank-details`,
        { withCredentials: true }
      );
      if (response.data.has_bank_details) {
        setBankDetails({
          bank_account_number: response.data.bank_account_number || '',
          bank_ifsc_code: response.data.bank_ifsc_code || '',
          bank_account_holder: response.data.bank_account_holder || '',
          bank_name: response.data.bank_name || '',
          upi_id: response.data.upi_id || ''
        });
        setHasBankDetails(true);
      }
    } catch (error) {
      console.error('Failed to fetch bank details:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      await axios.patch(
        `${BACKEND_URL}/api/creators/${creatorId}/bank-details`,
        bankDetails,
        { withCredentials: true }
      );
      setSaved(true);
      setHasBankDetails(true);
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      } else {
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      alert('Failed to update bank details: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-full p-3">
          <CreditCard className="w-6 h-6" strokeWidth={3} />
        </div>
        <div>
          <h2 className="text-2xl font-black">Bank Details for Payouts</h2>
          <p className="text-sm text-[#4A4A4A] font-medium">
            Secure payout processing for your earnings
          </p>
        </div>
      </div>

      {hasBankDetails && (
        <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" strokeWidth={3} />
            <p className="font-bold">Bank details saved! You can receive payouts.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-bold mb-2">Account Holder Name *</label>
            <Input
              required
              value={bankDetails.bank_account_holder}
              onChange={(e) => setBankDetails({...bankDetails, bank_account_holder: e.target.value})}
              placeholder="Full name as per bank"
              className="border-2 border-[#0A0A0A] focus:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] focus:-translate-y-1 transition-all"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Bank Name *</label>
            <Input
              required
              value={bankDetails.bank_name}
              onChange={(e) => setBankDetails({...bankDetails, bank_name: e.target.value})}
              placeholder="e.g., HDFC Bank, SBI"
              className="border-2 border-[#0A0A0A] focus:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] focus:-translate-y-1 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-bold mb-2">Account Number *</label>
            <Input
              required
              type="text"
              value={bankDetails.bank_account_number}
              onChange={(e) => setBankDetails({...bankDetails, bank_account_number: e.target.value})}
              placeholder="Enter account number"
              className="border-2 border-[#0A0A0A] focus:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] focus:-translate-y-1 transition-all"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">IFSC Code *</label>
            <Input
              required
              value={bankDetails.bank_ifsc_code}
              onChange={(e) => setBankDetails({...bankDetails, bank_ifsc_code: e.target.value.toUpperCase()})}
              placeholder="e.g., SBIN0001234"
              className="border-2 border-[#0A0A0A] focus:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] focus:-translate-y-1 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold mb-2">UPI ID (Optional)</label>
          <Input
            value={bankDetails.upi_id}
            onChange={(e) => setBankDetails({...bankDetails, upi_id: e.target.value})}
            placeholder="yourname@paytm"
            className="border-2 border-[#0A0A0A] focus:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] focus:-translate-y-1 transition-all"
          />
        </div>

        <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg p-4">
          <p className="font-bold text-sm">
            💰 <strong>Payout Example:</strong> For a ₹1,000 project, you'll receive ₹882 
            (₹1,000 - 10% platform fee - 18% GST on fee)
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold text-lg py-6 transition-all"
        >
          {loading ? 'Saving...' : saved ? '✓ Saved Successfully!' : 'Save Bank Details'}
        </Button>
      </form>
    </div>
  );
};

export default BankDetailsForm;
