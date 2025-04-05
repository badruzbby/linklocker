'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Provider';
import { truncateAddress } from '../utils/helpers';
import { isContractDeployed, networkConfig } from '../utils/web3Config';

const WalletConnect: React.FC = () => {
  const { 
    address, 
    isConnected, 
    isCorrectNetwork,
    connectWallet, 
    disconnectWallet,
    switchNetwork
  } = useWeb3();
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleConnectWallet = async () => {
    try {
      setIsReconnecting(true);
      setConnectError(null);
      
      console.log("Memulai proses koneksi wallet...");
      await connectWallet();
      console.log("Koneksi wallet berhasil");
    } catch (error) {
      console.error("Error menghubungkan wallet:", error);
      setConnectError("Gagal menghubungkan wallet. Silakan coba lagi.");
    } finally {
      setIsReconnecting(false);
    }
  };

  const renderWalletButton = () => {
    if (!isConnected) {
      return (
        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={handleConnectWallet}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            disabled={isReconnecting}
          >
            {isReconnecting ? (
              <div className="flex items-center">
                <div className="loader-crypto h-4 w-4 mr-2"></div>
                <span>Menghubungkan...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Hubungkan Wallet</span>
              </div>
            )}
          </button>
          {isReconnecting && <p className="text-sm text-gray-300">Mohon tunggu sementara kami menghubungkan wallet Anda...</p>}
          {connectError && (
            <div className="mt-2 text-sm text-red-400 bg-red-900/30 px-3 py-2 rounded-md border border-red-500/30">
              {connectError}
            </div>
          )}
        </div>
      );
    }
    
    if (!isCorrectNetwork) {
      return (
        <div className="flex flex-col gap-3">
          <div className="backdrop-blur-md bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4 text-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-white">Wallet Terhubung</p>
                <p className="text-sm font-mono text-cyan-300">{address ? truncateAddress(address) : ''}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={refreshConnection}
                  className="bg-indigo-600/50 hover:bg-indigo-600/80 text-white py-1 px-3 rounded-lg text-sm transition-colors flex items-center"
                  disabled={isReconnecting}
                >
                  {isReconnecting ? (
                    <>
                      <div className="loader-crypto h-3 w-3 mr-1"></div>
                      <span>Memuat</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Refresh</span>
                    </>
                  )}
                </button>
                <button
                  onClick={disconnectWallet}
                  className="bg-pink-600/50 hover:bg-pink-600/80 text-white py-1 px-3 rounded-lg text-sm transition-colors"
                  disabled={isReconnecting}
                >
                  Putuskan
                </button>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-indigo-500/30">
              <p className="text-red-400 font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Jaringan Tidak Sesuai!
              </p>
              <p className="text-sm text-gray-300">Aplikasi ini berjalan di {networkConfig.chainName}</p>
              <button
                onClick={switchNetwork}
                className="mt-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-1 px-4 rounded-lg text-sm shadow-lg hover:shadow-purple-500/20 transition-all"
              >
                Beralih ke {networkConfig.chainName}
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col gap-3">
        <div className="backdrop-blur-md bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4 text-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-white">Wallet Terhubung</p>
              <p className="text-sm font-mono text-cyan-300">{address ? truncateAddress(address) : ''}</p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="bg-indigo-600/50 hover:bg-indigo-600/80 text-white py-1 px-3 rounded-lg text-sm transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Opsi
                  <svg className={`ml-1 h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800/90 backdrop-blur-lg rounded-lg shadow-xl z-10 border border-purple-500/30 overflow-hidden transform transition-all">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          refreshConnection();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-indigo-900/50 flex items-center transition-colors"
                        disabled={isReconnecting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {isReconnecting ? "Memuat..." : "Refresh Koneksi"}
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsDiagnosticModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-indigo-900/50 flex items-center transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Diagnostik Sistem
                      </button>
                      
                      <div className="my-1 border-t border-gray-700/50"></div>
                      
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          disconnectWallet();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-900/30 flex items-center transition-colors"
                        disabled={isReconnecting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Putuskan Wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const refreshConnection = async () => {
    setIsReconnecting(true);
    setConnectError(null);
    
    try {
      console.log("Mulai memperbarui koneksi wallet...");
      if (isConnected) {
        await disconnectWallet();
        setTimeout(async () => {
          try {
            await connectWallet();
            console.log("Koneksi wallet berhasil diperbarui");
          } catch (error) {
            console.error("Error menghubungkan kembali wallet:", error);
            setConnectError("Gagal menghubungkan kembali wallet. Silakan coba lagi.");
          } finally {
            setIsReconnecting(false);
          }
        }, 1000);
      } else {
        await connectWallet();
        console.log("Wallet berhasil terhubung");
        setIsReconnecting(false);
      }
    } catch (error) {
      console.error("Error memperbarui koneksi:", error);
      setConnectError("Gagal memperbarui koneksi. Silakan coba lagi.");
      setIsReconnecting(false);
    }
  };

  return (
    <div className="wallet-connect-container mb-6">
      {renderWalletButton()}
      
      {isDiagnosticModalOpen && (
        <CustomDiagnosticModal onClose={() => setIsDiagnosticModalOpen(false)} />
      )}
    </div>
  );
};

const CustomDiagnosticModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [log, setLog] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const { provider, contract, isConnected, isCorrectNetwork } = useWeb3();
  
  const addToLog = (message: string) => {
    setLog(prev => [...prev, message]);
  };

  const clearLog = () => {
    setLog([]);
  };

  const runDiagnostics = async () => {
    clearLog();
    setIsTesting(true);
    
    try {
      addToLog("--- PEMERIKSAAN WALLET ---");
      if (!isConnected) {
        addToLog("❌ Wallet tidak terhubung. Harap hubungkan wallet terlebih dahulu.");
      } else {
        addToLog("✅ Wallet terhubung dengan baik.");
      }

      addToLog("--- PEMERIKSAAN JARINGAN ---");
      if (!isCorrectNetwork) {
        addToLog(`❌ Jaringan tidak sesuai. Aplikasi menggunakan ${networkConfig.chainName}.`);
      } else {
        addToLog(`✅ Terhubung ke jaringan yang benar: ${networkConfig.chainName}.`);
      }

      addToLog("--- PEMERIKSAAN ALAMAT KONTRAK ---");
      if (!isContractDeployed) {
        addToLog("❌ Kontrak belum di-deploy. Harap deploy kontrak terlebih dahulu.");
      } else if (isContractDeployed && isConnected) {
        addToLog(`✅ Alamat kontrak terkonfigurasi dan kontrak terdeteksi sebagai deployed.`);
      }

      addToLog("--- PEMERIKSAAN INSTANCE KONTRAK ---");
      if (!contract) {
        addToLog("❌ Instance kontrak tidak tersedia. Ini mungkin karena masalah pada ABI atau alamat kontrak.");
      } else {
        addToLog("✅ Instance kontrak tersedia dan siap digunakan.");
      }

      addToLog("--- PEMERIKSAAN PROVIDER ---");
      if (!provider) {
        addToLog("❌ Provider Ethereum tidak tersedia.");
      } else {
        addToLog("✅ Provider Ethereum tersedia.");
        try {
          const blockNumber = await provider.getBlockNumber();
          addToLog(`ℹ️ Nomor blok saat ini: ${blockNumber}`);
          
          const network = await provider.getNetwork();
          addToLog(`ℹ️ Terhubung ke jaringan: ${network.name} (Chain ID: ${network.chainId})`);
        } catch (error) {
          addToLog("❌ Gagal mendapatkan informasi dari provider.");
        }
      }

      addToLog("--- DIAGNOSTIK SELESAI ---");
    } catch (error) {
      addToLog(`🔴 Error selama diagnostik: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/90 backdrop-blur-md rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30">
        <div className="px-6 py-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-white">Diagnostik Sistem</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-gray-800/50 rounded-lg border border-indigo-500/20 p-4 mb-4 h-80 overflow-y-auto font-mono text-sm text-gray-300">
            {log.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="loader-crypto"></div>
                <span className="ml-3">Menjalankan diagnostik...</span>
              </div>
            ) : (
              log.map((message, index) => (
                <div key={index} className="mb-1">
                  {message}
                </div>
              ))
            )}
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={runDiagnostics}
              disabled={isTesting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isTesting ? (
                <>
                  <div className="loader-crypto h-4 w-4 mr-2"></div>
                  <span>Mendiagnosis...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Jalankan Lagi</span>
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect; 