const {db,admin,reply,configured}=require('./_common');
module.exports=async(req,res)=>{if(!['GET','PATCH'].includes(req.method))return reply(res,405,{error:'Metodo non consentito'});if(!configured())return reply(res,503,{error:'Configurazione server mancante'});try{if(!await admin(req))return reply(res,403,{error:'Accesso negato'});
 if(req.method==='GET'){const data=await db('orders?select=id,created_at,customer_email,child_name,name_pronunciation,child_hobby,dedication,package_type,price_cents,status&order=created_at.desc&limit=100');return reply(res,200,{orders:data})}
 const {id,status}=req.body||{};if(!/^[0-9a-f-]{36}$/i.test(id||'')||!['new','processing','completed','delivered'].includes(status))return reply(res,400,{error:'Dati non validi'});
 const rows=await db('orders?id=eq.'+encodeURIComponent(id)+'&select=id,status',{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({status})});return reply(res,200,{order:rows[0]||null});
 }catch(e){console.error(e.message);return reply(res,500,{error:'Errore del server'})}};
