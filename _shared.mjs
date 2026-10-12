import {getStore} from '@netlify/blobs';
import {createHash,timingSafeEqual} from 'node:crypto';
export const catalog={
 'Drag Drive Simulator':{'GP Gaji':{price:55000,stock:20},'Uang 50JT':{price:10000,stock:20}},
 'Blox Fruits':{'Produk custom (konfirmasi admin)':{price:0,stock:0}},
 'Grow A Garden':{'Produk custom (konfirmasi admin)':{price:0,stock:0}},
 'Steal a Brainrot':{'Produk custom (konfirmasi admin)':{price:0,stock:0}},
 'Fish It!':{'Produk custom (konfirmasi admin)':{price:0,stock:0}},
 'Rivals':{'Produk custom (konfirmasi admin)':{price:0,stock:0}},
 'Robux':{'Robux (tanya harga admin)':{price:0,stock:0}}
};
export const reply=(status,obj)=>new Response(JSON.stringify(obj),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
export const store=()=>getStore('erer-orders');
export const inventory=()=>getStore('erer-inventory');
export const safe=(v,n=120)=>typeof v==='string'?v.trim().slice(0,n).replace(/[@`<>]/g,''):'';
export const validId=v=>/^ER-[a-f0-9-]{36}$/.test(v||'');
export async function discord(title,fields,color=3447003){const url=process.env.DISCORD_WEBHOOK_URL;if(!url)throw Error('Webhook belum diatur');const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:'ERER STORE',allowed_mentions:{parse:[]},embeds:[{title,color,fields:fields.map(([name,value])=>({name,value:String(value).slice(0,1024),inline:true})),timestamp:new Date().toISOString()}]})});if(!r.ok)throw Error('Discord gagal: '+r.status)}
export function limit(request){const ip=request.headers.get('x-nf-client-connection-ip')||request.headers.get('x-forwarded-for')?.split(',')[0]||'unknown';return createHash('sha256').update(ip).digest('hex').slice(0,32)}
export async function throttle(key,seconds=45){const s=store(),k='rate/'+key,now=Date.now(),last=Number(await s.get(k)||0);if(now-last<seconds*1000)return false;await s.set(k,String(now));return true}
export const equal=(a,b)=>{const x=Buffer.from(a||''),y=Buffer.from(b||'');return x.length===y.length&&timingSafeEqual(x,y)};
