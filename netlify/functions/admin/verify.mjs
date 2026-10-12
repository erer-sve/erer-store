import {reply,adminSessionValid,store,discord} from '../_shared.mjs';
export default async request=>{
 if(request.method!=='POST')return reply(405,{error:'Method tidak diizinkan'});
 if(!adminSessionValid(request))return reply(401,{error:'Sesi admin berakhir. Login kembali.'});
 const b=await request.json().catch(()=>({})),id=String(b.id||''),status=String(b.status||'');
 if(!/^ER-[a-f0-9-]{36}$/.test(id)||!['paid','rejected'].includes(status))return reply(400,{error:'Data status tidak valid.'});
 try{
  const s=store(),key='order/'+id,o=await s.get(key,{type:'json'});
  if(!o)return reply(404,{error:'Pesanan tidak ditemukan.'});
  if(o.status!=='pending')return reply(409,{error:'Pesanan sudah diproses.'});
  o.status=status;o.verifiedAt=new Date().toISOString();await s.setJSON(key,o);
  try{
   await discord(status==='paid'?'Pesanan Dikonfirmasi LUNAS':'Pesanan Ditolak / Belum Dibayar',[
    ['ID Pesanan',id],['Username / ID',o.username],['WhatsApp',o.phone],['Produk',o.product],['Game',o.game],['Total','Rp'+Number(o.total).toLocaleString('id-ID')],['Status',status.toUpperCase()],['Diverifikasi',o.verifiedAt]
   ],status==='paid'?3066993:15158332);
  }catch(e){console.error('Discord status notification failed',e)}
  return reply(200,{ok:true,id,status});
 }catch(e){console.error(e);return reply(503,{error:'Gagal memperbarui status pesanan.'})}
};
