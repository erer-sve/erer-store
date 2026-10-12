import {reply,makeAdminSession,adminSetCookie,equal,throttle,limit} from '../_shared.mjs';
export default async request=>{
 if(request.method!=='POST')return reply(405,{error:'Method tidak diizinkan'});
 try{
  if(!(await throttle('admin-login/'+limit(request),5)))return reply(429,{error:'Terlalu banyak percobaan. Tunggu sebentar.'});
  const configured=process.env.ADMIN_PASSWORD||'';
  if(configured.length<12)return reply(503,{error:'Admin belum dikonfigurasi. Tambahkan ADMIN_PASSWORD di Netlify Environment Variables (minimal 12 karakter).'});
  if(!process.env.SESSION_SECRET||process.env.SESSION_SECRET.length<32)return reply(503,{error:'Tambahkan SESSION_SECRET acak minimal 32 karakter di Netlify Environment Variables.'});
  const body=await request.json().catch(()=>({}));
  if(!equal(String(body.password||''),configured))return reply(401,{error:'Password admin salah.'});
  return new Response(JSON.stringify({ok:true}),{status:200,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','set-cookie':adminSetCookie(makeAdminSession())}});
 }catch(e){console.error(e);return reply(500,{error:'Login gagal.'})}
};