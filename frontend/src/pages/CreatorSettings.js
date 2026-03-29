import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, User, Mail, Phone, Instagram, Youtube, Globe, Award, CheckCircle, AlertCircle, CreditCard, Building } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const CreatorSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState({ instagram: false, youtube: false, bank: false });
  const [showBankModal, setShowBankModal] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    website: '',
    rate_per_post: '',
  });

  const [verificationStatus, setVerificationStatus] = useState({
    instagram_verified: false,
    instagram_handle: '',
    instagram_followers: 0,
    youtube_verified: false,
    youtube_channel_name: '',
    youtube_subscribers: 0,
    bank_verified: false,
    bank_account_holder: '',
    bank_name: '',
    bank_last_4: '',
    bank_ifsc_code: ''
  });

  const [bankDetails, setBankDetails] = useState({
    bank_account_number: '',
    bank_ifsc_code: '',
    bank_account_holder: '',
    bank_name: '',
    upi_id: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchVerificationStatus();
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
          bio: data.bio || '',
          website: data.website || '',
          rate_per_post: data.rate_per_post || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchVerificationStatus = async () => {
    try {
      // Get user data for social verification
      const userRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/me`, {
        credentials: 'include'
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setVerificationStatus(prev => ({
          ...prev,
          instagram_verified: userData.instagram_verified || false,
          instagram_handle: userData.instagram_handle || '',
          instagram_followers: userData.instagram_followers || 0,
          youtube_verified: userData.youtube_verified || false,
          youtube_channel_name: userData.youtube_channel_name || '',
          youtube_subscribers: userData.youtube_subscribers || 0,
        }));
      }

      // Get bank verification status
      const bankRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/creators/verify/bank/status`, {
        credentials: 'include'
      });
      if (bankRes.ok) {
        const bankData = await bankRes.json();
        setVerificationStatus(prev => ({
          ...prev,
          bank_verified: bankData.bank_verified || false,
          bank_account_holder: bankData.bank_account_holder || '',
          bank_name: bankData.bank_name || '',
          bank_last_4: bankData.last_4_digits || '',
          bank_ifsc_code: bankData.bank_ifsc_code || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
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

  const handleInstagramVerification = async () => {
    setVerifying({ ...verifying, instagram: true });
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/creators/verify/instagram/initiate`, {
        method: 'POST',
        credentials: 'include',
      });

      // Read the response body once
      const data = await response.json();

      if (response.ok) {
        // Success - redirect to Instagram OAuth
        window.location.href = data.auth_url;
      } else {
        // Error - show message and reset button
        alert(data.detail || 'Instagram verification not configured');
        setVerifying({ ...verifying, instagram: false });
      }
    } catch (error) {
      console.error('Error initiating Instagram verification:', error);
      alert('Error starting Instagram verification');
      setVerifying({ ...verifying, instagram: false });
    }
  };

  const handleYouTubeVerification = async () => {
    setVerifying({ ...verifying, youtube: true });
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/creators/verify/youtube/initiate`, {
        method: 'POST',
        credentials: 'include',
      });

      // Read the response body once
      const data = await response.json();

      if (response.ok) {
        // Success - redirect to YouTube OAuth
        window.location.href = data.auth_url;
      } else {
        // Error - show message and reset button
        alert(data.detail || 'YouTube verification not configured');
        setVerifying({ ...verifying, youtube: false });
      }
    } catch (error) {
      console.error('Error initiating YouTube verification:', error);
      alert('Error starting YouTube verification');
      setVerifying({ ...verifying, youtube: false });
    }
  };

  const handleBankVerification = async () => {
    // Validate bank details
    if (!bankDetails.bank_account_number || !bankDetails.bank_ifsc_code || 
        !bankDetails.bank_account_holder || !bankDetails.bank_name) {
      alert('Please fill all required bank details');
      return;
    }

    setVerifying({ ...verifying, bank: true });
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/creators/verify/bank/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(bankDetails),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Bank account verified successfully!');
        setShowBankModal(false);
        await fetchVerificationStatus(); // Refresh verification status
        // Clear form
        setBankDetails({
          bank_account_number: '',
          bank_ifsc_code: '',
          bank_account_holder: '',
          bank_name: '',
          upi_id: ''
        });
      } else {
        const error = await response.json();
        alert(`Verification failed: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error verifying bank account:', error);
      alert('Error verifying bank account');
    } finally {
      setVerifying({ ...verifying, bank: false });
    }
  };

  // Open bank modal with existing data if editing
  const openBankModal = () => {
    if (verificationStatus.bank_verified) {
      // Pre-fill with existing data for editing (partial data available)
      setBankDetails({
        bank_account_number: '',  // Don't show full number for security
        bank_ifsc_code: verificationStatus.bank_ifsc_code || '',
        bank_account_holder: verificationStatus.bank_account_holder || '',
        bank_name: verificationStatus.bank_name || '',
        upi_id: ''
      });
    }
    setShowBankModal(true);
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
                  disabled
                  placeholder="your@email.com"
                  type="email"
                  className="border-2 border-[#0A0A0A] h-12 pl-11 bg-gray-50"
                />
              </div>
              <p className="text-xs text-[#4A4A4A] mt-1">Email cannot be changed</p>
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

            {/* Social Media Verification - OAuth Based */}
            <div className="border-t-2 border-[#0A0A0A] pt-6">
              <h3 className="text-lg font-black mb-4">Social Media Verification</h3>
              <p className="text-sm text-[#4A4A4A] mb-4">Verify your social accounts to build trust and showcase your reach</p>
              
              <div className="space-y-4">
                {/* Instagram Verification */}
                <div className="border-2 border-[#0A0A0A] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Instagram className="w-6 h-6 text-pink-600" strokeWidth={2} />
                      <div>
                        <p className="font-bold">Instagram</p>
                        {verificationStatus.instagram_verified ? (
                          <p className="text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            @{verificationStatus.instagram_handle} ({verificationStatus.instagram_followers.toLocaleString()} followers)
                          </p>
                        ) : (
                          <p className="text-sm text-[#4A4A4A]">Not verified</p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={handleInstagramVerification}
                      disabled={verifying.instagram || verificationStatus.instagram_verified}
                      className={`${
                        verificationStatus.instagram_verified 
                          ? 'bg-green-500' 
                          : 'bg-pink-500 hover:bg-pink-600'
                      } text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold`}
                    >
                      {verifying.instagram ? 'Verifying...' : verificationStatus.instagram_verified ? 'Verified ✓' : 'Verify'}
                    </Button>
                  </div>
                </div>

                {/* YouTube Verification */}
                <div className="border-2 border-[#0A0A0A] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Youtube className="w-6 h-6 text-red-600" strokeWidth={2} />
                      <div>
                        <p className="font-bold">YouTube</p>
                        {verificationStatus.youtube_verified ? (
                          <p className="text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            {verificationStatus.youtube_channel_name} ({verificationStatus.youtube_subscribers.toLocaleString()} subscribers)
                          </p>
                        ) : (
                          <p className="text-sm text-[#4A4A4A]">Not verified</p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={handleYouTubeVerification}
                      disabled={verifying.youtube || verificationStatus.youtube_verified}
                      className={`${
                        verificationStatus.youtube_verified 
                          ? 'bg-green-500' 
                          : 'bg-red-500 hover:bg-red-600'
                      } text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold`}
                    >
                      {verifying.youtube ? 'Verifying...' : verificationStatus.youtube_verified ? 'Verified ✓' : 'Verify'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Account Details - Full Section */}
            <div className="border-t-2 border-[#0A0A0A] pt-6">
              <h3 className="text-lg font-black mb-4">Bank Account Details</h3>
              <p className="text-sm text-[#4A4A4A] mb-4">Add your bank account to receive payments securely</p>
              
              {verificationStatus.bank_verified ? (
                /* Show verified bank details */
                <div className="space-y-4">
                  <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600" strokeWidth={3} />
                      <p className="font-bold text-green-800">Bank Account Verified</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Account Holder Name</label>
                        <p className="font-bold">{verificationStatus.bank_account_holder}</p>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Bank Name</label>
                        <p className="font-bold">{verificationStatus.bank_name}</p>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Account Number</label>
                        <p className="font-bold">****{verificationStatus.bank_last_4}</p>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">IFSC Code</label>
                        <p className="font-bold">{verificationStatus.bank_ifsc_code || 'Not available'}</p>
                      </div>
                    </div>
                    
                    <Button
                      onClick={openBankModal}
                      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
                    >
                      Update Bank Details
                    </Button>
                  </div>
                </div>
              ) : (
                /* Show add bank account form */
                <div className="border-2 border-[#0A0A0A] rounded-lg p-6 bg-blue-50">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" strokeWidth={2} />
                    <div>
                      <p className="font-bold text-blue-900 mb-2">No Bank Account Added</p>
                      <p className="text-sm text-blue-800">Add your bank account details to receive payments for completed projects.</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={openBankModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                  >
                    <Building className="w-4 h-4 mr-2 inline" />
                    Add Bank Account
                  </Button>
                </div>
              )}
            </div>

            {/* Website */}
            <div className="border-t-2 border-[#0A0A0A] pt-6">
              <h3 className="text-lg font-black mb-4">Additional Information</h3>
              
              <div className="space-y-4">
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

      {/* Bank Details Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-[#0A0A0A] shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6" strokeWidth={3} />
              <h3 className="text-xl font-black">
                {verificationStatus.bank_verified ? 'Update Bank Account' : 'Add Bank Account'}
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2 text-sm">Account Holder Name</label>
                <Input
                  value={bankDetails.bank_account_holder}
                  onChange={(e) => setBankDetails({...bankDetails, bank_account_holder: e.target.value})}
                  placeholder="John Doe"
                  className="border-2 border-[#0A0A0A] h-12"
                />
              </div>

              <div>
                <label className="block font-bold mb-2 text-sm">Account Number</label>
                <Input
                  value={bankDetails.bank_account_number}
                  onChange={(e) => setBankDetails({...bankDetails, bank_account_number: e.target.value})}
                  placeholder="1234567890"
                  className="border-2 border-[#0A0A0A] h-12"
                />
              </div>

              <div>
                <label className="block font-bold mb-2 text-sm">IFSC Code</label>
                <Input
                  value={bankDetails.bank_ifsc_code}
                  onChange={(e) => setBankDetails({...bankDetails, bank_ifsc_code: e.target.value.toUpperCase()})}
                  placeholder="SBIN0001234"
                  className="border-2 border-[#0A0A0A] h-12"
                />
              </div>

              <div>
                <label className="block font-bold mb-2 text-sm">Bank Name</label>
                <Input
                  value={bankDetails.bank_name}
                  onChange={(e) => setBankDetails({...bankDetails, bank_name: e.target.value})}
                  placeholder="State Bank of India"
                  className="border-2 border-[#0A0A0A] h-12"
                />
              </div>

              <div>
                <label className="block font-bold mb-2 text-sm">UPI ID (Optional)</label>
                <Input
                  value={bankDetails.upi_id}
                  onChange={(e) => setBankDetails({...bankDetails, upi_id: e.target.value})}
                  placeholder="yourname@upi"
                  className="border-2 border-[#0A0A0A] h-12"
                />
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Your bank details will be securely verified. This information is required to receive payments.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleBankVerification}
                  disabled={verifying.bank}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
                >
                  {verifying.bank ? 'Saving...' : verificationStatus.bank_verified ? 'Update Account' : 'Verify Account'}
                </Button>
                <Button
                  onClick={() => setShowBankModal(false)}
                  disabled={verifying.bank}
                  variant="outline"
                  className="border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorSettings;
