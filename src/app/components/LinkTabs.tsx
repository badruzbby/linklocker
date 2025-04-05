'use client';

import React from 'react';

export enum TabType {
  MyLinks = 'my-links',
  SharedWithMe = 'shared-with-me',
  Public = 'public'
}

interface LinkTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isWalletConnected: boolean;
}

const LinkTabs: React.FC<LinkTabsProps> = ({
  activeTab,
  onTabChange,
  isWalletConnected
}) => {
  return (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        className={`py-2 px-4 font-medium text-sm focus:outline-none ${
          activeTab === TabType.MyLinks
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        } ${!isWalletConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => isWalletConnected && onTabChange(TabType.MyLinks)}
        disabled={!isWalletConnected}
      >
        Link Saya
      </button>
      <button
        className={`py-2 px-4 font-medium text-sm focus:outline-none ${
          activeTab === TabType.SharedWithMe
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        } ${!isWalletConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => isWalletConnected && onTabChange(TabType.SharedWithMe)}
        disabled={!isWalletConnected}
      >
        Dibagikan ke Saya
      </button>
      <button
        className={`py-2 px-4 font-medium text-sm focus:outline-none ${
          activeTab === TabType.Public
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => onTabChange(TabType.Public)}
      >
        Link Publik
      </button>
    </div>
  );
};

export default LinkTabs; 