import { io, Socket } from "socket.io-client";
import { store } from "../Store";
import { addMessage, setUsers } from "../Store/chatSlice";
import { Message, User } from "../types";

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private currentUser: User | null = null;

  private constructor() {
    // Initialize the socket connection
    this.socket = io("http://localhost:5000", {
      transports: ['websocket'],  // Enforce WebSocket transport
    });

    // Handle the 'users' event, which updates the list of users
    this.socket.on("users", (users: User[]) => {
      store.dispatch(setUsers(users));
    });

    // Handle incoming messages
    this.socket.on("message", (message: Message) => {
      store.dispatch(addMessage(message));
    });

    // Handle connection established
    this.socket.on("connect", () => {
      console.log("Connected to server");
      if (this.currentUser) {
        // Only emit 'user:join' when the user is set and socket is connected
        this.socket?.emit("user:join", this.currentUser);
      }
    });

    // Handle socket connection error or disconnection
    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error: ", error);
    });
    
    this.socket.on("disconnect", () => {
      console.log("Disconnected from the server");
    });
  }

  // Singleton pattern to ensure only one instance of SocketService
  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  // Connect the user to the server
  connect(user: User): void {
    this.currentUser = user;
    if (this.socket?.connected) {
      this.socket.emit("user:join", user);
    } else {
      console.log("Socket is not connected yet. Waiting...");
      // Optionally, try reconnecting
      this.socket?.connect();
    }
  }

  // Send a message to the server and update the store
  sendMessage(message: Omit<Message, "id" | "timestamp">): void {
    if (!this.socket?.connected) {
      console.error("Socket is not connected.");
      return;
    }

    // Emit the message to the server
    this.socket?.emit("message:send", message);

    // Dispatch the sent message to the store immediately for the sender to see it
    const timestamp = Date.now();
    const messageWithTimestamp = {
      ...message,
      id: `${message.senderId}-${timestamp}`,
      timestamp,
    };

    store.dispatch(addMessage(messageWithTimestamp));
  }

  // Disconnect the user and handle cleanup
  disconnect(): void {
    if (this.currentUser) {
      this.socket?.emit("user:leave", this.currentUser.id);
      this.currentUser = null;
    }
    this.socket?.disconnect();
  }
}

export const socketService = SocketService.getInstance();
