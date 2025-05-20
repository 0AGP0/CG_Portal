"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/context/MessagesContext';
import Link from 'next/link';

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

export default function SalesMessagesPage() {
  const { user } = useAuth();
  const { 
    tickets, 
    unreadCount, 
    selectedTicketId, 
    selectTicket, 
    sendMessage
  } = useMessages();
  const [newMessage, setNewMessage] = useState('');

  // Seçili mesajı getir
  const selectedTicket = tickets.find(ticket => ticket.id === selectedTicketId);

  // Yeni mesaj gönderme
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedTicketId) return;
    
    sendMessage(newMessage);
    setNewMessage('');
  };

  // Erişim kontrolü
  if (!user || user.role !== 'sales') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erişim Reddedildi</h1>
            <p className="mb-4">Bu sayfaya erişmek için yetkiniz bulunmamaktadır.</p>
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
              Öğrenci Mesajları
            </h1>
            <p className="text-default mt-1">
              Öğrencilerle olan tüm mesajlaşmalarınızı buradan takip edebilirsiniz.
            </p>
          </div>
          
          <div className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
            <span className="mr-2">Okunmamış</span>
            <span className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              {unreadCount}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Mesaj Listesi */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-1 bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-[#002757]">Öğrenci Mesajları</h2>
            </div>
            
            <div className="divide-y">
              {tickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  variants={itemVariants}
                  onClick={() => selectTicket(ticket.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedTicketId === ticket.id 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : ticket.isRead ? 'hover:bg-gray-50' : 'hover:bg-gray-50 bg-yellow-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-medium ${!ticket.isRead ? 'font-bold' : ''}`}>
                      {ticket.studentName}
                    </h3>
                    {!ticket.isRead && (
                      <span className="bg-blue-500 rounded-full w-2 h-2"></span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700">{ticket.subject}</p>
                  <p className="text-sm text-gray-600 truncate">{ticket.preview}</p>
                  <p className="text-xs text-gray-500 mt-1">{ticket.date}</p>
                </motion.div>
              ))}
              
              {tickets.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  <p>Henüz öğrenci mesajı bulunmuyor.</p>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Mesaj İçeriği */}
          <motion.div 
            className="md:col-span-3 bg-white rounded-lg shadow-md flex flex-col h-[600px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {selectedTicket ? (
              <>
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-semibold text-lg text-[#002757]">
                        {selectedTicket.studentName}
                      </h2>
                      <p className="text-sm text-gray-500">{selectedTicket.subject}</p>
                    </div>
                    <div className="text-sm text-gray-500">{selectedTicket.date}</div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '450px' }}>
                  {selectedTicket.messages.length > 0 ? (
                    selectedTicket.messages.map((message, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg max-w-[80%] ${
                          message.sender === 'sales' 
                            ? 'bg-blue-100 ml-auto' 
                            : message.sender === 'advisor'
                              ? 'bg-gray-100'
                              : 'bg-orange-100'
                        }`}
                      >
                        <p className="text-sm mb-1">{message.content}</p>
                        <p className="text-xs text-gray-500">
                          {message.sender === 'sales' ? 'Siz' : 
                           message.sender === 'advisor' ? 'Danışman' : 'Öğrenci'} - {message.timestamp}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 my-8">
                      <p>Yeni bir mesaj göndererek konuşmayı başlatın.</p>
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
            ) : (
              <div className="flex items-center justify-center h-full text-center p-6">
                <div>
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold mb-2 text-[#002757]">Öğrenci Mesajları</h3>
                  <p className="text-gray-600 max-w-md">
                    Soldaki listeden bir öğrenci mesajını seçin ve yanıtlayın.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
} 