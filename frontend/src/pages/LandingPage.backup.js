import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Instagram, Youtube, Users, TrendingUp, Lock, SlidersHorizontal, ChevronDown, ChevronUp, LogIn } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LandingPage = () => {
  const navigate = useNavigate();
  const [creators, setCreators] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
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
      if (selectedPlatform) params.append('platform', selectedPlatform);
      if (selectedLanguage) params.append('language', selectedLanguage);
      if (selectedIndustry) params.append('industry', selectedIndustry);
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

  const handleLogin = (role = 'business') => {
    navigate(`/login/${role}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <Users className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={3} />
            <h1 className="text-xl sm:text-3xl font-black tracking-tight">Creabase</h1>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              onClick={() => navigate('/pricing')}
              className="hidden sm:inline-flex bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
            >
              Pricing
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all">
                  <LogIn className="w-4 h-4 mr-2" strokeWidth={3} />
                  Login
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-2 border-[#0A0A0A] bg-white">
                <DropdownMenuItem 
                  onClick={() => handleLogin('business')}
                  className="font-bold cursor-pointer"
                >
                  Business Login
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleLogin('creator')}
                  className="font-bold cursor-pointer"
                >
                  Creator Login
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter mb-3 sm:mb-4">
            Find Your Perfect
            <br />
            <span className="bg-[#C6A2FF] px-2 sm:px-4">Content Creator</span>
          </h2>
          <p className="text-base sm:text-lg text-[#4A4A4A] font-medium max-w-2xl mx-auto">
            Connect with top Instagram & YouTube creators for brand collaborations.
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

            {/* Row 1: Platform */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger data-testid="platform-filter" className="border-2 border-[#0A0A0A] h-12 font-bold">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="border-2 border-[#0A0A0A] h-12 font-bold">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="tamil">Tamil</SelectItem>
                  <SelectItem value="telugu">Telugu</SelectItem>
                  <SelectItem value="kannada">Kannada</SelectItem>
                  <SelectItem value="malayalam">Malayalam</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="border-2 border-[#0A0A0A] h-12 font-bold">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="beauty">Beauty</SelectItem>
                  <SelectItem value="food">Food & Cooking</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 2: Location */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                placeholder="City"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="border-2 border-[#0A0A0A] focus:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] h-12"
              />
              <Input
                placeholder="District"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="border-2 border-[#0A0A0A] focus:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] h-12"
              />
              <Input
                type="number"
                placeholder="Min Followers"
                value={minFollowers}
                onChange={(e) => setMinFollowers(e.target.value)}
                className="border-2 border-[#0A0A0A] focus:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] h-12"
              />
              <Input
                type="number"
                placeholder="Max Followers"
                value={maxFollowers}
                onChange={(e) => setMaxFollowers(e.target.value)}
                className="border-2 border-[#0A0A0A] focus:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] h-12"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  handleSearch();
                  setShowFilters(false);
                }}
                className="flex-1 md:flex-none bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold h-12"
              >
                Apply Filters
              </Button>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPlatform('');
                  setSelectedLanguage('');
                  setSelectedIndustry('');
                  setSelectedCity('');
                  setSelectedDistrict('');
                  setMinFollowers('');
                  setMaxFollowers('');
                }}
                className="flex-1 md:flex-none bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold h-12"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>

        {/* Creator Grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-xl font-bold">Loading creators...</p>
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl font-bold">No creators found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {creators.map((creator) => (
              <div
                key={creator.creator_id}
                data-testid={`creator-card-${creator.creator_id}`}
                className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 rounded-xl overflow-hidden cursor-pointer transition-all"
                onClick={() => navigate(`/creator/${creator.creator_id}`)}
              >
                {creator.profile_image && (
                  <img
                    src={creator.profile_image}
                    alt={creator.name}
                    className="w-full h-48 object-cover border-b-2 border-[#0A0A0A]"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{creator.name}</h3>
                  <p className="text-[#4A4A4A] mb-4 line-clamp-2">{creator.bio || 'No bio available'}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {creator.platforms?.includes('instagram') && (
                      <span className="platform-badge instagram-badge">
                        <Instagram className="w-3 h-3 inline mr-1" />
                        Instagram
                      </span>
                    )}
                    {creator.platforms?.includes('youtube') && (
                      <span className="platform-badge youtube-badge">
                        <Youtube className="w-3 h-3 inline mr-1" />
                        YouTube
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {creator.instagram_followers > 0 && (
                      <div className="border-2 border-[#0A0A0A] rounded-lg p-3">
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">IG Followers</p>
                        <p className="text-lg font-black">{(creator.instagram_followers / 1000).toFixed(1)}K</p>
                      </div>
                    )}
                    {creator.youtube_subscribers > 0 && (
                      <div className="border-2 border-[#0A0A0A] rounded-lg p-3">
                        <p className="text-xs font-bold uppercase text-[#4A4A4A] mb-1">YT Subs</p>
                        <p className="text-lg font-black">{(creator.youtube_subscribers / 1000).toFixed(1)}K</p>
                      </div>
                    )}
                  </div>

                  <Button
                    data-testid={`unlock-contact-button-${creator.creator_id}`}
                    className="w-full bg-[#FFE57F] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/pricing');
                    }}
                  >
                    <Lock className="w-4 h-4 mr-2" strokeWidth={3} />
                    Unlock Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-[#C6A2FF] border-t-2 border-[#0A0A0A] py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl sm:text-5xl font-black mb-6">Ready to Collaborate?</h2>
          <p className="text-xl font-medium mb-8">Get unlimited access to creator contacts with our subscription plans.</p>
          <Button
            data-testid="cta-get-started-button"
            onClick={() => navigate('/pricing')}
            className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold text-lg px-8 py-6 transition-all"
          >
            View Pricing Plans
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FAFAFA] border-t-2 border-[#0A0A0A] py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-bold text-[#4A4A4A]">© 2026 Creabase. All rights reserved.</p>
            <div className="flex gap-6">
              <button
                onClick={() => navigate('/terms')}
                className="font-bold hover:text-[#C6A2FF] transition-colors"
              >
                Terms & Conditions
              </button>
              <button
                onClick={() => navigate('/privacy')}
                className="font-bold hover:text-[#C6A2FF] transition-colors"
              >
                Privacy Policy
              </button>
              <a
                href="mailto:support@creabase.com"
                className="font-bold hover:text-[#C6A2FF] transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;