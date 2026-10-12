
import {reply,store,inventory,catalog,discord,equal,safe,validId} from '../../_shared.mjs';
export default async(request)=>{
 if(request.method!=='POST')return reply(405,{error:'Method tidak diizinkan'});
 if(!process.env.ADMIN_API_TOKEN||!equal(request.headers.get('x-admin-token'),process.env.ADMIN_API_TOKEN))return reply(401,{error:'Tidak diizinkan'});
 try{
 const b=await request.json(),s=store(),inv=inventory();
 if(b.action==='complete'){
 const id=safe(b.id,60);if(!validId(id))return reply(400,{error:'ID tidak valid'});
 const o=await s.get('order/'+id,{type:'json'});if(!o)return reply(404,{error:'Tidak ditemukan'});
 if(o.status!=='paid')return reply(409,{error:'Hanya order lunas yang dapat diselesaikan'});
 o.status='completed';o.completedAt=new Date().toISOString();await s.setJSON('order/'+id,o);
 await discord('Pesanan Selesai',[['ID',id],['Status','COMPLETED']],3066993);
 return reply(200,{ok:true});
 }
 if(b.action==='stock'){
 const game=safe(b.game,80),product=safe(b.product,100),count=b.count;
 if(!catalog[game]?.[product]||!Number.isInteger(count)||count<0||count>100000)return reply(400,{error:'Data stok salah'});
 await inv.set(game+'/'+product,String(count));return reply(200,{ok:true,stock:count});
 }
 return reply(400,{error:'Aksi tidak dikenal'});
 }catch(e){console.error(e);return reply(503,{error:'Gagal memproses permintaan'})}
};
