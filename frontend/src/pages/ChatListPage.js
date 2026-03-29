import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageCircle, ArrowLeft, LogOut, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import EmptyState from '../components/EmptyState';
import { ListSkeleton } from '../components/Skeletons';
import BottomNav from '../components/BottomNav';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ChatListPage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchConversations();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true
      });
      setCurrentUser(response.data);
    } catch (error) {
      navigate('/');
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/messages/conversations`, {
        withCredentials: true
      });
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than 24 hours
    if (diff < 86400000) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    
    // Less than a week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return days === 1 ? 'Yesterday' : `${days} days ago`;
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const goBack = () => {
    if (currentUser?.role === 'admin') {
      navigate('/admin');
    } else if (currentUser?.role === 'creator') {
      navigate('/creator-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  if (!currentUser) {
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
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              onClick={goBack}
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all p-3"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={3} />
            </Button>
            <MessageCircle className="w-8 h-8" strokeWidth={3} />
            <h1 className="text-3xl font-black tracking-tight">Messages</h1>
          </div>
          <div className="hidden md:block">
            <Button
              onClick={handleLogout}
              className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
            >
              <LogOut className="w-4 h-4" strokeWidth={3} />
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <ListSkeleton count={5} />
        ) : conversations.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No conversations yet"
            description="Start chatting with creators or businesses to see your conversations here."
            action={{
              label: currentUser.role === 'business' ? 'Find Creators' : 'Go to Dashboard',
              onClick: () => navigate(currentUser.role === 'business' ? '/dashboard' : '/creator-dashboard')
            }}
          />
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <div
                key={conversation.user_id}
                onClick={() => navigate(`/chat/${conversation.user_id}`)}
                className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 rounded-xl p-6 cursor-pointer transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="bg-[#C6A2FF] border-2 border-[#0A0A0A] rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-black">
                      {conversation.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-black truncate">
                        {conversation.name || 'User'}
                      </h3>
                      {conversation.last_message_time && (
                        <span className="text-sm font-bold text-[#4A4A4A] ml-2 flex-shrink-0">
                          {formatTime(conversation.last_message_time)}
                        </span>
                      )}
                    </div>
                    
                    {conversation.last_message && (
                      <p className="text-[#4A4A4A] font-medium truncate">
                        {conversation.last_message}
                      </p>
                    )}
                    
                    {conversation.unread_count > 0 && (
                      <div className="mt-2">
                        <span className="inline-block bg-[#FFE57F] border-2 border-[#0A0A0A] rounded-full px-3 py-1 text-xs font-black">
                          {conversation.unread_count} new
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <Send className="w-5 h-5 text-[#4A4A4A]" strokeWidth={3} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentPage="chats" />
    </div>
  );
};

export default ChatListPage;
