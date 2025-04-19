# Analisis Biaya Firebase untuk BengkelKu

## Estimasi Penggunaan per Bengkel/Bulan

### 1. Authentication
- 100 pengguna aktif/bulan
- Login: ~3x/hari/user = 9,000 auth/bulan

### 2. Firestore Database
Asumsi 1 bengkel menengah:
- 500 service records
- 1,000 inventory items
- 2,000 customer records
- 1,000 invoices
- 5,000 transactions

Estimasi:
- Reads: 10,000/hari = 300,000/bulan
- Writes: 1,000/hari = 30,000/bulan
- Deletes: 100/hari = 3,000/bulan
- Storage: ~100MB data

### 3. Cloud Storage
- Foto service: ~500KB x 500 = 250MB
- Dokumen: ~1MB x 100 = 100MB
- Total: ~350MB/bengkel

### 4. Bandwidth
- Download: ~2GB/bulan
- Upload: ~500MB/bulan

## Biaya Firebase (Free Tier)

### Gratis per Bulan:
- Authentication: 50,000 auth
- Firestore:
  - 50,000 reads/hari
  - 20,000 writes/hari
  - 20,000 deletes/hari
  - 1GB storage
- Cloud Storage: 5GB
- Bandwidth: 10GB/bulan

## Biaya di Atas Free Tier

### Authentication
- $0.01/1000 auth
- Estimasi: GRATIS (masih dalam free tier)

### Firestore
- Reads: $0.036/100,000
- Writes: $0.108/100,000
- Deletes: $0.036/100,000
- Storage: $0.108/GB/bulan
- Estimasi: GRATIS (masih dalam free tier)

### Cloud Storage
- Storage: $0.026/GB/bulan
- Download: $0.12/GB
- Upload: GRATIS
- Estimasi: GRATIS (masih dalam free tier)

## Skenario Biaya

### 1. Bengkel Kecil (1-2 cabang)
- Users: 50-100
- Data: < 1GB
- Bandwidth: < 5GB
**Total: GRATIS** (dalam free tier)

### 2. Bengkel Menengah (3-5 cabang)
Estimasi per bulan:
- Authentication: $0.5
- Firestore: $5-10
- Storage: $1-2
- Bandwidth: $2-3
**Total: ~$10-15/bulan** (Rp150,000-225,000)

### 3. Bengkel Besar (6+ cabang)
Estimasi per bulan:
- Authentication: $2-3
- Firestore: $15-25
- Storage: $3-5
- Bandwidth: $5-8
**Total: ~$25-40/bulan** (Rp375,000-600,000)

## Strategi Optimasi Biaya

### 1. Caching
```javascript
const cachingStrategy = {
  local: {
    // Cache data lokal untuk mengurangi reads
    duration: '1 hour',
    items: ['inventory', 'customers', 'services']
  },
  sync: {
    // Batch updates untuk mengurangi writes
    interval: '15 minutes',
    batchSize: 100
  }
}
```

### 2. Data Compression
```javascript
const compressionRules = {
  images: {
    maxSize: '500KB',
    quality: 0.8,
    format: 'webp'
  },
  documents: {
    compress: true,
    maxSize: '1MB'
  }
}
```

### 3. Batasan Penggunaan
- Foto servis: max 3 foto/servis
- Dokumen: max 5MB/upload
- History: 6 bulan terakhir (arsip ke cold storage)

## Rekomendasi Pricing untuk Pelanggan

### 1. Basic Plan (1 cabang)
- Harga: Rp99rb/bulan
- Margin: 100% (biaya Firebase GRATIS)

### 2. Multi-Branch Pro (2-3 cabang)
- Harga: Rp299rb/bulan
- Biaya Firebase: ~Rp150rb/bulan
- Margin: 100%

### 3. Enterprise (4-5 cabang)
- Harga: Rp499rb/bulan
- Biaya Firebase: ~Rp225rb/bulan
- Margin: ~120%

### 4. Custom (6+ cabang)
- Harga: Custom
- Minimal: Rp799rb/bulan
- Biaya Firebase: ~Rp375rb-600rb/bulan
- Margin: ~100%

## Kesimpulan
1. Free tier Firebase sangat mencukupi untuk bengkel kecil
2. Biaya mulai signifikan di 3+ cabang
3. Perlu strategi optimasi untuk bengkel besar
4. Pricing model masih profitable dengan margin 100%+