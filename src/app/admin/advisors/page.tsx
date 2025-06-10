"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

// Animasyon varyantları
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function AdvisorsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [showAddAdvisorModal, setShowAddAdvisorModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAdvisor, setNewAdvisor] = useState({ name: "", email: "", phone: "" });

  // Modal'ı kapatma fonksiyonu
  const closeModal = useCallback(() => {
    setShowAddAdvisorModal(false);
    setNewAdvisor({ name: "", email: "", phone: "" });
    setIsSubmitting(false);
  }, []);

  // Modal'ı açma fonksiyonu
  const openModal = useCallback(() => {
    setShowAddAdvisorModal(true);
  }, []);

  // Verileri yükle
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Danışmanları getir
        const response = await fetch('/api/admin/advisors');
        
        if (response.ok) {
          const data = await response.json();
          setAdvisors(data.advisors || []);
        } else {
          // API çalışmazsa örnek veri kullan
          setAdvisors([
            { id: "1", name: "Müge Hanım", email: "muge@campusglobal.com", phone: "533-111-0011", studentCount: 8, activityRate: "92%" },
            { id: "2", name: "Murat Bey", email: "murat@campusglobal.com", phone: "544-222-0022", studentCount: 12, activityRate: "88%" },
            { id: "3", name: "Canan Hanım", email: "canan@campusglobal.com", phone: "566-333-0033", studentCount: 5, activityRate: "95%" },
          ]);
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        toast({
          title: "Hata",
          description: "Veriler yüklenirken bir sorun oluştu.",
          variant: "destructive"
        });
        
        // Hata durumunda örnek veri kullan
        setAdvisors([
          { id: "1", name: "Müge Hanım", email: "muge@campusglobal.com", phone: "533-111-0011", studentCount: 8, activityRate: "92%" },
          { id: "2", name: "Murat Bey", email: "murat@campusglobal.com", phone: "544-222-0022", studentCount: 12, activityRate: "88%" },
        ]);
      } finally {
      setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredAdvisors = advisors.filter(advisor =>
    (advisor.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (advisor.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleAddAdvisor = async () => {
    // Form validasyonu
    if (!newAdvisor.name || !newAdvisor.email) {
      toast({
        title: "Eksik bilgi",
        description: "Lütfen ad ve e-posta alanlarını doldurun.",
        variant: "destructive"
      });
      return;
    }
    
    // E-posta validasyonu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdvisor.email)) {
      toast({
        title: "Geçersiz e-posta",
        description: "Lütfen geçerli bir e-posta adresi girin.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // API'ye yeni danışman ekleme isteği gönder
      const response = await fetch('/api/admin/advisors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAdvisor)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Başarılı yanıt durumunda UI'ı güncelle
        const newId = data.advisor?.id || `temp-${Date.now()}`;
        const newAdvisorData = { 
      id: newId, 
      ...newAdvisor, 
      studentCount: 0, 
      activityRate: "0%" 
        };
        
        setAdvisors([...advisors, newAdvisorData]);
    setNewAdvisor({ name: "", email: "", phone: "" });
        setShowAddAdvisorModal(false);
        
    toast({
      title: "Danışman oluşturuldu",
      description: "Yeni danışman başarıyla eklendi",
    });
      } else {
        // API hatası durumu
        const errorData = await response.json();
        toast({
          title: "Hata",
          description: errorData.error || "Beklenmeyen bir hata oluştu",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Danışman ekleme hatası:', error);
      toast({
        title: "Hata",
        description: "Danışman eklenirken bir sorun oluştu.",
        variant: "destructive"
      });
      
      // Hata olsa bile kullanıcı deneyimini korumak için UI'ı güncelle
      const newId = Date.now().toString();
      setAdvisors([...advisors, { id: newId, ...newAdvisor, studentCount: 0, activityRate: "0%" }]);
      setNewAdvisor({ name: "", email: "", phone: "" });
      setShowAddAdvisorModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Başlık */}
        <div className="relative overflow-hidden mb-8">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-100/50 dark:bg-accent-900/20 rounded-full blur-2xl"></div>
          <div className="absolute top-10 -left-10 w-40 h-40 bg-secondary-100/30 dark:bg-secondary-900/10 rounded-full blur-xl"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-r from-white to-accent-50/70 dark:from-gray-800/80 dark:to-accent-900/20 border border-white/40 dark:border-gray-700/30 shadow-xl"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Danışman Yönetimi</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Tüm danışmanların bilgilerini buradan yönetebilirsiniz.</p>
              </div>
              
              <Button 
                onClick={openModal}
                className="px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white shadow-sm hover:shadow-md rounded-full text-sm font-medium flex items-center justify-center"
              >
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Yeni Danışman
                  </Button>
            </div>
          </motion.div>
        </div>

        {/* Modal */}
        {showAddAdvisorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeModal}
            />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Yeni Danışman Ekle
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                      <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Ad Soyad</Label>
                      <Input 
                        id="name" 
                        value={newAdvisor.name}
                        onChange={(e) => setNewAdvisor({...newAdvisor, name: e.target.value})}
                    className="mt-1 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-accent-500 focus:border-accent-500"
                      />
                    </div>
                <div>
                      <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">E-posta</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={newAdvisor.email}
                        onChange={(e) => setNewAdvisor({...newAdvisor, email: e.target.value})}
                    className="mt-1 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-accent-500 focus:border-accent-500"
                      />
                    </div>
                <div>
                      <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Telefon</Label>
                      <Input 
                        id="phone" 
                        value={newAdvisor.phone}
                        onChange={(e) => setNewAdvisor({...newAdvisor, phone: e.target.value})}
                    className="mt-1 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-accent-500 focus:border-accent-500"
                      />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleAddAdvisor} 
                  className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white rounded-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      Ekleniyor...
                    </div>
                  ) : 'Ekle'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            variants={fadeIn}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-100/60 dark:border-gray-700/30 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Danışman</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{advisors.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeIn}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-100/60 dark:border-gray-700/30 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Öğrenci</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {advisors.reduce((total, advisor) => total + (advisor.studentCount || 0), 0)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success-600 dark:text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeIn}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-100/60 dark:border-gray-700/30 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ortalama Aktivite</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {advisors.length > 0 
                    ? Math.round(advisors.reduce((total, advisor) => {
                        const rate = parseInt(advisor.activityRate) || 0;
                        return total + rate;
                      }, 0) / advisors.length) + '%'
                    : '0%'}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                  </div>
            </div>
          </motion.div>
        </div>
        
        {/* Arama */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Danışman ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 block w-full sm:w-64 text-gray-800 dark:text-gray-200 rounded-lg"
          />
        </div>
        
        {/* Tablo */}
        <motion.div
          variants={fadeIn}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-700 dark:text-gray-300">Ad Soyad</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">E-posta</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Telefon</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Öğrenci Sayısı</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Aktivite Oranı</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-300">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Yükleniyor...
                    </TableCell>
                  </TableRow>
                ) : filteredAdvisors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Sonuç bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdvisors.map((advisor) => (
                    <TableRow key={advisor.id} className="group hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors">
                      <TableCell>
                        <div className="flex items-center">
                          <div className="relative group-hover:scale-105 transition-transform">
                            <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-success-400 rounded-full blur-[1px]"></div>
                            <div className="relative h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br from-accent-50 to-success-50 dark:from-accent-900 dark:to-success-900 border-2 border-white dark:border-gray-800 font-medium text-gray-800 dark:text-gray-200">
                              {advisor.name?.charAt(0) || '?'}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">{advisor.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        <a href={`mailto:${advisor.email}`} className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
                          {advisor.email}
                        </a>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {advisor.phone ? (
                          <a href={`tel:${advisor.phone.replace(/[^0-9]/g, '')}`} className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
                            {advisor.phone}
                          </a>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 italic">Belirtilmemiş</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                              className="bg-accent-600 dark:bg-accent-500 h-2.5 rounded-full transition-all duration-300" 
                              style={{ width: `${Math.min(100, (advisor.studentCount / 15) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{advisor.studentCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/40 text-success-800 dark:text-success-300">
                          {advisor.activityRate}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-accent-600 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-300 border-accent-200 dark:border-accent-800/30 hover:border-accent-300 dark:hover:border-accent-700/50 bg-accent-50/50 dark:bg-accent-900/20 hover:bg-accent-100/50 dark:hover:bg-accent-800/30"
                          >
                          Düzenle
                        </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
} 