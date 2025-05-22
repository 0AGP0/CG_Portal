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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export default function StudentsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Veri durumları
  const [students, setStudents] = useState<any[]>([]);
  const [advisors, setAdvisors] = useState<any[]>([]);

  // Form durum yönetimi
  const [newStudent, setNewStudent] = useState({ name: "", email: "", phone: "" });
  const [selectedAdvisor, setSelectedAdvisor] = useState("");

  // Verileri yükle
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Öğrencileri getir
        const studentsResponse = await fetch('/api/admin/students');
        
        // Danışmanları getir
        const advisorsResponse = await fetch('/api/admin/advisors');
        
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          setStudents(studentsData.students || []);
        } else {
          // API çalışmazsa örnek veri kullan
          setStudents([
            { id: "1", name: "Ahmet Yılmaz", email: "ahmet@example.com", phone: "532-111-2233", advisor: "Müge Hanım", status: "Aktif" },
            { id: "2", name: "Ayşe Demir", email: "ayse@example.com", phone: "535-222-3344", advisor: "Atanmadı", status: "Beklemede" },
            { id: "3", name: "Mehmet Kaya", email: "mehmet@example.com", phone: "542-333-4455", advisor: "Murat Bey", status: "Aktif" },
            { id: "4", name: "Zeynep Şahin", email: "zeynep@example.com", phone: "545-444-5566", advisor: "Atanmadı", status: "Beklemede" },
            { id: "5", name: "Emre Yıldız", email: "emre@example.com", phone: "555-555-6677", advisor: "Müge Hanım", status: "Tamamlandı" },
          ]);
        }
        
        if (advisorsResponse.ok) {
          const advisorsData = await advisorsResponse.json();
          setAdvisors(advisorsData.advisors || []);
        } else {
          // API çalışmazsa örnek veri kullan
          setAdvisors([
            { id: "1", name: "Müge Hanım", email: "muge@campusglobal.com", phone: "533-111-0011", studentCount: 8 },
            { id: "2", name: "Murat Bey", email: "murat@campusglobal.com", phone: "544-222-0022", studentCount: 12 },
            { id: "3", name: "Canan Hanım", email: "canan@campusglobal.com", phone: "566-333-0033", studentCount: 5 },
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
        setStudents([
          { id: "1", name: "Ahmet Yılmaz", email: "ahmet@example.com", phone: "532-111-2233", advisor: "Müge Hanım", status: "Aktif" },
          { id: "2", name: "Ayşe Demir", email: "ayse@example.com", phone: "535-222-3344", advisor: "Atanmadı", status: "Beklemede" },
        ]);
        
        setAdvisors([
          { id: "1", name: "Müge Hanım", email: "muge@campusglobal.com", phone: "533-111-0011", studentCount: 8 },
          { id: "2", name: "Murat Bey", email: "murat@campusglobal.com", phone: "544-222-0022", studentCount: 12 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredStudents = students.filter(student =>
    (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    ((student.status?.toLowerCase() || '').includes(searchTerm.toLowerCase()))
  );

  const handleAddStudent = async () => {
    // Form validasyonu
    if (!newStudent.name || !newStudent.email) {
      toast({
        title: "Eksik bilgi",
        description: "Lütfen ad ve e-posta alanlarını doldurun.",
        variant: "destructive"
      });
      return;
    }
    
    // E-posta validasyonu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newStudent.email)) {
      toast({
        title: "Geçersiz e-posta",
        description: "Lütfen geçerli bir e-posta adresi girin.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // API'ye yeni öğrenci ekleme isteği gönder
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Başarılı yanıt durumunda UI'ı güncelle
        const newId = data.student?.id || `temp-${Date.now()}`;
        const newStudentData = { 
          id: newId, 
          ...newStudent, 
          advisor: "Atanmadı", 
          status: "Beklemede" 
        };
        
        setStudents([...students, newStudentData]);
        setNewStudent({ name: "", email: "", phone: "" });
        setIsAddStudentOpen(false);
        
        toast({
          title: "Öğrenci oluşturuldu",
          description: "Yeni öğrenci başarıyla eklendi",
        });
      } else {
        // API hatası durumu
        const errorData = await response.json();
        toast({
          title: "Öğrenci oluşturulamadı",
          description: errorData.error || "Beklenmeyen bir hata oluştu",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Öğrenci ekleme hatası:', error);
      toast({
        title: "Hata",
        description: "Öğrenci eklenirken bir sorun oluştu.",
        variant: "destructive"
      });
      
      // Hata olsa bile kullanıcı deneyimini korumak için UI'ı güncelle
      const newId = Date.now().toString();
      setStudents([...students, { id: newId, ...newStudent, advisor: "Atanmadı", status: "Beklemede" }]);
      setNewStudent({ name: "", email: "", phone: "" });
      setIsAddStudentOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignAdvisor = async () => {
    if (!selectedStudent || !selectedAdvisor) {
      toast({
        title: "Eksik bilgi",
        description: "Lütfen öğrenci ve danışman seçin.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // API'ye danışman atama isteği gönder
      const response = await fetch('/api/admin/assign-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          advisorId: selectedAdvisor
        })
      });
      
      if (response.ok) {
        // Başarılı yanıt durumunda UI'ı güncelle
        const advisor = advisors.find(adv => adv.id.toString() === selectedAdvisor);
        
        // Öğrenci listesini güncelle
        const updatedStudents = students.map(student => {
          if (student.id.toString() === selectedStudent) {
            return { 
              ...student, 
              advisor: advisor ? advisor.name : "Atanmadı",
              advisorId: selectedAdvisor
            };
          }
          return student;
        });
        
        setStudents(updatedStudents);
        setIsAssignOpen(false);
        setSelectedStudent(null);
        setSelectedAdvisor("");
        
        toast({
          title: "Danışman ataması",
          description: "Danışman ataması başarıyla tamamlandı",
        });
      } else {
        // API hatası durumu
        const errorData = await response.json();
        toast({
          title: "Danışman atanamadı",
          description: errorData.error || "Beklenmeyen bir hata oluştu",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Danışman atama hatası:', error);
      toast({
        title: "Hata",
        description: "Danışman atanırken bir sorun oluştu.",
        variant: "destructive"
      });
      
      // Hata olsa bile kullanıcı deneyimini korumak için UI'ı güncelle
      const advisor = advisors.find(adv => adv.id.toString() === selectedAdvisor);
      const updatedStudents = students.map(student => {
        if (student.id.toString() === selectedStudent) {
          return { ...student, advisor: advisor ? advisor.name : "Atanmadı" };
        }
        return student;
      });
      
      setStudents(updatedStudents);
      setIsAssignOpen(false);
      setSelectedStudent(null);
      setSelectedAdvisor("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aktif':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/40 text-success-800 dark:text-success-300">
            Aktif
          </span>
        );
      case 'Beklemede':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 dark:bg-warning-900/40 text-warning-800 dark:text-warning-300">
            Beklemede
          </span>
        );
      case 'Tamamlandı':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-300">
            Tamamlandı
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
            {status}
          </span>
        );
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
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-100/50 dark:bg-primary-900/20 rounded-full blur-2xl"></div>
          <div className="absolute top-10 -left-10 w-40 h-40 bg-secondary-100/30 dark:bg-secondary-900/10 rounded-full blur-xl"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-r from-white to-primary-50/70 dark:from-gray-800/80 dark:to-primary-900/20 border border-white/40 dark:border-gray-700/30 shadow-xl"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Öğrenci Yönetimi</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Tüm öğrencilerin bilgilerini buradan yönetebilirsiniz.</p>
              </div>
        
              <div className="flex flex-wrap gap-3">
          <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
            <DialogTrigger asChild>
                    <Button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-sm hover:shadow-md rounded-full text-sm font-medium flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Yeni Öğrenci
                    </Button>
            </DialogTrigger>
                  <DialogContent className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-100/60 dark:border-gray-700/30 shadow-xl">
              <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">Yeni Öğrenci Ekle</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Ad Soyad</Label>
                  <Input 
                    id="name" 
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                          className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="grid gap-2">
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">E-posta</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                          className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="grid gap-2">
                        <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Telefon</Label>
                  <Input 
                    id="phone" 
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                          className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleAddStudent} 
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      Ekleniyor...
                    </div>
                  ) : 'Ekle'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogTrigger asChild>
                    <Button variant="outline" className="px-4 py-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm hover:shadow-md rounded-full text-sm font-medium flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Danışman Ata
                    </Button>
            </DialogTrigger>
                  <DialogContent className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-100/60 dark:border-gray-700/30 shadow-xl">
              <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">Danışman Ata</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                        <Label htmlFor="student" className="text-gray-700 dark:text-gray-300">Öğrenci</Label>
                  <Select value={selectedStudent || ""} onValueChange={setSelectedStudent}>
                          <SelectTrigger className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg">
                      <SelectValue placeholder="Öğrenci seçin" />
                    </SelectTrigger>
                          <SelectContent className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-100/60 dark:border-gray-700/30 rounded-lg">
                      {students.map(student => (
                              <SelectItem key={student.id} value={student.id.toString()} className="text-gray-800 dark:text-gray-100">
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                        <Label htmlFor="advisor" className="text-gray-700 dark:text-gray-300">Danışman</Label>
                  <Select value={selectedAdvisor} onValueChange={setSelectedAdvisor}>
                          <SelectTrigger className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg">
                      <SelectValue placeholder="Danışman seçin" />
                    </SelectTrigger>
                          <SelectContent className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-100/60 dark:border-gray-700/30 rounded-lg">
                      {advisors.map(advisor => (
                              <SelectItem key={advisor.id} value={advisor.id.toString()} className="text-gray-800 dark:text-gray-100">
                          {advisor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleAssignAdvisor} 
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      Atanıyor...
                    </div>
                  ) : 'Ata'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
            placeholder="Öğrenci ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block w-full sm:w-64 text-gray-800 dark:text-gray-200"
          />
      </div>
      
        {/* Tablo */}
        <motion.div
          variants={fadeIn}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/30 overflow-hidden"
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16">
                  <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-primary-200 dark:border-primary-800/40 opacity-40"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-t-primary-600 dark:border-t-primary-400 animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 dark:bg-gray-700/50">
                  <TableHead className="text-gray-500 dark:text-gray-400 font-medium">Ad Soyad</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400 font-medium">E-posta</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400 font-medium">Telefon</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400 font-medium">Danışman</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400 font-medium">Durum</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400 font-medium text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400 py-10">
                      <div className="flex flex-col items-center">
                        <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-full mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-lg mb-2">Öğrenci bulunamadı</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {searchTerm ? 'Arama kriterlerine uygun sonuç bulunamadı' : 'Henüz öğrenci kaydı bulunmuyor'}
                        </p>
                        {searchTerm && (
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="mt-4 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-800/30 transition-colors"
                          >
                            Aramayı Temizle
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow 
                      key={student.id} 
                      className="group hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center">
                          <div className="relative group-hover:scale-105 transition-transform">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full blur-[1px]"></div>
                            <div className="relative h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900 dark:to-accent-900 border-2 border-white dark:border-gray-800 font-medium text-gray-800 dark:text-gray-200">
                              {student.name?.charAt(0) || '?'}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{student.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">
                        <a href={`mailto:${student.email}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                          {student.email}
                        </a>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">
                        {student.phone ? (
                          <a href={`tel:${student.phone.replace(/[^0-9]/g, '')}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            {student.phone}
                          </a>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 italic">Belirtilmemiş</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.advisor === "Atanmadı" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 dark:bg-warning-900/40 text-warning-800 dark:text-warning-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-1.5 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Atanmadı
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/40 text-success-800 dark:text-success-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-1.5 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            {student.advisor}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(student.status || 'Beklemede')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="sm" className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 border-primary-200 dark:border-primary-800/30 hover:border-primary-300 dark:hover:border-primary-700/50 bg-primary-50/50 dark:bg-primary-900/20 hover:bg-primary-100/50 dark:hover:bg-primary-800/30">
                            Düzenle
                          </Button>
                          {student.advisor === "Atanmadı" && (
                            <Button 
                              size="sm" 
                              className="text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-sm"
                              onClick={() => {
                                setSelectedStudent(student.id);
                                setIsAssignOpen(true);
                              }}
                            >
                              Danışman Ata
                            </Button>
                          )}
                        </div>
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