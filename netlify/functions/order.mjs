import {catalog,reply,store,safe,discord,limit,throttle} from './_shared.mjs';
import {randomUUID} from 'node:crypto';

export default async request=>{
 if(request.method!=='POST')return reply(405,{error:'Method tidak diizinkan'});
 try{
  if(!(await throttle('order/'+limit(request),12)))return reply(429,{error:'Tunggu sebentar sebelum checkout lagi'});
  const b=await request.json(),game=safe(b.game,80),product=safe(b.product,100),username=safe(b.username,100),phone=safe(b.phone,20),promo=safe(b.promo,30).toUpperCase(),qty=b.quantity;
  const item=catalog[game]?.[product];
  if(!item||item.price<=0)return reply(400,{error:'Produk belum tersedia'});
  if(!Number.isInteger(qty)||qty<1||qty>20||!username||!/^[+]?\\d{9,16}$/.test(phone.replace(/[\\s-]/g,'')))return reply(400,{error:'Data pesanan tidak valid'});
  const subtotal=item.price*qty,discount=promo==='ERER5'&&subtotal>100000?Math.round(subtotal*.05):0,total=subtotal-discount,id='ER-'+randomUUID();
  const order={id,game,product,username,phone,qty,subtotal,discount,total,status:'pending',paymentMethod:'QRIS_STATIC',createdAt:new Date().toISOString()};
  await store().setJSON('order/'+id,order);
  let notified=true;
  try{
   await discord('Order Baru — Menunggu Pembayaran QRIS',[
    ['ID Pesanan',id],['Game',game],['Produk',product],['Jumlah',qty],['Username / ID',username],['WhatsApp',phone],['Subtotal','Rp'+subtotal.toLocaleString('id-ID')],['Diskon','Rp'+discount.toLocaleString('id-ID')],['Total','Rp'+total.toLocaleString('id-ID')],['Status','PENDING — MENUNGGU TRANSFER']
   ],3447003);
  }catch(e){notified=false;console.error('Discord order notification failed',e)}
  return reply(200,{id,total,subtotal,discount,status:'pending',payment_method:'QRIS_STATIC',notification_sent:notified});
 }catch(e){console.error(e);return reply(503,{error:'Pesanan gagal dibuat. Coba lagi atau hubungi admin.'})}
};
