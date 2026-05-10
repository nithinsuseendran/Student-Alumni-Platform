import { create } from 'zustand';
import { io } from 'socket.io-client';

const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],
  
  initSocket: (userId) => {
    // Connect to the same host (Vite proxy will handle it in dev)
    const socket = io('/', { transports: ['websocket'] });
    socket.emit('user:online', userId);
    socket.on('users:online', (users) => set({ onlineUsers: users }));
    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) { socket.disconnect(); set({ socket: null, onlineUsers: [] }); }
  },

  isUserOnline: (userId) => get().onlineUsers.includes(userId),
}));

export default useSocketStore;
