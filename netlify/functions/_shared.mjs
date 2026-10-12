
import {getStore} from '@netlify/blobs';
import {createHash,randomUUID,timingSafeEqual,createHmac,randomBytes} from 'node:crypto';
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

export const midtransBase=()=>process.env.MIDTRANS_ENV==='production'?'https://api.midtrans.com':'https://api.sandbox.midtrans.com';
export const snapBase=()=>process.env.MIDTRANS_ENV==='production'?'https://app.midtrans.com':'https://app.sandbox.midtrans.com';
export const auth=()=> 'Basic '+Buffer.from((process.env.MIDTRANS_SERVER_KEY||'')+':').toString('base64');
export async function statusMidtrans(id){
 const r=await fetch(midtransBase()+'/v2/'+encodeURIComponent(id)+'/status',{headers:{Authorization:auth(),Accept:'application/json'}});
 if(!r.ok)throw Error('Midtrans status API: '+r.status);
 return r.json();
}
export const paidStatus=x=>x.status_code==='200'&&(x.transaction_status==='settlement'||(x.transaction_status==='capture'&&(!x.fraud_status||x.fraud_status==='accept')));
export const terminalStatus=x=>['expire','cancel','deny','failure'].includes(x.transaction_status);
export function matchesAmount(x,o){return Number.isFinite(Number(x.gross_amount))&&Number(x.gross_amount)===o.total}

export const adminCookieName='erer_admin';
const sessionSign=value=>createHmac('sha256',process.env.SESSION_SECRET||'missing-session-secret-configure-this').update(value).digest('hex');
export function makeAdminSession(){const payload=Buffer.from(JSON.stringify({exp:Date.now()+8*60*60*1000,nonce:randomBytes(16).toString('hex')})).toString('base64url');return payload+'.'+sessionSign(payload)}
export function adminSessionValid(request){const raw=request.headers.get('cookie')||'';const token=raw.split(';').map(x=>x.trim()).find(x=>x.startsWith(adminCookieName+'='))?.slice(adminCookieName.length+1)||'';const i=token.lastIndexOf('.');if(i<1)return false;const payload=token.slice(0,i),sig=token.slice(i+1),expected=sessionSign(payload);if(sig.length!==expected.length||!timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return false;try{return JSON.parse(Buffer.from(payload,'base64url').toString()).exp>Date.now()}catch{return false}}
export const adminSetCookie=token=>adminCookieName+'='+token+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800';
export const adminClearCookie=adminCookieName+'=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
export async function listOrders(){const s=store(),all=await s.list({prefix:'order/'}),rows=await Promise.all((all.blobs||[]).map(async b=>await s.get(b.key,{type:'json'})));return rows.filter(Boolean).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')))}
