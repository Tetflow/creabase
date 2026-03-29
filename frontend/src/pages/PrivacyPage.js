import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';

const PrivacyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <nav className="sticky top-0 z-50 bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Button
            onClick={() => navigate('/')}
            className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={3} />
            Back
          </Button>
          <Shield className="w-8 h-8" strokeWidth={3} />
          <h1 className="text-3xl font-black tracking-tight">Privacy Policy</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8">
          <h2 className="text-3xl font-black mb-6">Privacy Policy</h2>
          <p className="text-sm text-[#4A4A4A] mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6">
            <section>
              <h3 className="text-2xl font-bold mb-3">1. Information We Collect</h3>
              <p className="text-[#4A4A4A] font-medium mb-2"><strong>Personal Information:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-[#4A4A4A] font-medium mb-4">
                <li>Name, email, phone number</li>
                <li>Google OAuth profile data</li>
                <li>Social media handles (Instagram, YouTube)</li>
                <li>Bank account details (for creators)</li>
                <li>Payment transaction history</li>
              </ul>
              <p className="text-[#4A4A4A] font-medium mb-2"><strong>Usage Data:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-[#4A4A4A] font-medium">
                <li>Search queries and browsing history</li>
                <li>Chat messages and project communications</li>
                <li>Device and browser information</li>
                <li>IP address and location data</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-3">2. How We Use Your Information</h3>
              <ul className="list-disc list-inside space-y-2 text-[#4A4A4A] font-medium">
                <li>Facilitate creator-business connections</li>
                <li>Process payments and subscriptions</li>
                <li>Verify social media accounts</li>
                <li>Send transactional emails (project updates, payments)</li>
                <li>Improve platform features and user experience</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-3">3. Data Sharing</h3>
              <p className="text-[#4A4A4A] font-medium mb-2">We share your data only in these cases:</p>
              <ul className="list-disc list-inside space-y-2 text-[#4A4A4A] font-medium">
                <li><strong>With other users:</strong> Contact info shared only with subscribed businesses</li>
                <li><strong>Payment processors:</strong> Cashfree for transaction processing</li>
                <li><strong>Email service:</strong> SendGrid/Resend for notifications</li>
                <li><strong>Legal compliance:</strong> When required by law enforcement</li>
              </ul>
              <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-lg p-4 my-4">
                <p className="font-bold">⚠️ We NEVER sell your personal data to third parties.</p>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-3">4. Data Security</h3>
              <p className="text-[#4A4A4A] font-medium mb-2">We implement industry-standard security measures:</p>
              <ul className="list-disc list-inside space-y-2 text-[#4A4A4A] font-medium">
                <li>SSL/TLS encryption for all data transmission</li>
                <li>Encrypted storage for bank details</li>
                <li>Regular security audits</li>
                <li>Access controls and authentication</li>
                <li>Secure payment gateway (PCI DSS compliant)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-3">5. Your Rights</h3>
              <p className="text-[#4A4A4A] font-medium mb-2">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-[#4A4A4A] font-medium">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request data deletion</li>
                <li>Export your data</li>
                <li>Opt-out of marketing emails</li>
                <li>Withdraw consent anytime</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-3">6. Cookies & Tracking</h3>
              <p className="text-[#4A4A4A] font-medium">
                We use cookies for authentication, preferences, and analytics. You can disable cookies in your browser, but some features may not work.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-3">7. Data Retention</h3>
              <p className="text-[#4A4A4A] font-medium">
                We retain your data as long as your account is active. After deletion, we keep transaction records for 7 years for legal/tax compliance.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-3">8. Children's Privacy</h3>
              <p className="text-[#4A4A4A] font-medium">
                Creabase is not intended for users under 18. We don't knowingly collect data from minors.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-3">9. Changes to Privacy Policy</h3>
              <p className="text-[#4A4A4A] font-medium">
                We may update this policy. Major changes will be notified via email. Continued use implies acceptance.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-3">10. Contact Us</h3>
              <p className="text-[#4A4A4A] font-medium">
                For privacy concerns or data requests, email: <strong>privacy@creabase.com</strong>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;