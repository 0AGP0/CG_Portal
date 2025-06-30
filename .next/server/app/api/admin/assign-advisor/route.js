"use strict";(()=>{var e={};e.id=8882,e.ids=[8882],e.modules={3295:e=>{e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},57148:(e,a,r)=>{r.a(e,async(e,s)=>{try{r.r(a),r.d(a,{patchFetch:()=>u,routeModule:()=>p,serverHooks:()=>c,workAsyncStorage:()=>l,workUnitAsyncStorage:()=>m});var t=r(96559),n=r(48088),i=r(37719),d=r(82384),o=e([d]);d=(o.then?(await o)():o)[0];let p=new t.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/admin/assign-advisor/route",pathname:"/api/admin/assign-advisor",filename:"route",bundlePath:"app/api/admin/assign-advisor/route"},resolvedPagePath:"C:\\Users\\pc\\Downloads\\CG_Portal-main\\CG_Portal-main\\src\\app\\api\\admin\\assign-advisor\\route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:l,workUnitAsyncStorage:m,serverHooks:c}=p;function u(){return(0,i.patchFetch)({workAsyncStorage:l,workUnitAsyncStorage:m})}s()}catch(e){s(e)}})},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},64939:e=>{e.exports=import("pg")},82384:(e,a,r)=>{r.a(e,async(e,s)=>{try{r.r(a),r.d(a,{POST:()=>o});var t=r(32190),n=r(5069),i=r(86481),d=e([n]);async function o(e){try{let a=await e.json();if(!a.studentId||!a.advisorId)return t.NextResponse.json({error:"\xd6ğrenci ID ve Danışman ID alanları zorunludur"},{status:400});let r=await n.dz.connect();try{let e=`
        SELECT 
          s.id as student_id,
          s.email as student_email,
          s.name as student_name,
          a.id as advisor_id,
          a.email as advisor_email,
          a.name as advisor_name
        FROM students s
        CROSS JOIN advisors a
        WHERE s.email = $1 AND a.id = $2
      `,s=await r.query(e,[a.studentId,a.advisorId]);if(0===s.rows.length)return t.NextResponse.json({error:"\xd6ğrenci veya danışman bulunamadı"},{status:404});let{student_id:n,student_email:i,student_name:d,advisor_id:o,advisor_email:u,advisor_name:p}=s.rows[0],l=`
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
      `,m=(await r.query(l,[u,o,i])).rows[0];return t.NextResponse.json({success:!0,message:"Danışman başarıyla atandı",student:{id:m.id,email:m.email,name:m.name,advisor:p,advisorId:o,advisorEmail:u,status:m.stage,processStarted:m.process_started,updatedAt:m.updated_at}})}finally{r.release()}}catch(e){return i.vF.error("Danışman atama hatası:",e),t.NextResponse.json({error:"Danışman atama işlemi sırasında bir hata oluştu"},{status:500})}}n=(d.then?(await d)():d)[0],s()}catch(e){s(e)}})}};var a=require("../../../../webpack-runtime.js");a.C(e);var r=e=>a(a.s=e),s=a.X(0,[4447,580,8033],()=>r(57148));module.exports=s})();