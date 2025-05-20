"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Mesaj türleri
export interface Message {
  sender: 'user' | 'advisor' | 'sales';
  content: string;
  timestamp: string;
}

export interface Ticket {
  id: number;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  messages: Message[];
  studentId?: string; // Öğrenciye ait bilet ise (satış ekibi ve danışman görünümü için)
  studentEmail?: string; // Öğrencinin e-posta adresi (satış ekibi ve danışman görünümü için)
  studentName?: string; // Öğrencinin adı (satış ekibi ve danışman görünümü için)
}

interface MessagesContextType {
  tickets: Ticket[];
  unreadCount: number;
  selectedTicketId: number | null;
  selectTicket: (id: number) => void;
  sendMessage: (content: string) => void;
  createNewTicket: (subject: string, content: string, receiverType: 'advisor' | 'sales') => void;
  markAsRead: (id: number) => void;
}

// Başlangıç değerleri
const defaultContext: MessagesContextType = {
  tickets: [],
  unreadCount: 0,
  selectedTicketId: null,
  selectTicket: () => {},
  sendMessage: () => {},
  createNewTicket: () => {},
  markAsRead: () => {}
};

// Context'i oluştur
const MessagesContext = createContext<MessagesContextType>(defaultContext);

// Custom hook
export const useMessages = () => useContext(MessagesContext);

interface MessagesProviderProps {
  children: ReactNode;
}

// Örnek mesaj verileri - daha sonra API'den gelecek
const sampleMessages: Ticket[] = [
  {
    id: 1,
    subject: "Vize Başvurusu Hakkında",
    preview: "Merhaba, vize başvurunuz için gerekli belgeler...",
    date: "12 Haziran 2024",
    isRead: true,
    messages: [
      {
        sender: "advisor" as 'advisor',
        content: "Merhaba, vize başvurunuz için gerekli belgeler listesini ekteki dosyada bulabilirsiniz. Herhangi bir sorunuz olursa lütfen yanıtlamaktan çekinmeyin.",
        timestamp: "12 Haziran 2024, 10:23"
      },
      {
        sender: "user" as 'user',
        content: "Teşekkürler, belgelerimi en kısa sürede hazırlayacağım. Pasaport yenileme işlemi için randevu aldım, bu süreci etkileyecek mi?",
        timestamp: "12 Haziran 2024, 11:45"
      },
      {
        sender: "advisor" as 'advisor',
        content: "Pasaport yenileme süreciniz tamamlanana kadar diğer belgeleri hazırlayabilirsiniz. Yeni pasaportunuz hazır olduğunda hemen sisteme yüklemeniz yeterli olacaktır.",
        timestamp: "12 Haziran 2024, 14:30"
      }
    ]
  },
  {
    id: 2,
    subject: "Dil Kursu Seçenekleri",
    preview: "İstediğiniz dil kursu seçenekleri aşağıda...",
    date: "5 Haziran 2024",
    isRead: false,
    messages: [
      {
        sender: "advisor" as 'advisor',
        content: "İstediğiniz dil kursu seçenekleri aşağıda listelenmiştir. Size en uygun olanı seçip bana bildirmenizi rica ederim.",
        timestamp: "5 Haziran 2024, 09:15"
      }
    ]
  },
  {
    id: 3,
    subject: "Konaklama Bilgileri",
    preview: "Konaklama için önerdiğimiz yurtlar...",
    date: "1 Haziran 2024",
    isRead: true,
    messages: [
      {
        sender: "advisor" as 'advisor',
        content: "Konaklama için önerdiğimiz yurtlar ve öğrenci rezidansları hakkında detaylı bilgileri aşağıda bulabilirsiniz.",
        timestamp: "1 Haziran 2024, 16:45"
      },
      {
        sender: "user" as 'user',
        content: "Öneriler için teşekkürler. Üniversiteye yakın olan seçenekler hakkında daha fazla bilgi alabilir miyim?",
        timestamp: "2 Haziran 2024, 10:20"
      },
      {
        sender: "advisor" as 'advisor',
        content: "Tabii ki, üniversiteye yakın olan yurtlar hakkında daha detaylı bilgileri ve fiyatları içeren bir dosyayı size gönderdim.",
        timestamp: "2 Haziran 2024, 14:15"
      }
    ]
  }
];

