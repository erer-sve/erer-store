# ERER STORE + Midtrans Snap Redirect + Discord

## Deploy
1. Import project repository di Netlify (jangan hanya drag-and-drop HTML). Build command `npm run build`, publish directory `.`, functions `netlify/functions`. Install dependency `@netlify/blobs`.
2. Netlify Site configuration → Environment variables (scope Functions):
   - `MIDTRANS_SERVER_KEY` = **Server Key** Midtrans Sandbox (rahasia)
   - `MIDTRANS_ENV` = `sandbox` (ubah menjadi `production` bersama production Server Key saat siap)
   - `DISCORD_WEBHOOK_URL` = URL webhook Discord (rahasia)
   - `ADMIN_API_TOKEN` = token panjang acak untuk aksi admin
   - `LOW_STOCK_THRESHOLD` = `3` (opsional)
3. Redeploy. Pada Midtrans Dashboard, isi Payment Notification URL: `https://DOMAIN-ANDA.netlify.app/api/midtrans-webhook`. Aktifkan QRIS untuk akun Midtrans. Gunakan HTTPS.
4. Tes Sandbox: checkout → Snap Redirect QRIS → pembayaran simulasi di dashboard Midtrans → webhook → cek status dan Discord. Jangan gunakan pembayaran sungguhan sebelum production diaktifkan dan akun merchant disetujui.
5. Edit katalog **di dua tempat**: `index.html` (tampilan) dan `netlify/functions/_shared.mjs` (harga server yang otoritatif). Produk contoh hanya GP Gaji Rp55.000 dan Uang 50JT Rp10.000; lainnya nonaktif. Kode promo `ERER5`: diskon 5% jika subtotal > Rp100.000.
6. Admin endpoint POST `/api/admin` header `x-admin-token: TOKEN`, JSON `{"action":"complete","id":"ER-..."}` hanya setelah status PAID. Atur stok estimasi: `{"action":"stock","game":"Drag Drive Simulator","product":"GP Gaji","count":20}`.

## Security & status
- Server Key dan Discord webhook hanya ada di Netlify Functions, tidak pernah dikirim ke browser.
- Midtrans webhook dicek SHA512(order_id + status_code + gross_amount + Server Key), nominal harus cocok dengan order tersimpan, lalu dikonfirmasi lagi melalui Midtrans GET Status API.
- `pending` → `paid` → `completed`; browser redirect **tidak** pernah menandai lunas.
- Pembayaran QRIS menggunakan Snap Redirect yang di-host Midtrans, bukan QRIS statis.
- Notifikasi Discord untuk order baru, payment success, dan stok menipis (stok estimasi saat lunas). Kegagalan Discord dicatat pada logs.
- **Batasan produksi:** Netlify Blobs bukan database transaksional. Callback bersamaan dapat menyebabkan race condition, duplikasi notifikasi, atau stok tidak akurat; webhook Discord dapat gagal setelah status tersimpan. Untuk produksi volume tinggi, gunakan Postgres dengan transaksi atomik, idempotency/outbox dan inventory locking. Order gagal bayar tidak mengurangi stok. Jangan mengandalkan stok estimasi sebagai hard limit; lakukan pemeriksaan ketersediaan dan fulfillment manual.
- Endpoint status menampilkan ringkasan berdasarkan ID acak; jangan membagikan ID pesanan publik. Rate limit sederhana berbasis Blobs best-effort, bukan anti-DDoS.
- Produk digital Roblox harus sesuai ketentuan Roblox dan kebijakan merchant Midtrans.
