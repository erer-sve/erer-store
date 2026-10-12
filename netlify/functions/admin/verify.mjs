import {reply,adminSessionValid,store,discord,statusMidtrans,paidStatus,matchesAmount} from '../_shared.mjs';
export default async request=>{
 if(request.method!=='POST')return reply(405,{error:'Method tidak diizinkan'});
 if(!adminSessionValid(request))return reply(401,{error:'Sesi admin berakhir. Login kembali.'});
 const b=await request.json().catch(()=>({})),id=String(b.id||''),status=String(b.status||'');
 if(!/^ER-[a-f0-9-]{36}$/.test(id)||!['paid','rejected'].includes(status))return reply(400,{error:'Data status tidak valid.'});
 try{
  const s=store(),key='order/'+id,o=await s.get(key,{type:'json'});
  if(!o)return reply(404,{error:'Pesanan tidak ditemukan.'});
  if(o.status!=='pending')return reply(409,{error:'Pesanan sudah diproses.'});
  if(status==='paid'){
   if(!process.env.MIDTRANS_SERVER_KEY)return reply(503,{error:'MIDTRANS_SERVER_KEY belum diatur di Netlify.'});
   const payment=await statusMidtrans(id);
   if(!paidStatus(payment)||!matchesAmount(payment,o))return reply(409,{error:'Midtrans belum mengonfirmasi pembayaran lunas dengan nominal yang sesuai. Jangan tandai lunas dulu.'});
  }
  o.status=status;o.verifiedAt=new Date().toISOString();await s.setJSON(key,o);
  try{await discord(status==='paid'?'Pesanan Diverifikasi Lunas':'Pesanan Ditolak / Belum Masuk',[['ID',id],['Username',o.username],['Produk',o.product],['Total','Rp'+Number(o.total).toLocaleString('id-ID')],['Status',status.toUpperCase()]],status==='paid'?3066993:15158332)}catch(e){console.error('Discord status notification',e)}
  return reply(200,{ok:true,id,status});
 }catch(e){console.error(e);return reply(503,{error:'Gagal memeriksa pembayaran ke Midtrans. Cek konfigurasi server lalu coba lagi.'})}
};
