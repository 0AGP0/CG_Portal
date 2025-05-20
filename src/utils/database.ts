import fs from 'fs';
import path from 'path';

// Basit JSON tabanlı veri deposu dosyaları
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'customers.json');
const ADVISORS_FILE = path.join(DB_DIR, 'advisors.json');
const MESSAGES_FILE = path.join(DB_DIR, 'messages.json');
const SALES_FILE = path.join(DB_DIR, 'sales.json');

// Log için
const LOG_DIR = path.join(process.cwd(), 'logs');

// Veri yapısı tipleri
export interface CustomerRecord {
  email: string;
  lead_id?: string;
  stage?: string;
  university?: string;
  program?: string;
  documents?: DocumentRecord[];
  updatedAt: string;
  [key: string]: any;
}

export interface DocumentRecord {
  documentType: string;
  documentUrl: string;
  documentName: string;
  updatedAt: string;
}

export interface AdvisorRecord {
  id: string;
  email: string;
  name: string;
  studentIds: string[];
  updatedAt: string;
  [key: string]: any;
}

export interface MessageRecord {
  id: string;
  senderEmail: string;
  receiverEmail: string;
  senderRole: 'student' | 'advisor' | 'sales';
  content: string;
  createdAt: string;
  isRead: boolean;
  replyToId?: string;
  subject?: string;
  category?: string;
}

export interface SalesPersonRecord {
  id: string;
  email: string;
  name: string;
  studentIds: string[];
  updatedAt: string;
  [key: string]: any;
}

// Veri dizinlerini oluştur
function ensureDirectories() {
  try {
    // Ana veri dizini
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
      console.log('Veri dizini oluşturuldu:', DB_DIR);
    }
    
    // Log dizini
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
      console.log('Log dizini oluşturuldu:', LOG_DIR);
    }
    
    return true;
  } catch (error) {
    console.error('Dizin oluşturma hatası:', error);
    if (error instanceof Error) {
      console.error('Hata mesajı:', error.message);
      console.error('Hata stack:', error.stack);
    }
    return false;
  }
}

// Veri dosyasını oluştur veya yükle
async function ensureDbExists() {
  await ensureDirectories();
  
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ customers: [] }));
      console.log('Müşteri veri dosyası oluşturuldu:', DB_FILE);
    }
    
    return true;
  } catch (error) {
    console.error('Veri dosyası oluşturma hatası:', error);
    return false;
  }
}

// Danışman veri dosyasını oluştur veya yükle
async function ensureAdvisorsDbExists() {
  await ensureDirectories();
  
  try {
    if (!fs.existsSync(ADVISORS_FILE)) {
      // Örnek danışman verisi oluştur
      const initialData = {
        advisors: [
          {
            id: 'adv-1',
            email: 'emre.danisman@example.com',
            name: 'Emre Danışman',
            studentIds: ['akifgiraypusat@gmail.com', 'burcu.shut@gmail.com'],
            updatedAt: new Date().toISOString()
          }
        ]
      };
      fs.writeFileSync(ADVISORS_FILE, JSON.stringify(initialData, null, 2));
      console.log('Danışman veri dosyası oluşturuldu:', ADVISORS_FILE);
    }
    
    return true;
  } catch (error) {
    console.error('Danışman veri dosyası oluşturma hatası:', error);
    return false;
  }
}

// Mesaj veri dosyasını oluştur veya yükle
async function ensureMessagesDbExists() {
  await ensureDirectories();
  
  try {
    if (!fs.existsSync(MESSAGES_FILE)) {
      // Örnek mesaj verisi oluştur
      const initialData = {
        messages: [
          {
            id: 'msg-1',
            senderEmail: 'emre.danisman@example.com',
            receiverEmail: 'akifgiraypusat@gmail.com',
            senderRole: 'advisor',
            content: 'Merhaba Akif, başvuru sürecinle ilgili bilgilendirme için teşekkürler. Vize randevun için gerekli belgeleri hazırlamanı rica ederim.',
            createdAt: new Date().toISOString(),
            isRead: false,
            subject: 'Vize Randevusu Hakkında',
            category: 'visa'
          },
          {
            id: 'msg-2',
            senderEmail: 'akifgiraypusat@gmail.com',
            receiverEmail: 'emre.danisman@example.com',
            senderRole: 'student',
            content: 'Merhaba Emre Bey, belgelerimi hazırlıyorum. Pasaport yenileme süreci biraz uzun sürebilir. Bu konuda nasıl bir yol izlemeliyim?',
            createdAt: new Date(Date.now() + 60000).toISOString(),
            isRead: true,
            replyToId: 'msg-1',
            subject: 'Re: Vize Randevusu Hakkında',
            category: 'visa'
          }
        ]
      };
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify(initialData, null, 2));
      console.log('Mesaj veri dosyası oluşturuldu:', MESSAGES_FILE);
    }
    
    return true;
  } catch (error) {
    console.error('Mesaj veri dosyası oluşturma hatası:', error);
    return false;
  }
}

