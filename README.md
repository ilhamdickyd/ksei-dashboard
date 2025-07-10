# KSEI Financial Dashboard 📊

![Dashboard Preview](https://via.placeholder.com/1200x600/3a86ff/ffffff?text=KSEI+Financial+Dashboard)

## 📌 Overview

KSEI Financial Dashboard adalah aplikasi web interaktif yang dirancang untuk memvisualisasikan dan menganalisis data keuangan dari Kustodian Sentral Efek Indonesia (KSEI). Dashboard ini menyajikan visualisasi data yang komprehensif dan interaktif untuk membantu pengguna memahami dan menganalisis tren pasar keuangan Indonesia.

### 🌟 Fitur Utama

- **Multi-perspektif Data**: Analisis tiga kategori utama data keuangan:
  - **Persebaran Keuangan**: Data pasar modal, reksa dana, C-BEST, dan SBN
  - **Sebaran Investor Domestik**: Distribusi investor berdasarkan wilayah di Indonesia
  - **Demografi Investor Individu**: Analisis investor berdasarkan jenis kelamin, umur, pekerjaan, pendidikan, dan pendapatan

- **Visualisasi Interaktif**: Grafik-grafik interaktif yang menyajikan data dalam bentuk:
  - Line charts untuk tren bulanan
  - Bar charts untuk perbandingan nilai
  - Donut charts untuk distribusi proporsi
  - Area charts untuk analisis pertumbuhan

- **Filter dan Perbandingan**: Kemampuan untuk memfilter dan membandingkan data berdasarkan:
  - Tahun (2021-2024)
  - Bulan
  - Kategori
  - Wilayah
  - Demografi

- **Analisis Multi-dimensi**: Tiga tab utama untuk setiap kategori data:
  - **Overview**: Gambaran umum metrik kunci dan distribusi
  - **Analysis**: Analisis mendalam dengan tren pertumbuhan dan volatilitas
  - **Comparison**: Perbandingan lintas kategori dan periode

## 🔧 Teknologi

Dashboard ini dibangun menggunakan teknologi modern:

- **Frontend**:
  - React.js dengan Next.js
  - TypeScript untuk type safety
  - Tailwind CSS untuk styling yang responsif
  - shadcn/ui untuk komponen UI yang elegan

- **Visualisasi Data**:
  - Recharts untuk visualisasi data interaktif
  - Custom tooltips dan formatters untuk pengalaman pengguna yang optimal

- **State Management**:
  - React Hooks (useState, useCallback, useMemo) untuk manajemen state efisien
  - Context API untuk state global (jika diperlukan)

## 📚 Struktur Aplikasi

Dashboard terdiri dari tiga komponen utama:

### 1. Persebaran Keuangan

Menyajikan analisis kategori keuangan utama termasuk:
- Pasar Modal
- Reksa Dana
- C-BEST
- SBN

![Persebaran Keuangan](https://via.placeholder.com/800x400/3a86ff/ffffff?text=Persebaran+Keuangan)

### 2. Sebaran Investor Domestik

Menyajikan analisis distribusi investor berdasarkan wilayah:
- Jawa
- Sumatera
- Kalimantan
- Sulawesi
- Bali, NTT, NTB
- Maluku & Papua

![Sebaran Investor Domestik](https://via.placeholder.com/800x400/4CAF50/ffffff?text=Sebaran+Investor+Domestik)

### 3. Demografi Investor Individu

Menyajikan analisis investor individu berdasarkan:
- Jenis Kelamin
- Umur
- Pekerjaan
- Pendidikan
- Pendapatan

![Demografi Investor Individu](https://via.placeholder.com/800x400/FFC107/ffffff?text=Demografi+Investor+Individu)

## 🚀 Panduan Penggunaan

### Navigasi Dashboard

1. **Pemilihan Kategori Utama**:
   - Gunakan tombol atas untuk memilih antara Persebaran Keuangan, Sebaran Investor Domestik, atau Demografi Investor Individu.

2. **Pemilihan Tahun**:
   - Gunakan dropdown untuk memilih tahun tertentu atau "Semua Tahun" untuk melihat data agregat.

3. **Navigasi Tab**:
   - Pilih tab "Overview", "Analysis", atau "Comparison" untuk melihat perspektif berbeda dari data.

4. **Filter Data**:
   - Gunakan filter wilayah/kategori untuk menyaring data yang ingin ditampilkan.
   - Pilih atau hapus elemen dari filter untuk menyesuaikan visualisasi.

### Interaksi dengan Grafik

- **Hover**: Arahkan kursor ke elemen grafik untuk melihat informasi detail.
- **Legenda**: Klik pada legenda untuk menampilkan/menyembunyikan kategori tertentu.
- **Filter**: Gunakan tombol filter untuk menyaring data berdasarkan wilayah atau kategori.

## 📊 Metrik Kunci

Dashboard menyajikan berbagai metrik keuangan penting:

- **Metrik Aset**:
  - Total Aset (dalam Triliun Rupiah)
  - Pertumbuhan Aset (persentase)
  - Volatilitas Aset (persentase)

- **Metrik Investor**:
  - Persentase Investor
  - Pertumbuhan Investor (persentase)
  - Distribusi Investor berdasarkan demografi

- **Metrik Pertumbuhan**:
  - Year-over-Year Growth
  - Month-over-Month Growth
  - Quarter-over-Quarter Growth

## 🛠️ Instalasi & Pengembangan

### Prasyarat

- Node.js (versi 16.x atau lebih tinggi)
- npm atau yarn
- Git

### Langkah Instalasi

1. Clone repositori:
   ```bash
   git clone https://github.com/yourusername/ksei-financial-dashboard.git
   cd ksei-financial-dashboard
   ```

2. Instal dependensi:
   ```bash
   npm install
   # atau
   yarn install
   ```

3. Jalankan aplikasi dalam mode pengembangan:
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

4. Buka browser dan akses `http://localhost:3000`

### Struktur Proyek

```
ksei-financial-dashboard/
├── components/              # Komponen React
│   ├── ui/                  # Komponen UI dasar
│   ├── SebaranInvestorDomestik.tsx
│   ├── DemografiInvestorIndividu.tsx
│   └── FinancialDashboard.tsx
├── data/                    # Sumber data
│   ├── demographicData.ts
│   ├── financialData.ts
│   └── investorData.ts
├── types/                   # Type definitions
├── pages/                   # Next.js pages
├── public/                  # Aset statis
└── styles/                  # CSS global
```

## 🔍 Sumber Data

Data yang digunakan dalam dashboard ini berasal dari Kustodian Sentral Efek Indonesia (KSEI), lembaga resmi yang bertanggung jawab untuk penyimpanan dan penyelesaian transaksi efek di Indonesia.

Format data yang digunakan:

```typescript
// Financial Data
interface FinancialDataEntry {
  year: string;
  category: string;
  Jan: number;
  Feb: number;
  // ... other months
  Dec: number;
}

// Investor Data
interface InvestorDataEntry {
  year: string;
  month: string;
  region: string;
  assetTrillionRp: number;
  investorPercentage: number;
}

// Demographic Data
interface DemographicDataEntry {
  year: string;
  month: string;
  categories: {
    gender: Record<string, { assetTrillionRp: number }>;
    age: Record<string, { assetTrillionRp: number }>;
    occupation: Record<string, { assetTrillionRp: number }>;
    education: Record<string, { assetTrillionRp: number }>;
    income: Record<string, { assetTrillionRp: number }>;
  };
}
```

## 🔮 Pengembangan Masa Depan

Beberapa fitur yang direncanakan untuk pengembangan di masa depan:

- **Prediktif Analytics**: Implementasi model prediksi tren berdasarkan data historis
- **Export Data**: Kemampuan untuk mengunduh data dalam format CSV atau Excel
- **Custom Date Ranges**: Filter data berdasarkan rentang tanggal kustom
- **Mobile App**: Versi aplikasi mobile untuk akses pada perangkat iOS dan Android
- **API Integration**: Koneksi langsung ke API KSEI untuk data real-time

## 📝 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE)

## 👥 Kontribusi

Kontribusi untuk pengembangan dashboard ini sangat diterima. Untuk berkontribusi:

1. Fork repositori
2. Buat branch fitur (`git checkout -b feature/amazing-feature`)
3. Commit perubahan Anda (`git commit -m 'Add some amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buka Pull Request

## 🙏 Acknowledgements

- Data dari KSEI (Kustodian Sentral Efek Indonesia)
- React, Next.js, dan TypeScript
- Tailwind CSS dan shadcn/ui
- Recharts untuk visualisasi data
- Semua kontributor yang telah membantu proyek ini

---

© 2025 KSEI Financial Dashboard. All Rights Reserved.
