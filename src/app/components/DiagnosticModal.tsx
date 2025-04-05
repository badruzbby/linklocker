'use client';

import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Provider';
import { CONTRACT_ADDRESS, networkConfig } from '../utils/web3Config';

const DiagnosticModal = () => {
  const [isOpen, setIsOpen] = useState(false);
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
      if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
        addToLog("❌ Alamat kontrak belum dikonfigurasi. Perbarui alamat kontrak di file web3Config.ts.");
      } else {
        addToLog(`✅ Alamat kontrak terkonfigurasi: ${CONTRACT_ADDRESS}`);
      }

      addToLog("--- PEMERIKSAAN INSTANCE KONTRAK ---");
      if (!contract) {
        addToLog("❌ Instance kontrak tidak tersedia.");
      } else {
        addToLog("✅ Instance kontrak tersedia.");

        addToLog("--- PENGUJIAN FUNGSI KONTRAK ---");
        try {
          addToLog("Mencoba memanggil fungsi getPublicLinks()...");
          const links = await contract.getPublicLinks();
          addToLog(`✅ Fungsi getPublicLinks() berhasil dipanggil. ${links.length} link ditemukan.`);
        } catch (error: any) {
          addToLog(`❌ Error saat memanggil getPublicLinks(): ${error.message}`);
          if (error.code === 'CALL_EXCEPTION') {
            addToLog("Kemungkinan penyebab: ABI tidak cocok dengan kontrak yang di-deploy.");
            addToLog("Pastikan ABI di web3Config.ts sesuai dengan versi kontrak yang di-deploy.");
          }
        }
      }

      addToLog("--- KESIMPULAN ---");
      if (!isConnected) {
        addToLog("🟠 Hubungkan wallet terlebih dahulu untuk diagnosis lengkap.");
      } else if (!isCorrectNetwork) {
        addToLog("🟠 Beralih ke jaringan yang benar untuk diagnosis lengkap.");
      } else if (!contract) {
        addToLog("🔴 Konfigurasi kontrak bermasalah. Periksa alamat kontrak dan ABI.");
      } else {
        addToLog("🟢 Semua pemeriksaan dasar berhasil. Jika masih ada masalah, periksa log konsol untuk detail lebih lanjut.");
      }
    } catch (error: any) {
      addToLog(`❌ Error selama diagnostik: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm"
      >
        Diagnostik Sistem
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Diagnostik Sistem</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                  &times; Tutup
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Diagnostik ini akan memeriksa koneksi wallet, jaringan, dan kontrak untuk membantu menyelesaikan masalah.
                </p>
                
                <button
                  onClick={runDiagnostics}
                  disabled={isTesting}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm mr-2"
                >
                  {isTesting ? "Menjalankan..." : "Jalankan Diagnostik"}
                </button>
                
                <button
                  onClick={clearLog}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm"
                >
                  Bersihkan Log
                </button>
              </div>
              
              <div className="bg-gray-100 p-4 rounded font-mono text-sm h-80 overflow-y-auto">
                {log.length === 0 ? (
                  <p className="text-gray-500">Log akan muncul di sini...</p>
                ) : (
                  log.map((entry, index) => (
                    <div key={index} className="mb-2">
                      {entry}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t">
              <p className="text-xs text-gray-500">
                Tip: Buka konsol browser (F12) untuk log detail lebih lanjut.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DiagnosticModal; 