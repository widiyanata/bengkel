# Memori Bengkelku Mobile App

## Informasi Umum
- Bengkelku Mobile App akan dijual secara komersial
- Aplikasi akan memiliki versi gratis dan versi pro

## Rencana Pengembangan
- Implementasi versi gratis Bengkelku Mobile terlebih dahulu, sebelum mengembangkan versi PRO
- Versi PRO Bengkelku Mobile akan diimplementasikan sebagai modul add-on
- Fitur onboarding/tutorial dan pemesanan janji temu akan dilewati untuk versi gratis

## Fitur Free (Gratis)

### Sudah Diimplementasikan
- **Manajemen Servis**
  - Pencatatan servis kendaraan
  - Detail servis dengan jasa dan part
  - Status servis (Menunggu, Dalam Pengerjaan, Selesai)
  - Pencarian servis berdasarkan nomor polisi
  - Tampilan daftar servis yang ditingkatkan dengan pengelompokan berdasarkan tanggal, pencarian, dan filter
  - Card servis yang lebih informatif dengan ikon status, chip jenis servis, dan tampilan yang lebih terstruktur
  - Halaman detail servis yang ditingkatkan dengan layout modern, visualisasi perbandingan biaya jasa vs part, dan navigasi yang lebih baik
  - Penyederhanaan proses input jasa dan sparepart dengan tampilan grid, pencarian, dan filter kategori
  - Tampilan dialog input jasa dan sparepart yang lebih compact untuk mobile dengan fullscreen mode dan toolbar
  - Halaman tambah servis yang ditingkatkan dengan UI modern, validasi form yang lebih baik, dan konfirmasi sebelum menyimpan

- **Manajemen Inventori Dasar**
  - Pencatatan stok part/sparepart
  - Informasi harga beli dan jual
  - Pencarian part berdasarkan nama atau kode

- **Manajemen Invoice**
  - Pembuatan invoice dari servis (hanya untuk servis dengan status "Selesai")
  - Invoice langsung (walk-in) tanpa servis
  - Pengeditan invoice (tambah/hapus item)
  - Cetak dan download invoice
  - Status pembayaran invoice

### Belum Diimplementasikan
- **Dashboard Ringkasan**
  - Tampilan pendapatan harian/mingguan
  - Jumlah servis aktif
  - Stok part yang hampir habis

- **Manajemen Pelanggan Dasar**
  - Database pelanggan
  - Riwayat servis per pelanggan
  - Pencarian pelanggan

- **Laporan Dasar**
  - Laporan pendapatan harian
  - Laporan penggunaan part
  - Laporan servis selesai

- **Pengaturan Aplikasi**
  - Informasi bengkel (nama, alamat, kontak)
  - Pengaturan printer
  - Backup data dasar

## Fitur Invoice
- Implementasi fungsi pengeditan invoice dalam aplikasi Bengkelku Mobile
- Saat membuat invoice, data item diambil dari catatan yang sudah ada:
  - Untuk jasa: bisa dari opsi kustom dan predefined
  - Untuk part: hanya dari inventaris yang ada
- Pengguna perlu dapat menambahkan part atau jasa tambahan ke invoice yang sudah ada
- Validasi bahwa jasa atau part ada dan total harga tidak nol
- Invoice diperbarui ketika jasa atau part dimodifikasi
- Ketika invoice ditandai sebagai dibayar, layanan terkait tidak lagi dapat diedit

## Pencarian
- Saat mencari nomor plat kendaraan, implementasikan pencarian fleksibel (LIKE) daripada pencocokan yang tepat

## Fitur Pro (Rencana)
- **Sistem Booking/Appointment**
  - Pelanggan dapat membuat janji temu servis
  - Notifikasi pengingat untuk janji temu
  - Manajemen jadwal bengkel

- **Manajemen Pelanggan Lanjutan**
  - Riwayat servis lengkap per pelanggan
  - Program loyalitas dan poin reward
  - Pengingat servis berkala otomatis

- **Laporan dan Analitik**
  - Laporan pendapatan harian/mingguan/bulanan
  - Analisis jasa dan part terlaris
  - Proyeksi pendapatan dan tren bisnis

