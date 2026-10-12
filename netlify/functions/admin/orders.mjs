import {reply,adminSessionValid,listOrders} from '../_shared.mjs';
export default async request=>{
 if(request.method!=='POST')return reply(405,{error:'Method tidak diizinkan'});
 if(!adminSessionValid(request))return reply(401,{error:'Sesi admin berakhir. Login kembali.'});
 try{return reply(200,{orders:await listOrders()})}catch(e){console.error(e);return reply(500,{error:'Gagal memuat pesanan.'})}
};