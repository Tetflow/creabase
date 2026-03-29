import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, X, Zap, Shield, TrendingUp, Award } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function SubscriptionPage() {
  const [userType, setUserType] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/subscriptions/my-subscription`, {
        withCredentials: true
      });
      setUserType(response.data.user_type);
      setCurrentSubscription(response.data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType) => {
    setSubscribing(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/subscriptions/checkout`,
        { plan_type: planType },
        { withCredentials: true }
      );

      if (response.data.status === 'payment_required') {
        // Redirect to Cashfree
        alert('Insufficient wallet balance. Redirecting to payment gateway...');
        // In production, redirect to Cashfree URL
        window.location.href = response.data.payment_info.redirect_url;
      } else {
        alert('Subscription activated successfully!');
        fetchSubscriptionStatus();
      }
    } catch (error) {
      alert(error.response?.data?.detail || 'Subscription failed');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const isCreator = userType === 'creator';
  const isBusiness = userType === 'business';

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-4">
            {isCreator ? '🎨 Creator Subscription' : '💼 Business Subscription'}
          </h1>
          <p className="text-lg text-gray-700">
            Unlock premium features and grow your presence on Creabase
          </p>
        </div>

        {currentSubscription && currentSubscription.status === 'active' ? (
          <div className="bg-white border-4 border-green-500 rounded-2xl p-8 mb-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Active Subscription ✅</h2>
                <p className="text-gray-700">
                  Plan: <span className="font-bold capitalize">{currentSubscription.plan}</span>
                </p>
                <p className="text-gray-600 text-sm">
                  Renews: {new Date(currentSubscription.expires_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : null}

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Monthly Plan */}
          <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-brutal hover:shadow-brutal-lg transition-all hover:translate-x-1 hover:translate-y-1">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black mb-2">Monthly Plan</h3>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-black">₹199</span>
                <span className="text-xl text-gray-600 ml-2">/month</span>
              </div>
            </div>

            {isCreator ? (
              <div className="space-y-4 mb-8">
                <Feature icon={<TrendingUp />} text="Top page visibility & ranking" />
                <Feature icon={<Award />} text="Verification badge" />
                <Feature icon={<CheckCircle />} text="Tier badges (100/500/1000 projects)" />
                <Feature icon={<Zap />} text="ZERO escrow fee (₹8,820 → ₹10,000)" />
                <Feature icon={<Shield />} text="Priority support" />
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                <Feature icon={<CheckCircle />} text="Chat with creators (unlimited)" />
                <Feature icon={<TrendingUp />} text="View creator analytics (unlimited)" />
                <Feature icon={<Zap />} text="Create & assign projects" />
                <Feature icon={<Award />} text="View creator ratings" />
                <Feature icon={<CheckCircle />} text="25 contacts/month included" />
                <Feature icon={<Shield />} text="Priority support" />
              </div>
            )}

            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={subscribing || (currentSubscription && currentSubscription.status === 'active')}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-black py-4 px-6 rounded-xl border-4 border-black shadow-brutal hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subscribing ? 'Processing...' : 'Subscribe Monthly'}
            </button>
          </div>

          {/* Annual Plan */}
          <div className="bg-gradient-to-br from-orange-400 to-red-400 border-4 border-black rounded-2xl p-8 shadow-brutal-lg hover:shadow-brutal-xl transition-all relative">
            <div className="absolute -top-4 -right-4 bg-green-400 border-4 border-black px-4 py-2 rounded-lg font-black text-sm rotate-12 shadow-brutal">
              SAVE 17%! 🎉
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-black mb-2 text-white">Annual Plan</h3>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-black text-white">₹1,999</span>
                <span className="text-xl text-white/80 ml-2">/year</span>
              </div>
              <p className="text-white/80 text-sm mt-2">₹166/month • Save ₹389</p>
            </div>

            {isCreator ? (
              <div className="space-y-4 mb-8">
                <FeatureWhite icon={<TrendingUp />} text="Top page visibility & ranking" />
                <FeatureWhite icon={<Award />} text="Verification badge" />
                <FeatureWhite icon={<CheckCircle />} text="Tier badges (100/500/1000 projects)" />
                <FeatureWhite icon={<Zap />} text="ZERO escrow fee (save ₹13,680/year!)" />
                <FeatureWhite icon={<Shield />} text="Priority support" />
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                <FeatureWhite icon={<CheckCircle />} text="Chat with creators (unlimited)" />
                <FeatureWhite icon={<TrendingUp />} text="View creator analytics (unlimited)" />
                <FeatureWhite icon={<Zap />} text="Create & assign projects" />
                <FeatureWhite icon={<Award />} text="View creator ratings" />
                <FeatureWhite icon={<CheckCircle />} text="25 contacts/month included" />
                <FeatureWhite icon={<Shield />} text="Priority support" />
              </div>
            )}

            <button
              onClick={() => handleSubscribe('annual')}
              disabled={subscribing || (currentSubscription && currentSubscription.status === 'active')}
              className="w-full bg-white hover:bg-gray-100 text-black font-black py-4 px-6 rounded-xl border-4 border-black shadow-brutal hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subscribing ? 'Processing...' : 'Subscribe Annually'}
            </button>
          </div>
        </div>

        {/* Value Proposition for Creators */}
        {isCreator && (
          <div className="mt-12 bg-green-50 border-4 border-green-500 rounded-2xl p-8">
            <h3 className="text-2xl font-black mb-4">💰 How Much You'll Save</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border-2 border-green-500">
                <p className="text-sm text-gray-600">₹10,000 project/month</p>
                <p className="text-2xl font-bold text-green-600">Save ₹1,180/mo</p>
                <p className="text-xs text-gray-500">Annual savings: ₹14,160</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-green-500">
                <p className="text-sm text-gray-600">₹50,000 projects/month</p>
                <p className="text-2xl font-bold text-green-600">Save ₹5,900/mo</p>
                <p className="text-xs text-gray-500">Annual savings: ₹70,800</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-green-500">
                <p className="text-sm text-gray-600">₹100,000 projects/month</p>
                <p className="text-2xl font-bold text-green-600">Save ₹11,800/mo</p>
                <p className="text-xs text-gray-500">Annual savings: ₹1,41,600</p>
              </div>
            </div>
            <p className="text-center mt-4 text-sm text-gray-700">
              Break-even at just <span className="font-bold">₹2,000/month</span> in projects!
            </p>
          </div>
        )}

        {/* FAQ or Cancel */}
        {currentSubscription && currentSubscription.status === 'active' && (
          <div className="mt-8 text-center">
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to cancel? You can use features until end of period.')) {
                  try {
                    await axios.post(`${BACKEND_URL}/api/subscriptions/cancel`, {}, { withCredentials: true });
                    alert('Subscription cancelled');
                    fetchSubscriptionStatus();
                  } catch (error) {
                    alert('Failed to cancel subscription');
                  }
                }
              }}
              className="text-red-600 hover:text-red-700 underline"
            >
              Cancel Subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Feature({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-green-500">{icon}</div>
      <span className="text-gray-700">{text}</span>
    </div>
  );
}

function FeatureWhite({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-white">{icon}</div>
      <span className="text-white">{text}</span>
    </div>
  );
}
