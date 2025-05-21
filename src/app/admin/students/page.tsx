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

  // Örnek veriler
  const [students, setStudents] = useState([
    { id: 1, name: "Ahmet Yılmaz", email: "ahmet@example.com", phone: "532-111-2233", advisor: "Müge Hanım", status: "Aktif" },
    { id: 2, name: "Ayşe Demir", email: "ayse@example.com", phone: "535-222-3344", advisor: "Atanmadı", status: "Beklemede" },
    { id: 3, name: "Mehmet Kaya", email: "mehmet@example.com", phone: "542-333-4455", advisor: "Murat Bey", status: "Aktif" },
    { id: 4, name: "Zeynep Şahin", email: "zeynep@example.com", phone: "545-444-5566", advisor: "Atanmadı", status: "Beklemede" },
    { id: 5, name: "Emre Yıldız", email: "emre@example.com", phone: "555-555-6677", advisor: "Müge Hanım", status: "Tamamlandı" },
  ]);

  const [advisors, setAdvisors] = useState([
    { id: 1, name: "Müge Hanım", email: "muge@campusglobal.com", phone: "533-111-0011", studentCount: 8 },
    { id: 2, name: "Murat Bey", email: "murat@campusglobal.com", phone: "544-222-0022", studentCount: 12 },
    { id: 3, name: "Canan Hanım", email: "canan@campusglobal.com", phone: "566-333-0033", studentCount: 5 },
  ]);

  // Form durum yönetimi
  const [newStudent, setNewStudent] = useState({ name: "", email: "", phone: "" });
  const [selectedAdvisor, setSelectedAdvisor] = useState("");

  useEffect(() => {
    // API'den veri çekme simülasyonu
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = () => {
    // API'ye yeni öğrenci ekleme isteği gönderilebilir
    const newId = students.length + 1;
    setStudents([...students, { id: newId, ...newStudent, advisor: "Atanmadı", status: "Beklemede" }]);
    setNewStudent({ name: "", email: "", phone: "" });
    setIsAddStudentOpen(false);
    toast({
      title: "Öğrenci oluşturuldu",
      description: "Yeni öğrenci başarıyla eklendi",
    });
  };

  const handleAssignAdvisor = () => {
    if (!selectedStudent || !selectedAdvisor) return;
    
    // Öğrenci ve danışman eşleştirme işlemi
    const updatedStudents = students.map(student => {
      if (student.id.toString() === selectedStudent) {
        const advisor = advisors.find(adv => adv.id.toString() === selectedAdvisor);
        return { ...student, advisor: advisor ? advisor.name : "Atanmadı" };
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
                  <DialogContent className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-gray-800 dark:text-gray-100">Yeni Öğrenci Ekle</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Ad Soyad</Label>
                        <Input 
                          id="name" 
                          value={newStudent.name}
                          onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">E-posta</Label>
                        <Input 
                          id="email" 
                          type="email"
                          value={newStudent.email}
                          onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Telefon</Label>
                        <Input 
                          id="phone" 
                          value={newStudent.phone}
                          onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddStudent} className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white">Ekle</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm hover:shadow-md rounded-full text-sm font-medium flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Danışman Ata
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-gray-800 dark:text-gray-100">Danışman Ata</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="student" className="text-gray-700 dark:text-gray-300">Öğrenci</Label>
                        <Select value={selectedStudent || ""} onValueChange={setSelectedStudent}>
                          <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100">
                            <SelectValue placeholder="Öğrenci seçin" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
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
                          <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100">
                            <SelectValue placeholder="Danışman seçin" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
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
                      <Button onClick={handleAssignAdvisor} className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white">Ata</Button>
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
          className="bg-white dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/30 overflow-hidden"
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
                <TableRow className="bg-gray-50 dark:bg-gray-700/30">
                  <TableHead className="text-gray-500 dark:text-gray-400">Ad Soyad</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">E-posta</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Telefon</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Danışman</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Durum</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400 text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400 py-10">
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>Öğrenci bulunamadı</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <TableCell>
                        <div className="flex items-center">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full blur-[1px]"></div>
                            <div className="relative h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900 dark:to-accent-900 border-2 border-white dark:border-gray-800 font-medium text-gray-800 dark:text-gray-200">
                              {student.name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">{student.email}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">{student.phone}</TableCell>
                      <TableCell>
                        {student.advisor === "Atanmadı" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 dark:bg-warning-900/40 text-warning-800 dark:text-warning-300">
                            Atanmadı
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/40 text-success-800 dark:text-success-300">
                            {student.advisor}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium">
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