const {db,reply,configured}=require('./_common');
module.exports=async(req,res)=>{if(req.method!=='POST')return reply(res,405,{error:'Metodo non consentito'});if(!configured())return reply(res,503,{error:'Servizio in configurazione'});if(process.env.ORDERS_ENABLED!=='true')return reply(res,503,{error:'Richieste temporaneamente non attive. Riprova più tardi.'});
 const x=req.body||{};if(x.website)return reply(res,200,{id:'00000000'});if(x.adult!==true||x.privacy!==true)return reply(res,400,{error:'Conferma obbligatoria mancante'});
 const clean=(v,n)=>typeof v==='string'?v.trim().slice(0,n):'';const email=clean(x.customer_email,254),name=clean(x.child_name,40),plan=x.package_type;
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!name||name.length>40||!['base','premium'].includes(plan))return reply(res,400,{error:'Controlla i dati obbligatori'});
 try{const result=await db('orders?select=id',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({customer_email:email,child_name:name,name_pronunciation:clean(x.name_pronunciation,60),child_hobby:clean(x.child_hobby,90),dedication:clean(x.dedication,250),package_type:plan,price_cents:plan==='base'?990:1499,status:'new'})});return reply(res,201,{id:result[0].id});}catch(e){console.error(e.message);return reply(res,500,{error:'Errore durante il salvataggio'});}
};
