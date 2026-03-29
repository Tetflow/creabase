import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import UsageStats from '../components/UsageStats';
import ContactModal from '../components/ContactModal';
import EmptyState from '../components/EmptyState';
import WalletWidget from '../components/WalletWidget';
import { GridSkeleton } from '../components/Skeletons';
import BottomNav from '../components/BottomNav';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [creators, setCreators] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Contact Modal State
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [contactData, setContactData] = useState(null);
  const [usageInfo, setUsageInfo] = useState(null);

  useEffect(() => {
    if (!user) {
      checkAuth();
    } else {
      fetchCreators();
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true
      });
      setUser(response.data);
      fetchCreators();
    } catch (error) {
      navigate('/');
    }
  };

  const fetchCreators = async () => {
    try {
      const params = searchQuery ? `?search=${searchQuery}` : '';
      const response = await axios.get(`${BACKEND_URL}/api/creators${params}`);
      setCreators(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch creators:', error);
      setLoading(false);
    }
  };

  const viewContact = async (creator) => {
    if (user?.subscription_status !== 'active') {
      setSelectedCreator(creator);
      setContactData(null);
      setUsageInfo(null);
      setShowContactModal(true);
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/api/creators/${creator.creator_id}/contact`, {
        withCredentials: true
      });
      
      setSelectedCreator(creator);
      setContactData(response.data);
      setUsageInfo(response.data.usage_info);
      setShowContactModal(true);
      
      // Refresh user data to update usage stats
      const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true });
      setUser(userRes.data);
    } catch (error) {
      if (error.response?.status === 403) {
        setSelectedCreator(creator);
        setContactData(null);
        setShowContactModal(true);
      } else {
        alert('Failed to fetch contact information');
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#0A0A0A] border-t-[#C6A2FF] rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] has-bottom-nav">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2">Business Dashboard</h1>
          <p className="text-base sm:text-lg text-[#4A4A4A] font-medium">Browse and connect with verified creators</p>
        </div>

        {/* Wallet & Usage Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <WalletWidget userRole={user.role} />
          </div>
          <div className="lg:col-span-2">
            {user?.subscription_status === 'active' && (
              <UsageStats user={user} />
            )}
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Find Creators</h2>
          <div className="flex gap-4">
            <Input
              data-testid="dashboard-search-input"
              placeholder="Search creators by name, bio, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchCreators()}
              className="border-2 border-[#0A0A0A] focus:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] focus:-translate-y-1 transition-all"
            />
            <Button
              data-testid="dashboard-search-button"
              onClick={fetchCreators}
              className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
            >
              <Search className="w-5 h-5" strokeWidth={3} />
            </Button>
          </div>
        </div>

        {/* Creator Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Available Creators</h2>
          {loading ? (
            <GridSkeleton count={6} />
          ) : creators.length === 0 ? (
            <EmptyState
              type="creators"
              title="No creators found"
              description="Try adjusting your search filters or check back later for new creators"
              actionLabel="Clear Search"
              onAction={() => {
                setSearchQuery('');
                fetchCreators();
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creators.map((creator) => (
                <div
                  key={creator.creator_id}
                  data-testid={`dashboard-creator-card-${creator.creator_id}`}
                  className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl overflow-hidden hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 transition-all"
                >
                  {creator.profile_image && (
                    <img
                      src={creator.profile_image}
                      alt={creator.name}
                      className="w-full h-48 object-cover border-b-2 border-[#0A0A0A] cursor-pointer"
                      onClick={() => navigate(`/creator/${creator.creator_id}`)}
                    />
                  )}
                  <div className="p-6">
                    <h3 
                      className="text-xl font-bold mb-2 cursor-pointer hover:text-[#7C3AED] transition-colors"
                      onClick={() => navigate(`/creator/${creator.creator_id}`)}
                    >
                      {creator.name}
                    </h3>
                    <p className="text-sm text-[#4A4A4A] mb-4 line-clamp-2">{creator.bio}</p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {creator.instagram_followers > 0 && (
                        <div className="border-2 border-[#0A0A0A] rounded-lg p-3">
                          <p className="text-xs font-bold uppercase text-[#4A4A4A]">Followers</p>
                          <p className="text-lg font-black">{(creator.instagram_followers / 1000).toFixed(1)}K</p>
                        </div>
                      )}
                      {creator.engagement_rate > 0 && (
                        <div className="border-2 border-[#0A0A0A] rounded-lg p-3">
                          <p className="text-xs font-bold uppercase text-[#4A4A4A]">Engagement</p>
                          <p className="text-lg font-black">{creator.engagement_rate}%</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        data-testid={`view-contact-button-${creator.creator_id}`}
                        onClick={() => viewContact(creator)}
                        className="flex-1 bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                      >
                        {user.subscription_status === 'active' ? 'View Contact' : 'Unlock Contact'}
                      </Button>
                      <Button
                        onClick={() => navigate(`/chat/${creator.creator_id}`)}
                        className="bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                      >
                        <MessageCircle className="w-4 h-4" strokeWidth={3} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false);
          setSelectedCreator(null);
          setContactData(null);
        }}
        creator={selectedCreator}
        contactData={contactData}
        usageInfo={usageInfo}
        onUpgrade={() => {
          setShowContactModal(false);
          navigate('/pricing');
        }}
      />

      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
};

export default Dashboard;