// Satış ekibi için örnek mesajlar
const sampleSalesMessages: Ticket[] = [
  {
    id: 101,
    subject: "Ödeme Planı Hakkında",
    preview: "Ödeme planınızı görmek için tıklayın...",
    date: "15 Haziran 2024",
    isRead: false,
    studentId: "akifgiraypusat@gmail.com",
    studentEmail: "akifgiraypusat@gmail.com",
    studentName: "Akif Giray Pusat",
    messages: [
      {
        sender: "sales" as 'sales',
        content: "Merhaba, ödeme planınızı aşağıda görebilirsiniz. Herhangi bir sorunuz olursa lütfen yanıtlayın.",
        timestamp: "15 Haziran 2024, 13:45"
      }
    ]
  },
  {
    id: 102,
    subject: "İndirim Fırsatı",
    preview: "Size özel indirim fırsatımız hakkında...",
    date: "10 Haziran 2024",
    isRead: true,
    studentId: "burcu.shut@gmail.com",
    studentEmail: "burcu.shut@gmail.com",
    studentName: "Burcu Shut",
    messages: [
      {
        sender: "sales" as 'sales',
        content: "Merhaba, erken kayıt döneminde olduğunuz için % 15 indirim fırsatı sunuyoruz. Bu fırsattan yararlanmak ister misiniz?",
        timestamp: "10 Haziran 2024, 11:30"
      },
      {
        sender: "user" as 'user',
        content: "Bu teklif için teşekkür ederim. Detayları öğrenebilir miyim?",
        timestamp: "10 Haziran 2024, 14:22"
      }
    ]
  }
];

