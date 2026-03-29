import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, User, Mail, Phone, Instagram, Youtube, Globe, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const CreatorSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    instagram_handle: '',
    youtube_channel: '',
    website: '',
    rate_per_post: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/me`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
          instagram_handle: data.instagram_handle || '',
          youtube_channel: data.youtube_channel || '',
          website: data.website || '',
          rate_per_post: data.rate_per_post || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2">Settings</h1>
          <p className="text-base sm:text-lg text-[#4A4A4A] font-medium">Manage your creator profile</p>
        </div>

        {/* Settings Content */}
        <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6" strokeWidth={3} />
            <h2 className="text-2xl font-black">Creator Profile</h2>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <label className="block font-bold mb-2 text-sm">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4A4A]" strokeWidth={2} />
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  placeholder="Your Full Name"
                  className="border-2 border-[#0A0A0A] h-12 pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4A4A]" strokeWidth={2} />
                <Input
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  placeholder="your@email.com"
                  type="email"
                  className="border-2 border-[#0A0A0A] h-12 pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4A4A]" strokeWidth={2} />
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  placeholder="+91 XXXXX XXXXX"
                  className="border-2 border-[#0A0A0A] h-12 pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                placeholder="Tell us about yourself and your content..."
                className="w-full border-2 border-[#0A0A0A] rounded-lg p-3 font-medium min-h-[100px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-[#4A4A4A] mt-1">{profile.bio?.length || 0}/500 characters</p>
            </div>

            {/* Social Media Links */}
            <div className="border-t-2 border-[#0A0A0A] pt-6">
              <h3 className="text-lg font-black mb-4">Social Media</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-bold mb-2 text-sm">Instagram Handle</label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4A4A]" strokeWidth={2} />
                    <Input
                      value={profile.instagram_handle}
                      onChange={(e) => setProfile({...profile, instagram_handle: e.target.value})}
                      placeholder="@yourusername"
                      className="border-2 border-[#0A0A0A] h-12 pl-11"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-2 text-sm">YouTube Channel</label>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4A4A]" strokeWidth={2} />
                    <Input
                      value={profile.youtube_channel}
                      onChange={(e) => setProfile({...profile, youtube_channel: e.target.value})}
                      placeholder="Channel URL or @handle"
                      className="border-2 border-[#0A0A0A] h-12 pl-11"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-2 text-sm">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4A4A]" strokeWidth={2} />
                    <Input
                      value={profile.website}
                      onChange={(e) => setProfile({...profile, website: e.target.value})}
                      placeholder="https://yourwebsite.com"
                      className="border-2 border-[#0A0A0A] h-12 pl-11"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t-2 border-[#0A0A0A] pt-6">
              <h3 className="text-lg font-black mb-4">Pricing</h3>
              
              <div>
                <label className="block font-bold mb-2 text-sm">Rate per Post (₹)</label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4A4A]" strokeWidth={2} />
                  <Input
                    value={profile.rate_per_post}
                    onChange={(e) => setProfile({...profile, rate_per_post: e.target.value})}
                    placeholder="5000"
                    type="number"
                    className="border-2 border-[#0A0A0A] h-12 pl-11"
                  />
                </div>
                <p className="text-xs text-[#4A4A4A] mt-1">Your standard rate for sponsored content</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-[#A78BFA] hover:bg-[#9333EA] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={() => navigate('/creator-dashboard')}
                variant="outline"
                className="border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorSettings;
