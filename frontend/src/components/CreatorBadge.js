import React, { useState, useEffect } from 'react';
import { Star, Award, Zap, CheckCircle, Sparkles } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const badgeIcons = {
  premium: <Star className="w-4 h-4" strokeWidth={3} />,
  top_rated: <Award className="w-4 h-4" strokeWidth={3} />,
  rising_star: <Zap className="w-4 h-4" strokeWidth={3} />,
  verified: <CheckCircle className="w-4 h-4" strokeWidth={3} />,
  new: <Sparkles className="w-4 h-4" strokeWidth={3} />,
  standard: null
};

const CreatorBadge = ({ creatorId, size = 'default', showStats = false }) => {
  const [badgeData, setBadgeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadge();
  }, [creatorId]);

  const fetchBadge = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/creators/${creatorId}/badge`);
      setBadgeData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch badge:', error);
      setLoading(false);
    }
  };

  if (loading || !badgeData || badgeData.badge === 'standard') {
    return null;
  }

  const { badge, badge_info, stats } = badgeData;
  const Icon = badgeIcons[badge];

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    default: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <span
        data-testid={`creator-badge-${creatorId}`}
        className={`inline-flex items-center gap-1.5 border-2 border-[#0A0A0A] rounded-lg font-bold ${sizeClasses[size]}`}
        style={{ backgroundColor: badge_info.color }}
      >
        {Icon}
        {badge_info.label}
      </span>
      
      {showStats && stats && (
        <div className="flex gap-2 text-xs text-[#4A4A4A]">
          <span>{stats.completed_projects} projects</span>
          {stats.average_rating > 0 && (
            <>
              <span>|</span>
              <span>{stats.average_rating} rating</span>
            </>
          )}
          {stats.total_reviews > 0 && (
            <>
              <span>|</span>
              <span>{stats.total_reviews} reviews</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Inline badge for lists (no API call - uses passed data)
export const InlineBadge = ({ badge, badgeInfo, size = 'small' }) => {
  if (!badge || badge === 'standard') return null;
  
  const Icon = badgeIcons[badge];
  
  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-1 text-sm',
    large: 'px-3 py-1.5 text-base'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 border-2 border-[#0A0A0A] rounded-lg font-bold ${sizeClasses[size]}`}
      style={{ backgroundColor: badgeInfo?.color || '#FFFFFF' }}
    >
      {Icon}
      {badgeInfo?.label || badge}
    </span>
  );
};

export default CreatorBadge;
