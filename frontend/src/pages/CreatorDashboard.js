import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import BankDetailsForm from '../components/BankDetailsForm';
import WalletWidget from '../components/WalletWidget';
import SocialVerificationCard from '../components/SocialVerificationCard';
import PremiumSubscriptionCard from '../components/PremiumSubscriptionCard';
import BottomNav from '../components/BottomNav';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    profile_image: '',
    platforms: [],
    instagram_handle: '',
    youtube_handle: '',
    instagram_followers: 0,
    youtube_subscribers: 0,
    language: [],
    industry: [],
    engagement_rate: 0,
    avg_views: 0,
    city: '',
    district: ''
  });
  const [creatorId, setCreatorId] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState('pending');

  useEffect(() => {
    checkCreatorProfile();
  }, []);

  const checkCreatorProfile = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true
      });
      
      // Check if creator profile exists
      const profileRes = await axios.get(`${BACKEND_URL}/api/creators/me`, {
        withCredentials: true
      });
      
      if (profileRes.data && profileRes.data.creator_id) {
        setCreatorProfile(profileRes.data);
        setCreatorId(profileRes.data.creator_id);
        setApprovalStatus(profileRes.data.status || 'pending');
        
        // Determine current step based on profile completion
        if (profileRes.data.status === 'approved') {
          setCurrentStep(5); // Show dashboard
        } else if (profileRes.data.bank_details) {
          setCurrentStep(4); // Waiting for approval
        } else if (profileRes.data.social_verified) {
          setCurrentStep(3); // Bank details
        } else if (profileRes.data.creator_id) {
          setCurrentStep(2); // Social verification
        }
      }
      setLoading(false);
    } catch (error) {
      // No profile yet, start from step 1
      setLoading(false);
    }
  };

  const handleBasicInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/creators`,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          bio: formData.bio,
          city: formData.city,
          district: formData.district
        },
        { withCredentials: true }
      );
      setCreatorId(response.data.creator_id);
      setCreatorProfile(response.data);
      setCurrentStep(2);
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to submit profile');
    }
  };

  const StepIndicator = ({ step, label, completed, active }) => (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full border-2 border-[#0A0A0A] flex items-center justify-center font-black ${
        completed ? 'bg-[#B4F8C8]' : active ? 'bg-[#C6A2FF]' : 'bg-white'
      }`}>
        {completed ? <CheckCircle className="w-5 h-5" strokeWidth={3} /> : step}
      </div>
      <p className="text-xs font-bold mt-2 text-center">{label}</p>
    </div>
  );

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

  // If approved, show full dashboard
  if (currentStep === 5) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] has-bottom-nav">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2">Creator Dashboard</h1>
            <p className="text-base sm:text-lg text-[#4A4A4A] font-medium">Manage your profile, projects, and earnings</p>
          </div>

          {/* Wallet Widget */}
          <div className="mb-8">
            <WalletWidget userRole="creator" />
          </div>
          
          {/* Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Card */}
            <PremiumSubscriptionCard />
            
            {/* Profile Status */}
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Profile Status</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00AA00]" strokeWidth={3} />
                  <span className="font-bold">Profile Approved</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00AA00]" strokeWidth={3} />
                  <span className="font-bold">Bank Details Verified</span>
                </div>
                <div className="pt-4 border-t-2 border-[#0A0A0A]">
                  <p className="text-sm text-[#4A4A4A] font-medium">
                    You're all set! Start receiving project opportunities from businesses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  // Onboarding Flow (Steps 1-4)
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2">Creator Onboarding</h1>
          <p className="text-base sm:text-lg text-[#4A4A4A] font-medium">Complete your profile to start receiving projects</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <StepIndicator step={1} label="Basic Info" completed={currentStep > 1} active={currentStep === 1} />
            <div className="flex-1 h-1 bg-[#0A0A0A] mx-2"></div>
            <StepIndicator step={2} label="Social Verify" completed={currentStep > 2} active={currentStep === 2} />
            <div className="flex-1 h-1 bg-[#0A0A0A] mx-2"></div>
            <StepIndicator step={3} label="Bank Details" completed={currentStep > 3} active={currentStep === 3} />
            <div className="flex-1 h-1 bg-[#0A0A0A] mx-2"></div>
            <StepIndicator step={4} label="Approval" completed={currentStep > 4} active={currentStep === 4} />
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <form onSubmit={handleBasicInfoSubmit} className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-2">Welcome, Creator!</h2>
            <p className="text-base text-[#4A4A4A] font-medium mb-8">Let's set up your profile</p>
            
            <div className="space-y-6">
              <div>
                <label className="block font-bold mb-2">Full Name *</label>
                <Input 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="border-2 border-[#0A0A0A] h-12" 
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block font-bold mb-2">Email Address *</label>
                <Input 
                  required 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  className="border-2 border-[#0A0A0A] h-12"
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label className="block font-bold mb-2">Mobile Number *</label>
                <Input 
                  required 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  className="border-2 border-[#0A0A0A] h-12"
                  placeholder="+91 98765 43210"
                />
              </div>
              
              <div>
                <label className="block font-bold mb-2">Bio</label>
                <Textarea 
                  value={formData.bio} 
                  onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                  className="border-2 border-[#0A0A0A] min-h-24"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">City</label>
                  <Input 
                    value={formData.city} 
                    onChange={(e) => setFormData({...formData, city: e.target.value})} 
                    className="border-2 border-[#0A0A0A] h-12"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">District</label>
                  <Input 
                    value={formData.district} 
                    onChange={(e) => setFormData({...formData, district: e.target.value})} 
                    className="border-2 border-[#0A0A0A] h-12"
                    placeholder="Andheri"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold text-lg py-6 transition-all">
                Continue <ArrowRight className="w-5 h-5 ml-2" strokeWidth={3} />
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Social Verification */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-2">Verify Your Social Accounts</h2>
              <p className="text-base text-[#4A4A4A] font-medium mb-8">Connect your Instagram or YouTube to get verified</p>
              
              <SocialVerificationCard />
            </div>

            <div className="flex gap-4">
              <Button onClick={() => setCurrentStep(1)} className="flex-1 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
              </Button>
              <Button onClick={() => setCurrentStep(3)} className="flex-1 bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold">
                Skip for Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Bank Details */}
        {currentStep === 3 && creatorId && (
          <div className="space-y-6">
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-2">Add Bank Details</h2>
              <p className="text-base text-[#4A4A4A] font-medium mb-8">Required to receive payments from projects</p>
              
              <BankDetailsForm creatorId={creatorId} onSuccess={() => setCurrentStep(4)} />
            </div>

            <Button onClick={() => setCurrentStep(2)} className="w-full bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold">
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </Button>
          </div>
        )}

        {/* Step 4: Waiting for Admin Approval */}
        {currentStep === 4 && (
          <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-12 text-center">
            <Clock className="w-20 h-20 mx-auto mb-6" strokeWidth={2} />
            <h2 className="text-3xl font-black mb-4">Pending Admin Approval</h2>
            <p className="text-base font-medium mb-6">Your profile is being reviewed by our admin team.</p>
            <p className="text-base font-bold mb-8">Creator ID: {creatorId}</p>
            
            <div className="bg-white border-2 border-[#0A0A0A] rounded-lg p-6 mb-8 text-left">
              <h3 className="text-xl font-bold mb-4">What's Next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#4A4A4A] mt-0.5 flex-shrink-0" strokeWidth={3} />
                  <span className="font-bold">Admin will review your profile</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#4A4A4A] mt-0.5 flex-shrink-0" strokeWidth={3} />
                  <span className="font-bold">You'll receive email notification once approved</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#4A4A4A] mt-0.5 flex-shrink-0" strokeWidth={3} />
                  <span className="font-bold">Access full dashboard and start receiving projects</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/')} className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold">
                Go to Home
              </Button>
              <Button onClick={() => window.location.reload()} className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold">
                Refresh Status
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard;
