import React from 'react';
import { Search, MessageSquare, Briefcase, Package, FileText, Users } from 'lucide-react';
import { Button } from './ui/button';

const illustrations = {
  creators: (
    <svg viewBox="0 0 200 150" className="w-full h-32">
      <circle cx="100" cy="60" r="40" fill="#C6A2FF" stroke="#0A0A0A" strokeWidth="3"/>
      <circle cx="60" cy="100" r="25" fill="#B4F8C8" stroke="#0A0A0A" strokeWidth="3"/>
      <circle cx="140" cy="100" r="25" fill="#FFE57F" stroke="#0A0A0A" strokeWidth="3"/>
      <circle cx="100" cy="60" r="15" fill="white" stroke="#0A0A0A" strokeWidth="2"/>
      <circle cx="60" cy="100" r="10" fill="white" stroke="#0A0A0A" strokeWidth="2"/>
      <circle cx="140" cy="100" r="10" fill="white" stroke="#0A0A0A" strokeWidth="2"/>
    </svg>
  ),
  messages: (
    <svg viewBox="0 0 200 150" className="w-full h-32">
      <rect x="30" y="20" width="100" height="60" rx="10" fill="#C6A2FF" stroke="#0A0A0A" strokeWidth="3"/>
      <rect x="70" y="70" width="100" height="60" rx="10" fill="#B4F8C8" stroke="#0A0A0A" strokeWidth="3"/>
      <circle cx="55" cy="50" r="5" fill="#0A0A0A"/>
      <circle cx="75" cy="50" r="5" fill="#0A0A0A"/>
      <circle cx="95" cy="50" r="5" fill="#0A0A0A"/>
      <line x1="90" y1="90" x2="150" y2="90" stroke="#0A0A0A" strokeWidth="3"/>
      <line x1="90" y1="105" x2="130" y2="105" stroke="#0A0A0A" strokeWidth="3"/>
    </svg>
  ),
  projects: (
    <svg viewBox="0 0 200 150" className="w-full h-32">
      <rect x="40" y="30" width="120" height="90" rx="8" fill="white" stroke="#0A0A0A" strokeWidth="3"/>
      <rect x="50" y="45" width="80" height="8" rx="4" fill="#C6A2FF"/>
      <rect x="50" y="60" width="60" height="6" rx="3" fill="#E5E5E5"/>
      <rect x="50" y="75" width="100" height="6" rx="3" fill="#E5E5E5"/>
      <rect x="50" y="90" width="40" height="20" rx="4" fill="#B4F8C8" stroke="#0A0A0A" strokeWidth="2"/>
      <rect x="100" y="90" width="40" height="20" rx="4" fill="#FFE57F" stroke="#0A0A0A" strokeWidth="2"/>
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 200 150" className="w-full h-32">
      <rect x="50" y="20" width="100" height="30" rx="6" fill="#C6A2FF" stroke="#0A0A0A" strokeWidth="3"/>
      <rect x="50" y="60" width="100" height="30" rx="6" fill="#B4F8C8" stroke="#0A0A0A" strokeWidth="3"/>
      <rect x="50" y="100" width="100" height="30" rx="6" fill="#FFE57F" stroke="#0A0A0A" strokeWidth="3"/>
      <circle cx="70" cy="35" r="6" fill="white" stroke="#0A0A0A" strokeWidth="2"/>
      <circle cx="70" cy="75" r="6" fill="white" stroke="#0A0A0A" strokeWidth="2"/>
      <circle cx="70" cy="115" r="6" fill="white" stroke="#0A0A0A" strokeWidth="2"/>
      <path d="M67 35 L69 37 L73 33" stroke="#0A0A0A" strokeWidth="2" fill="none"/>
      <path d="M67 75 L69 77 L73 73" stroke="#0A0A0A" strokeWidth="2" fill="none"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 200 150" className="w-full h-32">
      <circle cx="90" cy="70" r="40" fill="white" stroke="#0A0A0A" strokeWidth="4"/>
      <line x1="120" y1="100" x2="150" y2="130" stroke="#0A0A0A" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="80" cy="60" r="8" fill="#C6A2FF"/>
      <circle cx="100" cy="60" r="8" fill="#B4F8C8"/>
      <rect x="75" y="75" width="30" height="4" rx="2" fill="#E5E5E5"/>
    </svg>
  )
};

const EmptyState = ({ 
  type = 'creators', 
  title, 
  description, 
  actionLabel, 
  onAction,
  secondaryLabel,
  onSecondary
}) => {
  const defaults = {
    creators: {
      title: 'No creators found',
      description: 'Try adjusting your search filters or check back later for new creators',
      actionLabel: 'Clear Filters',
      icon: Users
    },
    messages: {
      title: 'No messages yet',
      description: 'Start a conversation with a creator to discuss collaborations',
      actionLabel: 'Find Creators',
      icon: MessageSquare
    },
    projects: {
      title: 'No projects yet',
      description: 'Create your first project to start collaborating with creators',
      actionLabel: 'Create Project',
      icon: Briefcase
    },
    orders: {
      title: 'No orders found',
      description: 'Your orders will appear here once you start projects with creators',
      actionLabel: 'Browse Creators',
      icon: Package
    },
    search: {
      title: 'No results found',
      description: 'We couldn\'t find what you\'re looking for. Try different keywords',
      actionLabel: 'Clear Search',
      icon: Search
    }
  };

  const config = defaults[type] || defaults.creators;
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Illustration */}
      <div className="w-48 mb-6">
        {illustrations[type] || illustrations.creators}
      </div>

      {/* Icon Badge */}
      <div className="w-14 h-14 bg-[#FAFAFA] border-2 border-[#0A0A0A] rounded-full flex items-center justify-center mb-4 -mt-10 relative z-10">
        <Icon className="w-6 h-6" strokeWidth={2} />
      </div>

      {/* Text */}
      <h3 className="text-2xl font-black mb-2">{title || config.title}</h3>
      <p className="text-[#4A4A4A] font-medium max-w-md mb-6">
        {description || config.description}
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        {onAction && (
          <Button
            onClick={onAction}
            className="bg-[#C6A2FF] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
          >
            {actionLabel || config.actionLabel}
          </Button>
        )}
        {onSecondary && secondaryLabel && (
          <Button
            onClick={onSecondary}
            className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1 font-bold transition-all"
          >
            {secondaryLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
