import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, ArrowLeft, Calendar, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import EmptyState from '../components/EmptyState';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CreatorInvoicesPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/invoices`, {
        withCredentials: true
      });
      setInvoices(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      setLoading(false);
    }
  };

  const handleDownload = async (projectId, invoiceId) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/invoices/${projectId}`,
        { withCredentials: true }
      );
      
      // Create downloadable invoice content
      const invoiceData = response.data;
      const content = `
INVOICE
${invoiceData.invoice_number}

Date: ${new Date(invoiceData.invoice_date).toLocaleDateString()}

FROM:
${invoiceData.from.name}
${invoiceData.from.email}
${invoiceData.from.address}

TO:
${invoiceData.to.name}
${invoiceData.to.email}

PROJECT: ${invoiceData.project.title}
${invoiceData.project.description}

AMOUNT BREAKDOWN:
Base Amount: ₹${invoiceData.amounts.base_amount.toFixed(2)}
Platform Fee: ₹${invoiceData.amounts.platform_fee.toFixed(2)}
GST (18%): ₹${invoiceData.amounts.gst.toFixed(2)}
-----------------------------------
Creator Receives: ₹${invoiceData.amounts.creator_receives.toFixed(2)}
Business Pays: ₹${invoiceData.amounts.total_payable.toFixed(2)}

Status: ${invoiceData.status.toUpperCase()}

Thank you for your business!
`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceId}.txt`;
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

  const filteredInvoices = invoices.filter(inv => 
    inv.project_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.invoice_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] has-bottom-nav">
      <nav className="sticky top-0 z-50 bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/creator-dashboard')}
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={3} />
            </Button>
            <h1 className="text-3xl font-black tracking-tight">My Invoices</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-2 border-[#0A0A0A] max-w-md"
          />
        </div>

        {/* Invoices List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-16 h-16 border-4 border-[#0A0A0A] border-t-[#C6A2FF] rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-bold">Loading invoices...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Invoices Found"
            description="Complete projects to generate invoices"
          />
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
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
                      </div>
                      <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] px-4 py-2 rounded-full">
                        <p className="font-black text-sm uppercase">{invoice.status}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Date</p>
                        <p className="font-bold flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(invoice.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Base Amount</p>
                        <p className="font-bold">{formatCurrency(invoice.amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Platform Fee</p>
                        <p className="font-bold text-red-600">-{formatCurrency(invoice.platform_fee)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">You Received</p>
                        <p className="text-2xl font-black text-green-600">
                          {formatCurrency(invoice.amount - invoice.platform_fee)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
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
    </div>
  );
};

export default CreatorInvoicesPage;
