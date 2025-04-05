'use client';

import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Provider';
import { Visibility, isContractDeployed, CONTRACT_ADDRESS } from '../utils/web3Config';

export interface LinkData {
  id: number;
  title: string;
  url: string;
  description: string;
  visibility: Visibility;
  owner: string;
  createdAt: number;
  updatedAt: number;
}

const ipfsHttpClient = {
  uploadToIPFS: async (data: string): Promise<string> => {
    try {
      if (typeof window === 'undefined') {
        return data; 
      }

      const formData = new FormData();
      const blob = new Blob([data], { type: 'text/plain' });
      formData.append('file', blob);

      const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload ke IPFS gagal');
      }

      const result = await response.json();
      return `ipfs://${result.Hash}`;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      return data; 
    }
  },

  getFromIPFS: async (ipfsHash: string): Promise<string> => {
    try {
      if (!ipfsHash.startsWith('ipfs://')) {
        return ipfsHash;
      }

      const hash = ipfsHash.replace('ipfs://', '');
      const response = await fetch(`https://ipfs.io/ipfs/${hash}`);
      
      if (!response.ok) {
        throw new Error('Gagal mendapatkan data dari IPFS');
      }
      
      return await response.text();
    } catch (error) {
      console.error('Error getting data from IPFS:', error);
      return 'Gagal memuat data dari IPFS';
    }
  }
};

