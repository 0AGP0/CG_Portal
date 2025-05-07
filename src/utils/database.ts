import fs from 'fs';
import path from 'path';

// Basit JSON tabanlı veri deposu dosyası
const DB_FILE = path.join(process.cwd(), 'data', 'customers.json');

// Veri yapısı tipleri
interface CustomerRecord {
  email: string;
  lead_id?: string;
  stage?: string;
  university?: string;
  program?: string;
  documents?: DocumentRecord[];
  updatedAt: string;
  [key: string]: any;
}

interface DocumentRecord {
  documentType: string;
  documentUrl: string;
  documentName: string;
  updatedAt: string;
}

// Veri dosyasını oluştur veya yükle
async function ensureDbExists() {
  try {
    const dirPath = path.dirname(DB_FILE);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ customers: [] }));
    }
    
    return true;
  } catch (error) {
    console.error('Veri dosyası oluşturma hatası:', error);
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

// Veritabanını kaydet
async function saveDb(data: { customers: CustomerRecord[] }): Promise<boolean> {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Veritabanı kaydetme hatası:', error);
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
  
  const db = await loadDb();
  const existingIndex = db.customers.findIndex(c => 
    c.email.toLowerCase() === data.email!.toLowerCase()
  );
  
  if (existingIndex >= 0) {
    // Mevcut kaydı güncelle
    const updatedRecord = {
      ...db.customers[existingIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    db.customers[existingIndex] = updatedRecord;
    await saveDb(db);
    
    return updatedRecord;
  } else {
    // Yeni kayıt oluştur
    const newRecord: CustomerRecord = {
      ...(data as CustomerRecord),
      updatedAt: new Date().toISOString(),
      documents: []
    };
    
    db.customers.push(newRecord);
    await saveDb(db);
    
    return newRecord;
  }
}

// Doküman bilgisini güncelleme
export async function updateDocumentRecord(data: {
  email: string;
  documentType: string;
  documentUrl: string;
  documentName: string;
  updatedAt: string;
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
      updatedAt: data.updatedAt
    };
  } else {
    // Yeni doküman ekle
    customer.documents.push({
      documentType: data.documentType,
      documentUrl: data.documentUrl,
      documentName: data.documentName,
      updatedAt: data.updatedAt
    });
  }
  
  // Müşteri kaydını güncelle
  customer.updatedAt = new Date().toISOString();
  db.customers[customerIndex] = customer;
  
  // Değişiklikleri kaydet
  await saveDb(db);
  
  return customer;
} 