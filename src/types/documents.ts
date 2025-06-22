export type StudentType = 'HIGH_SCHOOL_GRADUATE' | 'UNIVERSITY_STUDENT' | 'UNIVERSITY_GRADUATE';

export type DocumentStatus = 'PENDING' | 'UPLOADED' | 'APPROVED' | 'REJECTED';

export type ApplicationStage = 'PREPARATION' | 'VISA_APPLICATION';

export interface Document {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  status: DocumentStatus;
  uploadedAt?: Date;
  reviewedAt?: Date;
  fileUrl?: string;
  studentTypes: StudentType[];
  stage: ApplicationStage;
}

export const PREPARATION_DOCUMENTS: Document[] = [
  {
    id: 'high_school_diploma',
    name: 'Lise Diploması Örneği',
    required: true,
    status: 'PENDING',
    stage: 'PREPARATION',
    studentTypes: ['HIGH_SCHOOL_GRADUATE', 'UNIVERSITY_STUDENT', 'UNIVERSITY_GRADUATE']
  },
  {
    id: 'osym_placement',
    name: 'ÖSYM Yerleştirme Belgesi',
    required: true,
    status: 'PENDING',
    stage: 'PREPARATION',
    studentTypes: ['HIGH_SCHOOL_GRADUATE', 'UNIVERSITY_STUDENT', 'UNIVERSITY_GRADUATE']
  },
  {
    id: 'passport',
    name: 'Pasaport Fotokopisi',
    required: true,
    status: 'PENDING',
    stage: 'PREPARATION',
    studentTypes: ['HIGH_SCHOOL_GRADUATE', 'UNIVERSITY_STUDENT', 'UNIVERSITY_GRADUATE']
  },
  {
    id: 'cv',
    name: 'Detaylı Özgeçmiş',
    required: true,
    status: 'PENDING',
    stage: 'PREPARATION',
    studentTypes: ['HIGH_SCHOOL_GRADUATE', 'UNIVERSITY_STUDENT', 'UNIVERSITY_GRADUATE']
  },
  {
    id: 'high_school_transcript',
    name: 'Lise transkripti',
    required: true,
    status: 'PENDING',
    stage: 'PREPARATION',
    studentTypes: ['HIGH_SCHOOL_GRADUATE', 'UNIVERSITY_STUDENT']
  },
  {
    id: 'osym_result',
    name: 'ÖSYM Sonuç Belgesi',
    required: true,
    status: 'PENDING',
    stage: 'PREPARATION',
    studentTypes: ['HIGH_SCHOOL_GRADUATE', 'UNIVERSITY_STUDENT']
  },
  {
    id: 'university_transcript',
    name: 'Lisans/Ön lisans Transkripti',
    required: true,
    status: 'PENDING',
    stage: 'PREPARATION',
    studentTypes: ['UNIVERSITY_STUDENT', 'UNIVERSITY_GRADUATE']
  },
  {
    id: 'university_diploma',
    name: 'Lisans-Ön lisans Diploması/Mezuniyet Belgesi',
    required: true,
    status: 'PENDING',
    stage: 'PREPARATION',
    studentTypes: ['UNIVERSITY_GRADUATE']
  },
  {
    id: 'student_certificate',
    name: 'Üniversite Öğrenci Belgesi',
    required: true,
    status: 'PENDING',
    stage: 'PREPARATION',
    studentTypes: ['UNIVERSITY_STUDENT']
  }
];

export const VISA_DOCUMENTS: Document[] = [
  {
    id: 'financial_proof',
    name: 'Finansal kanıt belgesi',
    description: 'Ödemesi tamamlanmış olan bloke hesap onay belgesi ya da garantör belgesi',
    required: true,
    status: 'PENDING',
    stage: 'VISA_APPLICATION',
    studentTypes: ['HIGH_SCHOOL_GRADUATE', 'UNIVERSITY_STUDENT', 'UNIVERSITY_GRADUATE']
  },
  {
    id: 'blocked_account_receipt',
    name: 'Bloke hesap dekontu',
    description: 'Bloke hesap ile ilerlenecek olması halinde',
    required: true,
    status: 'PENDING',
    stage: 'VISA_APPLICATION',
    studentTypes: ['HIGH_SCHOOL_GRADUATE', 'UNIVERSITY_STUDENT', 'UNIVERSITY_GRADUATE']
  },
  {
    id: 'language_course_payment',
    name: 'Almanya\'daki dil kursu ödeme belgesi',
    description: 'C1 kaydı dahil olmak üzere',
    required: true,
    status: 'PENDING',
    stage: 'VISA_APPLICATION',
    studentTypes: ['HIGH_SCHOOL_GRADUATE', 'UNIVERSITY_STUDENT', 'UNIVERSITY_GRADUATE']
  },
  {
    id: 'biometric_photo',
    name: 'Biyometrik fotoğraf',
    required: true,
    status: 'PENDING',
    stage: 'VISA_APPLICATION',
    studentTypes: ['HIGH_SCHOOL_GRADUATE', 'UNIVERSITY_STUDENT', 'UNIVERSITY_GRADUATE']
  },
  {
    id: 'german_language_certificate',
    name: 'Almanca dil sınav sonuç belgesi',
    description: 'Minimum A1 başarılı sonuç belgesi, Goethe, Telc vb.',
    required: true,
    status: 'PENDING',
    stage: 'VISA_APPLICATION',
    studentTypes: ['HIGH_SCHOOL_GRADUATE', 'UNIVERSITY_STUDENT', 'UNIVERSITY_GRADUATE']
  },
  {
    id: 'insurance_documents',
    name: 'Sigorta belgeleri',
    description: 'AT 11 ve Care Concept',
    required: true,
    status: 'PENDING',
    stage: 'VISA_APPLICATION',
    studentTypes: ['HIGH_SCHOOL_GRADUATE', 'UNIVERSITY_STUDENT', 'UNIVERSITY_GRADUATE']
  },
  {
    id: 'english_language_certificate',
    name: 'TOEFL veya IELTS belgesi',
    description: 'İngilizce bölüm başvurularında aranmaktadır',
    required: false,
    status: 'PENDING',
    stage: 'VISA_APPLICATION',
    studentTypes: ['HIGH_SCHOOL_GRADUATE', 'UNIVERSITY_STUDENT', 'UNIVERSITY_GRADUATE']
  }
]; 