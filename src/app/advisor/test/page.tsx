"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';

// Animasyon varyantları
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

// Index signature ile test veri tipi
interface TestDataType {
  [key: string]: any;
  _action: string;
  _id: number;
  _model: string;
  contact_address: string;
  id: number;
  name: string;
  phone: boolean;
  x_studio_mail_adresi: string;
  x_studio_ya: number;
}

// Örnek test verileri - Odoo'dan gelen veri formatında
const testData: TestDataType = {
  "_action": "Send Webhook Notification(#NewId_1962)",
  "_id": 123,
  "_model": "res.partner",
  "contact_address": "Kartaltepe, Babacan Port Royal, Malazgirt Cd. No:6 A2 Blok D:3, Küçükçekmece\n\nİstanbul 34295\nTürkiye",
  "id": 123,
  "name": "AKİLE BURCU ŞAT",
  "phone": false,
  "x_studio_almanca_sertifikas": "A2 - ÖSD - 26 Ağustos",
  "x_studio_almanca_seviyesi_1": "Bilmiyorum",
  "x_studio_almanya_bulunma": false,
  "x_studio_anne_ad": "SELMA",
  "x_studio_anne_doum_tarihi": "1981-11-05",
  "x_studio_anne_doum_yeri": "KAYSERİ",
  "x_studio_anne_ikamet_sehrilke": "KAYSERİ/KOCASİNAN",
  "x_studio_anne_soyad": "ŞAT",
  "x_studio_anne_telefon": false,
  "x_studio_baba_ad": "MURAT",
  "x_studio_baba_doum_tarihi": "1973-01-19",
  "x_studio_baba_doum_yeri": "YOZGAT",
  "x_studio_baba_ikamet_ehrilkesi": "KAYSERİ/KOCASİNAN",
  "x_studio_baba_soyad": "ŞAT",
  "x_studio_baba_telefon": false,
  "x_studio_bilgiler_1": false,
  "x_studio_de_blm_tercihi": false,
  "x_studio_dil_kursu_kayt": false,
  "x_studio_dil_renim_durumu": false,
  "x_studio_dil_sertifikas": false,
  "x_studio_doum_tarihi": "1997-05-29",
  "x_studio_doum_yeri": "Kocasinan",
  "x_studio_finansal_kant": "Garantör",
  "x_studio_geerlilik_tarihi": "16.11.2033",
  "x_studio_konsolosluk_1": "İstanbul",
  "x_studio_lise_ad": "ÖZEL GENÇ SULTAN ANADOLU LİSESİ",
  "x_studio_lise_balang_tarihi_1": false,
  "x_studio_lise_biti_tarihi": "12.06.2015",
  "x_studio_lise_ehir": "KAYSERİ",
  "x_studio_lise_tr": "ANADOLU",
  "x_studio_maddi_kant_durumu": false,
  "x_studio_mail_adresi": "burcu.shut@gmail.com",
  "x_studio_medeni_durum_1": "Bekar",
  "x_studio_mezuniyet_durumu": "Üniversite",
  "x_studio_mezuniyet_yl": "09.07.2020",
  "x_studio_niversite_ad": "ERCİYES ÜNİVERSİTESİ",
  "x_studio_niversite_balang_tarihi": "06.09.2017",
  "x_studio_niversite_biti_tarihi": "09.07.2020",
  "x_studio_niversite_blm_ad": "İNGİLİZCE ÖĞRETMENLİĞİ",
  "x_studio_niversite_tercihleri": false,
  "x_studio_pasaport_numaras": "U30684829",
  "x_studio_pasaport_tr": "Umuma Mahsus (Bordo) Pasaport",
  "x_studio_pnr_numaras": "IDTY23PL8MZ",
  "x_studio_selection_field_8en_1iqnrqang": "BİTEN",
  "x_studio_sym_snav_giri": true,
  "x_studio_sym_yerlestirme_sonuc_tarihi": "23.07.2015",
  "x_studio_veren_makam": "MELİKGAZİ",
  "x_studio_verili_tarihi": "16.11.2023",
  "x_studio_vize_bavuru_tarihi_1": "2024-06-21",
  "x_studio_vize_randevu_belgesi": false,
  "x_studio_vize_randevu_tarihi": "2024-07-16",
  "x_studio_ya": 27
};

