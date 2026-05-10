import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Paperclip, Image as ImageIcon, Search, 
  MoreVertical, Phone, Video, Info, ArrowLeft,
  Smile, User
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import useAuthStore from '../store/authStore';
import useSocketStore from '../store/socketStore';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { socket, onlineUsers } = useSocketStore();
  
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [convLoading, setConvLoading] = useState(true);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get('/messages/conversations');
        setConversations(data.conversations);
      } catch (err) {
        console.error(err);
      } finally {
        setConvLoading(false);
      }
    };
    fetchConversations();
  }, [messages]);

  useEffect(() => {
    if (userId) {
      const fetchMessages = async () => {
        setLoading(true);
        try {
          const { data } = await api.get(`/messages/${userId}`);
          setMessages(data.messages);
          // Fetch user details for the header
          const userRes = await api.get(`/users/${userId}`);
          setSelectedUser(userRes.data.user);
        } catch (err) {
          toast.error('Failed to load chat');
        } finally {
          setLoading(false);
        }
      };
      fetchMessages();
    } else {
      setSelectedUser(null);
      setMessages([]);
    }
  }, [userId]);

  useEffect(() => {
    if (!socket) return;
    
    const handleReceiveMessage = (message) => {
      const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
      if (senderId === userId || message.receiver === userId) {
        setMessages(prev => [...prev, message]);
      }
      // Trigger conversation refresh
      setConversations(prev => [...prev]);
    };

    socket.on('message:receive', handleReceiveMessage);
    return () => socket.off('message:receive', handleReceiveMessage);
  }, [socket, userId]);

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;

    const messageData = { content: input, type: 'text' };
    setInput('');

    try {
      const { data } = await api.post(`/messages/${userId}`, messageData);
      setMessages(prev => [...prev, data.message]);
      
      if (socket) {
        socket.emit('message:send', {
          ...data.message,
          receiverId: userId
        });
      }
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const isOnline = (uid) => onlineUsers.includes(uid);

  return (
    <DashboardLayout title="Messages">
      <div className="h-[calc(100vh-140px)] flex gap-6 overflow-hidden">
        {/* Conversations List */}
        <div className={`w-full lg:w-80 flex flex-col glass-card overflow-hidden ${userId ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input 
                placeholder="Search chats..." 
                className="input-field pl-10 py-2 text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {convLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 flex gap-3">
                  <div className="skeleton w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-3/4" />
                    <div className="skeleton h-2 w-1/2" />
                  </div>
                </div>
              ))
            ) : conversations.length > 0 ? (
              conversations.map((conv) => (
                <button
                  key={conv.user._id}
                  onClick={() => navigate(`/chat/${conv.user._id}`)}
                  className={`w-full p-4 flex gap-3 transition-colors hover:bg-white/5 relative ${userId === conv.user._id ? 'bg-white/10' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                      {conv.user.avatar ? <img src={conv.user.avatar} className="w-full h-full rounded-2xl object-cover" /> : conv.user.name.charAt(0)}
                    </div>
                    {isOnline(conv.user._id) && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0a0a1f]" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-sm truncate">{conv.user.name}</p>
                      <p className="text-[10px] text-white/30">
                        {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-white font-medium' : 'text-white/40'}`}>
                      {conv.lastMessage.content}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="absolute right-4 bottom-4 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold">
                      {conv.unreadCount}
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="p-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                  <MessageCircle className="text-white/20" size={32} />
                </div>
                <p className="text-sm text-white/30">No conversations yet.</p>
                <Link to="/alumni" className="text-xs text-purple-400 hover:underline">Find someone to talk to</Link>
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex flex-col glass-card overflow-hidden ${!userId ? 'hidden lg:flex' : 'flex'}`}>
          {userId && selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate('/chat')} className="lg:hidden text-white/40 hover:text-white mr-2">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-sm">
                      {selectedUser.avatar ? <img src={selectedUser.avatar} className="w-full h-full rounded-xl object-cover" /> : selectedUser.name.charAt(0)}
                    </div>
                    {isOnline(userId) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0a0a1f]" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-tight">{selectedUser.name}</h4>
                    <p className="text-[10px] text-white/40 flex items-center gap-1">
                      {isOnline(userId) ? (
                        <> <span className="w-1 h-1 rounded-full bg-green-500" /> Active Now </>
                      ) : (
                        `Last seen ${new Date(selectedUser.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 transition-colors"><Phone size={18} /></button>
                  <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 transition-colors"><Video size={18} /></button>
                  <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 transition-colors"><Info size={18} /></button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {loading ? (
                  <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>
                ) : (
                  messages.map((msg, idx) => {
                    const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                    const isMe = senderId === currentUser?._id;
                    const showAvatar = idx === 0 || messages[idx-1].sender._id !== msg.sender._id;
                    
                    return (
                      <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                        {!isMe && (
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex-shrink-0 overflow-hidden">
                            {showAvatar ? (
                              selectedUser.avatar ? <img src={selectedUser.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">{selectedUser.name.charAt(0)}</div>
                            ) : null}
                          </div>
                        )}
                        <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                            isMe 
                              ? 'bg-purple-600 text-white rounded-br-none shadow-lg shadow-purple-900/20' 
                              : 'bg-white/5 border border-white/5 text-white/90 rounded-bl-none'
                          }`}>
                            {msg.content}
                          </div>
                          <span className="text-[9px] text-white/30 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-white/5 flex items-center gap-3">
                <button type="button" className="p-2 rounded-lg hover:bg-white/5 text-white/40"><Paperclip size={20} /></button>
                <div className="flex-1 relative">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..." 
                    className="input-field pr-10 py-3"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    <Smile size={20} />
                  </button>
                </div>
                <button 
                  type="submit" 
                  disabled={!input.trim()}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/40 disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                <MessageCircle className="text-white/10" size={48} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk' }}>Select a Chat</h3>
              <p className="text-white/30 max-w-xs">Pick a conversation from the sidebar to start interacting with the community.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
