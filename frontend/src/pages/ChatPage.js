import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Send, ArrowLeft, Paperclip, Smile } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import EmptyState from '../components/EmptyState';
import { MessageSkeleton } from '../components/Skeletons';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Typing Indicator Component
const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-4 flex items-center gap-1">
      <div className="w-2 h-2 bg-[#4A4A4A] rounded-full typing-dot"></div>
      <div className="w-2 h-2 bg-[#4A4A4A] rounded-full typing-dot"></div>
      <div className="w-2 h-2 bg-[#4A4A4A] rounded-full typing-dot"></div>
    </div>
  </div>
);

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  const fetchOtherUser = async () => {
    try {
      // Try to get creator info first
      const response = await axios.get(`${BACKEND_URL}/api/creators/${userId}`);
      setOtherUser(response.data);
    } catch (error) {
      // If not a creator, it might be a business user
      setOtherUser({ name: 'User', user_id: userId });
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchOtherUser();
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/messages/${userId}`, {
        withCredentials: true
      });
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await axios.post(
        `${BACKEND_URL}/api/messages`,
        { receiver_id: userId, content: newMessage },
        { withCredentials: true }
      );
      setNewMessage('');
      await fetchMessages();
      inputRef.current?.focus();
    } catch (error) {
      alert('Failed to send message');
    }
    setSending(false);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <nav className="bg-[#FAFAFA] border-b-2 border-[#0A0A0A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] font-bold"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={3} />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            {otherUser?.profile_image ? (
              <img 
                src={otherUser.profile_image} 
                alt={otherUser.name}
                className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] bg-[#C6A2FF] flex items-center justify-center">
                <Users className="w-5 h-5" strokeWidth={2} />
              </div>
            )}
            <div>
              <h1 className="text-xl font-black">{otherUser?.name || 'Chat'}</h1>
              <p className="text-xs text-[#4A4A4A]">
                {otherUser?.instagram_followers ? `${(otherUser.instagram_followers / 1000).toFixed(1)}K followers` : 'Online'}
              </p>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col" style={{height: 'calc(100vh - 140px)'}}>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="space-y-4">
              <MessageSkeleton />
              <MessageSkeleton isOwn />
              <MessageSkeleton />
            </div>
          ) : messages.length === 0 ? (
            <EmptyState
              type="messages"
              title="Start the conversation"
              description={`Say hello to ${otherUser?.name || 'this creator'} and discuss your collaboration ideas`}
            />
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-6">
                  <div className="bg-[#E5E5E5] px-4 py-1 rounded-full">
                    <span className="text-xs font-bold text-[#4A4A4A]">{formatDate(dateMessages[0].created_at)}</span>
                  </div>
                </div>
                
                {/* Messages for this date */}
                {dateMessages.map((message) => (
                  <div
                    key={message.message_id}
                    data-testid={`message-${message.message_id}`}
                    className={`flex ${message.sender_id === currentUser?.user_id ? 'justify-end' : 'justify-start'} mb-3 animate-fadeIn`}
                  >
                    <div
                      className={`max-w-md p-4 rounded-xl border-2 border-[#0A0A0A] ${
                        message.sender_id === currentUser?.user_id
                          ? 'bg-[#C6A2FF] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]'
                          : 'bg-white shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]'
                      }`}
                    >
                      <p className="font-medium whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs text-[#4A4A4A] mt-2 flex items-center gap-2">
                        {formatTime(message.created_at)}
                        {message.sender_id === currentUser?.user_id && message.read && (
                          <span className="text-green-600">✓✓</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
          
          {/* Typing Indicator (show when sending) */}
          {sending && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={sendMessage}
          className="border-t-2 border-[#0A0A0A] bg-white p-4"
        >
          <div className="flex gap-3 items-center">
            <Button
              type="button"
              className="bg-[#FAFAFA] border-2 border-[#0A0A0A] p-2 h-auto"
              title="Attach file (coming soon)"
              disabled
            >
              <Paperclip className="w-5 h-5" strokeWidth={2} />
            </Button>
            <Input
              ref={inputRef}
              data-testid="message-input"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border-2 border-[#0A0A0A] focus:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] focus:-translate-y-1 transition-all"
              disabled={sending}
            />
            <Button
              type="submit"
              data-testid="send-message-button"
              disabled={!newMessage.trim() || sending}
              className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" strokeWidth={3} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;