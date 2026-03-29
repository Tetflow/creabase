import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { Button } from './ui/button';
import RatingStars from './RatingStars';

const ReviewModal = ({ isOpen, onClose, project, onSubmitSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          project_id: project.project_id,
          rating: rating,
          comment: comment.trim() || undefined
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (onSubmitSuccess) {
          onSubmitSuccess(data);
        }
        onClose();
        // Reset form
        setRating(0);
        setComment('');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl border-2 border-[#0A0A0A] shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-[#0A0A0A]">
          <h2 className="text-2xl font-black">Leave a Review</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Info */}
          <div className="bg-gray-50 border-2 border-[#0A0A0A] rounded-lg p-4">
            <p className="text-sm font-bold text-gray-600 mb-1">Project</p>
            <p className="font-black text-lg">{project.title}</p>
          </div>

          {/* Rating */}
          <div>
            <label className="block font-bold mb-3">
              How would you rate this work? <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <RatingStars
                rating={rating}
                interactive={true}
                size={32}
                onRatingChange={setRating}
              />
              {rating > 0 && (
                <span className="text-2xl font-black text-yellow-600">{rating}.0</span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block font-bold mb-2">
              Share your experience (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like about working with this creator? Any feedback?"
              className="w-full border-2 border-[#0A0A0A] rounded-lg p-3 font-medium min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{comment.length}/500 characters</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3">
              <p className="text-red-700 font-bold text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 bg-[#A78BFA] hover:bg-[#9333EA] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