// Kategorilendirilmiş veri alanları
const dataCategories = [
  {
    title: "Temel Bilgiler",
    fields: ["name", "contact_address", "phone", "x_studio_mail_adresi", "x_studio_ya", "x_studio_doum_tarihi", "x_studio_doum_yeri", "x_studio_medeni_durum_1"]
  },
  {
    title: "Pasaport Bilgileri",
    fields: ["x_studio_pasaport_numaras", "x_studio_pasaport_tr", "x_studio_verili_tarihi", "x_studio_geerlilik_tarihi", "x_studio_veren_makam", "x_studio_pnr_numaras"]
  },
  {
    title: "Vize Bilgileri",
    fields: ["x_studio_vize_bavuru_tarihi_1", "x_studio_vize_randevu_tarihi", "x_studio_konsolosluk_1", "x_studio_almanya_bulunma"]
  },
  {
    title: "Üniversite Bilgileri",
    fields: ["x_studio_niversite_ad", "x_studio_niversite_blm_ad", "x_studio_niversite_balang_tarihi", "x_studio_niversite_biti_tarihi", "x_studio_mezuniyet_durumu", "x_studio_mezuniyet_yl", "x_studio_niversite_tercihleri"]
  },
  {
    title: "Lise Bilgileri",
    fields: ["x_studio_lise_ad", "x_studio_lise_tr", "x_studio_lise_ehir", "x_studio_lise_balang_tarihi_1", "x_studio_lise_biti_tarihi"]
  },
  {
    title: "Dil Yetkinlikleri",
    fields: ["x_studio_almanca_seviyesi_1", "x_studio_almanca_sertifikas", "x_studio_dil_sertifikas", "x_studio_dil_renim_durumu", "x_studio_dil_kursu_kayt"]
  },
  {
    title: "Aile Bilgileri - Anne",
    fields: ["x_studio_anne_ad", "x_studio_anne_soyad", "x_studio_anne_doum_tarihi", "x_studio_anne_doum_yeri", "x_studio_anne_ikamet_sehrilke", "x_studio_anne_telefon"]
  },
  {
    title: "Aile Bilgileri - Baba",
    fields: ["x_studio_baba_ad", "x_studio_baba_soyad", "x_studio_baba_doum_tarihi", "x_studio_baba_doum_yeri", "x_studio_baba_ikamet_ehrilkesi", "x_studio_baba_telefon"]
  },
  {
    title: "Finansal Bilgiler",
    fields: ["x_studio_finansal_kant", "x_studio_maddi_kant_durumu"]
  },
  {
    title: "Sınav Bilgileri",
    fields: ["x_studio_sym_snav_giri", "x_studio_sym_yerlestirme_sonuc_tarihi"]
  },
  {
    title: "Diğer Bilgiler",
    fields: ["_action", "_id", "_model", "id", "x_studio_selection_field_8en_1iqnrqang", "x_studio_bilgiler_1", "x_studio_de_blm_tercihi"]
  }
];

// Alan adını daha insancıl bir formata dönüştür
const formatFieldName = (fieldName: string): string => {
  // x_studio_ önekini kaldır
  let formatted = fieldName.replace('x_studio_', '');
  
  // Kelimeleri böl ve baş harflerini büyüt
  formatted = formatted.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Türkçe karakterleri düzelt
  formatted = formatted
    .replace('niversite', 'Üniversite')
    .replace('blm', 'Bölüm')
    .replace('ehir', 'Şehir')
    .replace('doum', 'Doğum')
    .replace('geerlilik', 'Geçerlilik')
    .replace('ya', 'Yaş')
    .replace('kant', 'Kanıt')
    .replace('balang', 'Başlangıç')
    .replace('bavuru', 'Başvuru');
  
  return formatted;
};

// Alan değerini formatla
const formatFieldValue = (value: any): string => {
  if (value === false) return '---';
  if (value === true) return 'Evet';
  if (value === null || value === undefined) return '---';
  return String(value);
};

export default function AdvisorTestPage() {
  const { user, isAdvisor } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState(testData);

  // Erişim kontrolü
  if (!user || !isAdvisor()) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erişim Reddedildi</h1>
            <p className="mb-4">Bu sayfaya erişmek için danışman olarak giriş yapmalısınız.</p>
            <Link href="/login" className="btn-primary">
              Giriş Sayfasına Dön
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#002757]">
              Odoo Veri Test Paneli
            </h1>
            <p className="text-default mt-1">
              Bu panel, Odoo'dan gelen tüm veri alanlarını test etmek için tasarlanmıştır.
            </p>
          </div>
          
          <Link href="/advisor/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Ana Panele Dön
          </Link>
        </div>

        {/* Test açıklaması */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <p className="text-yellow-800">
            <span className="font-bold">Not:</span> Bu sayfa, Odoo'dan gelen tüm veri alanlarını göstermek için oluşturulmuş bir test sayfasıdır. 
            Örnek veri olarak "AKİLE BURCU ŞAT" kaydı kullanılmıştır.
          </p>
        </div>

        {/* Öğrenci bilgileri */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-[#002757]">
            Öğrenci Bilgileri: {selectedStudent.name}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dataCategories.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                variants={itemVariants}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <h3 className="font-semibold text-lg mb-3 text-blue-700 border-b pb-2">
                  {category.title}
                </h3>
                <div className="space-y-2">
                  {category.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="flex justify-between">
                      <span className="text-gray-700 font-medium">{formatFieldName(field)}:</span>
                      <span className="text-gray-900 ml-2">{formatFieldValue(selectedStudent[field])}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Veri Kabul Butonu */}
        <div className="text-center mt-6">
          <button
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            onClick={() => alert("Örnek veri modeli başarıyla test edildi!")}
          >
            Veri Modelini Doğrula
          </button>
        </div>
      </motion.div>
    </Layout>
  );
} 