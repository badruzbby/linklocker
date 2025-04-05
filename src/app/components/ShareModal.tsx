'use client';

import React, { useState } from 'react';

interface ShareModalProps {
  onClose: () => void;
  onShare: (addresses: string[]) => void;
  loading: boolean;
}

const ShareModal: React.FC<ShareModalProps> = ({ onClose, onShare, loading }) => {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [error, setError] = useState('');

  const isValidEthAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleAddAddress = () => {
    if (!newAddress.trim()) {
      return;
    }
    
    if (!isValidEthAddress(newAddress)) {
      setError('Alamat Ethereum tidak valid');
      return;
    }
    
    if (addresses.includes(newAddress)) {
      setError('Alamat sudah ditambahkan');
      return;
    }
    
    setAddresses([...addresses, newAddress]);
    setNewAddress('');
    setError('');
  };

  const handleRemoveAddress = (address: string) => {
    setAddresses(addresses.filter(a => a !== address));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (addresses.length === 0) {
      setError('Tambahkan minimal satu alamat wallet');
      return;
    }
    
    onShare(addresses);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAddress();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Bagikan Link</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Tambahkan Alamat Wallet
            </label>
            
            <div className="flex mb-2">
              <input
                type="text"
                value={newAddress}
                onChange={(e) => {
                  setNewAddress(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                className={`flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0x..."
              />
              <button
                type="button"
                onClick={handleAddAddress}
                className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition-colors"
              >
                Tambah
              </button>
            </div>
            
            {error && (
              <p className="text-red-500 text-sm mb-2">{error}</p>
            )}
          </div>
          
          {addresses.length > 0 ? (
            <div className="mb-4">
              <p className="text-sm font-semibold mb-1">Alamat yang akan dibagikan:</p>
              <ul className="bg-gray-50 p-2 rounded-md max-h-40 overflow-y-auto">
                {addresses.map((address, index) => (
                  <li key={index} className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-700 truncate">
                      {address}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAddress(address)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Hapus
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-4">
              Belum ada alamat yang ditambahkan
            </p>
          )}
          
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              disabled={loading || addresses.length === 0}
            >
              {loading ? 'Memproses...' : 'Bagikan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareModal; 