import {reply,store,validId,statusMidtrans,paidStatus} from '../../_shared.mjs';
export default async request=>{
 if(request.method!=='GET')return reply(405,{error:'Method tidak diizinkan'});
 const id=new URL(request.url).searchParams.get('id');
 if(!validId(id))return reply(400,{error:'ID salah'});
 const o=await store().get('order/'+id,{type:'json'});
 if(!o)return reply(404,{error:'Pesanan tidak ditemukan'});
 // Display only; never update paid status based on browser calls.
 return reply(200,{id:o.id,status:o.status,total:o.total,game:o.game,product:o.product,payment_url:o.status==='pending'?o.redirect_url:undefined});
};
