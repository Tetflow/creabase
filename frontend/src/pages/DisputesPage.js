import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  ArrowLeft, 
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import EmptyState from '../components/EmptyState';
import { ListSkeleton } from '../components/Skeletons';
import BottomNav from '../components/BottomNav';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DisputesPage = () => {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    fetchUserRole();
    fetchDisputes();
  }, []);

  const fetchUserRole = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true
      });
      setUserRole(response.data.role);
    } catch (error) {
      console.error('Failed to fetch user role:', error);
    }
  };

  const fetchDisputes = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/disputes`, {
        withCredentials: true
      });
      setDisputes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
      setLoading(false);
    }
  };

  const viewDetails = async (dispute) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/disputes/${dispute.dispute_id}`, {
        withCredentials: true
      });
      setSelectedDispute(response.data);
      setShowDetails(true);
    } catch (error) {
      alert('Failed to load dispute details');
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
      under_review: FileText,
      resolved: CheckCircle
    };
    return icons[status] || AlertTriangle;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] has-bottom-nav">
        <nav className="sticky top-0 z-50 bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-6 py-4">
          <h1 className="text-3xl font-black">Disputes</h1>
        </nav>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <ListSkeleton count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] has-bottom-nav">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate(userRole === 'admin' ? '/admin' : userRole === 'creator' ? '/creator-dashboard' : '/dashboard')}
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all p-3"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={3} />
            </Button>
            <AlertTriangle className="w-8 h-8" strokeWidth={3} />
            <h1 className="text-3xl font-black tracking-tight">Disputes</h1>
          </div>
          <div className="hidden md:block">
            <Button
              onClick={handleLogout}
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
            >
              <LogOut className="w-4 h-4" strokeWidth={3} />
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {disputes.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No Disputes"
            description="You don't have any disputes. This is a good thing!"
            action={{
              label: 'Go Back',
              onClick: () => navigate(userRole === 'admin' ? '/admin' : userRole === 'creator' ? '/creator-dashboard' : '/dashboard')
            }}
          />
        ) : (
          <div className="space-y-6">
            {disputes.map((dispute) => {
              const StatusIcon = getStatusIcon(dispute.status);
              
              return (
                <div
                  key={dispute.dispute_id}
                  className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 rounded-xl p-6 cursor-pointer transition-all"
                  onClick={() => viewDetails(dispute)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-black mb-2">{dispute.project_title || dispute.project_details?.title || 'Project Dispute'}</h3>
                      <p className="text-[#4A4A4A] font-medium mb-3">
                        <span className="font-bold">Reason:</span> {dispute.reason}
                      </p>
                      <p className="text-sm font-medium text-[#4A4A4A]">
                        Filed by: <span className="font-bold">{dispute.raised_by_name}</span> against <span className="font-bold">{dispute.raised_against_name}</span>
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(dispute.status)} border-2 border-[#0A0A0A] px-4 py-2 font-black text-sm uppercase flex items-center gap-2`}>
                      <StatusIcon className="w-4 h-4" strokeWidth={3} />
                      {dispute.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t-2 border-[#0A0A0A]">
                    <p className="text-sm font-bold text-[#4A4A4A]">
                      Filed: {formatDate(dispute.created_at)}
                    </p>
                    {dispute.resolved_at && (
                      <p className="text-sm font-bold text-green-600">
                        Resolved: {formatDate(dispute.resolved_at)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dispute Details Modal */}
      {selectedDispute && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black">Dispute Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              {/* Status Badge */}
              <div className="flex justify-between items-center">
                <Badge className={`${getStatusColor(selectedDispute.status)} border-2 border-[#0A0A0A] px-4 py-2 font-black text-lg`}>
                  {selectedDispute.status.replace('_', ' ').toUpperCase()}
                </Badge>
                {selectedDispute.resolved_at && (
                  <p className="text-sm font-bold text-green-600">
                    Resolved on: {formatDate(selectedDispute.resolved_at)}
                  </p>
                )}
              </div>

              {/* Project Info */}
              <div className="bg-[#F0F0F0] border-2 border-[#0A0A0A] rounded-lg p-4">
                <p className="font-bold text-sm text-[#4A4A4A] mb-2">PROJECT</p>
                <p className="text-xl font-black">{selectedDispute.project?.title}</p>
                <p className="font-medium">Budget: ₹{selectedDispute.project?.budget}</p>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg p-4">
                  <p className="font-bold text-sm mb-2">FILED BY</p>
                  <p className="font-black">{selectedDispute.raised_by_user?.name || selectedDispute.raised_by_user?.email}</p>
                  <p className="text-sm font-medium text-[#4A4A4A] uppercase">{selectedDispute.raised_by_role}</p>
                </div>
                <div className="bg-[#C6A2FF] border-2 border-[#0A0A0A] rounded-lg p-4">
                  <p className="font-bold text-sm mb-2">AGAINST</p>
                  <p className="font-black">{selectedDispute.raised_against_user?.name || selectedDispute.raised_against_user?.email}</p>
                </div>
              </div>

              {/* Reason & Description */}
              <div>
                <p className="font-bold text-sm text-[#4A4A4A] mb-2">REASON</p>
                <p className="font-black text-lg mb-4">{selectedDispute.reason}</p>
                
                <p className="font-bold text-sm text-[#4A4A4A] mb-2">DESCRIPTION</p>
                <p className="font-medium">{selectedDispute.description}</p>
              </div>

              {/* Evidence */}
              {selectedDispute.evidence_urls && selectedDispute.evidence_urls.length > 0 && (
                <div>
                  <p className="font-bold text-sm text-[#4A4A4A] mb-2">EVIDENCE</p>
                  <div className="space-y-2">
                    {selectedDispute.evidence_urls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-lg p-3 font-medium text-blue-600 underline hover:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] transition-all"
                      >
                        Evidence {index + 1}: {url}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution */}
              {selectedDispute.resolution && (
                <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-lg p-4">
                  <p className="font-bold text-sm text-[#4A4A4A] mb-2">RESOLUTION</p>
                  <p className="font-black text-lg mb-2 uppercase">{selectedDispute.resolution.replace('_', ' ')}</p>
                  {selectedDispute.resolution_notes && (
                    <p className="font-medium">{selectedDispute.resolution_notes}</p>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default DisputesPage;
