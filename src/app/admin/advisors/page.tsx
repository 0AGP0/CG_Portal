"use client";

import { useState, useEffect } from "react";
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
  const [isAddAdvisorOpen, setIsAddAdvisorOpen] = useState(false);

  // Örnek danışman verileri
  const [advisors, setAdvisors] = useState([
    { id: 1, name: "Müge Hanım", email: "muge@campusglobal.com", phone: "533-111-0011", studentCount: 8, activityRate: "92%" },
    { id: 2, name: "Murat Bey", email: "murat@campusglobal.com", phone: "544-222-0022", studentCount: 12, activityRate: "88%" },
    { id: 3, name: "Canan Hanım", email: "canan@campusglobal.com", phone: "566-333-0033", studentCount: 5, activityRate: "95%" },
    { id: 4, name: "Ahmet Şahin", email: "ahmet.sahin@campusglobal.com", phone: "533-444-0044", studentCount: 10, activityRate: "85%" },
    { id: 5, name: "Selma Yılmaz", email: "selma@campusglobal.com", phone: "545-555-0055", studentCount: 7, activityRate: "90%" },
  ]);

  // Form durum yönetimi
  const [newAdvisor, setNewAdvisor] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    // API'den veri çekme simülasyonu
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const filteredAdvisors = advisors.filter(advisor =>
    advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAdvisor = () => {
    // API'ye yeni danışman ekleme isteği gönderilebilir
    const newId = advisors.length + 1;
    setAdvisors([...advisors, { 
      id: newId, 
      ...newAdvisor, 
      studentCount: 0, 
      activityRate: "0%" 
    }]);
    setNewAdvisor({ name: "", email: "", phone: "" });
    setIsAddAdvisorOpen(false);
    toast({
      title: "Danışman oluşturuldu",
      description: "Yeni danışman başarıyla eklendi",
    });
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
              
              <Dialog open={isAddAdvisorOpen} onOpenChange={setIsAddAdvisorOpen}>
                <DialogTrigger asChild>
                  <Button className="px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white shadow-sm hover:shadow-md rounded-full text-sm font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Yeni Danışman
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-gray-800 dark:text-gray-100">Yeni Danışman Ekle</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Ad Soyad</Label>
                      <Input 
                        id="name" 
                        value={newAdvisor.name}
                        onChange={(e) => setNewAdvisor({...newAdvisor, name: e.target.value})}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">E-posta</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={newAdvisor.email}
                        onChange={(e) => setNewAdvisor({...newAdvisor, email: e.target.value})}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Telefon</Label>
                      <Input 
                        id="phone" 
                        value={newAdvisor.phone}
                        onChange={(e) => setNewAdvisor({...newAdvisor, phone: e.target.value})}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddAdvisor} className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white">Ekle</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        </div>
        
        {/* Arama */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <Input
            placeholder="Danışman ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 block w-full sm:w-64 text-gray-800 dark:text-gray-200"
          />
        </div>
        
        {/* Tablo */}
        <motion.div
          variants={fadeIn}
          className="bg-white dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/30 overflow-hidden"
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16">
                  <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-accent-200 dark:border-accent-800/40 opacity-40"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-t-accent-600 dark:border-t-accent-400 animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-700/30">
                  <TableHead className="text-gray-500 dark:text-gray-400">Ad Soyad</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">E-posta</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Telefon</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Öğrenci Sayısı</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Aktivite Oranı</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400 text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdvisors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400 py-10">
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>Danışman bulunamadı</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdvisors.map((advisor) => (
                    <TableRow key={advisor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <TableCell>
                        <div className="flex items-center">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-success-400 rounded-full blur-[1px]"></div>
                            <div className="relative h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br from-accent-50 to-success-50 dark:from-accent-900 dark:to-success-900 border-2 border-white dark:border-gray-800 font-medium text-gray-800 dark:text-gray-200">
                              {advisor.name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{advisor.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">{advisor.email}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">{advisor.phone}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                              className="bg-accent-600 dark:bg-accent-500 h-2.5 rounded-full" 
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
                        <Button variant="outline" size="sm" className="text-accent-600 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-300 font-medium">
                          Düzenle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </motion.div>
      </motion.div>
    </Layout>
  );
} 