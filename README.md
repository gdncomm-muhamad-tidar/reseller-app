# Reseller App — prototype fungsional (Expo SDK 58)

App React Native dari prototype Reseller App (Dealer Samsung). Pakai BLUE 3.0 (token warna, type scale, spacing) dan font **TT Commons Pro**.

## Buka di Expo Go

1. Di HP, install / update **Expo Go** dari App Store atau Play Store (versi SDK 58).
2. Di Mac, buka Terminal di folder ini lalu jalankan:
   ```bash
   npm install
   npx expo start
   ```
3. Scan QR yang muncul:
   - iPhone: pakai aplikasi Kamera.
   - Android: pakai tombol "Scan QR code" di Expo Go.

   HP dan Mac harus di Wi-Fi yang sama. Kalau jaringan kantor memblokir, jalankan `npx expo start --tunnel`.

Butuh Node.js 22.13 atau lebih baru (`node -v`).

## Alur demo

- **Layar kunci (awal):** ketuk notifikasi "Misi Aksesori tercapai" → Beranda + pop up misi tercapai (confetti).
  - Tombol **Kirim notifikasi asli ke HP ini** mengirim notifikasi lokal sungguhan dalam 5 detik. Kunci HP, lalu ketuk notifikasinya.
- **Lanjut misi berikutnya** → Misi Dealer. **Pakai credit note** → Beranda scroll ke Produk pilihan.
- Produk → **Pesan** → Daftar pesanan → Checkout (pilih credit note, CBD/Tempo) → **Ajukan ke sales**.
- Pesanan disetujui otomatis ±4 detik → **Bayar** → pilih VA → **Cek status** → Pembayaran diterima.
- Pembayaran menambah poin dan progres misi. Kalau target misi tercapai, credit note baru masuk otomatis.

Halaman lain yang bisa dibuka:

| Halaman | Isi |
|---|---|
| Finansial | Ringkasan, Invoice (bayar sekaligus), Credit note (klaim) |
| Misi & Rewards | Tier, benefit tier |
| Detail misi | Tahapan misi |
| Poin | Tukar hadiah |
| Katalog | Cari & filter produk |
| Scan IMEI | Input IMEI; poin masuk setelah verifikasi |

**Reset demo:** tekan lama ikon toko di kiri atas Beranda.

## Struktur

- `src/app/` — layar (Expo Router). `(tabs)/` = Beranda, Katalog, Scan IMEI, Pesanan, Finansial.
- `src/ui/` — komponen BLUE (Text, Button, Badge, Chip, Card, sheet, toast, confetti, nav bar liquid glass).
- `src/theme.ts` — token BLUE 3.0. `src/data.ts` — data dummy. `src/store.tsx` — state app (in-memory).
- `assets/fonts/` — TT Commons Pro (Regular, Medium, DemiBold, Bold).

## Catatan

- Data dummy dan tersimpan di memori, jadi kembali ke awal saat app ditutup. Belum terhubung ke API.
- Font yang dibundel adalah **TT Commons Pro Trial** dari Mac pemilik project. Lisensi trial hanya untuk uji coba. Ganti dengan file berlisensi sebelum app dibagikan lebih luas.
- Push notification remote tidak didukung Expo Go di Android; yang dipakai di sini notifikasi lokal.
