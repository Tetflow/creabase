import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Logo({ className = '', size = 'default', clickable = true }) {
  const navigate = useNavigate();
  
  const sizes = {
    small: 'h-8',
    default: 'h-10',
    large: 'h-12',
    xlarge: 'h-16'
  };

  const handleClick = () => {
    if (clickable) {
      navigate('/');
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`flex items-center gap-3 ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
    >
      {/* Logo Icon */}
      <div className={`${sizes[size]} aspect-square relative`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#C6A2FF', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#7C3AED', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="20" fill="url(#logoGradient)"/>
          <path d="M 70 30 Q 80 40 80 50 Q 80 60 70 70" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round"/>
          <circle cx="35" cy="35" r="12" fill="white"/>
          <circle cx="35" cy="65" r="12" fill="white"/>
        </svg>
      </div>
      
      {/* Logo Text */}
      <span className={`font-black text-gray-900 ${
        size === 'small' ? 'text-xl' :
        size === 'default' ? 'text-2xl' :
        size === 'large' ? 'text-3xl' :
        'text-4xl'
      }`}>
        Creabase
      </span>
    </div>
  );
}
