'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { LinkLockerABI, CONTRACT_ADDRESS, networkConfig, isContractDeployed } from '../utils/web3Config';

interface Web3ContextType {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  address: string | null;
  chainId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  switchNetwork: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  contract: null,
  address: null,
  chainId: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isConnected: false,
  isCorrectNetwork: false,
  switchNetwork: async () => {},
});

export const useWeb3 = () => useContext(Web3Context);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [web3Modal, setWeb3Modal] = useState<Web3Modal | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [address, setAddress] = useState<string>('');
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);

  const initializeContract = useCallback(async () => {
    if (!provider) {
      console.log("Tidak ada provider yang tersedia");
      return null;
    }

    if (!isContractDeployed || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      console.log("Kontrak belum di-deploy atau alamat kontrak tidak valid");
      return null;
    }

    try {
      console.log("Mencoba inisialisasi kontrak di alamat:", CONTRACT_ADDRESS);
      const signerInstance = provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, LinkLockerABI, signerInstance);
      
      try {
        console.log("Memvalidasi kontrak dengan mencoba memanggil getPublicLinks()...");
        await contractInstance.getPublicLinks();
        console.log("Validasi kontrak berhasil - fungsi getPublicLinks() dapat dipanggil");
      } catch (validationError: any) {
        console.warn("Validasi kontrak gagal:", validationError.message);
        if (validationError.code === 'CALL_EXCEPTION') {
          console.error("CALL_EXCEPTION: ABI mungkin tidak cocok dengan kontrak yang di-deploy");
          console.error("Detail error:", validationError);
        }
      }
      
      return contractInstance;
    } catch (error) {
      console.error("Error saat inisialisasi kontrak:", error);
      return null;
    }
  }, [provider]);

  useEffect(() => {
    const initWeb3Modal = async () => {
      try {
        console.log("Memulai inisialisasi Web3Modal...");
        const web3ModalInstance = new Web3Modal({
          network: "sepolia", 
          cacheProvider: true,
          providerOptions: {
          }
        });
        console.log("Web3Modal berhasil diinisialisasi");
        setWeb3Modal(web3ModalInstance);

        if (web3ModalInstance.cachedProvider) {
          try {
            console.log("Provider tersimpan ditemukan, mencoba auto-connect...");
            await connectWallet(web3ModalInstance);
          } catch (error) {
            console.error("Error auto-connecting:", error);
          }
        }
      } catch (error) {
        console.error("Error initializing Web3Modal:", error);
      }
    };

    initWeb3Modal();
  }, []);

  const connectWallet = async (modalInstance?: Web3Modal) => {
    try {
      console.log("Mulai proses koneksi wallet...");
      const modal = modalInstance || web3Modal;
      if (!modal) {
        console.error("Web3Modal tidak tersedia");
        throw new Error("Web3Modal tidak tersedia");
      }

      console.log("Meminta koneksi dari Web3Modal...");
      const instance = await modal.connect();
      console.log("Koneksi berhasil diperoleh dari Web3Modal");
      
      console.log("Membuat provider Ethers dari instance...");
      const ethersProvider = new ethers.providers.Web3Provider(instance);
      console.log("Berhasil membuat provider Ethers");
      
      const ethSigner = ethersProvider.getSigner();
      console.log("Berhasil mendapatkan signer Ethers");
      
      const userAddress = await ethSigner.getAddress();
      console.log("Alamat user:", userAddress);
      
      const { chainId: userChainId } = await ethersProvider.getNetwork();
      console.log("Chain ID user:", userChainId);

      setProvider(ethersProvider);
      setSigner(ethSigner);
      setAddress(userAddress);
      setChainId(userChainId);
      setIsConnected(true);
      setIsCorrectNetwork(userChainId === networkConfig.chainId);

      console.log("Menginisialisasi instance kontrak...");
      const contractInstance = await initializeContract();
      setContract(contractInstance);

      console.log("Menambahkan event listener untuk wallet...");
      instance.on('accountsChanged', (accounts: string[]) => {
        console.log("Accounts changed event:", accounts);
        if (accounts.length === 0) {
          console.log("Wallet terputus, menjalankan disconnectWallet()");
          disconnectWallet();
        } else {
          console.log("Akun berubah, me-refresh halaman");
          window.location.reload();
        }
      });

      instance.on('chainChanged', () => {
        console.log("Chain changed event, me-refresh halaman");
        window.location.reload();
      });

      console.log("Proses koneksi wallet selesai");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setIsConnected(false);
      setProvider(null);
      setSigner(null);
      setContract(null);
      setAddress('');
      setChainId(null);
      throw error;
    }
  };

  const disconnectWallet = () => {
    console.log("Memutuskan koneksi wallet...");
    if (web3Modal) {
      web3Modal.clearCachedProvider();
      console.log("Cache provider dibersihkan");
    }
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAddress('');
    setChainId(null);
    setIsConnected(false);
    setIsCorrectNetwork(false);
    console.log("Koneksi wallet berhasil diputus");
  };

  const switchNetwork = async () => {
    if (!provider) {
      console.error("Provider tidak tersedia");
      return;
    }
    
    try {
      console.log("Mencoba beralih ke jaringan:", networkConfig.chainName);
      await provider.send('wallet_switchEthereumChain', [
        { chainId: ethers.utils.hexValue(networkConfig.chainId) },
      ]);
      console.log("Berhasil beralih ke jaringan:", networkConfig.chainName);
    } catch (switchError: any) {
      console.error("Error saat beralih jaringan:", switchError);
      
      if (switchError.code === 4902) {
        try {
          console.log("Jaringan tidak ada dalam wallet, mencoba menambahkan...");
          await provider.send('wallet_addEthereumChain', [
            {
              chainId: ethers.utils.hexValue(networkConfig.chainId),
              chainName: networkConfig.chainName,
              rpcUrls: networkConfig.rpcUrls,
              blockExplorerUrls: networkConfig.blockExplorerUrls,
              nativeCurrency: networkConfig.nativeCurrency,
            },
          ]);
          console.log("Berhasil menambahkan jaringan:", networkConfig.chainName);
        } catch (addError) {
          console.error('Error adding network:', addError);
        }
      }
    }
  };

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        contract,
        address,
        chainId,
        connectWallet: () => connectWallet(),
        disconnectWallet,
        isConnected,
        isCorrectNetwork,
        switchNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider; 