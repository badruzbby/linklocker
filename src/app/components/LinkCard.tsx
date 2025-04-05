'use client';

import React, { useState } from 'react';
import { LinkData } from '../hooks/useLinkLocker';
import { Visibility } from '../utils/web3Config';
import { useWeb3 } from '../context/Web3Provider';

interface LinkCardProps {
  link: LinkData;
  onDelete?: (id: number) => void;
  onEdit?: (link: LinkData) => void;
  onShare?: (id: number) => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ link, onDelete, onEdit, onShare }) => {
  const { address } = useWeb3();
  const [showDetails, setShowDetails] = useState(false);
  
  const isOwner = address && address.toLowerCase() === link.owner.toLowerCase();
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getVisibilityLabel = (visibility: Visibility) => {
    switch (visibility) {
      case Visibility.Public:
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Publik</span>;
      case Visibility.Private:
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Privat</span>;
      case Visibility.Shared:
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Dibagikan</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Tidak Diketahui</span>;
    }
  };
  
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4 transition-all hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold mb-1">
            {link.title}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            {getVisibilityLabel(link.visibility)}
            <span className="text-gray-500 text-xs">
              {formatDate(link.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {isOwner && (
            <>
              {onEdit && (
                <button
                  onClick={() => onEdit(link)}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(link.id)}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Hapus
                </button>
              )}
              {onShare && link.visibility === Visibility.Shared && (
                <button
                  onClick={() => onShare(link.id)}
                  className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Bagikan
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="mb-2">
        <a 
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all"
        >
          {truncateText(link.url, 50)}
        </a>
      </div>
      
      {!showDetails && link.description && (
        <p className="text-gray-600 mb-2">
          {truncateText(link.description, 100)}
        </p>
      )}
      
      {showDetails && link.description && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md">
          <p className="text-gray-700 whitespace-pre-wrap">{link.description}</p>
        </div>
      )}
      
      {link.description && link.description.length > 100 && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-500 hover:underline mt-1"
        >
          {showDetails ? 'Sembunyikan Detail' : 'Lihat Detail'}
        </button>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        Owner: {link.owner.substring(0, 8)}...{link.owner.substring(link.owner.length - 6)}
      </div>
    </div>
  );
};

export default LinkCard; 