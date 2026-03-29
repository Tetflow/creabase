import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, User, Mail, Phone, Building, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const BusinessSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    website: '',
    industry: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/me`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          company_name: data.company_name || '',
          website: data.website || '',
          industry: data.industry || '',
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
        await fetchProfile(); // Refresh to show updated data
      } else {
        const error = await response.json();
        alert(`Failed to update profile: ${error.detail || 'Unknown error'}`);
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
          <p className="text-base sm:text-lg text-[#4A4A4A] font-medium">Manage your business account</p>
        </div>

        {/* Settings Content */}
        <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6" strokeWidth={3} />
            <h2 className="text-2xl font-black">Business Profile</h2>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <label className="block font-bold mb-2 text-sm">Company Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4A4A]" strokeWidth={2} />
                <Input
                  value={profile.company_name}
                  onChange={(e) => setProfile({...profile, company_name: e.target.value})}
                  placeholder="Your Company Name"
                  className="border-2 border-[#0A0A0A] h-12 pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm">Contact Person</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4A4A]" strokeWidth={2} />
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  placeholder="Contact Name"
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
                  disabled
                  type="email"
                  placeholder="email@company.com"
                  className="border-2 border-[#0A0A0A] h-12 pl-11 bg-gray-50"
                />
              </div>
              <p className="text-xs text-[#4A4A4A] mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4A4A]" strokeWidth={2} />
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="border-2 border-[#0A0A0A] h-12 pl-11"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="border-t-2 border-[#0A0A0A] pt-6">
              <h3 className="text-lg font-black mb-4">Company Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block font-bold mb-2 text-sm">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4A4A]" strokeWidth={2} />
                    <Input
                      value={profile.website}
                      onChange={(e) => setProfile({...profile, website: e.target.value})}
                      placeholder="https://yourcompany.com"
                      className="border-2 border-[#0A0A0A] h-12 pl-11"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-2 text-sm">Industry</label>
                  <Input
                    value={profile.industry}
                    onChange={(e) => setProfile({...profile, industry: e.target.value})}
                    placeholder="E.g., Technology, Fashion, Food"
                    className="border-2 border-[#0A0A0A] h-12"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-[#B4F8C8] hover:bg-[#A0E7B4] text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
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

export default BusinessSettings;
