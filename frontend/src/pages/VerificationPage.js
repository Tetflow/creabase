import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Youtube, Instagram, Check, Copy } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const VerificationPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState('');
  const [handle, setHandle] = useState('');
  const [creatorId, setCreatorId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);

  const initiateVerification = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/verification/initiate`,
        { creator_id: creatorId, platform, handle },
        { withCredentials: true }
      );
      setVerificationCode(response.data.verification_code);
      setVerificationId(response.data.verification_id);
      setStep(2);
    } catch (error) {
      alert('Failed to initiate verification');
    } finally {
      setLoading(false);
    }
  };

  const verifyAccount = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/verification/${verificationId}/verify`,
        {},
        { withCredentials: true }
      );
      const statsMessage = platform === 'youtube' 
        ? `Subscribers: ${response.data.stats.subscribers}`
        : `Followers: ${response.data.stats.followers}`;
      alert(`Verification successful! ${statsMessage}`);
      navigate('/creator-dashboard');
    } catch (error) {
      alert('Verification failed. Make sure the code is in your bio.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(verificationCode);
    alert('Code copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <nav className="sticky top-0 z-50 bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Users className="w-8 h-8" strokeWidth={3} />
          <h1 className="text-3xl font-black tracking-tight">Creabase Verification</h1>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {step === 1 && (
          <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8">
            <h2 className="text-3xl font-black mb-6">Verify Your Account</h2>
            <p className="text-lg mb-8">Verify your YouTube or Instagram account to build trust with businesses.</p>

            <div className="space-y-6">
              <div>
                <label className="block font-bold mb-2">Creator ID</label>
                <Input
                  value={creatorId}
                  onChange={(e) => setCreatorId(e.target.value)}
                  placeholder="Your creator ID"
                  className="border-2 border-[#0A0A0A]"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Platform</label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => setPlatform('youtube')}
                    className={`${platform === 'youtube' ? 'bg-[#FF9B9B]' : 'bg-white'} border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold h-20`}
                  >
                    <Youtube className="w-6 h-6 mr-2" />
                    YouTube
                  </Button>
                  <Button
                    onClick={() => setPlatform('instagram')}
                    className={`${platform === 'instagram' ? 'bg-[#B4F8C8]' : 'bg-white'} border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold h-20`}
                  >
                    <Instagram className="w-6 h-6 mr-2" />
                    Instagram
                  </Button>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-2">Channel/Account Handle</label>
                <Input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder={platform === 'youtube' ? '@yourchannel' : '@yourusername'}
                  className="border-2 border-[#0A0A0A]"
                />
              </div>

              <Button
                onClick={initiateVerification}
                disabled={!platform || !handle || !creatorId || loading}
                className="w-full bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold text-lg py-6 transition-all"
              >
                {loading ? 'Processing...' : 'Start Verification'}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-block bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-full p-4 mb-4">
                <Check className="w-12 h-12" strokeWidth={3} />
              </div>
              <h2 className="text-3xl font-black mb-4">Verification Code Generated</h2>
              <p className="text-lg">Add this code to your {platform} bio/description</p>
            </div>

            <div className="bg-[#FAFAFA] border-2 border-[#0A0A0A] rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <code className="text-3xl font-black tracking-wider">{verificationCode}</code>
                <Button
                  onClick={copyCode}
                  className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="bg-[#C6A2FF] border-2 border-[#0A0A0A] rounded-full w-8 h-8 flex items-center justify-center font-black flex-shrink-0">1</div>
                <p className="font-bold pt-1">Copy the verification code above</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-[#C6A2FF] border-2 border-[#0A0A0A] rounded-full w-8 h-8 flex items-center justify-center font-black flex-shrink-0">2</div>
                <p className="font-bold pt-1">Add it to your {platform} bio/channel description</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-[#C6A2FF] border-2 border-[#0A0A0A] rounded-full w-8 h-8 flex items-center justify-center font-black flex-shrink-0">3</div>
                <p className="font-bold pt-1">Click Verify below (we will check your account automatically)</p>
              </div>
            </div>

            <Button
              onClick={verifyAccount}
              disabled={loading}
              className="w-full bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold text-lg py-6 transition-all"
            >
              {loading ? 'Verifying...' : 'Verify My Account'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;
