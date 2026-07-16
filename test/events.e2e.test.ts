import type { Server as HttpServer } from "http";
import { AddressInfo } from "net";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Server } from "socket.io";
import { io as ioClient, Socket as ClientSocket } from "socket.io-client";
import { createApp } from "../src/config/server.config";
import { initEventsGateway } from "../src/modules/events/events.gateway";
import { emitToUser } from "../src/modules/events/events.service";
import { createAccessToken } from "../src/common/utils/jwt.util";

/**
 * e2e de WebSockets: servidor HTTP real + socket.io-client contra el namespace
 * /events. La auth del handshake es JWT-only (sin DB). El gateway se inicializa
 * a mano — startServer solo lo hace con WS_ENABLED=true.
 */
describe("events e2e (socket.io real)", () => {
    let httpServer: HttpServer;
    let io: Server;
    let url: string;
    const clients: ClientSocket[] = [];

    beforeAll(async () => {
        const app = createApp();
        httpServer = app.listen(0);
        io = initEventsGateway(httpServer);
        const { port } = httpServer.address() as AddressInfo;
        url = `http://localhost:${port}/events`;
    });

    afterAll(async () => {
        clients.forEach((client) => client.disconnect());
        await io.close();
        httpServer.close();
    });

    const connect = (opts: { token?: string; cookie?: string } = {}): ClientSocket => {
        const client = ioClient(url, {
            forceNew: true,
            transports: ["websocket"],
            auth: opts.token ? { token: opts.token } : undefined,
            extraHeaders: opts.cookie ? { cookie: opts.cookie } : undefined,
        });
        clients.push(client);
        return client;
    };

    const connected = (client: ClientSocket): Promise<void> =>
        new Promise((resolve, reject) => {
            client.once("connect", () => resolve());
            client.once("connect_error", reject);
        });

    const connectError = (client: ClientSocket): Promise<Error> =>
        new Promise((resolve) => client.once("connect_error", resolve));

    it("rechaza la conexión sin token con la clave i18n en el connect_error", async () => {
        const error = await connectError(connect());
        expect(error.message).toBe("errors.TOKEN_NOT_PROVIDED");
    });

    it("rechaza la conexión con token inválido", async () => {
        const error = await connectError(connect({ token: "no.es.un.token" }));
        expect(error.message).toBe("errors.INVALID_OR_EXPIRED_TOKEN");
    });

    it("conecta con el token en handshake auth y responde pong al ping", async () => {
        const token = await createAccessToken({ id: "u1", email: "a@a.com", role: "user" });
        const client = connect({ token });
        await connected(client);

        const pong = await new Promise<{ time: string }>((resolve) => {
            client.once("pong", resolve);
            client.emit("ping");
        });
        expect(new Date(pong.time).getTime()).not.toBeNaN();
    });

    it("conecta con la cookie httpOnly access_token (flujo navegador)", async () => {
        const token = await createAccessToken({ id: "u1", email: "a@a.com", role: "user" });
        const client = connect({ cookie: `access_token=${token}` });
        await connected(client);
        expect(client.connected).toBe(true);
    });

    it("emitToUser llega a todas las conexiones de ese usuario y a nadie más", async () => {
        const tokenA = await createAccessToken({ id: "user-a", email: "a@a.com", role: "user" });
        const tokenB = await createAccessToken({ id: "user-b", email: "b@b.com", role: "user" });

        const clientA1 = connect({ token: tokenA });
        const clientA2 = connect({ token: tokenA });
        const clientB = connect({ token: tokenB });
        await Promise.all([connected(clientA1), connected(clientA2), connected(clientB)]);

        const received: string[] = [];
        const waitNotification = (client: ClientSocket, name: string): Promise<void> =>
            new Promise((resolve) =>
                client.once("notification", () => {
                    received.push(name);
                    resolve();
                }),
            );

        const bothA = Promise.all([waitNotification(clientA1, "a1"), waitNotification(clientA2, "a2")]);
        void waitNotification(clientB, "b");

        emitToUser("user-a", "notification", { message: "hola" });
        await bothA;

        // Margen para que un evento mal ruteado a B alcance a llegar.
        await new Promise((resolve) => setTimeout(resolve, 150));
        expect(received.sort()).toEqual(["a1", "a2"]);
    });
});
