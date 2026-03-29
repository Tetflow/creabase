import React, { useState, useEffect } from 'react';
import { Crown, Check, Loader2, Sparkles, TrendingUp, Star, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PremiumSubscriptionCard = () => {
  const [plans, setPlans] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchPlans();
    fetchSubscriptionStatus();
    
    // Check for payment callback
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    
    if (payment) {
      // payment parameter contains the order_id
      pollPaymentStatus(payment);
    }
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/premium/plans`);
      setPlans(response.data.plans);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/creators/premium/my-subscription`,
        { withCredentials: true }
      );
      setSubscription(response.data);
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    }
  };

  const handleSubscribe = async (planType) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const origin = window.location.origin;
      const response = await axios.post(
        `${BACKEND_URL}/api/creators/premium/checkout`,
        null,
        {
          params: {
            plan_type: planType,
            origin_url: origin
          },
          withCredentials: true
        }
      );
      
      // Load Cashfree SDK and initiate payment
      const { payment_session_id, order_id } = response.data;
      
      // Cashfree Checkout using SDK
      const cashfree = window.Cashfree({
        mode: "sandbox" // Change to "production" when going live
      });
      
      const checkoutOptions = {
        paymentSessionId: payment_session_id,
        returnUrl: `${origin}/creator-dashboard?tab=premium&payment=${order_id}`,
        notifyUrl: `${origin}/api/cashfree/webhook`
      };
      
      cashfree.checkout(checkoutOptions).then(() => {
        console.log("Payment initiated");
      });
      
    } catch (err) {
      setLoading(false);
      if (err.response?.status === 503) {
        setError('Payment system is currently unavailable. Please try again later.');
      } else {
        setError('Failed to initiate checkout. Please try again.');
      }
    }
  };

  const pollPaymentStatus = async (orderId, attempts = 0) => {
    const maxAttempts = 5;
    setCheckingStatus(true);
    
    if (attempts >= maxAttempts) {
      setCheckingStatus(false);
      setError('Payment verification timed out. Please refresh the page.');
      return;
    }
    
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/creators/premium/status/${orderId}`,
        { withCredentials: true }
      );
      
      if (response.data.payment_status === 'PAID' || response.data.payment_status === 'SUCCESS') {
        setCheckingStatus(false);
        setSuccess('🎉 Premium subscription activated successfully!');
        fetchSubscriptionStatus();
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname + '?tab=premium');
      } else if (response.data.status === 'EXPIRED' || response.data.payment_status === 'CANCELLED') {
        setCheckingStatus(false);
        setError('Payment session expired or cancelled. Please try again.');
        window.history.replaceState({}, document.title, window.location.pathname + '?tab=premium');
      } else {
        // Continue polling
        setTimeout(() => pollPaymentStatus(orderId, attempts + 1), 2000);
      }
    } catch (err) {
      setCheckingStatus(false);
      setError('Failed to verify payment. Please contact support.');
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your premium subscription?')) {
      return;
    }
    
    try {
      await axios.delete(
        `${BACKEND_URL}/api/creators/premium/cancel`,
        { withCredentials: true }
      );
      setSuccess('Premium subscription cancelled successfully.');
      fetchSubscriptionStatus();
    } catch (err) {
      setError('Failed to cancel subscription. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!plans) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" strokeWidth={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black mb-2">Premium Subscription</h2>
        <p className="text-sm text-[#4A4A4A] font-medium">
          Get featured at the top of search results and attract more projects
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
          <Check className="h-4 w-4" strokeWidth={3} />
          <AlertDescription className="font-bold">{success}</AlertDescription>
        </Alert>
      )}

      {checkingStatus && (
        <Alert className="bg-[#FFE57F] border-2 border-[#0A0A0A]">
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={3} />
          <AlertDescription className="font-bold">Verifying your payment...</AlertDescription>
        </Alert>
      )}

      {/* Current Subscription Status */}
      {subscription && subscription.is_premium && (
        <div className="bg-gradient-to-br from-[#FFE57F] to-[#FFD700] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-8 h-8" strokeWidth={3} />
            <h3 className="text-2xl font-black">Active Premium Subscription</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-[#4A4A4A] font-medium">Plan</p>
              <p className="text-xl font-black capitalize">{subscription.premium_plan}</p>
            </div>
            <div>
              <p className="text-sm text-[#4A4A4A] font-medium">Expires On</p>
              <p className="text-xl font-black">{formatDate(subscription.premium_until)}</p>
            </div>
            <div>
              <p className="text-sm text-[#4A4A4A] font-medium">Days Remaining</p>
              <p className="text-xl font-black">{subscription.days_remaining} days</p>
            </div>
          </div>

          <Button
            onClick={handleCancelSubscription}
            className="bg-[#FF9B9B] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
          >
            Cancel Subscription
          </Button>
        </div>
      )}

      {/* Premium Benefits */}
      <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5" strokeWidth={3} />
          Premium Benefits
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-[#B4F8C8] p-2 rounded-lg border-2 border-[#0A0A0A]">
              <TrendingUp className="w-4 h-4" strokeWidth={3} />
            </div>
            <div>
              <p className="font-black">Top Search Position</p>
              <p className="text-sm text-[#4A4A4A] font-medium">Appear first in search results</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-[#FFE57F] p-2 rounded-lg border-2 border-[#0A0A0A]">
              <Crown className="w-4 h-4" strokeWidth={3} />
            </div>
            <div>
              <p className="font-black">Premium Badge</p>
              <p className="text-sm text-[#4A4A4A] font-medium">Stand out with premium badge</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-[#C6A2FF] p-2 rounded-lg border-2 border-[#0A0A0A]">
              <Star className="w-4 h-4" strokeWidth={3} />
            </div>
            <div>
              <p className="font-black">Featured Listings</p>
              <p className="text-sm text-[#4A4A4A] font-medium">Get highlighted in creator lists</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-[#FFB4B4] p-2 rounded-lg border-2 border-[#0A0A0A]">
              <AlertCircle className="w-4 h-4" strokeWidth={3} />
            </div>
            <div>
              <p className="font-black">Priority Recommendations</p>
              <p className="text-sm text-[#4A4A4A] font-medium">Suggested first to businesses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      {(!subscription || !subscription.is_premium) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Plan */}
          <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6">
            <h3 className="text-2xl font-black mb-4">{plans.monthly.name}</h3>
            <div className="mb-6">
              <span className="text-4xl font-black">₹{plans.monthly.price}</span>
              <span className="text-[#4A4A4A] font-medium">/month</span>
            </div>
            
            <ul className="space-y-3 mb-6">
              {plans.monthly.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#00C851] flex-shrink-0 mt-0.5" strokeWidth={3} />
                  <span className="text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button
              onClick={() => handleSubscribe('monthly')}
              disabled={loading}
              className="w-full bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} />
                  Processing...
                </span>
              ) : (
                'Subscribe Monthly'
              )}
            </Button>
          </div>

          {/* Yearly Plan */}
          <div className="bg-gradient-to-br from-[#FFE57F] to-[#FFD700] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6 relative">
            <div className="absolute -top-3 -right-3 bg-[#00C851] border-2 border-[#0A0A0A] rounded-full px-3 py-1">
              <span className="text-xs font-black text-white">SAVE ₹189</span>
            </div>
            
            <h3 className="text-2xl font-black mb-4">{plans.yearly.name}</h3>
            <div className="mb-6">
              <span className="text-4xl font-black">₹{plans.yearly.price}</span>
              <span className="text-[#4A4A4A] font-medium">/year</span>
              <p className="text-sm font-bold text-[#4A4A4A] mt-1">
                Only ₹{(plans.yearly.price / 12).toFixed(2)}/month
              </p>
            </div>
            
            <ul className="space-y-3 mb-6">
              {plans.yearly.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#00C851] flex-shrink-0 mt-0.5" strokeWidth={3} />
                  <span className="text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button
              onClick={() => handleSubscribe('yearly')}
              disabled={loading}
              className="w-full bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Crown className="w-4 h-4" strokeWidth={3} />
                  Subscribe Yearly
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumSubscriptionCard;
