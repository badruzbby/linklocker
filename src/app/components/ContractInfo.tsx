'use client';

import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Provider';
import { isContractDeployed, CONTRACT_ADDRESS, networkConfig } from '../utils/web3Config';

const ContractInfo = () => {
  const { isConnected, isCorrectNetwork, chainId, contract } = useWeb3();
  const [showDetails, setShowDetails] = useState(false);
  const [contractStatus, setContractStatus] = useState<string | null>(null);

  const getConnectionStatus = () => {
    if (!isConnected) {
      return (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Status Koneksi: Tidak Terhubung</p>
          <p>Silakan hubungkan dompet Anda menggunakan tombol Connect di atas.</p>
        </div>
      );
    }

    if (!isCorrectNetwork) {
      return (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Status Jaringan: Jaringan Salah</p>
          <p>Silakan pindah ke jaringan {networkConfig.chainName} ({networkConfig.chainId}).</p>
        </div>
      );
    }

    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        <p className="font-bold">Status Koneksi: Terhubung</p>
        <p>Anda telah terhubung ke jaringan {networkConfig.chainName}.</p>
      </div>
    );
  };

  const getContractStatus = () => {
    if (!isContractDeployed) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Status Kontrak: Tidak Ter-deploy</p>
          <p>Kontrak LinkLocker belum di-deploy. Aplikasi ini tidak akan bekerja dengan benar.</p>
          <p className="mt-2">Untuk men-deploy kontrak:</p>
          <ol className="list-decimal ml-6 mt-1">
            <li>Deploy kontrak LinkLocker.sol ke jaringan {networkConfig.chainName}</li>
            <li>Perbarui alamat kontrak di file web3Config.ts</li>
            <li>Ubah flag isContractDeployed menjadi true</li>
            <li>Holesky adalah testnet baru Ethereum yang menggantikan Goerli dan memiliki gas fee lebih rendah dari Sepolia</li>
          </ol>
        </div>
      );
    }

    if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Status Kontrak: Alamat Tidak Valid</p>
          <p>Alamat kontrak belum dikonfigurasi dengan benar.</p>
          <p className="mt-2">Silakan perbarui file web3Config.ts dengan alamat kontrak yang benar.</p>
        </div>
      );
    }

    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="font-bold">Status Kontrak: Siap</p>
          <button 
            onClick={() => { setShowDetails(!showDetails); checkContract(); }}
            className="px-3 py-1 bg-green-200 hover:bg-green-300 rounded text-sm"
          >
            {showDetails ? 'Sembunyikan Detail' : 'Lihat Detail'}
          </button>
        </div>
        <p>Kontrak LinkLocker telah di-deploy di alamat: {CONTRACT_ADDRESS}</p>
        
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <h3 className="font-semibold mb-2">Informasi Teknis:</h3>
            {contractStatus && (
              <p className="text-sm mb-2">{contractStatus}</p>
            )}
            <p className="text-xs">Alamat: {CONTRACT_ADDRESS}</p>
            <p className="text-xs">Jaringan: {networkConfig.chainName} (ID: {networkConfig.chainId})</p>
            <p className="text-xs mt-2">
              <strong>Tips:</strong> Jika Anda mengalami masalah dengan kontrak, pastikan ABI yang digunakan sesuai dengan kontrak yang di-deploy.
            </p>
          </div>
        )}
      </div>
    );
  };

  const checkContract = async () => {
    if (!contract) {
      setContractStatus("Tidak ada instance kontrak yang tersedia");
      return;
    }

    try {
      setContractStatus("Memeriksa kontrak...");
      
      if (typeof contract.getPublicLinks === 'function') {
        await contract.getPublicLinks();
        setContractStatus("Kontrak berfungsi dengan baik ✅");
      } else {
        setContractStatus("Fungsi getPublicLinks tidak ditemukan pada kontrak ❌");
      }
    } catch (error: any) {
      console.error("Error checking contract:", error);
      
      if (error.code === 'CALL_EXCEPTION') {
        setContractStatus("Error CALL_EXCEPTION: ABI mungkin tidak cocok dengan kontrak yang di-deploy ❌");
      } else {
        setContractStatus(`Error: ${error.message} ❌`);
      }
    }
  };

  return (
    <div className="my-4">
      {getConnectionStatus()}
      {getContractStatus()}
    </div>
  );
};

export default ContractInfo; 