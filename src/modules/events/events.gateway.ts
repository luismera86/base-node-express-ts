import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import type { DefaultEventsMap } from "socket.io";
import envConfig from "../../config/env.config";
import { LoggerService } from "../../common/utils/logger.util";
import { authenticateSocket, WsUser } from "./utils/ws-auth.util";
import { bindEventsNamespace, userRoom } from "./events.service";

const logger = new LoggerService("EventsGateway");

type SocketData = { user?: WsUser };

/**
 * Monta socket.io sobre el servidor HTTP con el namespace `/events`.
 * Opt-in: startServer solo lo llama con WS_ENABLED=true. La auth ocurre en el
 * middleware del handshake — una conexión sin access token válido recibe
 * `connect_error` (con la clave i18n como mensaje) y nunca llega a "connection".
 */
export const initEventsGateway = (httpServer: HttpServer): Server => {
    const origins = envConfig.CORS_ORIGINS.split(",").map((o) => o.trim());

    const io = new Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>(httpServer, {
        cors: {
            // Mismo criterio que el CORS HTTP de server.config. Con "*" se refleja
            // el origen del request: los navegadores no aceptan wildcard junto con
            // credentials, y la cookie de access viaja en el handshake.
            origin: origins.includes("*") ? true : origins,
            credentials: true,
        },
    });

    const events = io.of("/events");

    events.use((socket, next) => {
        authenticateSocket(socket)
            .then((user) => {
                socket.data.user = user;
                next();
            })
            .catch((error: unknown) => {
                next(error instanceof Error ? error : new Error("errors.UNAUTHORIZED"));
            });
    });

    events.on("connection", (socket) => {
        const user = socket.data.user;
        if (!user) {
            // No debería ocurrir: el middleware del handshake ya autenticó.
            socket.disconnect(true);
            return;
        }

        // Room por usuario: habilita emitToUser desde cualquier módulo.
        void socket.join(userRoom(user.id));

        socket.on("ping", () => {
            socket.emit("pong", { time: new Date().toISOString() });
        });
    });

    bindEventsNamespace(events);
    logger.info("WebSockets habilitados (socket.io, namespace /events)");
    return io;
};
