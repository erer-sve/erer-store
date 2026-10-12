import {createHash} from 'node:crypto';
import {reply,store,validId,statusMidtrans,paidStatus,terminalStatus,matchesAmount,discord,equal} from './_shared.mjs';

export default async request => {
  if (request.method !== 'POST') return reply(405, {error:'Method tidak diizinkan'});
  if (!process.env.MIDTRANS_SERVER_KEY) return reply(503, {error:'Konfigurasi Midtrans belum lengkap'});
  try {
    const body = await request.json();
    const id = typeof body.order_id === 'string' ? body.order_id : '';
    const signature = typeof body.signature_key === 'string' ? body.signature_key : '';
    const expected = createHash('sha512').update(id + String(body.status_code || '') + String(body.gross_amount || '') + process.env.MIDTRANS_SERVER_KEY).digest('hex');
    if (!validId(id) || !equal(signature.toLowerCase(), expected)) return reply(401, {error:'Signature tidak valid'});

    const s = store();
    const order = await s.get('order/' + id, {type:'json'});
    if (!order) return reply(404, {error:'Pesanan tidak ditemukan'});

    // Verify transaction directly with Midtrans; never trust notification payload alone.
    const verified = await statusMidtrans(id);
    if (!matchesAmount(verified, order)) return reply(409, {error:'Nominal transaksi tidak cocok'});
    const previous = order.status;
    if (paidStatus(verified)) {
      if (previous !== 'completed') order.status = 'paid';
      order.paidAt ||= new Date().toISOString();
      order.midtransTransactionStatus = verified.transaction_status;
    } else if (terminalStatus(verified) && previous === 'pending') {
      order.status = verified.transaction_status === 'expire' ? 'expired' : 'failed';
      order.midtransTransactionStatus = verified.transaction_status;
    } else {
      order.midtransTransactionStatus = verified.transaction_status || 'pending';
    }
    order.updatedAt = new Date().toISOString();
    await s.setJSON('order/' + id, order);
    if (previous !== 'paid' && previous !== 'completed' && order.status === 'paid') {
      try {
        await discord('Pembayaran Terverifikasi',[['ID',id],['Game',order.game],['Produk',order.product],['Total','Rp'+order.total.toLocaleString('id-ID')],['Status','PAID']],3066993);
      } catch (e) { console.error('Discord paid notification',e); }
    }
    return reply(200,{ok:true});
  } catch (e) {
    console.error('Midtrans notification error',e);
    return reply(503,{error:'Gagal memverifikasi notifikasi'});
  }
};
