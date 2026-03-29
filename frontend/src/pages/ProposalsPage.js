import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, User, DollarSign, Clock, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import RatingStars from '../components/RatingStars';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProposalsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProposals();
    fetchProject();
  }, [projectId]);

  const fetchProposals = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/projects/${projectId}/proposals`,
        { withCredentials: true }
      );
      setProposals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
      setLoading(false);
    }
  };

  const fetchProject = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/projects/${projectId}`,
        { withCredentials: true }
      );
      setProject(response.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    }
  };

  const handleAcceptProposal = async (proposalId) => {
    if (!window.confirm('Accept this proposal? This will create the project with this creator.')) {
      return;
    }

    try {
      await axios.post(
        `${BACKEND_URL}/api/proposals/${proposalId}/accept`,
        null,
        { withCredentials: true }
      );
      alert('Proposal accepted! Project created with this creator.');
      navigate('/projects');
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to accept proposal');
    }
  };

  const handleRejectProposal = async (proposalId) => {
    if (!window.confirm('Reject this proposal?')) {
      return;
    }

    try {
      await axios.post(
        `${BACKEND_URL}/api/proposals/${proposalId}/reject`,
        null,
        { withCredentials: true }
      );
      alert('Proposal rejected');
      fetchProposals();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to reject proposal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-xl font-bold">Loading proposals...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-black font-bold mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2">
            Proposals for Project
          </h1>
          {project && (
            <div className="bg-white border-2 border-[#0A0A0A] rounded-lg p-4 mt-4">
              <p className="font-black text-xl">{project.title}</p>
              <p className="text-gray-600 mt-2">{project.description}</p>
              {project.budget && (
                <p className="font-bold text-purple-600 mt-2">
                  Budget: ₹{project.budget.toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Proposals */}
        {proposals.length === 0 ? (
          <div className="bg-white border-2 border-[#0A0A0A] rounded-xl p-12 text-center">
            <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-xl font-bold text-gray-600">No proposals yet</p>
            <p className="text-gray-500 mt-2">Creators will submit their proposals soon</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm font-bold text-gray-600">
              {proposals.length} {proposals.length === 1 ? 'Proposal' : 'Proposals'} Received
            </p>

            {proposals.map((proposal) => (
              <div
                key={proposal.proposal_id}
                className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6"
              >
                {/* Creator Info */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 border-2 border-[#0A0A0A] rounded-full p-3">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="font-black text-lg">{proposal.creator_name || 'Creator'}</p>
                      {proposal.creator_rating && (
                        <RatingStars rating={proposal.creator_rating} size={16} />
                      )}
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div>
                    {proposal.status === 'pending' && (
                      <span className="bg-yellow-100 text-yellow-800 border-2 border-yellow-800 px-3 py-1 rounded-lg font-bold text-sm">
                        Pending
                      </span>
                    )}
                    {proposal.status === 'accepted' && (
                      <span className="bg-green-100 text-green-800 border-2 border-green-800 px-3 py-1 rounded-lg font-bold text-sm">
                        ✓ Accepted
                      </span>
                    )}
                    {proposal.status === 'rejected' && (
                      <span className="bg-red-100 text-red-800 border-2 border-red-800 px-3 py-1 rounded-lg font-bold text-sm">
                        ✗ Rejected
                      </span>
                    )}
                  </div>
                </div>

                {/* Proposal Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3 bg-gray-50 border-2 border-[#0A0A0A] rounded-lg p-4">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600 font-bold">Bid Amount</p>
                      <p className="text-2xl font-black text-green-600">₹{proposal.amount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 border-2 border-[#0A0A0A] rounded-lg p-4">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600 font-bold">Delivery Time</p>
                      <p className="text-2xl font-black text-blue-600">
                        {proposal.delivery_days} {proposal.delivery_days === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="bg-gray-50 border-2 border-[#0A0A0A] rounded-lg p-4 mb-4">
                  <p className="font-bold mb-2 flex items-center gap-2">
                    <MessageSquare size={18} />
                    Cover Letter
                  </p>
                  <p className="text-gray-700 whitespace-pre-wrap">{proposal.message}</p>
                </div>

                {/* Submission Date */}
                <p className="text-xs text-gray-500 mb-4">
                  Submitted {new Date(proposal.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>

                {/* Actions */}
                {proposal.status === 'pending' && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleAcceptProposal(proposal.proposal_id)}
                      className="flex-1 bg-[#B4F8C8] hover:bg-green-400 text-black border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept Proposal
                    </Button>
                    <Button
                      onClick={() => handleRejectProposal(proposal.proposal_id)}
                      variant="outline"
                      className="border-2 border-red-500 text-red-600 hover:bg-red-50 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] hover:shadow-[6px_6px_0px_0px_rgba(239,68,68,1)] hover:-translate-y-1 font-bold transition-all"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalsPage;
