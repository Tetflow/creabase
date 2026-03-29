import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DisputeFormModal = ({ open, onClose, projectId, projectTitle, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reasons = [
    'Non-payment',
    'Poor quality work',
    'Missed deadline',
    'Unprofessional behavior',
    'Breach of agreement',
    'Scope creep',
    'Deliverables not as agreed',
    'Communication issues',
    'Other'
  ];

  const handleSubmit = async () => {
    if (!reason || !description) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const evidenceUrls = evidenceUrl.trim() ? [evidenceUrl.trim()] : [];
      
      await axios.post(
        `${BACKEND_URL}/api/disputes`,
        {
          project_id: projectId,
          reason,
          description,
          evidence_urls: evidenceUrls
        },
        { withCredentials: true }
      );

      alert('Dispute filed successfully! Our admin team will review it.');
      setReason('');
      setDescription('');
      setEvidenceUrl('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to file dispute');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-[#FF6B6B]" strokeWidth={3} />
            File a Dispute
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Project Info */}
          <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg p-4">
            <p className="font-bold text-sm text-[#4A4A4A] mb-1">PROJECT</p>
            <p className="font-black text-lg">{projectTitle}</p>
          </div>

          {/* Warning */}
          <div className="bg-[#FF6B6B]/20 border-2 border-[#FF6B6B] rounded-lg p-4">
            <p className="font-bold text-sm mb-2">⚠️ Important</p>
            <p className="text-sm font-medium">
              Disputes should only be filed for serious issues. False disputes may result in account penalties. 
              Our admin team will review all evidence and make a fair decision.
            </p>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block font-bold mb-2">Reason for Dispute *</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="border-2 border-[#0A0A0A]">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r} className="font-medium">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold mb-2">Detailed Description *</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the issue in detail. Include dates, specific incidents, and what resolution you're seeking..."
              className="border-2 border-[#0A0A0A] min-h-[150px]"
              maxLength={1000}
            />
            <p className="text-xs text-[#4A4A4A] mt-1">
              {description.length}/1000 characters
            </p>
          </div>

          {/* Evidence URL */}
          <div>
            <label className="block font-bold mb-2">Evidence URL (Optional)</label>
            <Input
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://drive.google.com/... or any cloud storage link"
              className="border-2 border-[#0A0A0A]"
            />
            <p className="text-xs text-[#4A4A4A] mt-1">
              Upload screenshots, documents, or other evidence to cloud storage and paste the link here
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={submitting || !reason || !description}
              className="flex-1 bg-[#FF6B6B] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  File Dispute
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              disabled={submitting}
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisputeFormModal;
