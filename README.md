# ERER STORE — QRIS Statis Manual

## Pembayaran
- Checkout membuat pesanan berstatus `pending` dan menampilkan QRIS statis toko di halaman pesanan.
- Pembeli membayar secara manual, lalu admin memeriksa pembayaran yang benar-benar masuk.
- Status pesanan hanya diubah menjadi `paid` lewat panel admin setelah pembayaran diverifikasi.
- Integrasi Midtrans dan endpoint webhook Midtrans sudah dihapus.
- Pastikan file QRIS milik toko tersedia di root repository dengan nama `qris.png`. Jangan unggah QRIS yang bukan milik toko.

## Deploy Netlify
1. Hubungkan repository ini ke Netlify; build command `npm run build`, publish directory `.`, functions directory `netlify/functions`.
2. Tambahkan Environment Variables:
   - `ADMIN_PASSWORD`: password admin panjang (minimal 12 karakter).
   - `SESSION_SECRET`: nilai acak rahasia minimal 32 karakter.
   - `DISCORD_WEBHOOK_URL`: opsional; jika diisi, Discord akan mendapat notifikasi pesanan dan perubahan status.
3. Deploy ulang setelah perubahan repository.

## Katalog
- Drag Drive Simulator — GP Gaji Rp55.000
- Drag Drive Simulator — Uang 50JT Rp10.000
- Promo `ERER5`: diskon 5% jika subtotal lebih dari Rp100.000.
- Produk lain yang masih bertuliskan konfirmasi admin belum bisa dipesan sebelum harga ditentukan.

## Verifikasi admin
Buka `/admin.html`, login, lalu tandai lunas hanya setelah nominal pembayaran QRIS cocok dan dana benar-benar diterima. Jangan pernah mengandalkan screenshot bukti transfer saja tanpa pemeriksaan pembayaran.
