import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Send, 
  ArrowLeft, 
  LogOut,
  Upload,
  AlertCircle,
  DollarSign,
  Calendar,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import EmptyState from '../components/EmptyState';
import { ListSkeleton } from '../components/Skeletons';
import BottomNav from '../components/BottomNav';
import DisputeFormModal from '../components/DisputeFormModal';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CreatorProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/projects/incoming`, {
        withCredentials: true
      });
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setLoading(false);
    }
  };

  const handleAccept = async (projectId) => {
    setProcessing(true);
    try {
      await axios.patch(
        `${BACKEND_URL}/api/projects/${projectId}/accept`,
        {},
        { withCredentials: true }
      );
      alert('Project accepted successfully!');
      setShowAcceptModal(false);
      fetchProjects();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to accept project');
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async (projectId) => {
    setProcessing(true);
    try {
      await axios.patch(
        `${BACKEND_URL}/api/projects/${projectId}/decline`,
        null,
        { 
          params: { reason: declineReason },
          withCredentials: true 
        }
      );
      alert('Project declined');
      setShowDeclineModal(false);
      setDeclineReason('');
      fetchProjects();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to decline project');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitDeliverable = async (projectId) => {
    if (!deliverableUrl.trim()) {
      alert('Please provide a deliverable URL');
      return;
    }

    setProcessing(true);
    try {
      await axios.post(
        `${BACKEND_URL}/api/projects/${projectId}/deliverables`,
        null,
        {
          params: {
            deliverable_url: deliverableUrl,
            notes: deliveryNotes
          },
          withCredentials: true
        }
      );
      alert('Deliverables submitted successfully!');
      setShowDeliverModal(false);
      setDeliverableUrl('');
      setDeliveryNotes('');
      fetchProjects();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to submit deliverables');
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

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { color: 'bg-[#FFE57F]', text: 'Pending Acceptance', icon: Clock },
      in_progress: { color: 'bg-[#C6A2FF]', text: 'In Progress', icon: Briefcase },
      active: { color: 'bg-[#B4F8C8]', text: 'Active', icon: CheckCircle },
      delivered: { color: 'bg-[#B4F8C8]', text: 'Delivered', icon: Send },
      completed: { color: 'bg-[#B4F8C8]', text: 'Completed', icon: CheckCircle },
      declined: { color: 'bg-[#FF6B6B]', text: 'Declined', icon: XCircle }
    };
    return statusMap[status] || { color: 'bg-white', text: status, icon: AlertCircle };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] has-bottom-nav">
        <nav className="sticky top-0 z-50 bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-3xl font-black">My Projects</h1>
          </div>
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
              onClick={() => navigate('/creator-dashboard')}
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all p-3"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={3} />
            </Button>
            <Briefcase className="w-8 h-8" strokeWidth={3} />
            <h1 className="text-3xl font-black tracking-tight">My Projects</h1>
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
        <div className="mb-6">
          <h2 className="text-2xl font-black mb-2">Project Requests & Active Work</h2>
          <p className="text-[#4A4A4A] font-medium">Manage your collaborations and deliverables</p>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No Projects Yet"
            description="You haven't received any project requests yet. Keep your profile updated to attract businesses!"
            action={{
              label: 'Go to Dashboard',
              onClick: () => navigate('/creator-dashboard')
            }}
          />
        ) : (
          <div className="space-y-6">
            {projects.map((project) => {
              const statusInfo = getStatusInfo(project.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={project.project_id}
                  className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl overflow-hidden"
                >
                  {/* Header */}
                  <div className={`${statusInfo.color} border-b-2 border-[#0A0A0A] p-6`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-2xl font-black mb-2">{project.title}</h3>
                        <p className="font-medium text-[#4A4A4A]">
                          From: <span className="font-bold">{project.business_name || project.business_email}</span>
                        </p>
                      </div>
                      <Badge className={`${statusInfo.color} border-2 border-[#0A0A0A] px-4 py-2 font-black text-sm`}>
                        <StatusIcon className="w-4 h-4 mr-2" strokeWidth={3} />
                        {statusInfo.text}
                      </Badge>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-5 h-5 text-[#4A4A4A]" strokeWidth={3} />
                          <p className="font-bold text-sm text-[#4A4A4A]">Budget</p>
                        </div>
                        <p className="text-2xl font-black">{formatCurrency(project.budget)}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-5 h-5 text-[#4A4A4A]" strokeWidth={3} />
                          <p className="font-bold text-sm text-[#4A4A4A]">Deadline</p>
                        </div>
                        <p className="text-xl font-bold">{formatDate(project.deadline)}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-[#4A4A4A]" strokeWidth={3} />
                          <p className="font-bold text-sm text-[#4A4A4A]">Created</p>
                        </div>
                        <p className="text-xl font-bold">{formatDate(project.created_at)}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="font-bold text-sm text-[#4A4A4A] mb-2">Description</p>
                      <p className="font-medium">{project.description}</p>
                    </div>

                    {/* Deliverables */}
                    {project.deliverable_url && (
                      <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-lg p-4 mb-6">
                        <p className="font-bold mb-2">Submitted Deliverable</p>
                        <a 
                          href={project.deliverable_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 underline font-medium break-all"
                        >
                          {project.deliverable_url}
                        </a>
                        {project.delivery_notes && (
                          <p className="mt-2 text-sm font-medium text-[#4A4A4A]">
                            Notes: {project.delivery_notes}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 flex-wrap">
                      {project.status === 'pending' && (
                        <>
                          <Dialog open={showAcceptModal && selectedProject?.project_id === project.project_id} onOpenChange={(open) => {
                            setShowAcceptModal(open);
                            if (open) setSelectedProject(project);
                          }}>
                            <DialogTrigger asChild>
                              <Button className="bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Accept Project
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-black">Accept Project?</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p className="font-medium">
                                  You're about to accept <span className="font-bold">{project.title}</span> for {formatCurrency(project.budget)}.
                                </p>
                                <p className="text-sm text-[#4A4A4A]">
                                  Deadline: {formatDate(project.deadline)}
                                </p>
                                <div className="flex gap-3">
                                  <Button
                                    onClick={() => handleAccept(project.project_id)}
                                    disabled={processing}
                                    className="flex-1 bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                                  >
                                    {processing ? 'Processing...' : 'Confirm Accept'}
                                  </Button>
                                  <Button
                                    onClick={() => setShowAcceptModal(false)}
                                    className="bg-white border-2 border-[#0A0A0A] font-bold"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={showDeclineModal && selectedProject?.project_id === project.project_id} onOpenChange={(open) => {
                            setShowDeclineModal(open);
                            if (open) setSelectedProject(project);
                          }}>
                            <DialogTrigger asChild>
                              <Button className="bg-[#FF6B6B] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all">
                                <XCircle className="w-4 h-4 mr-2" />
                                Decline
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-black">Decline Project</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p className="font-medium">Why are you declining this project?</p>
                                <Textarea
                                  value={declineReason}
                                  onChange={(e) => setDeclineReason(e.target.value)}
                                  placeholder="Reason (optional)"
                                  className="border-2 border-[#0A0A0A]"
                                />
                                <div className="flex gap-3">
                                  <Button
                                    onClick={() => handleDecline(project.project_id)}
                                    disabled={processing}
                                    className="flex-1 bg-[#FF6B6B] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                                  >
                                    {processing ? 'Processing...' : 'Confirm Decline'}
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setShowDeclineModal(false);
                                      setDeclineReason('');
                                    }}
                                    className="bg-white border-2 border-[#0A0A0A] font-bold"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}

                      {(project.status === 'in_progress' || project.status === 'active') && !project.deliverable_url && (
                        <Dialog open={showDeliverModal && selectedProject?.project_id === project.project_id} onOpenChange={(open) => {
                          setShowDeliverModal(open);
                          if (open) setSelectedProject(project);
                        }}>
                          <DialogTrigger asChild>
                            <Button className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all">
                              <Upload className="w-4 h-4 mr-2" />
                              Submit Deliverable
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-black">Submit Deliverable</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="block font-bold mb-2">Deliverable URL *</label>
                                <Input
                                  value={deliverableUrl}
                                  onChange={(e) => setDeliverableUrl(e.target.value)}
                                  placeholder="https://drive.google.com/..."
                                  className="border-2 border-[#0A0A0A]"
                                />
                                <p className="text-xs text-[#4A4A4A] mt-1">
                                  Upload your work to Google Drive, Dropbox, or any cloud storage and paste the link here
                                </p>
                              </div>
                              <div>
                                <label className="block font-bold mb-2">Notes (Optional)</label>
                                <Textarea
                                  value={deliveryNotes}
                                  onChange={(e) => setDeliveryNotes(e.target.value)}
                                  placeholder="Add any notes about your submission..."
                                  className="border-2 border-[#0A0A0A]"
                                />
                              </div>
                              <div className="flex gap-3">
                                <Button
                                  onClick={() => handleSubmitDeliverable(project.project_id)}
                                  disabled={processing || !deliverableUrl.trim()}
                                  className="flex-1 bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                                >
                                  {processing ? 'Submitting...' : 'Submit Deliverable'}
                                </Button>
                                <Button
                                  onClick={() => {
                                    setShowDeliverModal(false);
                                    setDeliverableUrl('');
                                    setDeliveryNotes('');
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

                      {project.status === 'delivered' && (
                        <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg px-4 py-2">
                          <p className="font-bold text-sm">⏳ Waiting for business approval</p>
                        </div>
                      )}

                      {project.status === 'completed' && (
                        <>
                          <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-lg px-4 py-2">
                            <p className="font-bold text-sm">✅ Completed & Paid</p>
                          </div>
                          <Button
                            onClick={() => navigate(`/invoice/${project.project_id}`)}
                            className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Invoice
                          </Button>
                        </>
                      )}
                      
                      {/* Raise Dispute Button - Show for active/delivered/completed projects */}
                      {(['in_progress', 'delivered', 'completed'].includes(project.status)) && (
                        <Button
                          onClick={() => {
                            setSelectedProject(project);
                            setShowDisputeModal(true);
                          }}
                          className="bg-[#FF6B6B] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Raise Dispute
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dispute Modal */}
      {selectedProject && (
        <DisputeFormModal
          open={showDisputeModal}
          onClose={() => {
            setShowDisputeModal(false);
            setSelectedProject(null);
          }}
          projectId={selectedProject.project_id}
          projectTitle={selectedProject.title}
          onSuccess={() => {
            fetchProjects();
          }}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav currentPage="projects" />
    </div>
  );
};

export default CreatorProjectsPage;