// Satış ekibi veri dosyasını oluştur veya yükle
async function ensureSalesDbExists() {
  await ensureDirectories();
  
  try {
    if (!fs.existsSync(SALES_FILE)) {
      // Örnek satış ekibi verisi oluştur
      const initialData = {
        salesTeam: [
          {
            id: 'sales-1',
            email: 'ahmet.satis@example.com',
            name: 'Ahmet Satış',
            studentIds: [],
            updatedAt: new Date().toISOString()
          },
          {
            id: 'sales-2',
            email: 'ayse.satis@example.com',
            name: 'Ayşe Satış',
            studentIds: [],
            updatedAt: new Date().toISOString()
          },
          {
            id: 'sales-3',
            email: 'mehmet.satis@example.com',
            name: 'Mehmet Satış',
            studentIds: [],
            updatedAt: new Date().toISOString()
          },
          {
            id: 'sales-4',
            email: 'zeynep.satis@example.com',
            name: 'Zeynep Satış',
            studentIds: [],
            updatedAt: new Date().toISOString()
          }
        ]
      };
      fs.writeFileSync(SALES_FILE, JSON.stringify(initialData, null, 2));
      console.log('Satış ekibi veri dosyası oluşturuldu:', SALES_FILE);
    }
    
    return true;
  } catch (error) {
    console.error('Satış ekibi veri dosyası oluşturma hatası:', error);
    return false;
  }
}

// Tüm veritabanını yükle
async function loadDb(): Promise<{ customers: CustomerRecord[] }> {
  await ensureDbExists();
  
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Veritabanı yükleme hatası:', error);
    return { customers: [] };
  }
}

// Danışman veritabanını yükle
export async function loadAdvisorsDb(): Promise<{ advisors: AdvisorRecord[] }> {
  await ensureAdvisorsDbExists();
  
  try {
    const data = fs.readFileSync(ADVISORS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Danışman veritabanı yükleme hatası:', error);
    return { advisors: [] };
  }
}

// Mesaj veritabanını yükle
async function loadMessagesDb(): Promise<{ messages: MessageRecord[] }> {
  await ensureMessagesDbExists();
  
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Mesaj veritabanı yükleme hatası:', error);
    return { messages: [] };
  }
}

