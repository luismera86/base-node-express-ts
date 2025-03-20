import { Server } from "socket.io";
import { Server as HttpServer } from "http"; 
import { logger } from "../common/utils/logger";


let io: Server;

export const initWebSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*"
    }
  });

  io.on("connection", (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });

    socket.on("message", (message) => {
      logger.info(`Message received: ${message}`);
      io.emit("message", message); 
    });
  });
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};
