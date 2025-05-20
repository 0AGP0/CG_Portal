"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/context/MessagesContext';

// Animasyon varyantları
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1
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

// Öğrenci tipi
interface Student {
  id: string;
  email: string;
  name: string;
  lastActive?: string;
}

export default function AdvisorMessagesPage() {
  const { user, isAdvisor } = useAuth();
  const { 
    tickets, 
    unreadCount, 
    selectedTicketId, 
    selectTicket, 
    sendMessage,
    createNewTicket: contextCreateNewTicket
  } = useMessages();
  
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Danışmanın öğrencilerini getir
  useEffect(() => {
    if (user && isAdvisor()) {
      fetchStudents();
    }
  }, [user]);
  
  // Öğrencileri getir
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/advisor/students', {
        headers: {
          'x-user-email': user?.email || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.students)) {
          const mappedStudents = data.students.map((student: any) => ({
            id: student.email,
            email: student.email,
            name: student.name || student.email.split('@')[0],
            lastActive: student.updatedAt
          }));
          
          setStudents(mappedStudents);
        }
      } else {
        console.error('Öğrenci verilerini getirme hatası:', response.status);
      }
    } catch (error) {
      console.error('Öğrenci verilerini getirme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Bir öğrencinin seçilmesiyle ilgili mesajları filtreleyelim
  const studentTickets = selectedStudentId 
    ? tickets.filter(ticket => ticket.studentEmail === selectedStudentId || ticket.studentId === selectedStudentId)
    : [];

  // Seçilen mesaj
  const selectedTicket = tickets.find(ticket => ticket.id === selectedTicketId);
  
  // Seçili öğrenci
  const selectedStudent = students.find(student => student.id === selectedStudentId);

  // Öğrenci arama
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Öğrenci seçimi
  const selectStudent = (id: string) => {
    setSelectedStudentId(id);
    selectTicket(0); // Öğrenci değiştiğinde mesaj seçimini sıfırla (0 geçersiz bir ID olduğundan seçim sıfırlanır)
  };

  // Yeni mesaj oluşturma
  const handleCreateNewTicket = () => {
    if (!selectedStudentId || !selectedStudent) return;
    
    // Context'teki createNewTicket fonksiyonunu kullanacağız,
    // ancak danışman için uyarlamak gerekiyor
    const subject = "Yeni Konu";
    const content = `Merhaba ${selectedStudent.name}`;
    
    // Not: Bu kısımda API çağrısı doğrudan yapılması gerekebilir
    const createAdvisorNewTicket = async () => {
      try {
        const response = await fetch('/api/messages/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': user?.email || ''
          },
          body: JSON.stringify({
            receiverEmail: selectedStudentId,
            content,
            senderRole: 'advisor',
            subject,
            category: 'general'
          })
        });
        
        if (response.ok) {
          // Yeni mesaj başarıyla oluşturuldu, sayfayı yenile
          window.location.reload();
        }
      } catch (error) {
        console.error('Yeni mesaj oluşturma hatası:', error);
      }
    };
    
    createAdvisorNewTicket();
  };

  // Mesaj gönderme
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedTicketId) return;
    
    // Context'teki sendMessage fonksiyonunu çağır
    sendMessage(newMessage);
    setNewMessage('');
  };

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#002757]">
            Mesajlaşma Paneli
          </h1>
          <p className="text-default mt-1">
            Öğrencilerinizle olan tüm mesajlaşmalarınızı buradan takip edebilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Öğrenci Listesi */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-3 bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-4 border-b">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Öğrenci ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="font-semibold text-[#002757]">Öğrencilerim</h2>
            </div>
            
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="p-6 text-center text-gray-500">
                  <p>Öğrenciler yükleniyor...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>Sonuç bulunamadı</p>
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <motion.div
                    key={student.id}
                    variants={itemVariants}
                    onClick={() => selectStudent(student.id)}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedStudentId === student.id 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
          
          {/* Mesaj Konuları */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-3 bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-[#002757]">Konular</h2>
              
              {selectedStudentId && (
                <button 
                  onClick={handleCreateNewTicket}
                  className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  title="Yeni Konu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {!selectedStudentId ? (
                <div className="p-4 text-center text-gray-500">
                  <p>Lütfen bir öğrenci seçin</p>
                </div>
              ) : studentTickets.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p className="mb-2">Mesaj bulunamadı</p>
                  <button 
                    onClick={handleCreateNewTicket}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Yeni Mesaj Oluştur
                  </button>
                </div>
              ) : (
                studentTickets.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    variants={itemVariants}
                    onClick={() => selectTicket(ticket.id)}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedTicketId === ticket.id 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : ticket.isRead ? 'hover:bg-gray-50' : 'hover:bg-gray-50 bg-yellow-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-medium ${!ticket.isRead ? 'font-bold' : ''}`}>
                        {ticket.subject}
                      </h3>
                      {!ticket.isRead && (
                        <span className="bg-blue-500 rounded-full w-2 h-2"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{ticket.preview}</p>
                    <p className="text-xs text-gray-500 mt-1">{ticket.date}</p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
          
          {/* Mesaj İçeriği */}
          <motion.div 
            className="md:col-span-6 bg-white rounded-lg shadow-md flex flex-col h-[600px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {!selectedStudentId ? (
              <div className="flex items-center justify-center h-full text-center p-6">
                <div>
                  <div className="text-5xl mb-4">👤</div>
                  <h3 className="text-xl font-semibold mb-2 text-[#002757]">Öğrenci Seçin</h3>
                  <p className="text-gray-600 max-w-md">
                    Mesajlaşmak için soldaki listeden bir öğrenci seçin.
                  </p>
                </div>
              </div>
            ) : !selectedTicketId ? (
              <div className="flex items-center justify-center h-full text-center p-6">
                <div>
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold mb-2 text-[#002757]">Mesaj Seçin</h3>
                  <p className="text-gray-600 max-w-md">
                    {selectedStudent?.name} ile olan mesajlarınızı görüntülemek için bir konu seçin veya yeni bir konu başlatın.
                  </p>
                  {studentTickets.length === 0 && (
                    <button 
                      onClick={handleCreateNewTicket}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      Yeni Mesaj Oluştur
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-lg text-[#002757]">
                    {selectedTicket?.subject} 
                    <span className="text-gray-500 text-sm ml-2">
                      ({selectedStudent?.name})
                    </span>
                  </h2>
                  <p className="text-sm text-gray-500">{selectedTicket?.date}</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '450px' }}>
                  {selectedTicket?.messages && selectedTicket.messages.length > 0 ? (
                    selectedTicket.messages.map((message, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg max-w-[80%] ${
                          message.sender === 'advisor' 
                            ? 'bg-blue-100 ml-auto' 
                            : 'bg-gray-100'
                        }`}
                      >
                        <p className="text-sm mb-1">{message.content}</p>
                        <p className="text-xs text-gray-500 text-right">{message.timestamp}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 my-8">
                      <p>Bu konuda henüz mesaj bulunmuyor. Bir mesaj göndererek konuşmayı başlatın.</p>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Mesajınızı yazın..."
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Gönder
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
} 