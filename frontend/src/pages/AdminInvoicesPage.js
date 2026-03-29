import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Download, ArrowLeft, Search, Edit, Settings,
  DollarSign, Calendar, Users, Shield
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import EmptyState from '../components/EmptyState';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminInvoicesPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [editData, setEditData] = useState({
    platform_fee_override: '',
    notes: ''
  });
  const [taxSettings, setTaxSettings] = useState(null);

  useEffect(() => {
    fetchInvoices();
    fetchTaxSettings();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/invoices?search=${searchQuery}`, {
        withCredentials: true
      });
      setInvoices(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      setLoading(false);
    }
  };

  const fetchTaxSettings = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/tax-settings`, {
        withCredentials: true
      });
      setTaxSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch tax settings:', error);
    }
  };

  const handleEditInvoice = async () => {
    try {
      await axios.patch(
        `${BACKEND_URL}/api/admin/invoices/${selectedInvoice.project_id}`,
        editData,
        { withCredentials: true }
      );
      alert('Invoice updated successfully!');
      setShowEditModal(false);
      fetchInvoices();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to update invoice');
    }
  };

  const handleUpdateTaxSettings = async () => {
    try {
      await axios.patch(
        `${BACKEND_URL}/api/admin/tax-settings`,
        taxSettings,
        { withCredentials: true }
      );
      alert('Tax settings updated successfully!');
      setShowTaxModal(false);
    } catch (error) {
      alert('Failed to update tax settings');
    }
  };

  const handleDownload = async (projectId, invoiceId) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/invoices/${projectId}`,
        { withCredentials: true }
      );
      
      const invoiceData = response.data;
      const content = `
CREABASE - INVOICE
${invoiceData.invoice_number}
Date: ${new Date(invoiceData.invoice_date).toLocaleDateString()}

FROM (Creator):
${invoiceData.from.name}
${invoiceData.from.email}
${invoiceData.from.address}

TO (Business):
${invoiceData.to.name}
${invoiceData.to.email}

PROJECT: ${invoiceData.project.title}
${invoiceData.project.description}

PAYMENT BREAKDOWN:
Base Project Amount: ₹${invoiceData.amounts.base_amount.toFixed(2)}
Platform Fee (10%): ₹${invoiceData.amounts.platform_fee.toFixed(2)}
GST on Fee (18%): ₹${invoiceData.amounts.gst.toFixed(2)}
-----------------------------------
Creator Receives: ₹${invoiceData.amounts.creator_receives.toFixed(2)}
Business Pays: ₹${invoiceData.amounts.total_payable.toFixed(2)}

Status: ${invoiceData.status.toUpperCase()}
Payment Status: PAID

