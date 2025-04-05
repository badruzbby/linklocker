'use client';

import React, { useState, useEffect } from 'react';
import { LinkData } from '../hooks/useLinkLocker';
import { Visibility } from '../utils/web3Config';

interface LinkFormProps {
  initialData?: LinkData;
  onSubmit: (data: {
    title: string;
    url: string;
    description: string;
    visibility: Visibility;
    sharedWith: string[];
  }) => void;
  onCancel: () => void;
  loading: boolean;
}

const LinkForm: React.FC<LinkFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<Visibility>(Visibility.Public);
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [urlError, setUrlError] = useState('');
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setUrl(initialData.url);
      setDescription(initialData.description);
      setVisibility(initialData.visibility);
      // sharedWith tidak selalu disertakan dalam data link, perlu diambil secara terpisah
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi URL
    if (!isValidUrl(url)) {
      setUrlError('URL tidak valid');
      return;
    }
    
    // Validasi alamat wallet jika visibility adalah Shared
    if (visibility === Visibility.Shared && sharedWith.length === 0) {
      setAddressError('Tambahkan minimal satu alamat wallet');
      return;
    }
    
    onSubmit({
      title,
      url,
      description,
      visibility,
      sharedWith
    });
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const isValidEthAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleAddAddress = () => {
    if (!isValidEthAddress(newAddress)) {
      setAddressError('Alamat Ethereum tidak valid');
      return;
    }
    
    if (sharedWith.includes(newAddress)) {
      setAddressError('Alamat sudah ditambahkan');
      return;
    }
    
    setSharedWith([...sharedWith, newAddress]);
    setNewAddress('');
    setAddressError('');
  };

  const handleRemoveAddress = (address: string) => {
    setSharedWith(sharedWith.filter(a => a !== address));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {initialData ? 'Edit Link' : 'Tambah Link Baru'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Judul
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Judul link"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setUrlError('');
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              urlError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="https://example.com"
            required
          />
          {urlError && <p className="text-red-500 text-sm mt-1">{urlError}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Deskripsi
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Deskripsi link (opsional)"
            rows={4}
          />
          <p className="text-gray-500 text-xs mt-1">
            Deskripsi panjang akan disimpan di IPFS secara otomatis
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Visibilitas
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(Number(e.target.value) as Visibility)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={Visibility.Public}>Publik (semua orang)</option>
            <option value={Visibility.Private}>Privat (hanya Anda)</option>
            <option value={Visibility.Shared}>Dibagikan (alamat tertentu)</option>
          </select>
        </div>
        
        {visibility === Visibility.Shared && (
          <div className="mb-4 p-4 border border-gray-200 rounded-lg">
            <label className="block text-gray-700 font-semibold mb-2">
              Bagikan dengan Alamat
            </label>
            
            <div className="flex mb-2">
              <input
                type="text"
                value={newAddress}
                onChange={(e) => {
                  setNewAddress(e.target.value);
                  setAddressError('');
                }}
                className={`flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  addressError ? 'border-red-500' : 'border-gray-300'
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
            
            {addressError && (
              <p className="text-red-500 text-sm mb-2">{addressError}</p>
            )}
            
            {sharedWith.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-semibold mb-1">Alamat yang dibagikan:</p>
                <ul className="bg-gray-50 p-2 rounded-md max-h-32 overflow-y-auto">
                  {sharedWith.map((address, index) => (
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
            )}
          </div>
        )}
        
        <div className="flex gap-2 justify-end mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : initialData ? 'Update' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LinkForm; 