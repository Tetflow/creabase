import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Users, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleSubscribe = async (planType) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/subscriptions`,
        { plan_type: planType, payment_method: 'upi' },
        { withCredentials: true }
      );

      // Mock activation for demo
      await axios.post(
        `${BACKEND_URL}/api/subscriptions/${response.data.subscription_id}/activate`,
        {},
        { withCredentials: true }
      );

      alert(`Subscription activated! Plan: ${planType}`);
      navigate('/dashboard');
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Please login first');
        handleLogin();
      } else {
        alert('Subscription failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8" strokeWidth={3} />
            <h1 className="text-3xl font-black tracking-tight">Creabase</h1>
          </div>
          <Button
            data-testid="back-button"
            onClick={() => navigate('/')}
            className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={3} />
            Back
          </Button>
        </div>
      </nav>

      {/* Pricing Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black tracking-tighter mb-4">Choose Your Plan</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <div
            data-testid="monthly-plan-card"
            className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Monthly</h3>
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-5xl font-black">₹199</span>
                <span className="text-xl text-[#4A4A4A] font-medium">/month</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-full p-1 mt-1">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
                <p className="font-bold">25 creator contacts per month</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-full p-1 mt-1">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
                <p className="font-bold">Unlimited creator search</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-full p-1 mt-1">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
                <p className="font-bold">Chat with creators</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-full p-1 mt-1">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
                <p className="font-bold">Creator analytics & insights</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-full p-1 mt-1">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
                <p className="font-bold">Cancel anytime</p>
              </div>
            </div>

            <Button
              data-testid="monthly-subscribe-button"
              onClick={() => handleSubscribe('monthly')}
              disabled={loading}
              className="w-full bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold text-lg py-6 transition-all"
            >
              {loading ? 'Processing...' : 'Subscribe Monthly'}
            </Button>
          </div>

          {/* Yearly Plan */}
          <div
            data-testid="yearly-plan-card"
            className="bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8 relative"
          >
            <div className="absolute -top-4 right-8 bg-[#FF9B9B] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] px-4 py-2 rounded-lg">
              <p className="text-xs font-black uppercase">Most Popular</p>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Yearly</h3>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl font-black">₹1,999</span>
                <span className="text-xl text-[#4A4A4A] font-medium">/year</span>
              </div>
              <p className="text-sm font-bold text-[#00AA00]">Save ₹389 (16% off)</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-full p-1 mt-1">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
                <p className="font-bold">25 creator contacts per month</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-full p-1 mt-1">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
                <p className="font-bold">Unlimited creator search</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-full p-1 mt-1">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
                <p className="font-bold">Chat with creators</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-full p-1 mt-1">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
                <p className="font-bold">Creator analytics & insights</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-full p-1 mt-1">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
                <p className="font-bold">Priority support</p>
              </div>
            </div>

            <Button
              data-testid="yearly-subscribe-button"
              onClick={() => handleSubscribe('yearly')}
              disabled={loading}
              className="w-full bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold text-lg py-6 transition-all"
            >
              {loading ? 'Processing...' : 'Subscribe Yearly'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;