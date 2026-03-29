import React, { useState, useEffect } from 'react';
import { Instagram, Youtube, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SocialVerificationCard = () => {
  const [verificationStatus, setVerificationStatus] = useState({
    instagram_verified: false,
    instagram_handle: null,
    instagram_followers: 0,
    youtube_verified: false,
    youtube_channel_name: null,
    youtube_subscribers: 0
  });
  const [loading, setLoading] = useState({ instagram: false, youtube: false });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchVerificationStatus();
    
    // Check for verification callback status in URL
    const params = new URLSearchParams(window.location.search);
    const verification = params.get('verification');
    
    if (verification === 'instagram_success') {
      setSuccess('Instagram account verified successfully!');
      fetchVerificationStatus();
      // Clear URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (verification === 'instagram_error') {
      setError('Instagram verification failed. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (verification === 'youtube_success') {
      setSuccess('YouTube channel verified successfully!');
      fetchVerificationStatus();
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (verification === 'youtube_error') {
      setError('YouTube verification failed. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true
      });
      
      setVerificationStatus({
        instagram_verified: response.data.instagram_verified || false,
        instagram_handle: response.data.instagram_handle,
        instagram_followers: response.data.instagram_followers || 0,
        youtube_verified: response.data.youtube_verified || false,
        youtube_channel_name: response.data.youtube_channel_name,
        youtube_subscribers: response.data.youtube_subscribers || 0
      });
    } catch (err) {
      console.error('Failed to fetch verification status:', err);
    }
  };

  const handleInstagramVerify = async () => {
    setLoading({ ...loading, instagram: true });
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/creators/verify/instagram/initiate`,
        {},
        { withCredentials: true }
      );
      
      // Redirect to Instagram OAuth
      window.location.href = response.data.auth_url;
    } catch (err) {
      setLoading({ ...loading, instagram: false });
      if (err.response?.status === 503) {
        setError('Instagram verification is not configured yet. Please contact support or try again later.');
      } else {
        setError('Failed to initiate Instagram verification. Please try again.');
      }
    }
  };

  const handleYouTubeVerify = async () => {
    setLoading({ ...loading, youtube: true });
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/creators/verify/youtube/initiate`,
        {},
        { withCredentials: true }
      );
      
      // Redirect to YouTube OAuth
      window.location.href = response.data.auth_url;
    } catch (err) {
      setLoading({ ...loading, youtube: false });
      if (err.response?.status === 503) {
        setError('YouTube verification is not configured yet. Please contact support or try again later.');
      } else {
        setError('Failed to initiate YouTube verification. Please try again.');
      }
    }
  };

  const handleRemoveVerification = async (platform) => {
    if (!window.confirm(`Are you sure you want to remove ${platform} verification?`)) {
      return;
    }
    
    try {
      await axios.delete(
        `${BACKEND_URL}/api/creators/verify/${platform}`,
        { withCredentials: true }
      );
      
      setSuccess(`${platform.charAt(0).toUpperCase() + platform.slice(1)} verification removed`);
      fetchVerificationStatus();
    } catch (err) {
      setError(`Failed to remove ${platform} verification`);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black mb-2">Social Verification</h2>
        <p className="text-sm text-[#4A4A4A] font-medium">
          Verify your Instagram and YouTube accounts to boost credibility and attract more projects
        </p>
      </div>

      {error && (
        <Alert className="bg-[#FF9B9B] border-2 border-[#0A0A0A]">
          <AlertCircle className="h-4 w-4" strokeWidth={3} />
          <AlertDescription className="font-bold">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-[#B4F8C8] border-2 border-[#0A0A0A]">
          <CheckCircle className="h-4 w-4" strokeWidth={3} />
          <AlertDescription className="font-bold">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Instagram Verification Card */}
        <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-[#FCAF45] via-[#DD2A7B] to-[#8134AF] p-2 rounded-lg border-2 border-[#0A0A0A]">
              <Instagram className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <h3 className="text-xl font-black">Instagram</h3>
          </div>

          {verificationStatus.instagram_verified ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#00C851]">
                <CheckCircle className="w-5 h-5" strokeWidth={3} />
                <span className="font-bold">Verified Account</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-[#4A4A4A] font-medium">Username</p>
                <p className="text-lg font-black">@{verificationStatus.instagram_handle}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-[#4A4A4A] font-medium">Followers</p>
                <p className="text-2xl font-black text-[#DD2A7B]">
                  {formatNumber(verificationStatus.instagram_followers)}
                </p>
              </div>

              <Button
                onClick={() => handleRemoveVerification('instagram')}
                className="w-full bg-[#FF9B9B] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
              >
                Remove Verification
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[#4A4A4A] font-medium">
                Connect your Instagram account to display your follower count and increase trust with businesses
              </p>
              
              <Button
                onClick={handleInstagramVerify}
                disabled={loading.instagram}
                className="w-full bg-gradient-to-r from-[#FCAF45] via-[#DD2A7B] to-[#8134AF] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
              >
                {loading.instagram ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} />
                    Connecting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Instagram className="w-4 h-4" strokeWidth={3} />
                    Verify Instagram
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* YouTube Verification Card */}
        <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#FF0000] p-2 rounded-lg border-2 border-[#0A0A0A]">
              <Youtube className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <h3 className="text-xl font-black">YouTube</h3>
          </div>

          {verificationStatus.youtube_verified ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#00C851]">
                <CheckCircle className="w-5 h-5" strokeWidth={3} />
                <span className="font-bold">Verified Channel</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-[#4A4A4A] font-medium">Channel Name</p>
                <p className="text-lg font-black">{verificationStatus.youtube_channel_name}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-[#4A4A4A] font-medium">Subscribers</p>
                <p className="text-2xl font-black text-[#FF0000]">
                  {formatNumber(verificationStatus.youtube_subscribers)}
                </p>
              </div>

              <Button
                onClick={() => handleRemoveVerification('youtube')}
                className="w-full bg-[#FF9B9B] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
              >
                Remove Verification
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[#4A4A4A] font-medium">
                Connect your YouTube channel to display your subscriber count and increase trust with businesses
              </p>
              
              <Button
                onClick={handleYouTubeVerify}
                disabled={loading.youtube}
                className="w-full bg-[#FF0000] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
              >
                {loading.youtube ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} />
                    Connecting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Youtube className="w-4 h-4" strokeWidth={3} />
                    Verify YouTube
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" strokeWidth={3} />
          <div className="text-sm font-medium">
            <p className="font-bold mb-1">Why verify your accounts?</p>
            <ul className="list-disc list-inside space-y-1 text-[#4A4A4A]">
              <li>Build trust with potential clients</li>
              <li>Showcase your real follower/subscriber count</li>
              <li>Stand out in search results</li>
              <li>Get priority in project recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialVerificationCard;
