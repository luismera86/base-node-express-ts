import type { Namespace } from "socket.io";

/** Room por usuario: todas sus conexiones (pestañas, dispositivos) la comparten. */
export const userRoom = (userId: string): string => `user:${userId}`;

/**
 * Emisor de eventos para el resto de la app: cualquier use case puede importar
 * `emitToUser` / `emitToAll` para notificar por socket. El gateway se registra
 * con bind() al inicializar; con WS_ENABLED=false (o sin conectados) las
 * emisiones son no-op — los módulos que emiten no necesitan chequear el flag.
 */
let namespace: Namespace | null = null;

/** Llamado por initEventsGateway al habilitar los sockets. */
export const bindEventsNamespace = (ns: Namespace): void => {
    namespace = ns;
};

/** Emite a todas las conexiones activas de un usuario. */
export const emitToUser = (userId: string, event: string, data: unknown): void => {
    namespace?.to(userRoom(userId)).emit(event, data);
};

/** Emite a todos los clientes conectados al namespace. */
export const emitToAll = (event: string, data: unknown): void => {
    namespace?.emit(event, data);
};
