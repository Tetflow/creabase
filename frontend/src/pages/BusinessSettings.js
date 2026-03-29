import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, User, Mail, Phone, Building } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const BusinessSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2">Settings</h1>
          <p className="text-base sm:text-lg text-[#4A4A4A] font-medium">Manage your account preferences</p>
        </div>

        {/* Settings Content */}
        <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6" strokeWidth={3} />
            <h2 className="text-2xl font-black">Profile Settings</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block font-bold mb-2 text-sm">Company Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4A4A]" strokeWidth={2} />
                <Input
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
                  type="email"
                  placeholder="email@company.com"
                  className="border-2 border-[#0A0A0A] h-12 pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4A4A]" strokeWidth={2} />
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="border-2 border-[#0A0A0A] h-12 pl-11"
                />
              </div>
            </div>

            <div className="pt-6 border-t-2 border-[#0A0A0A] flex gap-4">
              <Button
                className="bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
              >
                Save Changes
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
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