export const MessagesProvider = ({ children }: MessagesProviderProps) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Kullanıcı değiştiğinde mesajları yükle
  useEffect(() => {
    const fetchMessages = async () => {
      if (user) {
        try {
          // API'den mesajları getir
          const response = await fetch('/api/messages', {
            headers: {
              'x-user-email': user.email
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.success && Array.isArray(data.messages)) {
              // API'den gelen mesajları Ticket formatına dönüştür
              const convertedTickets: Ticket[] = [];
              
              // Mesajları konulara göre grupla
              const messageGroups = data.messages.reduce((groups: any, message: any) => {
                const subject = message.subject || 'Genel Konu';
                if (!groups[subject]) {
                  groups[subject] = [];
                }
                groups[subject].push(message);
                return groups;
              }, {});
              
              // Her konu için bir Ticket oluştur
              Object.entries(messageGroups).forEach(([subject, messages], index) => {
                const messagesArray = messages as any[];
                const sortedMessages = messagesArray.sort(
                  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
                
                const firstMessage = sortedMessages[0];
                const ticketId = parseInt(firstMessage.id.replace('msg-', '')) || index + 1;
                
                // Mesajları Message formata dönüştür
                const formattedMessages: Message[] = sortedMessages.map(msg => ({
                  sender: msg.senderRole === 'student' ? 'user' : msg.senderRole || 'advisor',
                  content: msg.content,
                  timestamp: new Date(msg.createdAt).toLocaleString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                }));
                
                // Ticket oluştur
                convertedTickets.push({
                  id: ticketId,
                  subject: subject,
                  preview: sortedMessages[sortedMessages.length - 1].content.substring(0, 50) + '...',
                  date: new Date(sortedMessages[sortedMessages.length - 1].createdAt).toLocaleDateString('tr-TR'),
                  isRead: sortedMessages.every(msg => msg.isRead),
                  messages: formattedMessages,
                  studentId: (user.role === 'advisor' || user.role === 'sales') ? firstMessage.senderEmail : undefined,
                  studentEmail: (user.role === 'advisor' || user.role === 'sales') ? firstMessage.senderEmail : undefined,
                  studentName: (user.role === 'advisor' || user.role === 'sales') ? firstMessage.senderName || firstMessage.senderEmail : undefined
                });
              });
              
              // Tarihe göre sırala (en yeni en üstte)
              convertedTickets.sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
              );
              
              setTickets(convertedTickets);
            } else {
              console.error('Mesaj verileri alınamadı:', data);
              // Demo verileri göster
              setTickets(user.role === 'student' ? sampleMessages : 
                        user.role === 'sales' ? sampleSalesMessages : []);
            }
          } else {
            console.error('Mesaj API hatası:', response.status);
            // Demo verileri göster
            setTickets(user.role === 'student' ? sampleMessages : 
                      user.role === 'sales' ? sampleSalesMessages : []);
          }
        } catch (error) {
          console.error('Mesajları getirme hatası:', error);
          // Demo verileri göster
          setTickets(user.role === 'student' ? sampleMessages : 
                    user.role === 'sales' ? sampleSalesMessages : []);
        }
      } else {
        setTickets([]);
      }
    };
    
    fetchMessages();
  }, [user]);

  // Okunmamış mesaj sayısını hesapla
  useEffect(() => {
    const count = tickets.filter(ticket => !ticket.isRead).length;
    setUnreadCount(count);
  }, [tickets]);

  // Mesaj seçme
  const selectTicket = (id: number) => {
    setSelectedTicketId(id);
    
    // Mesajı okundu olarak işaretle
    markAsRead(id);
  };

  // Okundu olarak işaretle
  const markAsRead = (id: number) => {
    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket.id === id ? { ...ticket, isRead: true } : ticket
      )
    );
  };

  // Seçili mesajı getir
  const selectedTicket = tickets.find(ticket => ticket.id === selectedTicketId);

  // Yeni mesaj gönderme
  const sendMessage = async (content: string) => {
    if (!content.trim() || !selectedTicketId) return;
    
    const ticket = tickets.find(t => t.id === selectedTicketId);
    if (!ticket) return;
    
    // Mesajı UI'da göster
    const newTickets = tickets.map(ticket => {
      if (ticket.id === selectedTicketId) {
        const newMessage: Message = {
          sender: user?.role === 'student' ? 'user' : (user?.role as 'advisor' | 'sales'),
          content,
          timestamp: new Date().toLocaleString('tr-TR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        };
        
        return {
          ...ticket,
          messages: [...ticket.messages, newMessage]
        };
      }
      return ticket;
    });
    
    setTickets(newTickets);
    
    // Gerçek API çağrısı
    try {
      // Alıcı e-posta adresini belirle
      let receiverEmail = '';
      
      if (user?.role === 'student') {
        // Mesaj konuşmasının ilk mesajına bak ve mesajın türüne göre alıcıyı belirle
        const firstSender = ticket.messages.length > 0 ? ticket.messages[0].sender : 'advisor';
        
        // Öğrenci profil bilgilerini getir (satış ekibi üyesi bilgisi için)
        const profileResponse = await fetch('/api/student/profile', {
          headers: {
            'x-user-email': user.email
          }
        });
        
        let salesPersonEmail = '';
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.student && profileData.student.salesPersonEmail) {
            salesPersonEmail = profileData.student.salesPersonEmail;
          }
        }
        
        // İlk mesaj satış ekibinden gelmişse veya satış temsilcisi varsa
        if (firstSender === 'sales' || ticket.subject.toLowerCase().includes('satış')) {
          if (salesPersonEmail) {
            receiverEmail = salesPersonEmail;
          } else {
            // Satış ekibi üyesi bulunamadıysa varsayılan
            receiverEmail = 'ahmet.satis@example.com';
          }
        } else {
          // Danışmana mesaj gönder
          receiverEmail = 'emre.danisman@example.com';
        }
      } else if (user?.role === 'advisor') {
        // Danışman ise, öğrenciye mesaj gönder
        receiverEmail = ticket.studentEmail || ticket.studentId || '';
        
        if (!receiverEmail) {
          console.error('Öğrenci e-posta adresi bulunamadı');
          return;
        }
      } else if (user?.role === 'sales') {
        // Satış ekibi ise, öğrenciye mesaj gönder
        receiverEmail = ticket.studentEmail || ticket.studentId || '';
        
        if (!receiverEmail) {
          console.error('Öğrenci e-posta adresi bulunamadı');
          return;
        }
      }
      
      // API isteği 
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          receiverEmail,
          content,
          senderRole: user?.role === 'student' ? 'student' : user?.role === 'sales' ? 'sales' : 'advisor',
          subject: ticket.subject,
          replyToId: ticket.id.toString(),
          category: 'general'
        })
      });
      
      if (!response.ok) {
        console.error('Mesaj gönderme hatası:', await response.json());
      }
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
    }
  };

  // Yeni konu oluşturma
  const createNewTicket = async (subject: string, content: string, receiverType: 'advisor' | 'sales') => {
    if (!user) return;
    
    try {
      if (user.role === 'student') {
        // Öğrenci profil bilgilerini getir (satış ekibi üyesi bilgisi için)
        const profileResponse = await fetch('/api/student/profile', {
          headers: {
            'x-user-email': user.email
          }
        });
        
        let salesPersonEmail = '';
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.student && profileData.student.salesPersonEmail) {
            salesPersonEmail = profileData.student.salesPersonEmail;
          }
        }
        
        // Seçilen alıcıya göre danışman veya satış ekibine mesaj gönder
        let receiverEmail = '';
        
        if (receiverType === 'advisor') {
          receiverEmail = 'emre.danisman@example.com'; // Danışman e-postası
        } else if (receiverType === 'sales') {
          if (salesPersonEmail) {
            receiverEmail = salesPersonEmail;
          } else {
            // Satış ekibi üyesi bulunamadıysa varsayılan
            receiverEmail = 'ahmet.satis@example.com';
            console.warn('Öğrenciye atanmış satış ekibi üyesi bulunamadı, varsayılan satış ekibi üyesi kullanılıyor');
          }
        }
        
        // Alıcıya mesaj gönder
        const response = await fetch('/api/messages/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': user.email
          },
          body: JSON.stringify({
            receiverEmail,
            content,
            senderRole: 'student',
            subject,
            category: 'general'
          })
        });
        
        if (response.ok) {
          const newMessageData = await response.json();
          
          if (newMessageData.success) {
            // Yeni ticket oluştur ve listeye ekle
            const newTicket: Ticket = {
              id: parseInt(newMessageData.data.id.replace('msg-', '')) || Date.now(),
              subject,
              preview: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
              date: new Date().toLocaleDateString('tr-TR'),
              isRead: true,
              messages: [
                {
                  sender: 'user',
                  content,
                  timestamp: new Date().toLocaleString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                }
              ],
              studentId: user.role === 'student' ? user.email : undefined,
              studentEmail: user.role === 'student' ? user.email : undefined,
              studentName: user.role === 'student' ? user.name : undefined
            };
            
            setTickets(prevTickets => [newTicket, ...prevTickets]);
            setSelectedTicketId(newTicket.id);
            
            return;
          }
        } else {
          console.error('Yeni konu gönderme hatası:', await response.json());
        }
      } else if (user.role === 'advisor' || user.role === 'sales') {
        // Danışman veya satış ekibi, öğrenciye mesaj gönderebilir
        // Bu kısım gerekirse daha sonra eklenebilir
        return;
      }
      
      console.error('Yeni konu oluşturulamadı');
    } catch (error) {
      console.error('Yeni konu oluşturma hatası:', error);
    }
    
    // API başarısız olursa, yine de UI'da göster
    const newTicket: Ticket = {
      id: Date.now(),
      subject,
      preview: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      date: new Date().toLocaleDateString('tr-TR'),
      isRead: true,
      messages: [
        {
          sender: user.role === 'student' ? 'user' : 'advisor',
          content,
          timestamp: new Date().toLocaleString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      ],
      studentId: user.role === 'student' ? user.email : undefined,
      studentEmail: user.role === 'student' ? user.email : undefined,
      studentName: user.role === 'student' ? user.name : undefined
    };
    
    setTickets(prevTickets => [newTicket, ...prevTickets]);
    setSelectedTicketId(newTicket.id);
  };

  return (
    <MessagesContext.Provider value={{
      tickets,
      unreadCount,
      selectedTicketId,
      selectTicket,
      sendMessage,
      createNewTicket,
      markAsRead
    }}>
      {children}
    </MessagesContext.Provider>
  );
};

export default MessagesContext; 