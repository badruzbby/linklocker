export const truncateAddress = (
  address: string, 
  prefixLength: number = 6, 
  suffixLength: number = 4
): string => {
  if (!address) return '';
  
  if (address.length <= prefixLength + suffixLength) {
    return address;
  }
  
  const prefix = address.substring(0, prefixLength);
  const suffix = address.substring(address.length - suffixLength);
  
  return `${prefix}...${suffix}`;
};

/**
 * Memformat tanggal untuk tampilan
 * 
 * @param timestamp - Timestamp dalam bentuk detik
 * @returns String tanggal yang sudah diformat
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Mengecek apakah browser mendukung clipboard API
 * 
 * @returns boolean
 */
export const isClipboardSupported = (): boolean => {
  return !!(
    typeof navigator !== 'undefined' && 
    navigator.clipboard && 
    navigator.clipboard.writeText
  );
};

/**
 * Menyalin teks ke clipboard
 * 
 * @param text - Teks yang akan disalin
 * @returns Promise yang berhasil jika penyalinan sukses
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!isClipboardSupported()) {
    console.error('Clipboard API tidak didukung di browser ini');
    return false;
  }
  
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Gagal menyalin ke clipboard:', err);
    return false;
  }
};

/**
 * Memeriksa apakah string merupakan URL valid
 * 
 * @param url - String URL yang akan diperiksa
 * @returns boolean
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Memeriksa apakah nilai merupakan objek
 * 
 * @param value - Nilai yang akan diperiksa
 * @returns boolean
 */
export const isObject = (value: any): boolean => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

/**
 * Mengembalikan visibility label berdasarkan nilai
 * 
 * @param visibility - Nilai visibility (0, 1, 2)
 * @returns String label
 */
export const getVisibilityLabel = (visibility: number): string => {
  switch (visibility) {
    case 0:
      return 'Pribadi';
    case 1:
      return 'Dibagikan';
    case 2:
      return 'Publik';
    default:
      return 'Tidak diketahui';
  }
};

/**
 * Sleep function untuk menunda eksekusi async
 * 
 * @param ms - Waktu penundaan dalam milidetik
 * @returns Promise yang resolve setelah penundaan
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
}; 