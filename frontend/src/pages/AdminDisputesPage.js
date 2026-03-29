import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  ArrowLeft, 
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Users,
  DollarSign,
  Shield
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import EmptyState from '../components/EmptyState';
import { ListSkeleton } from '../components/Skeletons';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminDisputesPage = () => {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionType, setResolutionType] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, under_review, resolved

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/disputes`, {
        withCredentials: true
      });
      setDisputes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
      setLoading(false);
    }
  };

  const handleResolveDispute = async () => {
    if (!resolutionType) {
      alert('Please select a resolution type');
      return;
    }

    setProcessing(true);
    try {
      await axios.patch(
        `${BACKEND_URL}/api/admin/disputes/${selectedDispute.dispute_id}/resolve`,
        {
          resolution: resolutionType,
          admin_notes: resolutionNotes
        },
        { withCredentials: true }
      );
      
      alert('Dispute resolved successfully!');
      setShowResolveModal(false);
      setSelectedDispute(null);
      setResolutionType('');
      setResolutionNotes('');
      fetchDisputes();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to resolve dispute');
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-[#FFE57F]',
      under_review: 'bg-[#C6A2FF]',
      resolved: 'bg-[#B4F8C8]'
    };
    return colors[status] || 'bg-white';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      under_review: AlertTriangle,
      resolved: CheckCircle
    };
    const Icon = icons[status] || AlertTriangle;
    return <Icon className="w-4 h-4" strokeWidth={3} />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const filteredDisputes = filter === 'all' 
    ? disputes 
    : disputes.filter(d => d.status === filter);

  const pendingCount = disputes.filter(d => d.status === 'pending').length;
  const underReviewCount = disputes.filter(d => d.status === 'under_review').length;

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
              <h1 className="text-3xl font-black tracking-tight">Dispute Management</h1>
            </div>
          </div>
          <Button onClick={handleLogout} className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold">
            <LogOut className="w-4 h-4" strokeWidth={3} />
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
            <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-2">Total Disputes</p>
            <p className="text-3xl font-black">{disputes.length}</p>
          </div>
          <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
            <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-2">Pending</p>
            <p className="text-3xl font-black">{pendingCount}</p>
          </div>
          <div className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
            <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-2">Under Review</p>
            <p className="text-3xl font-black">{underReviewCount}</p>
          </div>
          <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
            <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-2">Resolved</p>
            <p className="text-3xl font-black">{disputes.filter(d => d.status === 'resolved').length}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <Button
            onClick={() => setFilter('all')}
            className={`${filter === 'all' ? 'bg-[#0A0A0A] text-white' : 'bg-white'} border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold`}
          >
            All ({disputes.length})
          </Button>
          <Button
            onClick={() => setFilter('pending')}
            className={`${filter === 'pending' ? 'bg-[#FFE57F]' : 'bg-white'} border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold`}
          >
            Pending ({pendingCount})
          </Button>
          <Button
            onClick={() => setFilter('under_review')}
            className={`${filter === 'under_review' ? 'bg-[#C6A2FF]' : 'bg-white'} border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold`}
          >
            Under Review ({underReviewCount})
          </Button>
          <Button
            onClick={() => setFilter('resolved')}
            className={`${filter === 'resolved' ? 'bg-[#B4F8C8]' : 'bg-white'} border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold`}
          >
            Resolved ({disputes.filter(d => d.status === 'resolved').length})
          </Button>
        </div>

        {/* Disputes List */}
        {loading ? (
          <ListSkeleton count={3} />
        ) : filteredDisputes.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No Disputes"
            description={filter === 'all' ? "No disputes have been raised yet" : `No ${filter} disputes`}
          />
        ) : (
          <div className="space-y-6">
            {filteredDisputes.map((dispute) => {
              const statusColor = getStatusColor(dispute.status);
              
              return (
                <div
                  key={dispute.dispute_id}
                  className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl overflow-hidden"
                >
                  {/* Header */}
                  <div className={`${statusColor} border-b-2 border-[#0A0A0A] p-6`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-2xl font-black mb-2">
                          Dispute #{dispute.dispute_id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="font-medium text-[#4A4A4A]">
                          Project: <span className="font-bold">{dispute.project_title || dispute.project_id}</span>
                        </p>
                        <p className="text-sm font-medium text-[#4A4A4A] mt-1">
                          Raised by: <span className="font-bold capitalize">{dispute.raised_by}</span>
                        </p>
                      </div>
                      <Badge className={`${statusColor} border-2 border-[#0A0A0A] px-4 py-2 font-black text-sm uppercase`}>
                        {getStatusIcon(dispute.status)}
                        <span className="ml-2">{dispute.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="font-bold text-sm text-[#4A4A4A] mb-2">Reason</p>
                        <p className="font-bold text-lg">{dispute.reason}</p>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#4A4A4A] mb-2">Raised On</p>
                        <p className="font-bold text-lg">{formatDate(dispute.raised_at)}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="font-bold text-sm text-[#4A4A4A] mb-2">Description</p>
                      <p className="font-medium">{dispute.description || 'No description provided'}</p>
                    </div>

                    {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
                      <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg p-4 mb-6">
                        <p className="font-bold mb-2">📎 Evidence</p>
                        <ul className="space-y-2">
                          {dispute.evidence_urls.map((url, idx) => (
                            <li key={idx}>
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 underline font-medium break-all hover:text-blue-800"
                              >
                                {url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {dispute.status === 'resolved' && dispute.resolution && (
                      <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-lg p-4 mb-6">
                        <p className="font-bold mb-2">✅ Resolution</p>
                        <p className="font-bold text-sm text-[#4A4A4A]">Outcome: <span className="text-[#0A0A0A] capitalize">{dispute.resolution.replace('_', ' ')}</span></p>
                        {dispute.admin_notes && (
                          <p className="mt-2 text-sm font-medium">
                            <span className="font-bold">Admin Notes:</span> {dispute.admin_notes}
                          </p>
                        )}
                        <p className="text-xs text-[#4A4A4A] mt-2">
                          Resolved: {formatDate(dispute.resolved_at)}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {dispute.status !== 'resolved' && (
                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            setSelectedDispute(dispute);
                            setShowResolveModal(true);
                          }}
                          className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Resolve Dispute
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolve Dispute Modal */}
      {selectedDispute && (
        <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Resolve Dispute</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg p-4">
                <p className="font-bold mb-2">Dispute Details</p>
                <p className="text-sm"><span className="font-bold">Project:</span> {selectedDispute.project_title}</p>
                <p className="text-sm"><span className="font-bold">Raised by:</span> {selectedDispute.raised_by}</p>
                <p className="text-sm"><span className="font-bold">Reason:</span> {selectedDispute.reason}</p>
              </div>

              <div>
                <p className="font-bold mb-3">Select Resolution</p>
                <div className="space-y-3">
                  <button
                    onClick={() => setResolutionType('favor_creator')}
                    className={`w-full text-left p-4 border-2 border-[#0A0A0A] rounded-lg font-bold transition-all ${
                      resolutionType === 'favor_creator' ? 'bg-[#B4F8C8]' : 'bg-white hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <p className="font-black">✓ Favor Creator</p>
                    <p className="text-sm text-[#4A4A4A] font-medium">Refund business, release payment to creator</p>
                  </button>

                  <button
                    onClick={() => setResolutionType('favor_business')}
                    className={`w-full text-left p-4 border-2 border-[#0A0A0A] rounded-lg font-bold transition-all ${
                      resolutionType === 'favor_business' ? 'bg-[#B4F8C8]' : 'bg-white hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <p className="font-black">✓ Favor Business</p>
                    <p className="text-sm text-[#4A4A4A] font-medium">Full refund to business from escrow</p>
                  </button>

                  <button
                    onClick={() => setResolutionType('partial')}
                    className={`w-full text-left p-4 border-2 border-[#0A0A0A] rounded-lg font-bold transition-all ${
                      resolutionType === 'partial' ? 'bg-[#B4F8C8]' : 'bg-white hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <p className="font-black">✓ Partial Resolution</p>
                    <p className="text-sm text-[#4A4A4A] font-medium">Split payment between both parties</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-2">Admin Notes (Optional)</label>
                <Textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Add any notes about the resolution..."
                  className="border-2 border-[#0A0A0A] min-h-24"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleResolveDispute}
                  disabled={!resolutionType || processing}
                  className="flex-1 bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : 'Confirm Resolution'}
                </Button>
                <Button
                  onClick={() => {
                    setShowResolveModal(false);
                    setSelectedDispute(null);
                    setResolutionType('');
                    setResolutionNotes('');
                  }}
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

export default AdminDisputesPage;
