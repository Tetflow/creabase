import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Briefcase, Clock, CheckCircle, XCircle, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import CreatorSelector from '../components/CreatorSelector';
import EmptyState from '../components/EmptyState';
import { ListSkeleton } from '../components/Skeletons';
import BottomNav from '../components/BottomNav';
import DisputeFormModal from '../components/DisputeFormModal';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/projects`, {
        withCredentials: true
      });
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setLoading(false);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    if (!selectedCreator) {
      alert('Please select a creator');
      return;
    }
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/projects`,
        { ...formData, budget: parseFloat(formData.budget), creator_id: selectedCreator.creator_id },
        { withCredentials: true }
      );
      alert(response.data.message);
      setShowCreateForm(false);
      setSelectedCreator(null);
      setFormData({ title: '', description: '', budget: '', deadline: '' });
      fetchProjects();
    } catch (error) {
      alert('Failed to create project');
    }
  };

  const payProject = async (projectId) => {
    try {
      await axios.post(`${BACKEND_URL}/api/projects/${projectId}/pay`, {}, {
        withCredentials: true
      });
      alert('Payment successful! Project is now active.');
      fetchProjects();
    } catch (error) {
      alert('Payment failed');
    }
  };

  const approveProject = async (projectId) => {
    if (!window.confirm('Approve this project and release payment to creator?')) {
      return;
    }
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/projects/${projectId}/approve`, {}, {
        withCredentials: true
      });
      alert(`Project approved! ₹${response.data.payout_amount} paid to creator.`);
      fetchProjects();
    } catch (error) {
      alert(error.response?.data?.detail || 'Approval failed');
    }
  };

  const requestRevision = async (projectId) => {
    const revisionNotes = window.prompt('What revisions are needed?');
    if (!revisionNotes) return;
    
    try {
      await axios.post(
        `${BACKEND_URL}/api/projects/${projectId}/request-revision`,
        null,
        { 
          params: { revision_notes: revisionNotes },
          withCredentials: true 
        }
      );
      alert('Revision requested. Creator will be notified.');
      fetchProjects();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to request revision');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-[#FFE57F]';
      case 'active': return 'bg-[#B4F8C8]';
      case 'delivered': return 'bg-[#C6A2FF]';
      case 'completed': return 'bg-[#B4F8C8]';
      default: return 'bg-white';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] has-bottom-nav">
      <nav className="sticky top-0 z-50 bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8" strokeWidth={3} />
            <h1 className="text-3xl font-black tracking-tight">Projects</h1>
          </div>
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
          >
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-black">Your Projects</h2>
          <Button
            data-testid="create-project-button"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
          >
            <Plus className="w-5 h-5 mr-2" strokeWidth={3} />
            Create Project
          </Button>
        </div>

        {showCreateForm && (
          <form
            onSubmit={createProject}
            className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8 mb-8 animate-slideDown"
          >
            <h3 className="text-2xl font-black mb-6">Create New Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2">Project Title *</label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Instagram Reel Campaign"
                  className="border-2 border-[#0A0A0A]"
                />
              </div>
              <div>
                <label className="block font-bold mb-2">Description *</label>
                <Textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the project requirements, deliverables, and timeline..."
                  className="border-2 border-[#0A0A0A] min-h-24"
                />
              </div>
              
              {/* Creator Selector */}
              <CreatorSelector
                selectedCreator={selectedCreator}
                onSelect={setSelectedCreator}
                onClear={() => setSelectedCreator(null)}
              />

              <div>
                <label className="block font-bold mb-2">Budget (₹) *</label>
                <Input
                  required
                  type="number"
                  min="100"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  placeholder="Enter amount in INR"
                  className="border-2 border-[#0A0A0A]"
                />
                {formData.budget && parseFloat(formData.budget) > 0 && (
                  <p className="text-sm text-[#4A4A4A] mt-2">
                    Platform fee (10% + GST): ₹{(parseFloat(formData.budget) * 0.10 * 1.18).toFixed(2)}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={!selectedCreator}
                  className="bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Project
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setSelectedCreator(null);
                    setFormData({ title: '', description: '', budget: '', deadline: '' });
                  }}
                  className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}

        {loading ? (
          <ListSkeleton count={3} />
        ) : projects.length === 0 ? (
          <EmptyState
            type="projects"
            title="No projects yet"
            description="Create your first project to start collaborating with creators"
            actionLabel="Create Project"
            onAction={() => setShowCreateForm(true)}
            secondaryLabel="Browse Creators"
            onSecondary={() => navigate('/dashboard')}
          />
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <div
                key={project.project_id}
                data-testid={`project-card-${project.project_id}`}
                className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-black mb-2">{project.title}</h3>
                    <p className="text-[#4A4A4A] font-medium">{project.description}</p>
                  </div>
                  <span className={`${getStatusColor(project.status)} border-2 border-[#0A0A0A] px-4 py-2 rounded-lg font-bold text-sm uppercase`}>
                    {project.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="border-2 border-[#0A0A0A] rounded-lg p-3">
                    <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Budget</p>
                    <p className="text-lg font-black">₹{project.budget}</p>
                  </div>
                  {project.fees && (
                    <>
                      <div className="border-2 border-[#0A0A0A] rounded-lg p-3">
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">You Pay</p>
                        <p className="text-lg font-black">₹{project.fees.business_pays}</p>
                      </div>
                      <div className="border-2 border-[#0A0A0A] rounded-lg p-3">
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">Creator Gets</p>
                        <p className="text-lg font-black">₹{project.fees.creator_receives}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Show deliverables if submitted */}
                {project.deliverable_url && (
                  <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-lg p-4 mb-4">
                    <p className="font-bold mb-2">📦 Deliverable Submitted:</p>
                    <a 
                      href={project.deliverable_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 underline font-medium break-all hover:text-blue-800"
                    >
                      {project.deliverable_url}
                    </a>
                    {project.delivery_notes && (
                      <p className="mt-2 text-sm text-[#4A4A4A]">
                        <span className="font-bold">Notes:</span> {project.delivery_notes}
                      </p>
                    )}
                    <p className="text-xs text-[#4A4A4A] mt-2">
                      Delivered: {project.delivered_at && new Date(project.delivered_at).toLocaleString()}
                    </p>
                  </div>
                )}
                
                {/* Show revision notes if any */}
                {project.revision_notes && (
                  <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg p-4 mb-4">
                    <p className="font-bold mb-2">🔄 Revision Requested:</p>
                    <p className="text-sm">{project.revision_notes}</p>
                  </div>
                )}

                <div className="flex gap-3 flex-wrap">
                  {project.status === 'pending' && (
                    <Button
                      onClick={() => payProject(project.project_id)}
                      className="bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
                    >
                      Pay Now
                    </Button>
                  )}
                  {project.status === 'delivered' && (
                    <>
                      <Button
                        onClick={() => approveProject(project.project_id)}
                        className="bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve & Pay Creator
                      </Button>
                      <Button
                        onClick={() => requestRevision(project.project_id)}
                        className="bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Request Revision
                      </Button>
                    </>
                  )}
                  {project.status === 'completed' && (
                    <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-lg px-4 py-2">
                      <p className="font-bold text-sm">✅ Completed & Paid</p>
                    </div>
                  )}
                  {(project.status === 'active' || project.status === 'in_progress') && (
                    <div className="bg-[#C6A2FF] border-2 border-[#0A0A0A] rounded-lg px-4 py-2">
                      <p className="font-bold text-sm">⏳ Work in Progress</p>
                    </div>
                  )}
                  
                  {/* Raise Dispute Button - Show for active/delivered/completed projects */}
                  {(['active', 'in_progress', 'delivered', 'completed'].includes(project.status)) && (
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
                  
                  <Button
                    onClick={() => navigate(`/chat/${project.creator_id}`)}
                    className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
                  >
                    Chat with Creator
                  </Button>
                </div>
              </div>
            ))}
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

      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
};

export default ProjectsPage;