export const useLinkLocker = () => {
  const { contract, address, isConnected, isCorrectNetwork } = useWeb3();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isContractDeployed) {
      setError("Kontrak belum di-deploy. Harap deploy kontrak dan perbarui konfigurasi.");
    } else if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setError("Alamat kontrak tidak valid. Harap perbarui alamat kontrak di file web3Config.ts.");
    } else if (!contract && isConnected) {
      setError("Tidak dapat terhubung ke kontrak. Periksa konfigurasi.");
    } else {
      setError(null);
    }
  }, [contract, isConnected, isCorrectNetwork]);

  const checkContractStatus = (): string | null => {
    if (!isContractDeployed) {
      return "Kontrak LinkLocker belum di-deploy. Harap deploy kontrak dan perbarui konfigurasi.";
    }
    
    if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      return "Alamat kontrak belum dikonfigurasi. Harap perbarui alamat kontrak di file web3Config.ts.";
    }
    
    if (!contract) {
      return "Tidak ada instance kontrak. Harap hubungkan wallet dan coba lagi.";
    }
    
    return null;
  };

  const isIPFSUri = (str: string): boolean => {
    return str.startsWith("ipfs://");
  };

  const formatLinkData = async (
    [id, title, url, description, visibility, owner, createdAt, updatedAt]: [
      ethers.BigNumber,
      string,
      string,
      string,
      number,
      string,
      ethers.BigNumber,
      ethers.BigNumber
    ]
  ): Promise<LinkData> => {
    let resolvedDescription = description;
    if (isIPFSUri(description)) {
      try {
        resolvedDescription = await ipfsHttpClient.getFromIPFS(description);
      } catch (error) {
        resolvedDescription = "Gagal memuat deskripsi dari IPFS";
      }
    }

    return {
      id: id.toNumber(),
      title,
      url,
      description: resolvedDescription,
      visibility: visibility as Visibility,
      owner,
      createdAt: createdAt.toNumber(),
      updatedAt: updatedAt.toNumber(),
    };
  };

  const createLink = useCallback(
    async (
      title: string,
      url: string,
      description: string,
      visibility: Visibility,
      sharedWith: string[] = []
    ): Promise<number> => {
      const contractError = checkContractStatus();
      if (contractError) {
        setError(contractError);
        return 0;
      }
      
      if (!isConnected || !isCorrectNetwork) {
        setError("Connect wallet and switch to correct network first");
        return 0;
      }

      try {
        setLoading(true);
        setError(null);

        let finalDescription = description;
        if (description.length > 500) {
          try {
            finalDescription = await ipfsHttpClient.uploadToIPFS(description);
          } catch (err) {
            console.error("IPFS upload failed, using plaintext:", err);
          }
        }

        const tx = await contract!.createLink(
          title,
          url,
          finalDescription,
          visibility,
          sharedWith
        );
        
        const receipt = await tx.wait();
        
        const event = receipt.events?.find(
          (e: any) => e.event === "LinkCreated"
        );
        
        const linkId = event?.args?.linkId.toNumber() || 0;
        
        setLoading(false);
        return linkId;
      } catch (err: any) {
        console.error("Error creating link:", err);
        setError(err.message || "Failed to create link");
        setLoading(false);
        return 0;
      }
    },
    [contract, isConnected, isCorrectNetwork]
  );

  const updateLink = useCallback(
    async (
      linkId: number,
      title: string,
      url: string,
      description: string,
      visibility: Visibility
    ): Promise<boolean> => {
      const contractError = checkContractStatus();
      if (contractError) {
        setError(contractError);
        return false;
      }
      
      if (!isConnected || !isCorrectNetwork) {
        setError("Connect wallet and switch to correct network first");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        let finalDescription = description;
        if (description.length > 500) {
          try {
            finalDescription = await ipfsHttpClient.uploadToIPFS(description);
          } catch (err) {
            console.error("IPFS upload failed, using plaintext:", err);
          }
        }

        const tx = await contract!.updateLink(
          linkId,
          title,
          url,
          finalDescription,
          visibility
        );

        await tx.wait();
        
        setLoading(false);
        return true;
      } catch (err: any) {
        console.error("Error updating link:", err);
        setError(err.message || "Failed to update link");
        setLoading(false);
        return false;
      }
    },
    [contract, isConnected, isCorrectNetwork]
  );

  const deleteLink = useCallback(
    async (linkId: number): Promise<boolean> => {
      const contractError = checkContractStatus();
      if (contractError) {
        setError(contractError);
        return false;
      }
      
      if (!isConnected || !isCorrectNetwork) {
        setError("Connect wallet and switch to correct network first");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        const tx = await contract!.deleteLink(linkId);

        await tx.wait();
        
        setLoading(false);
        return true;
      } catch (err: any) {
        console.error("Error deleting link:", err);
        setError(err.message || "Failed to delete link");
        setLoading(false);
        return false;
      }
    },
    [contract, isConnected, isCorrectNetwork]
  );

  const shareLink = useCallback(
    async (linkId: number, addresses: string[]): Promise<boolean> => {
      const contractError = checkContractStatus();
      if (contractError) {
        setError(contractError);
        return false;
      }
      
      if (!isConnected || !isCorrectNetwork) {
        setError("Connect wallet and switch to correct network first");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        const tx = await contract!.shareLink(linkId, addresses);

        await tx.wait();
        
        setLoading(false);
        return true;
      } catch (err: any) {
        console.error("Error sharing link:", err);
        setError(err.message || "Failed to share link");
        setLoading(false);
        return false;
      }
    },
    [contract, isConnected, isCorrectNetwork]
  );

  const unshareLink = useCallback(
    async (linkId: number, addresses: string[]): Promise<boolean> => {
      const contractError = checkContractStatus();
      if (contractError) {
        setError(contractError);
        return false;
      }
      
      if (!isConnected || !isCorrectNetwork) {
        setError("Connect wallet and switch to correct network first");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        const tx = await contract!.unshareLink(linkId, addresses);
        await tx.wait();
        
        setLoading(false);
        return true;
      } catch (err: any) {
        console.error("Error unsharing link:", err);
        setError(err.message || "Failed to unshare link");
        setLoading(false);
        return false;
      }
    },
    [contract, isConnected, isCorrectNetwork]
  );

  const getLink = useCallback(
    async (linkId: number): Promise<LinkData | null> => {
      const contractError = checkContractStatus();
      if (contractError) {
        setError(contractError);
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const canAccess = await contract!.canAccess(linkId);
        if (!canAccess) {
          setError("You don't have permission to access this link");
          setLoading(false);
          return null;
        }

        const linkData = await contract!.getLink(linkId);
        const formattedLink = await formatLinkData(linkData);
        
        setLoading(false);
        return formattedLink;
      } catch (err: any) {
        console.error("Error getting link:", err);
        setError(err.message || "Failed to get link");
        setLoading(false);
        return null;
      }
    },
    [contract]
  );

  const retryOperation = async (operation: () => Promise<any>, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        console.log(`Attempt ${i+1} failed, retrying in ${delay}ms...`);
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  };

  const getMyLinks = useCallback(
    async (): Promise<LinkData[]> => {
      const contractError = checkContractStatus();
      if (contractError) {
        setError(contractError);
        return [];
      }
      
      if (!isConnected) {
        setError("Connect wallet first");
        return [];
      }

      try {
        setLoading(true);
        setError(null);

        const getLinks = async () => {
          try {
            console.log("Memanggil getMyLinks pada kontrak:", CONTRACT_ADDRESS);
            
            const linkIds = await contract!.getMyLinks();
            console.log("Link IDs diterima:", linkIds);
            
            const links: LinkData[] = [];
            for (const id of linkIds) {
              try {
                console.log("Mencoba mengambil link dengan ID:", id.toString());
                const linkData = await contract!.getLink(id);
                const formattedLink = await formatLinkData(linkData);
                links.push(formattedLink);
              } catch (err) {
                console.error(`Error getting link ID ${id}:`, err);
              }
            }
            
            return links;
          } catch (error: any) {
            console.error("Error dalam getLinks:", error);
            if (error.code === 'CALL_EXCEPTION' || error.message.includes('decode') || error.message.includes('call revert')) {
              throw new Error(`Kemungkinan masalah ABI: ${error.message}. Pastikan ABI cocok dengan kontrak yang di-deploy.`);
            }
            throw error;
          }
        };
        
        try {
          const links = await retryOperation(getLinks, 3, 1500);
          setLoading(false);
          return links;
        } catch (err: any) {
          if (err.message.includes('ABI')) {
            setError(`Masalah dengan ABI kontrak: ${err.message}`);
          } else {
            setError(err.message || "Failed to get links");
          }
          setLoading(false);
          return [];
        }
      } catch (err: any) {
        console.error("Error getting my links:", err);
        setError(err.message || "Failed to get links");
        setLoading(false);
        return [];
      }
    },
    [contract, isConnected]
  );

  const getSharedWithMe = useCallback(
    async (): Promise<LinkData[]> => {
      const contractError = checkContractStatus();
      if (contractError) {
        setError(contractError);
        return [];
      }
      
      if (!isConnected) {
        setError("Connect wallet first");
        return [];
      }

      try {
        setLoading(true);
        setError(null);

        const linkIds = await contract!.getSharedWithMe();
        
        const links: LinkData[] = [];
        for (const id of linkIds) {
          try {
            const linkData = await contract!.getLink(id);
            const formattedLink = await formatLinkData(linkData);
            links.push(formattedLink);
          } catch (err) {
            console.error(`Error getting shared link ID ${id}:`, err);
          }
        }
        
        setLoading(false);
        return links;
      } catch (err: any) {
        console.error("Error getting shared links:", err);
        setError(err.message || "Failed to get shared links");
        setLoading(false);
        return [];
      }
    },
    [contract, isConnected]
  );

  const getPublicLinks = useCallback(
    async (): Promise<LinkData[]> => {
      const contractError = checkContractStatus();
      if (contractError) {
        setError(contractError);
        return [];
      }

      try {
        setLoading(true);
        setError(null);

        const linkIds = await contract!.getPublicLinks();
        
        const links: LinkData[] = [];
        for (const id of linkIds) {
          try {
            const linkData = await contract!.getLink(id);
            const formattedLink = await formatLinkData(linkData);
            links.push(formattedLink);
          } catch (err) {
            console.error(`Error getting public link ID ${id}:`, err);
          }
        }
        
        setLoading(false);
        return links;
      } catch (err: any) {
        console.error("Error getting public links:", err);
        setError(err.message || "Failed to get public links");
        setLoading(false);
        return [];
      }
    },
    [contract]
  );

  const getSharedAddresses = useCallback(
    async (linkId: number): Promise<string[]> => {
      const contractError = checkContractStatus();
      if (contractError) {
        setError(contractError);
        return [];
      }
      
      if (!isConnected) {
        setError("Connect wallet first");
        return [];
      }

      try {
        setLoading(true);
        setError(null);

        // Buat mekanisme untuk mengambil alamat yang telah dibagikan
        // Catatan: Kontrak perlu memiliki metode getSharedAddresses atau sejenisnya
        // Jika tidak ada, kita bisa membuat simulasi untuk prototyping
        
        try {
          // Periksa apakah kontrak memiliki fungsi getSharedAddresses
          if (typeof contract!.getSharedAddresses === 'function') {
            const addresses = await contract!.getSharedAddresses(linkId);
            setLoading(false);
            return addresses;
          } else {
            console.log("Kontrak tidak memiliki fungsi getSharedAddresses, membuat simulasi data");
            // Simulasi data jika kontrak tidak memiliki fungsi tersebut
            // Dalam implementasi sebenarnya, ini perlu ditambahkan ke kontrak
            setLoading(false);
            return [];
          }
        } catch (err) {
          console.error("Error mendapatkan alamat yang dibagikan:", err);
          setLoading(false);
          return [];
        }
        
      } catch (err: any) {
        console.error("Error getting shared addresses:", err);
        setError(err.message || "Failed to get shared addresses");
        setLoading(false);
        return [];
      }
    },
    [contract, isConnected]
  );

  const getSharedByInfo = useCallback(
    async (linkId: number): Promise<{ owner: string; sharedDate: number } | null> => {
      const contractError = checkContractStatus();
      if (contractError) {
        setError(contractError);
        return null;
      }
      
      if (!isConnected) {
        setError("Connect wallet first");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        
        const linkData = await getLink(linkId);
        
        if (linkData) {
          setLoading(false);
          return {
            owner: linkData.owner,
            sharedDate: linkData.updatedAt 
          };
        }
        
        setLoading(false);
        return null;
      } catch (err: any) {
        console.error("Error getting shared by info:", err);
        setError(err.message || "Failed to get sharing information");
        setLoading(false);
        return null;
      }
    },
    [contract, isConnected, getLink]
  );

  return {
    createLink,
    updateLink,
    deleteLink,
    shareLink,
    unshareLink,
    getLink,
    getMyLinks,
    getSharedWithMe,
    getPublicLinks,
    getSharedAddresses,
    getSharedByInfo,
    loading,
    error,
  };
}; 