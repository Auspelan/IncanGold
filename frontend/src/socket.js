import { io } from 'socket.io-client';

let socket = null;

export function initSocket(url = import.meta.env.VITE_SOCKET_URL || undefined) {
  if (socket) return socket;
  socket = io(url, {
    autoConnect: true,
    path: '/socket.io'
  });

  socket.on('connect', () => {
    console.info('[socket] connected', socket.id);
  });
  socket.on('disconnect', (reason) => {
    console.info('[socket] disconnected', reason);
  });
  socket.on('connect_error', (err) => {
    console.error('[socket] connect_error', err.message);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function safeEmit(event, ...args) {
  if (!socket) return;
  socket.emit(event, ...args);
}

export function on(event, handler) {
  if (!socket) return;
  socket.on(event, handler);
}

export function off(event, handler) {
  if (!socket) return;
  socket.off(event, handler);
}
