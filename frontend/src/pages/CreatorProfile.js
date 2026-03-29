import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Instagram, Youtube, TrendingUp, Users, Lock, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import CreatorBadge from '../components/CreatorBadge';
import RatingStars from '../components/RatingStars';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CreatorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [creator, setCreator] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    fetchCreator();
    fetchReviews();
    checkAccess();
  }, [id]);

  const fetchCreator = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/creators/${id}`, {
        withCredentials: true
      });
      setCreator(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch creator:', error);
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/creators/${id}/reviews`, {
        withCredentials: true
      });
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const checkAccess = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true
      });
      setHasAccess(response.data.subscription_status === 'active');
    } catch (error) {
      setHasAccess(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#0A0A0A] border-t-[#C6A2FF] rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Creator not found</p>
          <Button onClick={() => navigate('/')}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button
            data-testid="back-to-home-button"
            onClick={() => navigate('/')}
            className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={3} />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8" strokeWidth={3} />
            <h1 className="text-3xl font-black tracking-tight">Creabase</h1>
          </div>
        </div>
      </nav>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {creator.profile_image && (
              <img
                src={creator.profile_image}
                alt={creator.name}
                className="w-48 h-48 object-cover border-2 border-[#0A0A0A] rounded-xl"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-4xl font-black">{creator.name}</h1>
                <CreatorBadge creatorId={id} size="default" />
              </div>
              <p className="text-lg text-[#4A4A4A] font-medium mb-6">{creator.bio}</p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {creator.platforms?.includes('instagram') && (
                  <span className="platform-badge instagram-badge">
                    <Instagram className="w-3 h-3 inline mr-1" />
                    Instagram
                  </span>
                )}
                {creator.platforms?.includes('youtube') && (
                  <span className="platform-badge youtube-badge">
                    <Youtube className="w-3 h-3 inline mr-1" />
                    YouTube
                  </span>
                )}
                {creator.language?.map((lang) => (
                  <span key={lang} className="platform-badge" style={{ background: '#FFE57F' }}>
                    {lang}
                  </span>
                ))}
                {creator.industry?.map((ind) => (
                  <span key={ind} className="platform-badge" style={{ background: '#C6A2FF' }}>
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {creator.instagram_followers > 0 && (
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
              <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-2">Instagram Followers</p>
              <p className="text-3xl font-black">{(creator.instagram_followers / 1000).toFixed(1)}K</p>
            </div>
          )}
          {creator.youtube_subscribers > 0 && (
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
              <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-2">YouTube Subscribers</p>
              <p className="text-3xl font-black">{(creator.youtube_subscribers / 1000).toFixed(1)}K</p>
            </div>
          )}
          {creator.engagement_rate > 0 && (
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
              <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-2">Engagement Rate</p>
              <p className="text-3xl font-black">{creator.engagement_rate}%</p>
            </div>
          )}
          {creator.avg_views > 0 && (
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
              <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-2">Avg Views</p>
              <p className="text-3xl font-black">{(creator.avg_views / 1000).toFixed(1)}K</p>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8">
          <div className="text-center">
            <Lock className="w-12 h-12 mx-auto mb-4" strokeWidth={3} />
            <h2 className="text-3xl font-black mb-4">Contact Information</h2>
            {hasAccess ? (
              <div>
                {creator.email && (
                  <p className="text-lg font-bold mb-2">Email: {creator.email}</p>
                )}
                {creator.phone && (
                  <p className="text-lg font-bold mb-4">Phone: {creator.phone}</p>
                )}
                {!creator.email && !creator.phone && (
                  <p className="text-lg font-bold text-[#AA0000]">Contact information not available</p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium mb-6">Subscribe to unlock contact information and reach out for collaborations</p>
                <Button
                  data-testid="unlock-contact-cta-button"
                  onClick={() => navigate('/pricing')}
                  className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold text-lg px-8 py-4 transition-all"
                >
                  Unlock Contact
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" strokeWidth={3} />
            <h2 className="text-2xl sm:text-3xl font-black">
              Reviews & Ratings
            </h2>
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border-2 border-[#0A0A0A] rounded-lg p-4 sm:p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <RatingStars rating={review.rating} size={20} />
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 font-medium">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Star size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No reviews yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;