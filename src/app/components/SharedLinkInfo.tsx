'use client';

import React, { useState, useEffect } from 'react';
import { useLinkLocker } from '../hooks/useLinkLocker';

interface SharedLinkInfoProps {
  linkId: number;
}

const SharedLinkInfo: React.FC<SharedLinkInfoProps> = ({ linkId }) => {
  const [sharedByInfo, setSharedByInfo] = useState<{ owner: string; sharedDate: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { getSharedByInfo } = useLinkLocker();
  
  const fetchSharedByInfo = async () => {
    if (!linkId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const info = await getSharedByInfo(linkId);
      setSharedByInfo(info);
    } catch (err: any) {
      console.error('Error fetching shared by info:', err);
      setError('Gagal mendapatkan informasi pembagi');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSharedByInfo();
  }, [linkId]);
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-3 mb-3 bg-indigo-900/20 backdrop-blur-sm rounded-lg border border-indigo-500/20 text-gray-300 animate-pulse">
        <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-cyan-400 border-r-2 border-cyan-400 border-b-2 border-transparent mr-2"></div>
        <span>Memuat informasi pembagi...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-3 mb-3 bg-red-900/20 backdrop-blur-sm rounded-lg border border-red-500/20 text-red-200">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }
  
  if (!sharedByInfo) {
    return null;
  }
  
  return (
    <div className="p-3 mb-3 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 backdrop-blur-sm rounded-lg border border-indigo-500/30 text-gray-300">
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <div>
          <span>Dibagikan oleh </span>
          <span className="font-mono text-cyan-300 bg-cyan-900/20 px-2 py-0.5 rounded" title={sharedByInfo.owner}>
            {truncateAddress(sharedByInfo.owner)}
          </span>
          <span className="text-sm block mt-1 text-gray-400">
            pada {formatDate(sharedByInfo.sharedDate)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SharedLinkInfo; 