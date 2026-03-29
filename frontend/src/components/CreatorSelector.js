import React, { useState, useEffect } from 'react';
import { Search, Check, User, Instagram, Youtube, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CreatorSelector = ({ selectedCreator, onSelect, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCreators();
    }
  }, [isOpen, searchQuery]);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const params = searchQuery ? `?search=${searchQuery}` : '';
      const response = await axios.get(`${BACKEND_URL}/api/creators${params}`);
      setCreators(response.data);
    } catch (error) {
      console.error('Failed to fetch creators:', error);
    }
    setLoading(false);
  };

  const handleSelect = (creator) => {
    onSelect(creator);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <label className="block font-bold mb-2">Select Creator *</label>
      
      {/* Selected Creator Display */}
      {selectedCreator ? (
        <div className="flex items-center gap-3 p-3 bg-[#B4F8C8] border-2 border-[#0A0A0A] rounded-xl">
          {selectedCreator.profile_image && (
            <img
              src={selectedCreator.profile_image}
              alt={selectedCreator.name}
              className="w-10 h-10 rounded-lg border-2 border-[#0A0A0A] object-cover"
            />
          )}
          <div className="flex-1">
            <p className="font-bold">{selectedCreator.name}</p>
            <p className="text-xs text-[#4A4A4A]">
              {selectedCreator.instagram_followers > 0 && `${(selectedCreator.instagram_followers / 1000).toFixed(1)}K followers`}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              onClear();
              setIsOpen(true);
            }}
            className="bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] p-2 h-auto"
          >
            <X className="w-4 h-4" strokeWidth={3} />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full justify-start bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-medium text-[#4A4A4A] hover:bg-[#FAFAFA]"
        >
          <User className="w-4 h-4 mr-2" strokeWidth={2} />
          Click to select a creator...
        </Button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b-2 border-[#0A0A0A]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A4A4A]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search creators..."
                className="pl-10 border-2 border-[#0A0A0A]"
                autoFocus
              />
            </div>
          </div>

          {/* Creator List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <p className="text-[#4A4A4A]">Loading...</p>
              </div>
            ) : creators.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-[#4A4A4A]">No creators found</p>
              </div>
            ) : (
              creators.map((creator) => (
                <button
                  key={creator.creator_id}
                  type="button"
                  onClick={() => handleSelect(creator)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-[#FAFAFA] transition-colors border-b border-[#E5E5E5] last:border-b-0"
                >
                  {creator.profile_image ? (
                    <img
                      src={creator.profile_image}
                      alt={creator.name}
                      className="w-10 h-10 rounded-lg border-2 border-[#0A0A0A] object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg border-2 border-[#0A0A0A] bg-[#C6A2FF] flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <p className="font-bold">{creator.name}</p>
                    <div className="flex items-center gap-2 text-xs text-[#4A4A4A]">
                      {creator.platforms?.includes('instagram') && (
                        <span className="flex items-center gap-1">
                          <Instagram className="w-3 h-3" />
                          {creator.instagram_followers > 0 && `${(creator.instagram_followers / 1000).toFixed(1)}K`}
                        </span>
                      )}
                      {creator.platforms?.includes('youtube') && (
                        <span className="flex items-center gap-1">
                          <Youtube className="w-3 h-3" />
                          {creator.youtube_subscribers > 0 && `${(creator.youtube_subscribers / 1000).toFixed(1)}K`}
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedCreator?.creator_id === creator.creator_id && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Close */}
          <div className="p-3 border-t-2 border-[#0A0A0A] bg-[#FAFAFA]">
            <Button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] font-bold"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorSelector;
