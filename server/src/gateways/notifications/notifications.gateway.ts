import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {


  @WebSocketServer()
  server: Server


  private connectedUsers: Map<string, string> = new Map();


  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      this.connectedUsers.set(userId, client.id);
      console.log(`User ${userId} connected with socket ${client.id}`);
    }
  }


  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);

        console.log(`User ${userId} disconnected`);
      }
    }
  }


  sendToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);

    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
      console.log(`Notification sent to user ${userId}`, notification);
    } else {
      console.log(`User ${userId} is offline. Notification stored.`);
    }
  }

}
