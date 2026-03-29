import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

const TermsPage = () => {
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
          <Users className="w-8 h-8" strokeWidth={3} />
          <h1 className="text-3xl font-black tracking-tight">Terms & Conditions</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8">
          <h2 className="text-3xl font-black mb-6">Terms of Service</h2>
          <p className="text-sm text-[#4A4A4A] mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6">
            <section>
              <h3 className="text-2xl font-bold mb-3">1. Acceptance of Terms</h3>
              <p className="text-[#4A4A4A] font-medium">
                By accessing and using Creabase, you accept and agree to be bound by these Terms and Conditions.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-3">2. Platform Services</h3>
              <p className="text-[#4A4A4A] font-medium mb-2">
                Creabase provides a marketplace connecting businesses with content creators on Instagram and YouTube.
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#4A4A4A] font-medium">
                <li>Free creator search and discovery</li>
                <li>Subscription-based contact access (₹199/month or ₹1,999/year)</li>
                <li>Escrow-protected project payments</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-3">3. User Responsibilities</h3>
              <p className="text-[#4A4A4A] font-medium mb-2"><strong>Businesses:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-[#4A4A4A] font-medium mb-4">
                <li>Provide accurate project requirements</li>
                <li>Make timely payments through escrow</li>
                <li>Approve delivered work within 7 days or raise disputes</li>
              </ul>
              <p className="text-[#4A4A4A] font-medium mb-2"><strong>Creators:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-[#4A4A4A] font-medium">
                <li>Verify social media accounts honestly</li>
                <li>Provide accurate bank details for payouts</li>
                <li>Deliver work as agreed in project terms</li>
                <li>Maintain professional communication</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-3">4. Payment Terms</h3>
              <p className="text-[#4A4A4A] font-medium mb-2">
                All payments are processed through Cashfree Payment Gateway with the following fee structure:
              </p>
              <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-lg p-4 my-4">
                <p className="font-bold">For a ₹1,000 project:</p>
                <ul className="space-y-1 font-medium">
                  <li>• Business pays: ₹1,118 (₹1,000 + 10% platform fee + 18% GST)</li>
                  <li>• Creator receives: ₹882 (₹1,000 - 10% platform fee - 18% GST)</li>
                  <li>• Platform earns: ₹236 total</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-3">5. Escrow Protection</h3>
              <p className="text-[#4A4A4A] font-medium">
                All project payments are held in escrow until business approval. Funds are released to creators within 3-5 business days after approval.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-3">6. Dispute Resolution</h3>
              <p className="text-[#4A4A4A] font-medium">
                In case of disagreements, users can raise disputes within the platform. Creabase admin will review and mediate within 7 business days.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-3">7. Refund Policy</h3>
              <ul className="list-disc list-inside space-y-2 text-[#4A4A4A] font-medium">
                <li>Subscription fees are non-refundable</li>
                <li>Project payments refunded if creator doesn't accept within 48 hours</li>
                <li>Disputed payments held until resolution</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-3">8. Prohibited Activities</h3>
              <ul className="list-disc list-inside space-y-2 text-[#4A4A4A] font-medium">
                <li>Fake social media verification</li>
                <li>Direct payment outside escrow system</li>
                <li>Harassment or unprofessional behavior</li>
                <li>Sharing contact information publicly</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-3">9. Account Termination</h3>
              <p className="text-[#4A4A4A] font-medium">
                Creabase reserves the right to suspend or terminate accounts violating these terms without prior notice.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-3">10. Contact</h3>
              <p className="text-[#4A4A4A] font-medium">
                For questions about these terms, contact us at: <strong>legal@creabase.com</strong>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;