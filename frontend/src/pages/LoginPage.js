import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Briefcase, Shield, UserCheck } from 'lucide-react';
import { Button } from '../components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LoginPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();

  const roleConfig = {
    admin: {
      title: 'Admin Login',
      subtitle: 'Manage platform, approve creators, handle disputes',
      color: 'bg-[#FFE57F]',
      icon: Shield,
      features: [
        'Approve creators',
        'Manage users',
        'Resolve disputes',
        'View analytics'
      ]
    },
    business: {
      title: 'Business Login',
      subtitle: 'Find and collaborate with content creators',
      color: 'bg-[#C6A2FF]',
      icon: Briefcase,
      features: [
        'Search verified creators',
        'Access contact info',
        'Create projects',
        'Chat with creators'
      ]
    },
    creator: {
      title: 'Creator Login',
      subtitle: 'Showcase your work and get opportunities',
      color: 'bg-[#B4F8C8]',
      icon: UserCheck,
      features: [
        'Create profile',
        'Verify accounts',
        'Receive projects',
        'Get paid securely'
      ]
    }
  };

  const config = roleConfig[role] || roleConfig.business;
  const Icon = config.icon;

  const handleLogin = () => {
    // Store intended role in sessionStorage to use after auth
    sessionStorage.setItem('intended_role', role);
    
    const redirectUrl = window.location.origin + `/auth-callback?role=${role}`;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-12 h-12" strokeWidth={3} />
            <h1 className="text-4xl font-black tracking-tight">Creabase</h1>
          </div>
        </div>

        {/* Login Card */}
        <div className={`${config.color} border-2 border-[#0A0A0A] shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8 md:p-12`}>
          <div className="text-center mb-8">
            <div className="bg-white border-2 border-[#0A0A0A] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Icon className="w-10 h-10" strokeWidth={3} />
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-3">{config.title}</h2>
            <p className="text-lg font-medium text-[#4A4A4A]">{config.subtitle}</p>
          </div>

          {/* Features List */}
          <div className="bg-white/50 border-2 border-[#0A0A0A] rounded-lg p-6 mb-8">
            <h3 className="text-xl font-black mb-4">What you can do:</h3>
            <ul className="space-y-3">
              {config.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 font-bold">
                  <span className="text-2xl">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            className="w-full bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold text-lg py-6 transition-all"
          >
            Login / Sign Up as {role.charAt(0).toUpperCase() + role.slice(1)}
          </Button>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm font-bold underline hover:text-[#0A0A0A] transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
