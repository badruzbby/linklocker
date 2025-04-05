'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLinkLocker } from '../hooks/useLinkLocker';
import { truncateAddress } from '../utils/helpers';
import { ethers } from 'ethers';

interface SharedAddressesManagerProps {
  linkId: number;
  disabled?: boolean;
  onAddressesUpdated?: () => void;
}

const SharedAddressesManager: React.FC<SharedAddressesManagerProps> = ({ 
  linkId, 
  disabled = false,
  onAddressesUpdated
}) => {
  const { getSharedAddresses, shareLink, unshareLink, loading: contractLoading } = useLinkLocker();
  const [addresses, setAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAddresses();
  }, [linkId]);

  const fetchAddresses = async () => {
    if (!linkId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const sharedAddresses = await getSharedAddresses(linkId);
      setAddresses(sharedAddresses);
    } catch (err: any) {
      console.error('Error fetching shared addresses:', err);
      setError('Gagal mengambil daftar alamat yang dibagikan');
    } finally {
      setLoading(false);
    }
  };

  const isValidEthereumAddress = (address: string): boolean => {
    try {
      return ethers.utils.isAddress(address);
    } catch (e) {
      return false;
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.trim()) {
      setError("Alamat tidak boleh kosong");
      return;
    }

    const trimmedAddress = newAddress.trim();
    
    if (!isValidEthereumAddress(trimmedAddress)) {
      setError("Format alamat Ethereum tidak valid");
      return;
    }

    if (addresses.includes(trimmedAddress)) {
      setError("Alamat ini sudah ada dalam daftar");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await shareLink(linkId, [trimmedAddress]);
      
      await fetchAddresses();
      
      setNewAddress('');
      setSuccess('Alamat berhasil ditambahkan');
      
      if (onAddressesUpdated) {
        onAddressesUpdated();
      }
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error adding address:', err);
      setError(err.message || 'Gagal menambahkan alamat');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAddress = async (addressToRemove: string) => {
    if (!confirm(`Apakah Anda yakin ingin berhenti berbagi dengan ${truncateAddress(addressToRemove)}?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await unshareLink(linkId, [addressToRemove]);
      
      await fetchAddresses();
      
      setSuccess('Alamat berhasil dihapus');
      
      if (onAddressesUpdated) {
        onAddressesUpdated();
      }
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error removing address:', err);
      setError(err.message || 'Gagal menghapus alamat');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressPaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    const addressPattern = /\b(0x)?[0-9a-fA-F]{40}\b/g;
    const foundAddresses = pastedText.match(addressPattern) || [];
    
    if (foundAddresses.length === 0) {
      setError("Tidak ada alamat Ethereum valid yang ditemukan dari teks yang ditempel");
      return;
    }
    
    const validAddresses = foundAddresses
      .filter(addr => isValidEthereumAddress(addr))
      .filter(addr => !addresses.includes(addr));
    
    if (validAddresses.length === 0) {
      setError("Semua alamat yang ditempel sudah ada dalam daftar atau tidak valid");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await shareLink(linkId, validAddresses);
      
      await fetchAddresses();
      
      setNewAddress('');
      setSuccess(`${validAddresses.length} alamat berhasil ditambahkan`);
      
      if (onAddressesUpdated) {
        onAddressesUpdated();
      }
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error adding multiple addresses:', err);
      setError(err.message || 'Terjadi kesalahan saat menambahkan alamat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-gray-300">
      {error && (
        <div className="mb-4 bg-red-900/30 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg relative animate-pulse">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
          <button 
            onClick={() => setError(null)} 
            className="absolute top-0 right-0 mt-3 mr-4 text-red-200 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-900/30 border border-green-500/30 text-green-200 px-4 py-3 rounded-lg relative animate-fadeInOut">
          <strong className="font-bold">Sukses:</strong>
          <span className="block sm:inline"> {success}</span>
        </div>
      )}

      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:space-x-2">
          <div className="flex-grow relative mb-2 md:mb-0">
            <input
              ref={addressInputRef}
              type="text"
              value={newAddress}
              onChange={(e) => {
                setNewAddress(e.target.value);
                setError(null);
              }}
              onPaste={handleAddressPaste}
              placeholder="Masukkan alamat wallet Ethereum (0x...)"
              className="shadow appearance-none bg-gray-800/50 border border-gray-700 rounded-lg w-full py-2 pl-3 pr-12 text-gray-100 leading-tight focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
              disabled={disabled || loading || contractLoading}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
          </div>
          <button
            onClick={handleAddAddress}
            disabled={disabled || loading || contractLoading || !newAddress.trim()}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-purple-500/20 transition-all"
          >
            {loading ? 'Menambahkan...' : 'Tambah Alamat'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Tip: Anda dapat menempel beberapa alamat Ethereum sekaligus, dan sistem akan secara otomatis mengekstrak alamat yang valid
        </p>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold mb-2 text-gray-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Alamat yang Dibagikan ({addresses.length})
        </h4>
        
        {loading && !addresses.length && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-purple-500 border-r-2 border-purple-500 border-b-2 border-transparent"></div>
            <p className="mt-2 text-gray-400">Mengambil alamat...</p>
          </div>
        )}

        {!loading && !addresses.length && (
          <div className="text-center py-4 bg-gray-800/30 rounded-lg border border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="mt-2 text-gray-400">Belum ada alamat yang dibagikan</p>
          </div>
        )}

        {addresses.length > 0 && (
          <ul className="bg-gray-800/20 rounded-lg border border-gray-700/50 divide-y divide-gray-700/50 max-h-48 overflow-y-auto">
            {addresses.map((address, index) => (
              <li 
                key={index}
                className="px-4 py-3 flex justify-between items-center hover:bg-gray-700/20 transition-colors"
              >
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full h-8 w-8 flex items-center justify-center mr-3 shadow-md">
                    <span className="font-mono text-xs text-white">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-mono text-cyan-300 hover:text-cyan-200 transition-colors">
                      {address}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {truncateAddress(address)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveAddress(address)}
                  disabled={disabled || loading || contractLoading}
                  className="text-pink-400 hover:text-pink-300 hover:bg-pink-900/20 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                  title="Hapus alamat ini"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fadeInOut {
          animation: fadeInOut 3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SharedAddressesManager; 