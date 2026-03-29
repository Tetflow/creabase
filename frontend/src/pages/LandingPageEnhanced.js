import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Instagram, Youtube, Users, TrendingUp, Lock, SlidersHorizontal, 
  ChevronDown, ChevronUp, CheckCircle, Star, ArrowRight, Shield,
  Zap, BarChart3, MessageCircle, DollarSign, Globe, Award, Target
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LandingPageEnhanced = () => {
  const navigate = useNavigate();
  const [creators, setCreators] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [minFollowers, setMinFollowers] = useState('');
  const [maxFollowers, setMaxFollowers] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCreators();
  }, [selectedPlatform, selectedLanguage, selectedIndustry, selectedCity, selectedDistrict]);

  const fetchCreators = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedPlatform && selectedPlatform !== 'all') params.append('platform', selectedPlatform);
      if (selectedLanguage && selectedLanguage !== 'all') params.append('language', selectedLanguage);
      if (selectedIndustry && selectedIndustry !== 'all') params.append('industry', selectedIndustry);
      if (selectedCity) params.append('city', selectedCity);
      if (selectedDistrict) params.append('district', selectedDistrict);
      if (minFollowers) params.append('min_followers', minFollowers);
      if (maxFollowers) params.append('max_followers', maxFollowers);

      const response = await axios.get(`${BACKEND_URL}/api/creators?${params.toString()}`);
      setCreators(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch creators:', error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchCreators();
  };

  const handleLogin = (role) => {
    navigate(`/login/${role}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#C6A2FF] via-[#B4F8C8] to-[#FFE57F] border-b-4 border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block bg-[#0A0A0A] text-white px-4 py-2 rounded-full border-2 border-[#0A0A0A] font-bold text-sm">
                🚀 India's #1 Creator Marketplace
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight">
                Connect with
                <span className="block text-[#7C3AED]">Verified Creators</span>
              </h1>
              
              <p className="text-xl sm:text-2xl font-bold text-[#4A4A4A] leading-relaxed">
                Find the perfect influencers for your brand. Verified creators on Instagram & YouTube ready to collaborate.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => handleLogin('business')}
                  className="bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold text-lg px-8 py-6 transition-all"
                >
                  Find Creators <ArrowRight className="w-5 h-5 ml-2" strokeWidth={3} />
                </Button>
                <Button
                  onClick={() => handleLogin('creator')}
                  className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold text-lg px-8 py-6 transition-all"
                >
                  Join as Creator
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <p className="text-3xl sm:text-4xl font-black">500+</p>
                  <p className="text-sm font-bold text-[#4A4A4A]">Verified Creators</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-black">10K+</p>
                  <p className="text-sm font-bold text-[#4A4A4A]">Projects Done</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-black">98%</p>
                  <p className="text-sm font-bold text-[#4A4A4A]">Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="bg-white border-4 border-[#0A0A0A] shadow-[12px_12px_0px_0px_rgba(10,10,10,1)] rounded-3xl overflow-hidden">
                <img 
                  src="https://images.pexels.com/photos/7514814/pexels-photo-7514814.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" 
                  alt="Content Creator" 
                  className="w-full h-[400px] object-cover"
                />
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-full p-3">
                    <TrendingUp className="w-6 h-6" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-2xl font-black">₹50L+</p>
                    <p className="text-sm font-bold">Paid to Creators</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white border-b-2 border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Why Choose <span className="text-[#7C3AED]">Creabase</span>?
            </h2>
            <p className="text-xl font-bold text-[#4A4A4A] max-w-2xl mx-auto">
              Everything you need to run successful influencer campaigns
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8 hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 transition-all">
              <div className="bg-white border-2 border-[#0A0A0A] rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Shield className="w-8 h-8" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black mb-3">Verified Creators</h3>
              <p className="text-base font-bold text-[#4A4A4A]">
                All creators are verified through Instagram & YouTube OAuth. Work with authentic influencers only.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#B4F8C8] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8 hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 transition-all">
              <div className="bg-white border-2 border-[#0A0A0A] rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Lock className="w-8 h-8" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black mb-3">Secure Escrow</h3>
              <p className="text-base font-bold text-[#4A4A4A]">
                Your payments are held in secure escrow until work is approved. Safe for both parties.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8 hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 transition-all">
              <div className="bg-white border-2 border-[#0A0A0A] rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black mb-3">Real Analytics</h3>
              <p className="text-base font-bold text-[#4A4A4A]">
                Track campaign performance, engagement rates, and ROI with detailed analytics dashboards.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#FFB4B4] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8 hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 transition-all">
              <div className="bg-white border-2 border-[#0A0A0A] rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <MessageCircle className="w-8 h-8" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black mb-3">Direct Chat</h3>
              <p className="text-base font-bold text-[#4A4A4A]">
                Communicate directly with creators. No middlemen, no confusion. Just simple, direct messaging.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#FAFAFA] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8 hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 transition-all">
              <div className="bg-white border-2 border-[#0A0A0A] rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Zap className="w-8 h-8" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black mb-3">Fast Matching</h3>
              <p className="text-base font-bold text-[#4A4A4A]">
                AI-powered search finds the perfect creators for your niche in seconds. Filter by followers, engagement & more.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8 hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 transition-all">
              <div className="bg-[#C6A2FF] border-2 border-[#0A0A0A] rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Award className="w-8 h-8" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black mb-3">Dispute Protection</h3>
              <p className="text-base font-bold text-[#4A4A4A]">
                Fair dispute resolution by our admin team. Get refunds or payouts based on evidence submitted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#FAFAFA] border-b-2 border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              How It <span className="text-[#7C3AED]">Works</span>
            </h2>
            <p className="text-xl font-bold text-[#4A4A4A]">
              Get started in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8">
                <div className="absolute -top-6 -left-6 bg-[#C6A2FF] border-2 border-[#0A0A0A] rounded-full w-16 h-16 flex items-center justify-center">
                  <span className="text-3xl font-black">1</span>
                </div>
                <div className="mt-4">
                  <img 
                    src="https://images.unsplash.com/photo-1615540122272-eb3eae775bb0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxjb250ZW50JTIwY3JlYXRvciUyMGluZmx1ZW5jZXIlMjB3b3Jrc3BhY2V8ZW58MHx8fHwxNzc0NzcxMzY4fDA&ixlib=rb-4.1.0&q=85"
                    alt="Search Creators"
                    className="w-full h-48 object-cover rounded-lg border-2 border-[#0A0A0A] mb-6"
                  />
                  <h3 className="text-2xl font-black mb-3">Search Creators</h3>
                  <p className="text-base font-bold text-[#4A4A4A]">
                    Browse verified creators by niche, followers, location & engagement rate.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8">
                <div className="absolute -top-6 -left-6 bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-full w-16 h-16 flex items-center justify-center">
                  <span className="text-3xl font-black">2</span>
                </div>
                <div className="mt-4">
                  <img 
                    src="https://images.unsplash.com/photo-1590650589327-3f67c43ad8a2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHw0fHxidXNpbmVzcyUyMHRlYW0lMjBjb2xsYWJvcmF0aW9uJTIwbWVldGluZ3xlbnwwfHx8fDE3NzQ3NzEzNzZ8MA&ixlib=rb-4.1.0&q=85"
                    alt="Create Project"
                    className="w-full h-48 object-cover rounded-lg border-2 border-[#0A0A0A] mb-6"
                  />
                  <h3 className="text-2xl font-black mb-3">Create Project</h3>
                  <p className="text-base font-bold text-[#4A4A4A]">
                    Send project details & budget. Payment held safely in escrow until work is approved.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8">
                <div className="absolute -top-6 -left-6 bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-full w-16 h-16 flex items-center justify-center">
                  <span className="text-3xl font-black">3</span>
                </div>
                <div className="mt-4">
                  <img 
                    src="https://images.pexels.com/photos/97080/pexels-photo-97080.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                    alt="Track Results"
                    className="w-full h-48 object-cover rounded-lg border-2 border-[#0A0A0A] mb-6"
                  />
                  <h3 className="text-2xl font-black mb-3">Track Results</h3>
                  <p className="text-base font-bold text-[#4A4A4A]">
                    Monitor campaign performance with real-time analytics. Approve & release payment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filters - Existing Creator Discovery */}
      <section className="py-20 bg-white border-b-2 border-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Discover <span className="text-[#7C3AED]">Creators</span>
            </h2>
            <p className="text-xl font-bold text-[#4A4A4A]">
              Find the perfect match for your brand
            </p>
          </div>

          {/* Search & Filters */}
          <div className="bg-white border-2 border-[#0A0A0A] shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6 md:p-8 mb-12">
            {/* Search bar + filter toggle */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <Input
                  data-testid="search-input"
                  placeholder="Search creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="border-2 border-[#0A0A0A] focus:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] focus:-translate-y-1 transition-all h-12"
                />
              </div>
              <Button
                data-testid="search-button"
                onClick={handleSearch}
                className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold h-12 px-4 transition-all"
              >
                <Search className="w-5 h-5" strokeWidth={3} />
              </Button>
              <Button
                data-testid="toggle-filters-button"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold h-12 px-4 transition-all"
              >
                <SlidersHorizontal className="w-5 h-5" strokeWidth={3} />
                <span className="ml-2 hidden sm:inline">Filters</span>
              </Button>
            </div>

            {/* Filter count badge */}
            {!showFilters && (selectedPlatform || selectedLanguage || selectedIndustry || selectedCity || selectedDistrict || minFollowers || maxFollowers) && (
              <button 
                onClick={() => setShowFilters(true)}
                className="mb-4 text-sm text-[#7C3AED] font-bold underline"
              >
                {[selectedPlatform, selectedLanguage, selectedIndustry, selectedCity, selectedDistrict, minFollowers, maxFollowers].filter(Boolean).length} filters active - click to edit
              </button>
            )}

            {/* Advanced Filters - Hidden by default */}
            <div className={`${showFilters ? 'block' : 'hidden'} space-y-4 animate-slideDown`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-black">Advanced Filters</h3>
                <Button
                  onClick={() => setShowFilters(false)}
                  className="bg-white border-2 border-[#0A0A0A] p-2 h-auto"
                >
                  <ChevronUp className="w-4 h-4" strokeWidth={3} />
                </Button>
              </div>

              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold mb-2 text-sm">Platform</label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger className="border-2 border-[#0A0A0A]">
                      <SelectValue placeholder="All Platforms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block font-bold mb-2 text-sm">Language</label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="border-2 border-[#0A0A0A]">
                      <SelectValue placeholder="All Languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                      <SelectItem value="tamil">Tamil</SelectItem>
                      <SelectItem value="telugu">Telugu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block font-bold mb-2 text-sm">Industry</label>
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger className="border-2 border-[#0A0A0A]">
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="tech">Tech</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block font-bold mb-2 text-sm">City</label>
                  <Input
                    placeholder="e.g., Mumbai"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="border-2 border-[#0A0A0A]"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2 text-sm">Min Followers</label>
                  <Input
                    type="number"
                    placeholder="e.g., 10000"
                    value={minFollowers}
                    onChange={(e) => setMinFollowers(e.target.value)}
                    className="border-2 border-[#0A0A0A]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2 text-sm">Max Followers</label>
                  <Input
                    type="number"
                    placeholder="e.g., 100000"
                    value={maxFollowers}
                    onChange={(e) => setMaxFollowers(e.target.value)}
                    className="border-2 border-[#0A0A0A]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Creator Cards */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-16 h-16 border-4 border-[#0A0A0A] border-t-[#C6A2FF] rounded-full animate-spin mb-4"></div>
              <p className="text-xl font-bold">Loading creators...</p>
            </div>
          ) : creators.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl font-black mb-4">No creators found</p>
              <p className="text-lg font-bold text-[#4A4A4A]">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {creators.slice(0, 6).map((creator) => (
                <div 
                  key={creator.creator_id}
                  onClick={() => navigate(`/creator/${creator.creator_id}`)}
                  className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 rounded-xl overflow-hidden cursor-pointer transition-all"
                >
                  {creator.profile_image && (
                    <img 
                      src={creator.profile_image} 
                      alt={creator.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-2xl font-black mb-2">{creator.name}</h3>
                    {creator.bio && (
                      <p className="text-sm font-bold text-[#4A4A4A] mb-4 line-clamp-2">{creator.bio}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {creator.platforms?.includes('instagram') && (
                        <div className="bg-[#FFB4B4] border-2 border-[#0A0A0A] px-3 py-1 rounded-full flex items-center gap-2">
                          <Instagram className="w-4 h-4" strokeWidth={3} />
                          <span className="font-bold text-sm">{creator.instagram_followers?.toLocaleString() || '0'}</span>
                        </div>
                      )}
                      {creator.platforms?.includes('youtube') && (
                        <div className="bg-[#FFE57F] border-2 border-[#0A0A0A] px-3 py-1 rounded-full flex items-center gap-2">
                          <Youtube className="w-4 h-4" strokeWidth={3} />
                          <span className="font-bold text-sm">{creator.youtube_subscribers?.toLocaleString() || '0'}</span>
                        </div>
                      )}
                    </div>

                    {creator.industry && creator.industry.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {creator.industry.slice(0, 2).map((ind, idx) => (
                          <span key={idx} className="bg-[#C6A2FF] border-2 border-[#0A0A0A] px-3 py-1 rounded-full text-xs font-bold uppercase">
                            {ind}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {creators.length > 6 && (
            <div className="text-center mt-12">
              <Button
                onClick={() => handleLogin('business')}
                className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold text-lg px-8 py-6 transition-all"
              >
                View All Creators <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#C6A2FF] to-[#7C3AED] border-b-2 border-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-6 text-white">
            Ready to Get Started?
          </h2>
          <p className="text-xl font-bold text-white/90 mb-8">
            Join thousands of brands and creators already using Creabase
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => handleLogin('business')}
              className="bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold text-lg px-8 py-6 transition-all"
            >
              Start Hiring Creators
            </Button>
            <Button
              onClick={() => handleLogin('creator')}
              className="bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] hover:-translate-y-1 font-bold text-lg px-8 py-6 transition-all"
            >
              Join as Creator
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <img src="/logo.svg" alt="Creabase" className="h-10 mb-4 brightness-0 invert" />
              <p className="font-bold text-white/70">
                India's premier content creator marketplace connecting brands with verified influencers.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-black text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="font-bold text-white/70 hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="font-bold text-white/70 hover:text-white transition-colors">How It Works</a></li>
                <li><button onClick={() => navigate('/pricing')} className="font-bold text-white/70 hover:text-white transition-colors">Pricing</button></li>
              </ul>
            </div>

            {/* For Businesses */}
            <div>
              <h4 className="font-black text-lg mb-4">For Businesses</h4>
              <ul className="space-y-2">
                <li><button onClick={() => handleLogin('business')} className="font-bold text-white/70 hover:text-white transition-colors">Find Creators</button></li>
                <li><button onClick={() => handleLogin('business')} className="font-bold text-white/70 hover:text-white transition-colors">Create Campaign</button></li>
                <li><button onClick={() => handleLogin('business')} className="font-bold text-white/70 hover:text-white transition-colors">View Analytics</button></li>
              </ul>
            </div>

            {/* For Creators */}
            <div>
              <h4 className="font-black text-lg mb-4">For Creators</h4>
              <ul className="space-y-2">
                <li><button onClick={() => handleLogin('creator')} className="font-bold text-white/70 hover:text-white transition-colors">Join Platform</button></li>
                <li><button onClick={() => handleLogin('creator')} className="font-bold text-white/70 hover:text-white transition-colors">Browse Projects</button></li>
                <li><button onClick={() => handleLogin('creator')} className="font-bold text-white/70 hover:text-white transition-colors">Get Verified</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="font-bold text-white/70 text-sm">
                © 2025 Creabase. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="#" className="font-bold text-white/70 hover:text-white transition-colors text-sm">Privacy Policy</a>
                <a href="#" className="font-bold text-white/70 hover:text-white transition-colors text-sm">Terms of Service</a>
                <a href="#" className="font-bold text-white/70 hover:text-white transition-colors text-sm">Contact Us</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageEnhanced;
