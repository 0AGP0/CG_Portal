"use strict";(()=>{var e={};e.id=5832,e.ids=[5832],e.modules={792:(e,r,a)=>{a.a(e,async(e,t)=>{try{a.r(r),a.d(r,{patchFetch:()=>l,routeModule:()=>d,serverHooks:()=>c,workAsyncStorage:()=>m,workUnitAsyncStorage:()=>p});var i=a(96559),n=a(48088),s=a(37719),o=a(67510),u=e([o]);o=(u.then?(await u)():u)[0];let d=new i.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/auth/admin/route",pathname:"/api/auth/admin",filename:"route",bundlePath:"app/api/auth/admin/route"},resolvedPagePath:"C:\\Users\\pc\\Downloads\\CG_Portal-main\\CG_Portal-main\\src\\app\\api\\auth\\admin\\route.ts",nextConfigOutput:"",userland:o}),{workAsyncStorage:m,workUnitAsyncStorage:p,serverHooks:c}=d;function l(){return(0,s.patchFetch)({workAsyncStorage:m,workUnitAsyncStorage:p})}t()}catch(e){t(e)}})},3295:e=>{e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},27910:e=>{e.exports=require("stream")},28354:e=>{e.exports=require("util")},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},41423:(e,r,a)=>{a.d(r,{HU:()=>u,nr:()=>l});var t=a(43205),i=a.n(t);a(85663),a(32190),a(55511);let n=process.env.JWT_SECRET||"your-secret-key",s=process.env.JWT_EXPIRES_IN||"24h",o=new Map,u=e=>i().sign(e,n,{expiresIn:s}),l=e=>{try{return i().verify(e,n)}catch(e){return d("Token doğrulama hatası:",e),null}},d=(e,r)=>{let a=r?JSON.stringify(r,(e,r)=>"password"===e||"token"===e||"secret"===e?"***":r):void 0;console.log(`[${new Date().toISOString()}] ${e}`,a)}},44870:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{e.exports=require("crypto")},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},64939:e=>{e.exports=import("pg")},67510:(e,r,a)=>{a.a(e,async(e,t)=>{try{a.r(r),a.d(r,{POST:()=>l,createAdminTable:()=>d});var i=a(32190),n=a(5069),s=a(86481),o=a(41423),u=e([n]);async function l(e){try{s.vF.info("Admin girişi isteği alındı");let r=await e.json();if(s.vF.info("Gelen veri:",r),!r.email)return s.vF.error("E-posta eksik"),i.NextResponse.json({error:"E-posta adresi gereklidir"},{status:400});let a=await n.dz.connect();try{let e=`
        SELECT 
          id,
          email,
          name,
          role,
          created_at,
          updated_at
        FROM admins 
        WHERE email = $1
      `,t=(await a.query(e,[r.email])).rows[0];if(!t)return s.vF.error("Admin bulunamadı:",r.email),i.NextResponse.json({error:"Bu e-posta adresi ile kayıtlı admin bulunamadı"},{status:401});let n=(0,o.HU)({id:t.id.toString(),email:t.email,role:"admin"});if(!n)return s.vF.error("Token oluşturulamadı"),i.NextResponse.json({error:"Oturum başlatılamadı"},{status:500});let u={success:!0,token:n,user:{id:t.id,email:t.email,name:t.name,role:"admin"}};return s.vF.info("Admin girişi başarılı:",{email:t.email}),i.NextResponse.json(u)}finally{a.release()}}catch(e){return s.vF.error("Admin girişi hatası:",e),i.NextResponse.json({error:"Admin girişi yapılırken bir hata oluştu"},{status:500})}}async function d(){let e=await n.dz.connect();try{await e.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);let r={email:"admin@campusglobal.com",name:"Admin User"};await e.query(`
      INSERT INTO admins (email, name)
      VALUES ($1, $2)
      ON CONFLICT (email) DO NOTHING
    `,[r.email,r.name]),s.vF.info("Admin tablosu ve varsayılan admin hesabı oluşturuldu")}catch(e){throw s.vF.error("Admin tablosu oluşturma hatası:",e),e}finally{e.release()}}n=(u.then?(await u)():u)[0],d().catch(e=>{s.vF.error("Admin tablosu oluşturulurken hata:",e)}),t()}catch(e){t(e)}})},79428:e=>{e.exports=require("buffer")}};var r=require("../../../../webpack-runtime.js");r.C(e);var a=e=>r(r.s=e),t=r.X(0,[4447,580,5315,8033],()=>a(792));module.exports=t})();