import React, { useState } from 'react';
import { X, Mail, Phone, Copy, Check, AlertTriangle, CreditCard } from 'lucide-react';
import { Button } from './ui/button';

const ContactModal = ({ isOpen, onClose, creator, contactData, usageInfo, onUpgrade }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = async (text, type) => {
    await navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const hasContact = contactData?.email || contactData?.phone;
  const needsUpgrade = !hasContact && !contactData;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white border-2 border-[#0A0A0A] shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] rounded-xl max-w-md w-full animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-[#0A0A0A]">
          <h2 className="text-2xl font-black">Contact Information</h2>
          <Button
            onClick={onClose}
            className="bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] p-2 h-auto"
          >
            <X className="w-4 h-4" strokeWidth={3} />
          </Button>
        </div>

        {/* Creator Preview */}
        {creator && (
          <div className="p-6 border-b-2 border-[#0A0A0A] bg-[#FAFAFA]">
            <div className="flex items-center gap-4">
              {creator.profile_image && (
                <img
                  src={creator.profile_image}
                  alt={creator.name}
                  className="w-16 h-16 rounded-xl border-2 border-[#0A0A0A] object-cover"
                />
              )}
              <div>
                <h3 className="text-xl font-bold">{creator.name}</h3>
                <p className="text-sm text-[#4A4A4A]">
                  {creator.instagram_followers > 0 && `${(creator.instagram_followers / 1000).toFixed(1)}K followers`}
                  {creator.instagram_followers > 0 && creator.youtube_subscribers > 0 && ' • '}
                  {creator.youtube_subscribers > 0 && `${(creator.youtube_subscribers / 1000).toFixed(1)}K subs`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Details */}
        <div className="p-6">
          {needsUpgrade ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold mb-2">Subscription Required</h3>
              <p className="text-[#4A4A4A] mb-6">
                Upgrade to unlock contact information and connect with creators
              </p>
              <Button
                onClick={onUpgrade}
                className="w-full bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all py-3"
              >
                View Plans
              </Button>
            </div>
          ) : hasContact ? (
            <div className="space-y-4">
              {contactData.email && (
                <div className="flex items-center gap-3 p-4 bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-xl">
                  <Mail className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                  <span className="flex-1 font-medium break-all">{contactData.email}</span>
                  <Button
                    onClick={() => copyToClipboard(contactData.email, 'email')}
                    className="bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] p-2 h-auto"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              )}
              
              {contactData.phone && (
                <div className="flex items-center gap-3 p-4 bg-[#A0E7E5] border-2 border-[#0A0A0A] rounded-xl">
                  <Phone className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                  <span className="flex-1 font-medium">{contactData.phone}</span>
                  <Button
                    onClick={() => copyToClipboard(contactData.phone, 'phone')}
                    className="bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] p-2 h-auto"
                  >
                    {copiedPhone ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              )}

              {/* Usage Info */}
              {usageInfo && (
                <div className="mt-6 p-4 bg-[#FAFAFA] border-2 border-[#0A0A0A] rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-[#4A4A4A]">Monthly Usage</span>
                    <span className="font-bold">
                      {usageInfo.creators_viewed_this_month}/{usageInfo.monthly_limit}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-white border-2 border-[#0A0A0A] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#C6A2FF] transition-all duration-300"
                      style={{ width: `${Math.min((usageInfo.creators_viewed_this_month / usageInfo.monthly_limit) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#4A4A4A] mt-2">
                    {usageInfo.remaining_in_plan} views remaining this month
                  </p>
                  
                  {usageInfo.charged_payg && (
                    <div className="mt-3 p-3 bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" strokeWidth={2} />
                      <span className="text-sm font-bold">
                        Pay-as-you-go: ₹{usageInfo.payg_charge?.toFixed(2)} charged
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-[#4A4A4A]">Contact information not available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {hasContact && (
          <div className="p-6 border-t-2 border-[#0A0A0A] bg-[#FAFAFA]">
            <Button
              onClick={onClose}
              className="w-full bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
            >
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactModal;