// Satış ekibi veritabanını yükle
export async function loadSalesDb(): Promise<{ salesTeam: SalesPersonRecord[] }> {
  await ensureSalesDbExists();
  
  try {
    const data = fs.readFileSync(SALES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Satış ekibi veritabanı yükleme hatası:', error);
    return { salesTeam: [] };
  }
}

// Veritabanını kaydet
async function saveDb(data: { customers: CustomerRecord[] }): Promise<boolean> {
  try {
    // Veri dizininin varlığını kontrol et
    const dirPath = path.dirname(DB_FILE);
    if (!fs.existsSync(dirPath)) {
      console.log('Veri dizini oluşturuluyor:', dirPath);
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    console.log('Veritabanı kaydediliyor:', DB_FILE);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    console.log('Veritabanı kaydedildi');
    return true;
  } catch (error) {
    console.error('Veritabanı kaydetme ayrıntılı hata:', error);
    if (error instanceof Error) {
      console.error('Hata mesajı:', error.message);
      console.error('Hata stack:', error.stack);
    }
    return false;
  }
}

// Danışman veritabanını kaydet
async function saveAdvisorsDb(data: { advisors: AdvisorRecord[] }): Promise<boolean> {
  try {
    fs.writeFileSync(ADVISORS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Danışman veritabanı kaydetme hatası:', error);
    return false;
  }
}

// Mesaj veritabanını kaydet
async function saveMessagesDb(data: { messages: MessageRecord[] }): Promise<boolean> {
  await ensureDirectories();
  
  try {
    console.log(`Mesaj veritabanı kaydediliyor... Toplam mesaj sayısı: ${data.messages.length}`);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(data, null, 2));
    console.log('Mesaj veritabanı başarıyla kaydedildi');
    return true;
  } catch (error) {
    console.error('Mesaj veritabanı kaydetme hatası:', error);
    if (error instanceof Error) {
      console.error('Hata mesajı:', error.message);
      console.error('Hata stack:', error.stack);
    }
    
    // Dosya yolu bilgisini kontrol et ve yazdır
    console.error('Hedef dosya yolu:', MESSAGES_FILE);
    console.error('Dizin mevcut mu:', fs.existsSync(path.dirname(MESSAGES_FILE)));
    
    return false;
  }
}

// Satış ekibi veritabanını kaydet
async function saveSalesDb(data: { salesTeam: SalesPersonRecord[] }): Promise<boolean> {
  try {
    // Veri dizininin varlığını kontrol et
    const dirPath = path.dirname(SALES_FILE);
    if (!fs.existsSync(dirPath)) {
      console.log('Satış ekibi veri dizini oluşturuluyor:', dirPath);
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    console.log('Satış ekibi veritabanı kaydediliyor:', SALES_FILE);
    fs.writeFileSync(SALES_FILE, JSON.stringify(data, null, 2));
    console.log('Satış ekibi veritabanı kaydedildi');
    return true;
  } catch (error) {
    console.error('Satış ekibi veritabanı kaydetme hatası:', error);
    if (error instanceof Error) {
      console.error('Hata mesajı:', error.message);
      console.error('Hata stack:', error.stack);
    }
    return false;
  }
}

// E-posta adresine göre kayıt bulma
export async function getRecordByEmail(email: string): Promise<CustomerRecord | null> {
  const db = await loadDb();
  const customer = db.customers.find(c => c.email.toLowerCase() === email.toLowerCase());
  return customer || null;
}

// Yeni kayıt oluşturma veya mevcut kaydı güncelleme
export async function updateOrCreateRecord(data: Partial<CustomerRecord>): Promise<CustomerRecord> {
  if (!data.email) {
    throw new Error('Email alanı zorunludur');
  }
  
  console.log('updateOrCreateRecord başlatıldı:', data.email);
  
  try {
    const db = await loadDb();
    const existingIndex = db.customers.findIndex(c => 
      c.email.toLowerCase() === data.email!.toLowerCase()
    );
    
    console.log('Mevcut kayıt durumu:', existingIndex >= 0 ? 'Mevcut kayıt bulundu' : 'Yeni kayıt oluşturulacak');
    
    if (existingIndex >= 0) {
      // Mevcut kaydı güncelle
      const updatedRecord = {
        ...db.customers[existingIndex],
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      db.customers[existingIndex] = updatedRecord;
      const saveResult = await saveDb(db);
      console.log('Kayıt güncelleme sonucu:', saveResult ? 'Başarılı' : 'Başarısız');
      
      return updatedRecord;
    } else {
      // Yeni kayıt oluştur
      const newRecord: CustomerRecord = {
        ...(data as CustomerRecord),
        updatedAt: new Date().toISOString(),
        documents: data.documents || []
      };
      
      db.customers.push(newRecord);
      const saveResult = await saveDb(db);
      console.log('Yeni kayıt oluşturma sonucu:', saveResult ? 'Başarılı' : 'Başarısız');
      
      return newRecord;
    }
  } catch (error) {
    console.error('updateOrCreateRecord hatası:', error);
    throw error;
  }
}

// Doküman bilgisini güncelleme
export async function updateDocumentRecord(data: {
  email: string;
  documentType: string;
  documentUrl: string;
  documentName: string;
  updatedAt: string;
  [key: string]: any;
}): Promise<CustomerRecord | null> {
  if (!data.email) {
    throw new Error('Email alanı zorunludur');
  }
  
  const db = await loadDb();
  const customerIndex = db.customers.findIndex(c => 
    c.email.toLowerCase() === data.email.toLowerCase()
  );
  
  if (customerIndex < 0) {
    return null; // Müşteri bulunamadı
  }
  
  // Müşteri kaydını al
  const customer = db.customers[customerIndex];
  
  // Dokümanlar dizisini oluştur veya mevcut olanı kullan
  if (!customer.documents) {
    customer.documents = [];
  }
  
  // Aynı tipteki mevcut dokümanı bul
  const docIndex = customer.documents.findIndex(
    doc => doc.documentType === data.documentType
  );
  
  if (docIndex >= 0) {
    // Mevcut dokümanı güncelle
    customer.documents[docIndex] = {
      documentType: data.documentType,
      documentUrl: data.documentUrl,
      documentName: data.documentName,
      updatedAt: data.updatedAt,
      ...(data.uploadedBy ? { uploadedBy: data.uploadedBy } : {}),
      ...(data.uploadedByRole ? { uploadedByRole: data.uploadedByRole } : {})
    };
  } else {
    // Yeni doküman ekle
    customer.documents.push({
      documentType: data.documentType,
      documentUrl: data.documentUrl,
      documentName: data.documentName,
      updatedAt: data.updatedAt,
      ...(data.uploadedBy ? { uploadedBy: data.uploadedBy } : {}),
      ...(data.uploadedByRole ? { uploadedByRole: data.uploadedByRole } : {})
    });
  }
  
  // Müşteri kaydını güncelle
  customer.updatedAt = new Date().toISOString();
  db.customers[customerIndex] = customer;
  
  // Değişiklikleri kaydet
  await saveDb(db);
  
  return customer;
}

// E-posta adresine göre danışman bulma
export async function getAdvisorByEmail(email: string): Promise<AdvisorRecord | null> {
  const db = await loadAdvisorsDb();
  const advisor = db.advisors.find(a => a.email.toLowerCase() === email.toLowerCase());
  return advisor || null;
}

// Danışman ID'sine göre öğrencileri bulma
export async function getAdvisorStudents(advisorId: string): Promise<CustomerRecord[]> {
  // Önce danışmanı bul
  const advisorsDb = await loadAdvisorsDb();
  const advisor = advisorsDb.advisors.find(a => a.id === advisorId);
  
  if (!advisor || !advisor.studentIds || advisor.studentIds.length === 0) {
    return [];
  }
  
  // Danışmana atanmış öğrencileri bul
  const db = await loadDb();
  const students = db.customers.filter(c => 
    advisor.studentIds.includes(c.email.toLowerCase())
  );
  
  return students;
}

// Yeni danışman oluşturma veya mevcut danışmanı güncelleme
export async function updateOrCreateAdvisor(data: Partial<AdvisorRecord>): Promise<AdvisorRecord> {
  if (!data.email) {
    throw new Error('Email alanı zorunludur');
  }
  
  const db = await loadAdvisorsDb();
  const existingIndex = db.advisors.findIndex(a => 
    a.email.toLowerCase() === data.email!.toLowerCase()
  );
  
  if (existingIndex >= 0) {
    // Mevcut danışmanı güncelle
    const updatedRecord = {
      ...db.advisors[existingIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    db.advisors[existingIndex] = updatedRecord;
    await saveAdvisorsDb(db);
    
    return updatedRecord;
  } else {
    // Yeni danışman oluştur
    const newRecord: AdvisorRecord = {
      ...(data as AdvisorRecord),
      updatedAt: new Date().toISOString(),
      studentIds: data.studentIds || []
    };
    
    db.advisors.push(newRecord);
    await saveAdvisorsDb(db);
    
    return newRecord;
  }
}

// Kullanıcıya ait mesajları getirme (hem gönderilen hem alınan)
export async function getUserMessages(email: string): Promise<MessageRecord[]> {
  const db = await loadMessagesDb();
  const messages = db.messages.filter(m => 
    m.senderEmail.toLowerCase() === email.toLowerCase() || 
    m.receiverEmail.toLowerCase() === email.toLowerCase()
  );
  
  // Mesajları tarih sırasına göre sırala (en yeniden en eskiye)
  return messages.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Belirli bir mesajı getirme
export async function getMessageById(messageId: string): Promise<MessageRecord | null> {
  const db = await loadMessagesDb();
  const message = db.messages.find(m => m.id === messageId);
  return message || null;
}

// Yeni mesaj oluşturma
export async function createMessage(data: Omit<MessageRecord, 'id' | 'createdAt' | 'isRead'>): Promise<MessageRecord> {
  try {
    console.log('Yeni mesaj oluşturuluyor...');
    console.log('Gönderen:', data.senderEmail);
    console.log('Alıcı:', data.receiverEmail);
    console.log('Rol:', data.senderRole);
    
    // Mesaj veritabanını yükle
    const db = await loadMessagesDb();
    console.log(`Mevcut mesaj sayısı: ${db.messages.length}`);
    
    // Yeni mesaj oluştur
    const newMessage: MessageRecord = {
      id: `msg-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    console.log('Yeni mesaj ID:', newMessage.id);
    
    // Mesajı veritabanına ekle
    db.messages.push(newMessage);
    
    // Veritabanını kaydet
    const saveResult = await saveMessagesDb(db);
    if (!saveResult) {
      throw new Error('Mesaj veritabanı kaydedilemedi');
    }
    
    console.log('Yeni mesaj başarıyla kaydedildi');
    return newMessage;
  } catch (error) {
    console.error('Mesaj oluşturma hatası:', error);
    if (error instanceof Error) {
      console.error('Hata mesajı:', error.message);
      console.error('Hata stack:', error.stack);
    }
    throw error;
  }
}

// Mesajın okundu olarak işaretlenmesi
export async function markMessageAsRead(messageId: string): Promise<MessageRecord | null> {
  const db = await loadMessagesDb();
  const messageIndex = db.messages.findIndex(m => m.id === messageId);
  
  if (messageIndex < 0) {
    return null; // Mesaj bulunamadı
  }
  
  // Mesajı güncelle
  db.messages[messageIndex].isRead = true;
  await saveMessagesDb(db);
  
  return db.messages[messageIndex];
}

// Okunmamış mesaj sayısını getirme
export async function getUnreadMessagesCount(email: string): Promise<number> {
  const db = await loadMessagesDb();
  const unreadCount = db.messages.filter(m => 
    m.receiverEmail.toLowerCase() === email.toLowerCase() && !m.isRead
  ).length;
  
  return unreadCount;
}

// E-posta adresine göre satış ekibi üyesi bulma
export async function getSalesPersonByEmail(email: string): Promise<SalesPersonRecord | null> {
  const db = await loadSalesDb();
  const salesPerson = db.salesTeam.find(s => s.email.toLowerCase() === email.toLowerCase());
  return salesPerson || null;
}

// Satış ekibi üyesi ID'sine göre öğrencileri bulma
export async function getSalesPersonStudents(salesPersonId: string): Promise<CustomerRecord[]> {
  // Önce satış ekibi üyesini bul
  const salesDb = await loadSalesDb();
  const salesPerson = salesDb.salesTeam.find(s => s.id === salesPersonId);
  
  if (!salesPerson || !salesPerson.studentIds || salesPerson.studentIds.length === 0) {
    return [];
  }
  
  // Satış ekibi üyesine atanmış öğrencileri bul
  const db = await loadDb();
  const students = db.customers.filter(c => 
    salesPerson.studentIds.includes(c.email.toLowerCase())
  );
  
  return students;
}

// Yeni kayıt olan bir kullanıcıya satış ekibi üyesi atama
export async function assignSalesPersonToStudent(studentEmail: string): Promise<SalesPersonRecord | null> {
  const db = await loadSalesDb();
  
  if (!db.salesTeam || db.salesTeam.length === 0) {
    return null;
  }
  
  // Sırayla satış ekibi üyesi atama için en az öğrencisi olan üyeyi seç
  const salesPerson = db.salesTeam.reduce((prev, current) => 
    (prev.studentIds?.length || 0) <= (current.studentIds?.length || 0) ? prev : current
  );
  
  // Öğrenciyi satış ekibi üyesinin listesine ekle
  if (!salesPerson.studentIds) {
    salesPerson.studentIds = [];
  }
  
  // Email adresi zaten listede var mı kontrol et
  const email = studentEmail.toLowerCase();
  if (!salesPerson.studentIds.includes(email)) {
    salesPerson.studentIds.push(email);
  }
  
  // Güncellenme zamanını kaydet
  salesPerson.updatedAt = new Date().toISOString();
  
  // Veritabanını güncelle
  const salesPersonIndex = db.salesTeam.findIndex(s => s.id === salesPerson.id);
  if (salesPersonIndex >= 0) {
    db.salesTeam[salesPersonIndex] = salesPerson;
    await saveSalesDb(db);
  }
  
  return salesPerson;
}

// Yeni satış ekibi üyesi oluşturma veya mevcut üyeyi güncelleme
export async function updateOrCreateSalesPerson(data: Partial<SalesPersonRecord>): Promise<SalesPersonRecord> {
  if (!data.email) {
    throw new Error('Email alanı zorunludur');
  }
  
  console.log('updateOrCreateSalesPerson başlatıldı:', data.email);
  
  try {
    const db = await loadSalesDb();
    const existingIndex = db.salesTeam.findIndex(s => 
      s.email.toLowerCase() === data.email!.toLowerCase()
    );
    
    console.log('Mevcut satış ekibi üyesi durumu:', existingIndex >= 0 ? 'Mevcut üye bulundu' : 'Yeni üye oluşturulacak');
    
    if (existingIndex >= 0) {
      // Mevcut üyeyi güncelle
      const updatedRecord = {
        ...db.salesTeam[existingIndex],
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      db.salesTeam[existingIndex] = updatedRecord;
      const saveResult = await saveSalesDb(db);
      console.log('Satış ekibi üyesi güncelleme sonucu:', saveResult ? 'Başarılı' : 'Başarısız');
      
      return updatedRecord;
    } else {
      // Yeni üye oluştur
      const newRecord: SalesPersonRecord = {
        ...(data as SalesPersonRecord),
        id: data.id || `sales-${Date.now()}`,
        updatedAt: new Date().toISOString(),
        studentIds: data.studentIds || []
      };
      
      db.salesTeam.push(newRecord);
      const saveResult = await saveSalesDb(db);
      console.log('Yeni satış ekibi üyesi oluşturma sonucu:', saveResult ? 'Başarılı' : 'Başarısız');
      
      return newRecord;
    }
  } catch (error) {
    console.error('updateOrCreateSalesPerson hatası:', error);
    throw error;
  }
}

// Satış ekibi üyesinin süreç başlatması ve danışman ataması
export async function startProcessAndAssignAdvisor(
  studentEmail: string, 
  advisorId: string, 
  salesPersonId: string
): Promise<CustomerRecord | null> {
  try {
    // Önce öğrenciyi bul
    const student = await getRecordByEmail(studentEmail);
    
    if (!student) {
      console.error('Öğrenci bulunamadı:', studentEmail);
      return null;
    }
    
    // Danışmanı doğrula
    const advisorsDb = await loadAdvisorsDb();
    const advisor = advisorsDb.advisors.find(a => a.id === advisorId);
    
    if (!advisor) {
      console.error('Danışman bulunamadı:', advisorId);
      return null;
    }
    
    // Öğrencinin sürecini başlat ve danışmanını ata
    const updatedStudent = await updateOrCreateRecord({
      email: studentEmail,
      processStarted: true,
      processStartDate: new Date().toISOString(),
      advisorId: advisor.id,
      advisorName: advisor.name,
      advisorEmail: advisor.email,
      salesId: salesPersonId,
      stage: 'Süreç Başlatıldı'
    });
    
    // Danışmanın öğrenci listesine ekle
    if (!advisor.studentIds) {
      advisor.studentIds = [];
    }
    
    if (!advisor.studentIds.includes(studentEmail.toLowerCase())) {
      advisor.studentIds.push(studentEmail.toLowerCase());
      await updateOrCreateAdvisor({
        id: advisor.id,
        email: advisor.email,
        name: advisor.name,
        studentIds: advisor.studentIds
      });
    }
    
    return updatedStudent;
  } catch (error) {
    console.error('Süreç başlatma ve danışman atama hatası:', error);
    return null;
  }
} 