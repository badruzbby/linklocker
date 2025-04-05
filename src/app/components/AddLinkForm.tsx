'use client';

import React, { useState } from 'react';
import { useLinkLocker } from '../hooks/useLinkLocker';
import { Visibility } from '../utils/web3Config';

interface AddLinkFormProps {
  onSuccess: () => void;
}

const AddLinkForm: React.FC<AddLinkFormProps> = ({ onSuccess }) => {
  const { createLink, loading, error } = useLinkLocker();
  
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<Visibility>(Visibility.Private);
  const [sharedAddresses, setSharedAddresses] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    if (!title.trim()) {
      setFormError('Judul tidak boleh kosong');
      setIsSubmitting(false);
      return;
    }

    if (!url.trim()) {
      setFormError('URL tidak boleh kosong');
      setIsSubmitting(false);
      return;
    }

    try {
      new URL(url);
    } catch (e) {
      setFormError('URL tidak valid');
      setIsSubmitting(false);
      return;
    }

    let addressesToShare: string[] = [];
    if (visibility === Visibility.Shared) {
      if (!sharedAddresses.trim()) {
        setFormError('Alamat wallet untuk berbagi tidak boleh kosong');
        setIsSubmitting(false);
        return;
      }

      addressesToShare = sharedAddresses
        .split(/[\n,]/)
        .map(addr => addr.trim())
        .filter(addr => addr.length > 0);

      const invalidAddresses = addressesToShare.filter(addr => !addr.match(/^0x[a-fA-F0-9]{40}$/));
      if (invalidAddresses.length > 0) {
        setFormError(`Alamat tidak valid: ${invalidAddresses.join(', ')}`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const linkId = await createLink(title, url, description, visibility, addressesToShare);
      
      if (linkId) {
        setSuccessMessage(`Link berhasil dibuat! ID: ${linkId}`);
        
        setTitle('');
        setUrl('');
        setDescription('');
        setVisibility(Visibility.Private);
        setSharedAddresses('');
        
        setTimeout(() => {
          onSuccess();
          setIsSubmitting(false);
        }, 2000);
      } else {
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="backdrop-blur-md bg-gray-900/80 rounded-lg shadow-xl p-6 border border-purple-500/30">
      {(formError || error) && (
        <div className="mb-4 bg-red-900/60 border border-red-500/50 text-red-200 px-4 py-3 rounded relative">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {formError || error}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 bg-green-900/60 border border-green-500/50 text-green-200 px-4 py-3 rounded relative">
          <strong className="font-bold">Sukses:</strong>
          <span className="block sm:inline"> {successMessage}</span>
          <p className="mt-1 text-sm">Tunggu sebentar, link Anda akan segera muncul di tab "Link Saya"...</p>
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="title" className="block text-white font-bold mb-2">
          Judul
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800/90 border border-indigo-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-gray-400"
          placeholder="Judul Link"
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="url" className="block text-white font-bold mb-2">
          URL
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800/90 border border-indigo-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-gray-400"
          placeholder="https://example.com"
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-white font-bold mb-2">
          Deskripsi
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800/90 border border-indigo-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-gray-400"
          placeholder="Deskripsi link Anda (opsional)"
          rows={4}
          disabled={isSubmitting}
        />
        <p className="text-xs text-indigo-300 mt-1">
          Tip: Deskripsi panjang lebih dari 500 karakter akan otomatis disimpan di IPFS
        </p>
      </div>
      
      <div className="mb-6">
        <label className="block text-white font-bold mb-2">
          Visibilitas
        </label>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <input
              type="radio"
              id="visibility-private"
              name="visibility"
              checked={visibility === Visibility.Private}
              onChange={() => setVisibility(Visibility.Private)}
              className="mr-2 accent-purple-500"
              disabled={isSubmitting}
            />
            <label htmlFor="visibility-private" className="text-gray-200">
              Pribadi (hanya Anda)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="radio"
              id="visibility-shared"
              name="visibility"
              checked={visibility === Visibility.Shared}
              onChange={() => setVisibility(Visibility.Shared)}
              className="mr-2 accent-purple-500"
              disabled={isSubmitting}
            />
            <label htmlFor="visibility-shared" className="text-gray-200">
              Dibagikan (Anda dan alamat spesifik)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="radio"
              id="visibility-public"
              name="visibility"
              checked={visibility === Visibility.Public}
              onChange={() => setVisibility(Visibility.Public)}
              className="mr-2 accent-purple-500"
              disabled={isSubmitting}
            />
            <label htmlFor="visibility-public" className="text-gray-200">
              Publik (semua orang)
            </label>
          </div>
        </div>
      </div>

      {visibility === Visibility.Shared && (
        <div className="mb-6">
          <label htmlFor="sharedAddresses" className="block text-white font-bold mb-2">
            Alamat Wallet untuk Berbagi
          </label>
          <textarea
            id="sharedAddresses"
            value={sharedAddresses}
            onChange={(e) => setSharedAddresses(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800/90 border border-indigo-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-gray-400"
            placeholder="Masukkan alamat wallet (format: 0x...) satu per baris atau dipisahkan dengan koma"
            rows={3}
            disabled={isSubmitting}
          />
          <p className="text-xs text-indigo-300 mt-1">
            Format: 0x1234... (satu alamat per baris atau dipisahkan dengan koma)
          </p>
        </div>
      )}
      
      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={loading || isSubmitting}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Menyimpan...' : loading ? 'Memproses...' : 'Simpan Link'}
        </button>
      </div>
    </form>
  );
};

export default AddLinkForm; 