export interface Student {
  id?: string;
  email: string;
  name?: string;
  stage?: string;
  processStartDate?: string;
  
  // Adres ve iletişim bilgileri
  contact_address?: string;
  phone?: string;
  age?: string | number;
  
  // Kişisel bilgiler
  birth_date?: string;
  birth_place?: string;
  marital_status?: string;
  
  // Eğitim bilgileri
  high_school_name?: string;
  high_school_type?: string;
  high_school_city?: string;
  high_school_start_date?: string;
  high_school_graduation_date?: string;
  university_name?: string;
  university_department?: string;
  university_start_date?: string;
  university_end_date?: string;
  graduation_status?: string;
  graduation_year?: string;
  university_preferences?: string;
  german_department_preference?: string;
  
  // Dil bilgileri
  language_level?: string;
  language_certificate?: string;
  language_course_registration?: string;
  language_learning_status?: string;
  
  // Vize/Pasaport bilgileri
  passport_number?: string;
  passport_type?: string;
  passport_issue_date?: string;
  passport_expiry_date?: string;
  issuing_authority?: string;
  pnr_number?: string;
  visa_application_date?: string;
  visa_appointment_date?: string;
  visa_document?: string;
  consulate?: string;
  has_been_to_germany?: boolean;
  
  // Aile bilgileri
  mother_name?: string;
  mother_surname?: string;
  mother_birth_date?: string;
  mother_birth_place?: string;
  mother_residence?: string;
  mother_phone?: string;
  
  father_name?: string;
  father_surname?: string;
  father_birth_date?: string;
  father_birth_place?: string;
  father_residence?: string;
  father_phone?: string;
  
  // Finansal bilgiler
  financial_proof?: string;
  financial_proof_status?: string;
  
  // Sınav bilgileri
  exam_entry?: string;
  exam_result_date?: string;
  
  // Dökümanlar
  documents?: Array<{
    documentType: string;
    documentUrl: string;
    documentName: string;
    updatedAt: string;
  }>;
  
  updatedAt?: string;
} 