'use client';

import React, { useState, useEffect } from 'react';
import { LinkData, useLinkLocker } from '../hooks/useLinkLocker';
import { truncateAddress } from '../utils/helpers';
import { Visibility } from '../utils/web3Config';
import SharedAddressesManager from './SharedAddressesManager';
import SharedLinkInfo from './SharedLinkInfo';

interface LinkListProps {
  links: LinkData[];
  onRefresh: () => void;
  activeTab?: 'public' | 'my' | 'shared';
}

const LinkList: React.FC<LinkListProps> = ({ 
  links, 
  onRefresh,
  activeTab = 'public'
}) => {
  const [expandedDescription, setExpandedDescription] = useState<number | null>(null);
  const { deleteLink, updateLink, loading } = useLinkLocker();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkData | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVisibility, setEditVisibility] = useState<Visibility>(Visibility.Private);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingLink) {
      setEditTitle(editingLink.title);
      setEditUrl(editingLink.url);
      setEditDescription(editingLink.description);
      setEditVisibility(editingLink.visibility);
    }
  }, [editingLink]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus link ini?')) {
      const success = await deleteLink(id);
      if (success) {
        onRefresh();
      }
    }
  };

  const openEditModal = (link: LinkData) => {
    setEditingLink(link);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingLink(null);
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setIsSubmitting(true);

    // Validasi form
    if (!editTitle.trim()) {
      setEditError('Judul tidak boleh kosong');
      setIsSubmitting(false);
      return;
    }

    if (!editUrl.trim()) {
      setEditError('URL tidak boleh kosong');
      setIsSubmitting(false);
      return;
    }

    // Validasi URL dasar
    try {
      new URL(editUrl);
    } catch (e) {
      setEditError('URL tidak valid');
      setIsSubmitting(false);
      return;
    }

    // Memastikan kita memiliki ID link yang valid
    if (!editingLink || !editingLink.id) {
      setEditError('ID link tidak valid');
      setIsSubmitting(false);
      return;
    }

    try {
      // Update link dengan informasi baru
      const success = await updateLink(
        editingLink.id,
        editTitle,
        editUrl,
        editDescription,
        editVisibility
      );
      
      if (success) {
        closeEditModal();
        onRefresh();
      }
      
      setIsSubmitting(false);
    } catch (err: any) {
      console.error('Error updating link:', err);
      setEditError(err.message || 'Gagal memperbarui link');
      setIsSubmitting(false);
    }
  };

  const getVisibilityLabel = (visibility: Visibility) => {
    switch (visibility) {
      case Visibility.Private:
        return <span className="text-red-500">Pribadi</span>;
      case Visibility.Shared:
        return <span className="text-yellow-500">Dibagikan</span>;
      case Visibility.Public:
        return <span className="text-green-500">Publik</span>;
      default:
        return <span className="text-gray-500">Tidak diketahui</span>;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {links.map((link) => (
        <div key={link.id} className="backdrop-blur-md bg-gray-900/80 rounded-lg shadow-xl p-4 border border-indigo-500/30 hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1 hover:border-purple-500/50">
          {/* Tampilkan informasi tentang siapa yang membagikan link (hanya di tab "Shared with me") */}
          {activeTab === 'shared' && (
            <SharedLinkInfo linkId={link.id} />
          )}
          
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-white">{link.title}</h3>
            <div className="flex space-x-2">
              {/* Tombol Edit hanya tampil jika link milik kita, tidak ada di tab "Shared with me" */}
              {activeTab !== 'shared' && (
                <button
                  onClick={() => openEditModal(link)}
                  disabled={loading}
                  className="text-indigo-300 hover:text-indigo-200 p-1 rounded-full hover:bg-indigo-900/50 transition-colors"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              
              {/* Tombol Hapus hanya tampil jika link milik kita, tidak ada di tab "Shared with me" */}
              {activeTab !== 'shared' && (
                <button
                  onClick={() => handleDelete(link.id)}
                  disabled={loading}
                  className="text-pink-300 hover:text-pink-200 p-1 rounded-full hover:bg-pink-900/50 transition-colors"
                  title="Hapus"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-cyan-200 hover:underline transition-colors break-all flex items-center mt-1 bg-cyan-900/20 px-2 py-1 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {link.url}
          </a>
          
          <div className="mt-2">
            {expandedDescription === link.id ? (
              <div className="bg-indigo-900/50 p-3 rounded-lg border-l-4 border-purple-500 text-white">
                <p className="whitespace-pre-wrap">{link.description}</p>
                <button 
                  onClick={() => setExpandedDescription(null)}
                  className="text-purple-300 hover:text-purple-200 hover:underline mt-2 text-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Sembunyikan Deskripsi
                </button>
              </div>
            ) : (
              <>
                {link.description && (
                  <button
                    onClick={() => setExpandedDescription(link.id)}
                    className="text-purple-300 hover:text-purple-200 hover:underline text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Lihat Deskripsi
                  </button>
                )}
              </>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-purple-500/20 flex flex-wrap justify-between items-center text-sm text-gray-300">
            <div className="flex items-center mb-1 md:mb-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Ditambahkan: {formatDate(link.createdAt)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Visibilitas: {getVisibilityLabel(link.visibility)}
              </span>
              
              {/* Menu untuk mengelola alamat share jika link milik kita dan visibility adalah Shared */}
              {activeTab === 'my' && link.visibility === Visibility.Shared && (
                <SharedAddressesManager linkId={link.id} />
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Modal Edit */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/90 backdrop-blur-md rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30">
            <div className="px-6 py-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Edit Link</h3>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-white text-xl">
                &times;
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6">
              {editError && (
                <div className="mb-4 bg-red-900/60 border border-red-500/50 text-red-200 px-4 py-3 rounded-md">
                  <strong className="font-bold">Error:</strong>
                  <span className="block sm:inline"> {editError}</span>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-white font-bold mb-2" htmlFor="edit-title">
                  Judul
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800/90 border border-indigo-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-gray-400"
                  placeholder="Judul Link"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-white font-bold mb-2" htmlFor="edit-url">
                  URL
                </label>
                <input
                  id="edit-url"
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800/90 border border-indigo-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-gray-400"
                  placeholder="https://example.com"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-white font-bold mb-2" htmlFor="edit-description">
                  Deskripsi
                </label>
                <textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800/90 border border-indigo-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-gray-400"
                  placeholder="Deskripsi link Anda (opsional)"
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-white font-bold mb-2">
                  Visibilitas
                </label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="edit-visibility-private"
                      name="edit-visibility"
                      checked={editVisibility === Visibility.Private}
                      onChange={() => setEditVisibility(Visibility.Private)}
                      className="mr-2 accent-purple-500"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="edit-visibility-private" className="text-gray-200">
                      Pribadi (hanya Anda)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="edit-visibility-shared"
                      name="edit-visibility"
                      checked={editVisibility === Visibility.Shared}
                      onChange={() => setEditVisibility(Visibility.Shared)}
                      className="mr-2 accent-purple-500"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="edit-visibility-shared" className="text-gray-200">
                      Dibagikan (alamat tertentu)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="edit-visibility-public"
                      name="edit-visibility"
                      checked={editVisibility === Visibility.Public}
                      onChange={() => setEditVisibility(Visibility.Public)}
                      className="mr-2 accent-purple-500"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="edit-visibility-public" className="text-gray-200">
                      Publik (semua orang)
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkList; 