- **Integrasi Pembayaran**
  - Dukungan berbagai metode pembayaran digital
  - Pencatatan pembayaran otomatis
  - Pengelolaan hutang pelanggan

- **Manajemen Inventori Lanjutan**
  - Peringatan stok minimum otomatis
  - Pemesanan otomatis ke supplier
  - Pelacakan riwayat harga dan supplier

- **Ekspor dan Impor Data**
  - Ekspor data ke Excel/CSV
  - Backup dan restore data
  - Sinkronisasi dengan sistem akuntansi

- **Aplikasi Pelanggan**
  - Aplikasi terpisah untuk pelanggan
  - Pelanggan dapat melihat riwayat servis
  - Pelanggan dapat membuat janji temu

## Aturan Bisnis
- Invoice hanya dapat dibuat untuk servis dengan status "Selesai"
- Servis tidak dapat diedit jika invoice terkait sudah dibayar
- Saat menambahkan servis baru dengan walk-in customer, halaman detail servis harus memungkinkan pembuatan invoice
- Tombol "Lihat Invoice" harus selalu berfungsi untuk melihat invoice yang sudah ada, terlepas dari status pembayaran

## Preferensi Tampilan
- Pengguna lebih menyukai aplikasi Bengkelku Mobile memiliki background light grey daripada putih terang untuk kontras yang lebih baik
- Warna teks pada chip harus selalu kontras dengan latar belakangnya, menggunakan teks gelap pada latar belakang terang dan sebaliknya
- Card di homepage dibuat lebih rapi dan compact untuk tampilan mobile
- Tombol aksi cepat di homepage menggunakan layout ikon dengan teks di bawahnya untuk mencegah overlap teks
- Komponen dashboard menggunakan padding yang lebih kecil dan font yang lebih compact untuk tampilan mobile
- Daftar servis aktif dan stok menipis menggunakan tampilan yang lebih compact dengan density="compact"
- Halaman stok menggunakan tampilan grid kartu yang lebih visual dengan indikator stok menipis dan progress bar
- Dialog edit dan hapus item stok menggunakan toolbar berwarna dan layout yang lebih terorganisir
- Halaman stok memiliki fitur filter dan pengurutan untuk memudahkan pengelolaan inventaris
- Tombol aksi pada halaman stok menggunakan teks dan ikon untuk meningkatkan kejelasan dan area sentuh pada perangkat mobile
- Filter dan pengurutan pada halaman stok dapat disembunyikan/ditampilkan pada tampilan mobile untuk menghemat ruang
- Tombol header pada halaman stok menggunakan ikon saja pada tampilan mobile untuk menghemat ruang
- Filter dan pengurutan pada halaman stok memiliki handler khusus untuk memastikan berfungsi dengan baik
- Menu dropdown pada halaman stok memiliki perbaikan CSS untuk mencegah terpotong pada tampilan mobile
- Semua fungsi pada halaman stok memiliki penanganan error untuk mencegah crash aplikasi
- Atribut pada komponen v-select diperbaiki untuk menghindari warning dan error

## Peningkatan AppBar dan Bottom Navigation
- AppBar ditingkatkan dengan fitur pencarian global untuk mencari servis, pelanggan, dan part
- AppBar menampilkan judul halaman yang dinamis sesuai dengan halaman yang sedang aktif
- AppBar memiliki tombol notifikasi dengan badge yang menunjukkan jumlah servis aktif dan stok menipis
- AppBar memiliki efek elevasi dan blur saat halaman di-scroll
- Bottom Navigation ditingkatkan dengan badge notifikasi pada tab Servis dan Stok (badge tampak timbul di atas bottom navigation dengan custom overflow)
- Bottom Navigation menyembunyikan diri saat halaman di-scroll ke bawah untuk memberikan lebih banyak ruang konten
- Menu Pelanggan dan Laporan dipindahkan ke menu "Lainnya" untuk menyederhanakan Bottom Navigation
- Floating Action Button (FAB) kontekstual yang berubah fungsinya berdasarkan halaman yang aktif
- FAB otomatis disembunyikan saat scroll mentok ke bawah untuk mencegah menutupi konten, dengan transisi halus dan penanganan halaman yang tidak scrollable

# Lingkungan Pengembangan
- Pengguna menggunakan command line Windows PowerShell

