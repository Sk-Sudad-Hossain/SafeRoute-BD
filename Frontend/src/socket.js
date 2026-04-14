import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace("/api", "")
  : "http://localhost:1715";

const socket = io(SOCKET_URL, {
  autoConnect: true,
});

export default socket;