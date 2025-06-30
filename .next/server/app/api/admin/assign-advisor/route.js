"use strict";(()=>{var a={};a.id=8882,a.ids=[8882],a.modules={3295:a=>{a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:a=>{a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:a=>{a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},57148:(a,e,s)=>{s.a(a,async(a,t)=>{try{s.r(e),s.d(e,{patchFetch:()=>u,routeModule:()=>p,serverHooks:()=>c,workAsyncStorage:()=>l,workUnitAsyncStorage:()=>m});var r=s(96559),n=s(48088),i=s(37719),o=s(82384),d=a([o]);o=(d.then?(await d)():d)[0];let p=new r.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/admin/assign-advisor/route",pathname:"/api/admin/assign-advisor",filename:"route",bundlePath:"app/api/admin/assign-advisor/route"},resolvedPagePath:"C:\\Users\\pc\\Downloads\\CG_Portal-main\\CG_Portal-main\\src\\app\\api\\admin\\assign-advisor\\route.ts",nextConfigOutput:"",userland:o}),{workAsyncStorage:l,workUnitAsyncStorage:m,serverHooks:c}=p;function u(){return(0,i.patchFetch)({workAsyncStorage:l,workUnitAsyncStorage:m})}t()}catch(a){t(a)}})},63033:a=>{a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},64939:a=>{a.exports=import("pg")},82384:(a,e,s)=>{s.a(a,async(a,t)=>{try{s.r(e),s.d(e,{POST:()=>d});var r=s(32190),n=s(5069),i=s(86481),o=a([n]);async function d(a){try{let e=await a.json();if(!e.studentEmail||!e.advisorEmail)return r.NextResponse.json({error:"\xd6ğrenci e-posta ve Danışman e-posta alanları zorunludur"},{status:400});let s=await n.dz.connect();try{let a=`
        SELECT 
          s.id as student_id,
          s.email as student_email,
          s.name as student_name,
          a.id as advisor_id,
          a.email as advisor_email,
          a.name as advisor_name
        FROM students s
        CROSS JOIN advisors a
        WHERE s.email = $1 AND a.email = $2
      `,t=await s.query(a,[e.studentEmail,e.advisorEmail]);if(0===t.rows.length)return r.NextResponse.json({error:"\xd6ğrenci veya danışman bulunamadı"},{status:404});let{student_id:n,student_email:i,student_name:o,advisor_id:d,advisor_email:u,advisor_name:p}=t.rows[0],l=`
        UPDATE students
        SET 
          advisor_email = $1,
          advisor_id = $2,
          stage = 'Hazırlık Aşaması',
          process_started = true,
          process_start_date = NOW(),
          updated_at = NOW()
        WHERE email = $3
        RETURNING *
      `,m=(await s.query(l,[u,d,i])).rows[0];return r.NextResponse.json({success:!0,message:"Danışman başarıyla atandı",student:{id:m.id,email:m.email,name:m.name,advisor:p,advisorId:d,advisorEmail:u,status:m.stage,processStarted:m.process_started,updatedAt:m.updated_at}})}finally{s.release()}}catch(a){return i.vF.error("Danışman atama hatası:",a),r.NextResponse.json({error:"Danışman atama işlemi sırasında bir hata oluştu"},{status:500})}}n=(o.then?(await o)():o)[0],t()}catch(a){t(a)}})}};var e=require("../../../../webpack-runtime.js");e.C(a);var s=a=>e(e.s=a),t=e.X(0,[4447,580,8033],()=>s(57148));module.exports=t})();