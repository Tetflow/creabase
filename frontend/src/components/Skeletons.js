import React from 'react';

// Card Skeleton
export const CardSkeleton = ({ hasImage = true }) => (
  <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl overflow-hidden animate-pulse">
    {hasImage && (
      <div className="w-full h-48 bg-gradient-to-r from-[#E5E5E5] to-[#F5F5F5]" />
    )}
    <div className="p-6 space-y-4">
      <div className="h-6 bg-[#E5E5E5] rounded-lg w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-[#E5E5E5] rounded w-full" />
        <div className="h-4 bg-[#E5E5E5] rounded w-2/3" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-16 bg-[#E5E5E5] rounded-lg" />
        <div className="h-16 bg-[#E5E5E5] rounded-lg" />
      </div>
      <div className="flex gap-3">
        <div className="flex-1 h-10 bg-[#E5E5E5] rounded-lg" />
        <div className="w-10 h-10 bg-[#E5E5E5] rounded-lg" />
      </div>
    </div>
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton = () => (
  <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6 animate-pulse">
    <div className="flex items-center gap-6">
      <div className="w-12 h-12 bg-[#E5E5E5] rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-[#E5E5E5] rounded w-1/3" />
        <div className="h-4 bg-[#E5E5E5] rounded w-1/4" />
      </div>
      <div className="w-24 h-8 bg-[#E5E5E5] rounded-lg" />
    </div>
  </div>
);

// Stats Card Skeleton
export const StatsSkeleton = () => (
  <div className="bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-xl p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-6 h-6 bg-[#E5E5E5] rounded" />
      <div className="h-3 bg-[#E5E5E5] rounded w-20" />
    </div>
    <div className="h-10 bg-[#E5E5E5] rounded w-24 mb-2" />
    <div className="h-3 bg-[#E5E5E5] rounded w-16" />
  </div>
);

// Chat Message Skeleton
export const MessageSkeleton = ({ isOwn = false }) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-pulse`}>
    <div className={`max-w-md p-4 rounded-xl border-2 border-[#E5E5E5] ${isOwn ? 'bg-[#E8D5FF]' : 'bg-[#F5F5F5]'}`}>
      <div className="space-y-2">
        <div className="h-4 bg-[#E5E5E5] rounded w-48" />
        <div className="h-4 bg-[#E5E5E5] rounded w-32" />
      </div>
      <div className="h-3 bg-[#E5E5E5] rounded w-16 mt-3" />
    </div>
  </div>
);

// Profile Header Skeleton
export const ProfileSkeleton = () => (
  <div className="bg-white border-2 border-[#0A0A0A] shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] rounded-xl p-8 animate-pulse">
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-48 h-48 bg-[#E5E5E5] rounded-xl" />
      <div className="flex-1 space-y-4">
        <div className="h-10 bg-[#E5E5E5] rounded w-64" />
        <div className="space-y-2">
          <div className="h-5 bg-[#E5E5E5] rounded w-full" />
          <div className="h-5 bg-[#E5E5E5] rounded w-3/4" />
        </div>
        <div className="flex gap-3">
          <div className="h-8 bg-[#E5E5E5] rounded-lg w-24" />
          <div className="h-8 bg-[#E5E5E5] rounded-lg w-24" />
          <div className="h-8 bg-[#E5E5E5] rounded-lg w-20" />
        </div>
      </div>
    </div>
  </div>
);

// Grid Skeleton
export const GridSkeleton = ({ count = 6, hasImage = true }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} hasImage={hasImage} />
    ))}
  </div>
);

// List Skeleton
export const ListSkeleton = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <TableRowSkeleton key={i} />
    ))}
  </div>
);

// Full Page Loading
export const PageLoadingSkeleton = () => (
  <div className="min-h-screen bg-[#FAFAFA] animate-pulse">
    {/* Nav */}
    <div className="border-b-2 border-[#E5E5E5] px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#E5E5E5] rounded" />
          <div className="w-32 h-8 bg-[#E5E5E5] rounded" />
        </div>
        <div className="flex gap-4">
          <div className="w-24 h-10 bg-[#E5E5E5] rounded-lg" />
          <div className="w-24 h-10 bg-[#E5E5E5] rounded-lg" />
        </div>
      </div>
    </div>
    
    {/* Content */}
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="h-10 bg-[#E5E5E5] rounded w-64 mb-8" />
      <GridSkeleton count={6} />
    </div>
  </div>
);

export default {
  CardSkeleton,
  TableRowSkeleton,
  StatsSkeleton,
  MessageSkeleton,
  ProfileSkeleton,
  GridSkeleton,
  ListSkeleton,
  PageLoadingSkeleton
};
