import {reply,store,validId} from './_shared.mjs';
export default async request=>{
 if(request.method!=='GET')return reply(405,{error:'Method tidak diizinkan'});
 const id=new URL(request.url).searchParams.get('id');
 if(!validId(id))return reply(400,{error:'ID salah'});
 try{
  const o=await store().get('order/'+id,{type:'json'});
  if(!o)return reply(404,{error:'Pesanan tidak ditemukan'});
  return reply(200,{id:o.id,status:o.status,total:o.total,game:o.game,product:o.product,payment_method:o.paymentMethod||'QRIS_STATIC',createdAt:o.createdAt});
 }catch(e){console.error(e);return reply(500,{error:'Gagal memuat status pesanan'})}
};
