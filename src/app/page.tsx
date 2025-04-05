'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from './context/Web3Provider';
import { useLinkLocker, LinkData } from './hooks/useLinkLocker';
import LinkList from './components/LinkList';
import AddLinkForm from './components/AddLinkForm';
import ContractInfo from './components/ContractInfo';
import WalletConnect from './components/WalletConnect';
import { isContractDeployed, CONTRACT_ADDRESS } from './utils/web3Config';

export default function Home() {
  const { isConnected } = useWeb3();
  const { getMyLinks, getSharedWithMe, getPublicLinks, loading, error } = useLinkLocker();
  
  const [myLinks, setMyLinks] = useState<LinkData[]>([]);
  const [sharedLinks, setSharedLinks] = useState<LinkData[]>([]);
  const [publicLinks, setPublicLinks] = useState<LinkData[]>([]);
  const [activeTab, setActiveTab] = useState<'public' | 'my' | 'shared'>('public');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchLinks = async () => {
    setFetchError(null);

    if (!isContractDeployed || CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      console.warn("Kontrak belum di-deploy atau alamat tidak valid. Tidak memanggil fungsi kontrak.");
      return;
    }

    try {
      const publicData = await getPublicLinks();
      setPublicLinks(publicData);
    } catch (err: any) {
      console.error('Error fetching public links:', err);
      setFetchError('Gagal mengambil link publik. ' + (err.message || ''));
    }

    if (isConnected) {
      try {
        const myData = await getMyLinks();
        setMyLinks(myData);
      } catch (err) {
        console.error('Error fetching my links:', err);
      }

      try {
        const sharedData = await getSharedWithMe();
        setSharedLinks(sharedData);
      } catch (err) {
        console.error('Error fetching shared links:', err);
      }
    }
  };

  useEffect(() => {
    fetchLinks();
    
    if (!isConnected && activeTab !== 'public') {
      setActiveTab('public');
    }
  }, [isConnected, activeTab]);

  const handleLinkCreationSuccess = () => {
    setActiveTab('my');
    fetchLinks();
  };

  const handleTabChange = (tab: 'public' | 'my' | 'shared') => {
    setActiveTab(tab);
    fetchLinks(); 
  };

  const refreshWithRetry = async () => {
    setIsRefreshing(true);
    setRetryCount(prev => prev + 1);
    
    try {
      console.log(`Mencoba refresh data (percobaan ke-${retryCount + 1})...`);
      await fetchLinks();
      console.log("Refresh data selesai");
    } catch (err) {
      console.error("Error saat refresh:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my' && myLinks.length === 0 && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Retry otomatis #${retryCount + 1} untuk mengambil link...`);
        refreshWithRetry();
      }, 5000 * (retryCount + 1)); 
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, myLinks.length, retryCount]);

  const renderLinks = () => {
    let linksToShow: LinkData[] = [];
    let emptyMessage = '';

    switch (activeTab) {
      case 'my':
        linksToShow = myLinks;
        emptyMessage = 'Anda belum membuat link apapun.';
        break;
      case 'shared':
        linksToShow = sharedLinks;
        emptyMessage = 'Belum ada link yang dibagikan kepada Anda.';
        break;
      case 'public':
      default:
        linksToShow = publicLinks;
        emptyMessage = 'Belum ada link publik yang tersedia.';
    }

    if (fetchError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{fetchError}</p>
        </div>
      );
    }

    if (loading) {
      return <p className="text-center py-4">Memuat data...</p>;
    }

    if (linksToShow.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-300 mb-4">{emptyMessage}</p>
          
          {activeTab === 'my' && (
            <div className="mt-4 p-4 bg-indigo-900/40 text-indigo-200 rounded-lg border border-indigo-500/30">
              <p className="font-semibold mb-2">Link tidak muncul setelah menambahkan?</p>
              <p className="mb-2">Beberapa kemungkinan penyebab:</p>
              <ul className="list-disc pl-5 text-left mb-3">
                <li>Transaksi blockchain membutuhkan waktu untuk dikonfirmasi</li>
                <li>Kontrak mungkin memerlukan beberapa saat sebelum memperbarui data</li>
                <li>ABI mungkin tidak cocok dengan kontrak yang di-deploy</li>
              </ul>
              <p>Coba klik tombol <strong>Refresh</strong> di atas untuk memuat ulang data.</p>
            </div>
          )}
        </div>
      );
    }

    return <LinkList links={linksToShow} onRefresh={fetchLinks} activeTab={activeTab} />;
  };

  const renderTabs = () => {
    return (
      <div className="border-b mb-4 flex justify-between items-center">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button
              className={`inline-block p-4 rounded-t-lg transition-all duration-200 ${
                activeTab === 'public'
                  ? 'text-purple-400 border-b-2 border-purple-500 font-bold'
                  : 'hover:text-purple-400 text-gray-300 hover:border-purple-300'
              }`}
              onClick={() => handleTabChange('public')}
            >
              Link Publik
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 rounded-t-lg transition-all duration-200 ${
                activeTab === 'my'
                  ? 'text-purple-400 border-b-2 border-purple-500 font-bold'
                  : 'hover:text-purple-400 text-gray-300 hover:border-purple-300'
              } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleTabChange('my')}
              disabled={!isConnected}
            >
              Link Saya
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 rounded-t-lg transition-all duration-200 ${
                activeTab === 'shared'
                  ? 'text-purple-400 border-b-2 border-purple-500 font-bold'
                  : 'hover:text-purple-400 text-gray-300 hover:border-purple-300'
              } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleTabChange('shared')}
              disabled={!isConnected}
            >
              Dibagikan ke Saya
            </button>
          </li>
        </ul>
        
        <button
          onClick={refreshWithRetry}
          disabled={isRefreshing}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg inline-flex items-center shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-indigo-500/50"
        >
          {isRefreshing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Memuat...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="backdrop-blur-md bg-white/10 rounded-xl shadow-2xl p-6 mb-8 border border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              DL3: Decentralized Link Locker
            </h1>
            <div className="mt-4 md:mt-0">
              <WalletConnect />
            </div>
          </div>

          <div className="mb-6">
            <ContractInfo />
          </div>
        </div>

        {/* Form Tambah Link */}
        {isConnected && isContractDeployed && (
          <div className="backdrop-blur-md bg-white/10 rounded-xl shadow-2xl p-6 mb-8 border border-white/20 transform transition-all duration-300 hover:shadow-purple-500/20">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tambah Link Baru
            </h2>
            <AddLinkForm onSuccess={handleLinkCreationSuccess} />
          </div>
        )}

        {/* Tab dan Daftar Link */}
        <div className="backdrop-blur-md bg-white/10 rounded-xl shadow-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Kumpulan Link
          </h2>
          {renderTabs()}
          <div className="bg-gray-800/50 rounded-lg p-4">
            {renderLinks()}
          </div>
        </div>
        
        <footer className="text-center text-gray-400 text-sm py-6">
          <p>&copy; {new Date().getFullYear()} LinkLocker DApp - Aplikasi Terdesentralisasi untuk Menyimpan Link</p>
          <p className="mt-2">Dibuat dengan <span className="text-pink-500">❤️</span> untuk Blockchain</p>
        </footer>
      </div>
    </main>
  );
}
