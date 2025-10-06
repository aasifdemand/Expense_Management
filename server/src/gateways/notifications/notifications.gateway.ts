import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  handleConnection(client: Socket) {
    // Use auth instead of query
    const userId = client.handshake.auth.userId as string;

    if (userId) {
      this.connectedUsers.set(userId, client.id);
      console.log(`✅ User ${userId} connected with socket ${client.id}`);
    } else {
      console.log('⚠️ User connected without userId');
      client.disconnect(true); // optional: disconnect users without userId
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
  }

  sendToUser(userId: string, data: any): boolean {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', data);
      console.log(`📤 Sent notification to user ${userId}`);
      return true;
    } else {
      console.log(`⚠️ User ${userId} not connected`);
      return false;
    }
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }
}
