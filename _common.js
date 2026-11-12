const URL=process.env.SUPABASE_URL;const KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;
function configured(){return !!(URL&&KEY)}
async function db(path,options={}){if(!configured())throw Error('Configurazione server mancante');const r=await fetch(URL+'/rest/v1/'+path,{...options,headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json',...options.headers}});const txt=await r.text();let data;try{data=txt?JSON.parse(txt):null}catch{data=txt}if(!r.ok)throw Error('Database: '+r.status);return data}
async function admin(req){const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');if(!token)return false;const r=await fetch(URL+'/auth/v1/user',{headers:{apikey:KEY,Authorization:'Bearer '+token}});if(!r.ok)return false;const user=await r.json();if(!user.id)return false;const rows=await db('admins?user_id=eq.'+encodeURIComponent(user.id)+'&select=user_id');return rows.length>0}
function reply(res,code,data){res.status(code).setHeader('Cache-Control','no-store').json(data)}
module.exports={db,admin,reply,configured};
