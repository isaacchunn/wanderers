import { Server, Socket } from "socket.io";
import http from "http";
import { createMessage } from "./chat";

const rooms: Record<string, Set<string>> = {};

export const setupSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins for now
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    socket.on("joinRoom", (roomId: string) => {
      socket.join(roomId); // Join room with the given roomId

      // Add to room trackingF
      if (!rooms[roomId]) {
        rooms[roomId] = new Set();
      }
      rooms[roomId].add(socket.id);
    });

    socket.on(
      "sendMessage",
      async (
        roomId: string,
        userId: string,
        message: string
      ) => {
        const createdChatMessage = await createMessage(
          Number(userId),
          Number(roomId),
          message
        );
        io.to(roomId).emit("receiveMessage", createdChatMessage);
      }
    );

    socket.on("disconnect", () => {
      // Remove the user from the rooms
      for (const roomId in rooms) {
        if (rooms[roomId].has(socket.id)) {
          rooms[roomId].delete(socket.id);
          console.log(`Socket ${socket.id} left room ${roomId}`);
        }
      }

      console.log(`Socket ${socket.id} disconnected`);
    });
  });

  return io;
};
