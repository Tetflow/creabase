import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, ArrowLeft, Printer, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { PageLoadingSkeleton } from '../components/Skeletons';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const InvoicePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoice();
  }, [projectId]);

  const fetchInvoice = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/invoices/${projectId}`, {
        withCredentials: true
      });
      setInvoice(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
      setError(error.response?.data?.detail || 'Failed to load invoice');
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="max-w-4xl mx-auto">
          <PageLoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-[#4A4A4A]" />
          <h2 className="text-2xl font-black mb-2">Invoice Not Found</h2>
          <p className="text-[#4A4A4A] font-medium mb-6">{error}</p>
          <Button onClick={() => navigate(-1)} className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Action Bar - Hidden when printing */}
      <div className="print:hidden sticky top-0 z-50 bg-white border-b-2 border-[#0A0A0A] px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button
            onClick={() => navigate(-1)}
            className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={handlePrint}
              className="bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto p-6 md:p-12">
        <div className="bg-white border-2 border-[#0A0A0A] shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8 md:p-12">
          {/* Header */}
          <div className="flex justify-between items-start mb-12 pb-8 border-b-2 border-[#0A0A0A]">
            <div>
              <h1 className="text-5xl font-black mb-2">INVOICE</h1>
              <p className="text-lg font-bold text-[#4A4A4A]">{invoice.invoice_number}</p>
            </div>
            <div className="text-right">
              <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg px-6 py-3 mb-3">
                <p className="text-sm font-bold text-[#4A4A4A]">Platform</p>
                <p className="text-2xl font-black">{invoice.platform.name}</p>
              </div>
              {invoice.status === 'paid' && (
                <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-lg px-4 py-2 flex items-center gap-2 justify-center">
                  <CheckCircle className="w-5 h-5" strokeWidth={3} />
                  <span className="font-black">PAID</span>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div>
              <p className="text-sm font-bold text-[#4A4A4A] mb-2">INVOICE DATE</p>
              <p className="text-lg font-black">{formatDate(invoice.invoice_date)}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-[#4A4A4A] mb-2">DUE DATE</p>
              <p className="text-lg font-black">{formatDate(invoice.due_date)}</p>
            </div>
          </div>

          {/* From & To */}
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-lg p-6">
              <p className="text-sm font-bold text-[#4A4A4A] mb-4">FROM (SERVICE PROVIDER)</p>
              <p className="text-xl font-black mb-2">{invoice.from.name}</p>
              <p className="font-medium">{invoice.from.email}</p>
              <p className="font-medium">{invoice.from.phone}</p>
              <p className="font-medium text-sm mt-2">{invoice.from.address}</p>
            </div>
            <div className="bg-[#C6A2FF] border-2 border-[#0A0A0A] rounded-lg p-6">
              <p className="text-sm font-bold text-[#4A4A4A] mb-4">TO (CLIENT)</p>
              <p className="text-xl font-black mb-2">{invoice.to.name}</p>
              <p className="font-medium">{invoice.to.email}</p>
              <p className="font-medium">{invoice.to.phone}</p>
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg p-6 mb-8">
            <p className="text-sm font-bold text-[#4A4A4A] mb-2">PROJECT</p>
            <p className="text-2xl font-black mb-3">{invoice.project.title}</p>
            <p className="font-medium mb-4">{invoice.project.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-bold text-[#4A4A4A]">Started:</span>
                <span className="ml-2 font-medium">{formatDate(invoice.project.created_date)}</span>
              </div>
              <div>
                <span className="font-bold text-[#4A4A4A]">Completed:</span>
                <span className="ml-2 font-medium">{formatDate(invoice.project.completed_date)}</span>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#0A0A0A]">
                  <th className="text-left py-4 font-black">DESCRIPTION</th>
                  <th className="text-center py-4 font-black">QTY</th>
                  <th className="text-right py-4 font-black">RATE</th>
                  <th className="text-right py-4 font-black">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items.map((item, index) => (
                  <tr key={index} className="border-b border-[#E5E5E5]">
                    <td className="py-4 font-medium">{item.description}</td>
                    <td className="text-center py-4 font-medium">{item.quantity}</td>
                    <td className="text-right py-4 font-medium">{formatCurrency(item.rate)}</td>
                    <td className="text-right py-4 font-bold">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full md:w-1/2 space-y-3">
              <div className="flex justify-between py-2">
                <span className="font-bold">Subtotal:</span>
                <span className="font-black text-lg">{formatCurrency(invoice.subtotal)}</span>
              </div>
              
              {invoice.fees.map((fee, index) => (
                <div key={index} className="flex justify-between py-2 text-sm">
                  <span className="font-medium text-[#4A4A4A]">{fee.description}:</span>
                  <span className="font-bold">{formatCurrency(fee.amount)}</span>
                </div>
              ))}
              
              <div className="border-t-2 border-[#0A0A0A] pt-4 flex justify-between">
                <span className="font-black text-xl">TOTAL:</span>
                <span className="font-black text-3xl">{formatCurrency(invoice.total_amount)}</span>
              </div>
              
              <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-lg p-4 mt-4">
                <div className="flex justify-between">
                  <span className="font-bold">Creator Receives:</span>
                  <span className="font-black text-xl">{formatCurrency(invoice.creator_receives)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mt-12 pt-8 border-t-2 border-[#0A0A0A]">
            <p className="text-sm font-bold text-[#4A4A4A] mb-4">PAYMENT DETAILS</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs font-bold text-[#4A4A4A] mb-1">Method</p>
                <p className="font-bold">{invoice.payment.method}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#4A4A4A] mb-1">Status</p>
                <p className="font-bold text-green-600">{invoice.payment.status}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#4A4A4A] mb-1">Paid Date</p>
                <p className="font-bold">{formatDate(invoice.payment.paid_date)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#4A4A4A] mb-1">Transaction ID</p>
                <p className="font-bold text-xs">{invoice.payment.transaction_id}</p>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-12 pt-8 border-t-2 border-[#0A0A0A]">
            <p className="text-sm font-bold text-[#4A4A4A] mb-4">TERMS & CONDITIONS</p>
            <ul className="space-y-2">
              {invoice.terms.map((term, index) => (
                <li key={index} className="text-sm font-medium text-[#4A4A4A] flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t-2 border-[#0A0A0A] text-center">
            <p className="font-bold mb-2">{invoice.platform.name}</p>
            <p className="text-sm font-medium text-[#4A4A4A]">
              {invoice.platform.website} • {invoice.platform.support_email}
            </p>
            <p className="text-xs font-medium text-[#4A4A4A] mt-2">
              GSTIN: {invoice.platform.gstin}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
