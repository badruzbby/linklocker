# <div align="center">🔗 LinkLocker DApp</div>

<div align="center">

![Status Project](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![IPFS](https://img.shields.io/badge/IPFS-65C2CB?style=for-the-badge&logo=ipfs&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

**Aplikasi terdesentralisasi untuk menyimpan dan mengelola link pada blockchain dengan UI yang modern dan menarik.**

[Fitur](#-fitur) • [Demo](#-demo) • [Teknologi](#-teknologi) • [Instalasi](#-instalasi) • [Penggunaan](#-penggunaan) • [Kontribusi](#-kontribusi) • [Lisensi](#-lisensi)

![LinkLocker DApp Screenshot]<img src="https://imgur.com/u59XzFe" alt="LinkLocker DApp Screenshot" width="800px" />

</div>

## 🚀 Fitur

<img align="right" width="300" src="https://placehold.co/300x450?text=App+Features" alt="Features" />

- ✨ **Menyimpan link secara terdesentralisasi** menggunakan smart contract Ethereum
- 📁 **Akses ke IPFS** untuk menyimpan deskripsi link yang panjang
- 🔒 **Privasi terjamin** dengan opsi penyimpanan privat 
- 🔄 **Berbagi yang fleksibel** dengan alamat wallet spesifik
- 🌐 **Akses publik** untuk konten yang ingin disebarluaskan
- 🔌 **Koneksi wallet yang mudah** melalui Web3Modal
- 🔍 **Diagnostik sistem** untuk membantu mengatasi masalah dengan cepat
- 🎨 **UI yang intuitif** dirancang dengan TailwindCSS
- ⚡ **Performa tinggi** dengan arsitektur React/Next.js

## 🌟 Demo

> **Live Demo**: [Link ke Demo](https://dl3.badruz.com) 

<details>
<summary>🖼️ Lihat Screenshot</summary>
<br>

| Halaman Utama | Manajemen Link |
|:---:|:---:|:---:|
|![Home](https://imgur.com/u59XzFe)|![Management](hhttps://imgur.com/LWe8vq6)|

</details>

## 🔐 Fitur Berbagi Link

LinkLocker menawarkan **tiga tingkat visibilitas** untuk link Anda:

| 🔒 **Pribadi** | 👥 **Dibagikan** | 🌐 **Publik** |
|----------------|------------------|---------------|
| Hanya Anda yang dapat melihat | Anda dan alamat yang ditentukan | Semua orang dapat melihat |

### 🤝 Cara Berbagi Link

1. Saat membuat link baru, pilih opsi "**Dibagikan**" dan masukkan alamat wallet
2. Untuk link yang sudah ada, klik **ikon edit** dan ubah visibilitas
3. Gunakan **pengelola alamat** untuk menambah/menghapus alamat yang dibagikan

<details>
<summary>💫 Fitur Manajemen Alamat Berbagi</summary>
<br>

- ➕ Tambahkan alamat satu per satu atau beberapa sekaligus
- 📋 Dukungan untuk paste teks dengan multiple alamat
- 📊 Lihat semua alamat yang sudah dibagikan
- ❌ Hapus alamat dari daftar berbagi dengan mudah
- ✅ Validasi otomatis format alamat Ethereum

</details>

## 🛠️ Teknologi

<div align="center">

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-5.7-2535a0?style=flat-square&logo=ethereum)](https://docs.ethers.io/)
[![Web3Modal](https://img.shields.io/badge/Web3Modal-Latest-21325b?style=flat-square&logo=ethereum)](https://web3modal.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![IPFS](https://img.shields.io/badge/IPFS-HTTP_API-65C2CB?style=flat-square&logo=ipfs)](https://ipfs.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-007ACC?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8-363636?style=flat-square&logo=solidity)](https://soliditylang.org/)

</div>

## 📦 Instalasi

```bash
# Clone repositori
git clone https://github.com/badruzbby/linklocker.git
cd linklocker

# Instal dependensi
npm install

# Konfigurasi kontrak
# Edit file src/app/utils/web3Config.ts dan masukkan alamat kontrak yang sudah di-deploy
```

## 🔧 Penggunaan

```bash
# Jalankan aplikasi dalam mode development
npm run dev

# Buat build untuk production
npm run build

# Jalankan server production
npm start
```

### 📝 Konfigurasi Kontrak

Edit file `src/app/utils/web3Config.ts` dan masukkan alamat kontrak yang sudah di-deploy:

```typescript
export const CONTRACT_ADDRESS = "0xYourContractAddress";
export const isContractDeployed = true;
```

## ⚠️ Mengatasi Masalah Umum

<details>
<summary><b>🚨 Error CALL_EXCEPTION</b></summary>
<br>

Jika Anda melihat error "CALL_EXCEPTION", kemungkinan penyebabnya adalah:

1. ABI tidak cocok dengan kontrak yang di-deploy
2. Alamat kontrak salah
3. Kontrak tidak di-deploy di jaringan yang benar

💡 **Solusi**: tunggu selama beberapa detik lalu tekan tombol refresh di panel wallet atau Gunakan fitur "Diagnostik Sistem" untuk mengidentifikasi masalah.

</details>

<details>
<summary><b>🔌 Masalah Koneksi Wallet</b></summary>
<br>

Jika Anda mengalami masalah dengan koneksi wallet:

1. Pastikan Anda menggunakan jaringan yang benar (Holesky Testnet)
2. Coba gunakan tombol "Refresh" di panel wallet 
3. Buka konsol browser untuk melihat error lebih detail

</details>

<details>
<summary><b>🔄 Data Tidak Muncul</b></summary>
<br>

Jika link Anda tidak muncul setelah ditambahkan:

1. Gunakan tombol "Refresh" di panel tab
2. Pastikan transaksi Anda telah dikonfirmasi di blockchain
3. Verifikasi bahwa Anda berada di jaringan yang benar

</details>

## 📁 Struktur Proyek

```
linklocker/
├── src/
│   ├── app/
│   │   ├── components/     # Komponen React
│   │   ├── context/        # Context API untuk state global
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Fungsi utilitas dan konfigurasi
├── contracts/              # Smart contract (jika disertakan)
├── public/                 # Aset statis
└── README.md               # Anda sedang membacanya!
```

## 👥 Kontribusi

Kami sangat mengapresiasi kontribusi Anda! Berikut beberapa cara untuk berkontribusi:

1. 🍴 **Fork** repositori ini
2. 🔧 **Buat branch fitur** (`git checkout -b feature/AmazingFeature`)
3. 💾 **Commit perubahan** (`git commit -m 'Add some AmazingFeature'`)
4. 📤 **Push ke branch** (`git push origin feature/AmazingFeature`)
5. 🔃 **Buka Pull Request**

<details>
<summary>💡 <b>Ide untuk Kontribusi</b></summary>
<br>

- **Fitur baru**: Tambahkan fitur seperti notifikasi, label, atau kategori untuk link
- **Peningkatan UI/UX**: Buat UI yang lebih responsif atau tambahkan animasi
- **Integrasi Web3**: Tambahkan dukungan untuk jaringan blockchain lain
- **Dokumentasi**: Perbaiki atau perluas dokumentasi
- **Testing**: Tambahkan pengujian untuk komponen atau kontrak
- **Lokalisasi**: Terjemahkan ke bahasa lain

</details>

### 🌱 Panduan untuk Kontributor Baru

Kami sangat menyambut kontributor baru! Jika Anda baru pertama kali berkontribusi:

1. Cari issue bertanda ["good first issue"](https://github.com/badruzbby/linklocker/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
2. Baca [panduan kontribusi](CONTRIBUTING.md) kami

## 📄 Lisensi

LinkLocker DApp dilisensikan di bawah [Lisensi MIT](LICENSE).

---

<div align="center">

💙 **Dibuat dengan 🔗 dan 🌐 untuk komunitas Web3**

[![Twitter Follow](https://img.shields.io/twitter/follow/Badz45317195?style=social)](https://twitter.com/your-twitter)
[![GitHub stars](https://img.shields.io/github/stars/badruzbby/linklocker?style=social)](https://github.com/badruzbby/linklocker)

</div>
