import {catalog,reply,store,safe,discord,limit,throttle,snapBase,auth} from './_shared.mjs';
import {randomUUID} from 'node:crypto';
export default async request=>{
 if(request.method!=='POST')return reply(405,{error:'Method tidak diizinkan'});
 if(!process.env.MIDTRANS_SERVER_KEY||!process.env.DISCORD_WEBHOOK_URL)return reply(503,{error:'Konfigurasi pembayaran belum lengkap'});
 try{
 if(!(await throttle('order/'+limit(request),12)))return reply(429,{error:'Tunggu sebentar sebelum checkout lagi'});
 const b=await request.json(),game=safe(b.game,80),product=safe(b.product,100),username=safe(b.username,100),phone=safe(b.phone,20),promo=safe(b.promo,30).toUpperCase(),qty=b.quantity;
 const item=catalog[game]?.[product];
 if(!item||item.price<=0)return reply(400,{error:'Produk belum tersedia'});
 if(!Number.isInteger(qty)||qty<1||qty>20||!username||!/^[+]?\d{9,16}$/.test(phone.replace(/[\s-]/g,'')))return reply(400,{error:'Data pesanan tidak valid'});
 const subtotal=item.price*qty,discount=promo==='ERER5'&&subtotal>100000?Math.round(subtotal*.05):0,total=subtotal-discount,id='ER-'+randomUUID();
 const order={id,game,product,username,phone,qty,subtotal,discount,total,status:'pending',createdAt:new Date().toISOString()};
 const r=await fetch(snapBase()+'/snap/v1/transactions',{method:'POST',headers:{Authorization:auth(),'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({transaction_details:{order_id:id,gross_amount:total},item_details:[{id:'item',price:subtotal,quantity:1,name:(game+' - '+product).slice(0,50)},...(discount?[{id:'discount',price:-discount,quantity:1,name:'Promo ERER5'}]:[])],customer_details:{first_name:username,phone},enabled_payments:['qris']})});
 const snap=await r.json().catch(()=>({}));
 if(!r.ok||!snap.redirect_url)throw Error('Midtrans menolak transaksi: '+JSON.stringify(snap).slice(0,200));
 await store().setJSON('order/'+id,{...order,redirect_url:snap.redirect_url});
 try{await discord('Order Baru / Menunggu Pembayaran',[['ID',id],['Game',game],['Produk',product],['Jumlah',qty],['Username',username],['Total','Rp'+total.toLocaleString('id-ID')],['Status','PENDING']],3447003)}catch(e){console.error('Discord order notification',e)}
 return reply(200,{id,total,payment_url:snap.redirect_url,status:'pending'});
 }catch(e){console.error(e);return reply(503,{error:'Checkout gagal. Coba lagi atau hubungi admin.'})}
};