Thank you for using Creabase!
`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceId}_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
    } catch (error) {
      alert('Failed to download invoice');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const stats = {
    total: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
    totalPlatformFee: invoices.reduce((sum, inv) => sum + (inv.platform_fee || 0), 0),
    totalGST: invoices.reduce((sum, inv) => sum + (inv.gst || 0), 0)
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
              <h1 className="text-3xl font-black tracking-tight">Invoice Management</h1>
            </div>
          </div>
          <Button
            onClick={() => setShowTaxModal(true)}
            className="bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
          >
            <Settings className="w-4 h-4 mr-2" strokeWidth={3} />
            Tax Settings
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
            <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-2">Total Invoices</p>
            <p className="text-3xl font-black">{stats.total}</p>
          </div>
          <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
            <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-2">Total Revenue</p>
            <p className="text-2xl font-black">{formatCurrency(stats.totalAmount)}</p>
          </div>
          <div className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
            <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-2">Platform Fees</p>
            <p className="text-2xl font-black">{formatCurrency(stats.totalPlatformFee)}</p>
          </div>
          <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
            <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-2">GST Collected</p>
            <p className="text-2xl font-black">{formatCurrency(stats.totalGST)}</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4A4A]" strokeWidth={3} />
            <Input
              placeholder="Search invoices, businesses, creators..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                fetchInvoices();
              }}
              className="border-2 border-[#0A0A0A] pl-10"
            />
          </div>
        </div>

        {/* Invoices List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-16 h-16 border-4 border-[#0A0A0A] border-t-[#C6A2FF] rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-bold">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Invoices Found"
            description="Invoices will appear here once projects are completed"
          />
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.invoice_id}
                className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-black mb-2">{invoice.project_title}</h3>
                        <p className="text-sm font-bold text-[#4A4A4A]">Invoice: {invoice.invoice_id}</p>
                        <div className="flex gap-4 mt-2">
                          <p className="text-sm font-bold">
                            <span className="text-[#4A4A4A]">Business:</span> {invoice.business_name}
                          </p>
                          <p className="text-sm font-bold">
                            <span className="text-[#4A4A4A]">Creator:</span> {invoice.creator_name}
                          </p>
                        </div>
                      </div>
                      <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] px-4 py-2 rounded-full">
                        <p className="font-black text-sm uppercase">{invoice.status}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Date</p>
                        <p className="font-bold">{new Date(invoice.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Base Amount</p>
                        <p className="font-bold">{formatCurrency(invoice.amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Platform Fee</p>
                        <p className="font-bold text-green-600">{formatCurrency(invoice.platform_fee)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">GST (18%)</p>
                        <p className="font-bold text-green-600">{formatCurrency(invoice.gst)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Total</p>
                        <p className="text-xl font-black">{formatCurrency(invoice.total_amount)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setEditData({
                          platform_fee_override: invoice.platform_fee.toString(),
                          notes: ''
                        });
                        setShowEditModal(true);
                      }}
                      className="bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                    >
                      <Edit className="w-4 h-4 mr-2" strokeWidth={3} />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDownload(invoice.project_id, invoice.invoice_id)}
                      className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                    >
                      <Download className="w-4 h-4 mr-2" strokeWidth={3} />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Invoice Modal */}
      {selectedInvoice && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Edit Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg p-4">
                <p className="font-bold mb-2">Invoice: {selectedInvoice.invoice_id}</p>
                <p className="text-sm"><span className="font-bold">Project:</span> {selectedInvoice.project_title}</p>
                <p className="text-sm"><span className="font-bold">Original Platform Fee:</span> {formatCurrency(selectedInvoice.platform_fee)}</p>
              </div>

              <div>
                <label className="block font-bold mb-2">Override Platform Fee (₹)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editData.platform_fee_override}
                  onChange={(e) => setEditData({...editData, platform_fee_override: e.target.value})}
                  className="border-2 border-[#0A0A0A]"
                />
                <p className="text-sm text-[#4A4A4A] mt-1">GST will be recalculated automatically (18% of platform fee)</p>
              </div>

              <div>
                <label className="block font-bold mb-2">Admin Notes</label>
                <Textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({...editData, notes: e.target.value})}
                  placeholder="Add notes about this invoice modification..."
                  className="border-2 border-[#0A0A0A] min-h-24"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleEditInvoice}
                  className="flex-1 bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => setShowEditModal(false)}
                  className="bg-white border-2 border-[#0A0A0A] font-bold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Tax Settings Modal */}
      {taxSettings && (
        <Dialog open={showTaxModal} onOpenChange={setShowTaxModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Tax Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">GST Rate (%)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(taxSettings.gst_rate * 100).toFixed(2)}
                    onChange={(e) => setTaxSettings({...taxSettings, gst_rate: parseFloat(e.target.value) / 100})}
                    className="border-2 border-[#0A0A0A]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">Platform Fee Rate (%)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(taxSettings.platform_fee_rate * 100).toFixed(2)}
                    onChange={(e) => setTaxSettings({...taxSettings, platform_fee_rate: parseFloat(e.target.value) / 100})}
                    className="border-2 border-[#0A0A0A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-2">Tax ID / GSTIN</label>
                <Input
                  value={taxSettings.tax_id}
                  onChange={(e) => setTaxSettings({...taxSettings, tax_id: e.target.value})}
                  placeholder="GSTIN1234567890"
                  className="border-2 border-[#0A0A0A]"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Company Name</label>
                <Input
                  value={taxSettings.company_name}
                  onChange={(e) => setTaxSettings({...taxSettings, company_name: e.target.value})}
                  className="border-2 border-[#0A0A0A]"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Company Address</label>
                <Textarea
                  value={taxSettings.company_address}
                  onChange={(e) => setTaxSettings({...taxSettings, company_address: e.target.value})}
                  className="border-2 border-[#0A0A0A] min-h-24"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleUpdateTaxSettings}
                  className="flex-1 bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                >
                  Save Tax Settings
                </Button>
                <Button
                  onClick={() => setShowTaxModal(false)}
                  className="bg-white border-2 border-[#0A0A0A] font-bold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminInvoicesPage;
