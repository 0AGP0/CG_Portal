exports.id=8033,exports.ids=[8033],exports.modules={5069:(e,a,t)=>{"use strict";t.a(e,async(e,r)=>{try{t.d(a,{D6:()=>R,I8:()=>l,LW:()=>A,NK:()=>o,Y:()=>d,Z7:()=>m,_Y:()=>_,aD:()=>T,dz:()=>h,oH:()=>u,s5:()=>E,updateStudentProfile:()=>c});var s=t(64939),n=t(86481),i=e([s]);if(s=(i.then?(await i)():i)[0],!process.env.POSTGRES_PASSWORD)throw Error("POSTGRES_PASSWORD environment variable is not set");let h=new s.Pool({user:process.env.POSTGRES_USER||"postgres",host:process.env.POSTGRES_HOST||"localhost",database:process.env.POSTGRES_DATABASE||"cg_portal",password:process.env.POSTGRES_PASSWORD,port:parseInt(process.env.POSTGRES_PORT||"5432"),ssl:{rejectUnauthorized:!1}});async function o(e){let a=await h.connect();try{return(await a.query("SELECT * FROM students WHERE email = $1",[e])).rows[0]}catch(e){throw n.vF.error("\xd6ğrenci getirme hatası:",e),e}finally{a.release()}}async function _(e){let a=await h.connect();try{return(await a.query("SELECT * FROM advisors WHERE email = $1",[e])).rows[0]}catch(e){throw n.vF.error("Danışman getirme hatası:",e),e}finally{a.release()}}async function l(e){let a=await h.connect();try{let t=`
      SELECT 
        s.*,
        json_agg(
          json_build_object(
            'documentType', d.document_type,
            'documentUrl', d.file_path,
            'documentName', d.file_name,
            'updatedAt', d.upload_date
          )
        ) FILTER (WHERE d.id IS NOT NULL) as documents
      FROM students s
      LEFT JOIN documents d ON s.id = d.student_id
      WHERE s.advisor_email = $1
      GROUP BY s.id, s.email, s.name, s.phone, s.stage, s.process_started, s.created_at, s.updated_at, s.advisor_id, s.advisor_email
      ORDER BY s.updated_at DESC
    `;return(await a.query(t,[e])).rows}catch(e){throw n.vF.error("Danışman \xf6ğrencileri getirme hatası:",e),e}finally{a.release()}}async function d(){let e;try{e=await h.connect();let a=`
      SELECT 
        s.*,
        json_agg(
          json_build_object(
            'documentType', d.document_type,
            'documentUrl', d.file_path,
            'documentName', d.file_name,
            'updatedAt', d.upload_date
          )
        ) FILTER (WHERE d.id IS NOT NULL) as documents,
        a.name as advisor_name,
        a.email as advisor_email,
        a.id as advisor_id
      FROM students s
      LEFT JOIN documents d ON s.id = d.student_id
      LEFT JOIN advisors a ON s.advisor_email = a.email
      GROUP BY s.id, s.email, s.name, s.phone, s.stage, s.process_started, s.created_at, s.updated_at, s.advisor_id, s.advisor_email, a.name, a.email, a.id
      ORDER BY s.updated_at DESC
    `;return(await e.query(a)).rows}catch(e){throw n.vF.error("T\xfcm \xf6ğrencileri getirme hatası:",e),e}finally{e&&e.release()}}async function c(e,a){let t;try{t=await h.connect();let r=[],s=[],n=1;for(let e of["name","phone","birth_date","birth_place","marital_status","contact_address","passport_number","passport_type","passport_issue_date","passport_expiry_date","issuing_authority","high_school_name","high_school_type","high_school_city","high_school_start_date","high_school_graduation_date","university_name","university_department","university_start_date","university_end_date","graduation_status","graduation_year","university_preferences","german_department_preference","language_level","language_certificate","language_course_registration","language_learning_status","visa_consulate","visa_application_date","visa_appointment_date","visa_document","financial_proof","financial_proof_status","exam_entry","exam_result_date","mother_name","mother_surname","mother_birth_date","mother_birth_place","mother_residence","mother_phone","father_name","father_surname","father_birth_date","father_birth_place","father_residence","father_phone"]){let t=a[e];void 0!==t&&(r.push(`${e} = $${n}`),s.push(t),n++)}if(0===r.length)throw Error("G\xfcncellenecek alan bulunamadı");r.push("updated_at = NOW()"),s.push(e);let i=`
      UPDATE students 
      SET ${r.join(", ")}
      WHERE email = $${n}
      RETURNING *
    `,o=await t.query(i,s);if(0===o.rows.length)throw Error("\xd6ğrenci bulunamadı");return o.rows[0]}catch(e){throw n.vF.error("\xd6ğrenci profil g\xfcncelleme hatası:",e),e}finally{t&&t.release()}}async function E(e){let a;try{a=await h.connect();let t=`
      INSERT INTO students (
        email,
        name,
        phone,
        stage,
        process_started,
        created_at,
        updated_at,
        advisor_id,
        advisor_name,
        advisor_email
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6, $7, $8)
      RETURNING *
    `,r=[e.email,e.name,e.phone||"",e.stage||"new",e.process_started||!1,e.advisor_id||null,e.advisor_name||null,e.advisor_email||null],s=await a.query(t,r);return n.vF.info("Yeni \xf6ğrenci oluşturuldu:",{email:e.email}),s.rows[0]}catch(e){throw n.vF.error("\xd6ğrenci oluşturma hatası:",e),e}finally{a&&a.release()}}async function u(e){let a=await h.connect();try{return(await a.query(`INSERT INTO messages (sender_email, receiver_email, sender_role, content, subject, category, reply_to_id, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
       RETURNING *`,[e.senderEmail.toLowerCase(),e.receiverEmail.toLowerCase(),e.senderRole,e.content,e.subject||null,e.category||"general",e.replyToId||null])).rows[0]}catch(e){throw n.vF.error("Mesaj oluşturma hatası:",e),e}finally{a.release()}}async function R(e){let a=await h.connect();try{return(await a.query(`SELECT DISTINCT 
         CASE 
           WHEN sender_email = $1 THEN receiver_email 
           ELSE sender_email 
         END as other_participant,
         MIN(created_at) as first_message,
         MAX(created_at) as last_message,
         COUNT(*) as message_count,
         SUM(CASE WHEN is_read = false AND receiver_email = $1 THEN 1 ELSE 0 END) as unread_count
       FROM messages 
       WHERE sender_email = $1 OR receiver_email = $1 
       GROUP BY other_participant
       ORDER BY last_message DESC`,[e.toLowerCase()])).rows}catch(e){throw n.vF.error("Kullanıcı konuşmaları getirme hatası:",e),e}finally{a.release()}}async function A(e,a){let t=await h.connect();try{return(await t.query(`SELECT * FROM messages 
       WHERE (sender_email = $1 AND receiver_email = $2) 
          OR (sender_email = $2 AND receiver_email = $1) 
       ORDER BY created_at ASC`,[e.toLowerCase(),a.toLowerCase()])).rows}catch(e){throw n.vF.error("İki kullanıcı arası mesajlar getirme hatası:",e),e}finally{t.release()}}async function m(e){let a=await h.connect();try{return(await a.query("UPDATE messages SET is_read = true WHERE id = $1 RETURNING *",[e])).rows[0]}catch(e){throw n.vF.error("Mesaj okundu işaretleme hatası:",e),e}finally{a.release()}}async function T(e){let a=await h.connect();try{let t=await a.query("SELECT COUNT(*) as count FROM messages WHERE receiver_email = $1 AND is_read = false",[e.toLowerCase()]);return parseInt(t.rows[0].count)}catch(e){throw n.vF.error("Okunmamış mesaj sayısı getirme hatası:",e),e}finally{a.release()}}h.on("connect",()=>{n.vF.info("Veritabanına bağlantı başarılı")}),h.on("error",e=>{n.vF.error("Veritabanı bağlantı hatası:",e)}),(async function(){let e;try{e=await h.connect(),await e.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        phone VARCHAR(50),
        stage VARCHAR(100) DEFAULT 'new',
        process_started BOOLEAN DEFAULT FALSE,
        process_start_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        advisor_id INTEGER REFERENCES advisors(id),
        advisor_name VARCHAR(255),
        advisor_email VARCHAR(255),
        sales_id VARCHAR(255),
        sales_name VARCHAR(255),
        sales_email VARCHAR(255),
        lead_id VARCHAR(255),
        contact_address TEXT,
        age INTEGER,
        birth_date DATE,
        birth_place VARCHAR(255),
        marital_status VARCHAR(50),
        passport_number VARCHAR(50),
        passport_type VARCHAR(100),
        passport_issue_date DATE,
        passport_expiry_date DATE,
        issuing_authority VARCHAR(255),
        pnr_number VARCHAR(50),
        visa_application_date DATE,
        visa_appointment_date DATE,
        visa_document VARCHAR(255),
        visa_consulate VARCHAR(255),
        has_been_to_germany BOOLEAN DEFAULT FALSE,
        high_school_name VARCHAR(255),
        high_school_type VARCHAR(100),
        high_school_city VARCHAR(255),
        high_school_start_date DATE,
        high_school_graduation_date DATE,
        university_name VARCHAR(255),
        university_department VARCHAR(255),
        university_start_date DATE,
        university_end_date DATE,
        graduation_status VARCHAR(50),
        graduation_year INTEGER,
        university_preferences TEXT[],
        german_department_preference VARCHAR(255),
        language_level VARCHAR(50),
        language_certificate VARCHAR(255),
        language_course_registration VARCHAR(255),
        language_learning_status VARCHAR(50),
        financial_proof VARCHAR(255),
        financial_proof_status VARCHAR(50),
        exam_entry BOOLEAN DEFAULT FALSE,
        exam_result_date DATE,
        mother_name VARCHAR(255),
        mother_surname VARCHAR(255),
        mother_birth_date DATE,
        mother_birth_place VARCHAR(255),
        mother_residence VARCHAR(255),
        mother_phone VARCHAR(50),
        father_name VARCHAR(255),
        father_surname VARCHAR(255),
        father_birth_date DATE,
        father_birth_place VARCHAR(255),
        father_residence VARCHAR(255),
        father_phone VARCHAR(50),
        webhook_updated BOOLEAN DEFAULT FALSE,
        webhook_update_timestamp TIMESTAMP WITH TIME ZONE
      );
    `),await e.query(`
      CREATE TABLE IF NOT EXISTS advisors (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `),await e.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_email VARCHAR(255) NOT NULL,
        receiver_email VARCHAR(255) NOT NULL,
        sender_role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        subject VARCHAR(255),
        category VARCHAR(50) DEFAULT 'general',
        reply_to_id INTEGER REFERENCES messages(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE,
        CONSTRAINT valid_sender_role CHECK (sender_role IN ('student', 'advisor'))
      );
    `),n.vF.info("Veritabanı tabloları başarıyla oluşturuldu")}catch(e){throw n.vF.error("Veritabanı tabloları oluşturma hatası:",e),e}finally{e&&e.release()}})().catch(e=>{n.vF.error("Tablolar oluşturulurken hata:",e),process.exit(1)}),r()}catch(e){r(e)}})},78335:()=>{},86481:(e,a,t)=>{"use strict";t.d(a,{SB:()=>i,fH:()=>n,vF:()=>r,vV:()=>s});let r={info:(...e)=>{},error:(...e)=>{},warn:(...e)=>{},debug:(...e)=>{}},s=(e,a)=>{r.error(e,a)},n=(e,a)=>{r.info(e,a)},i=(e,a,t)=>{let s=`Webhook alındı: ${e} - Durum: ${a}`;"error"===a?r.error(s,t):r.info(s,t)}},96487:()=>{}};