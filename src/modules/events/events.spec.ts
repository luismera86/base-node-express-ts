import { describe, it, expect, vi } from "vitest";
import type { Namespace, Socket } from "socket.io";
import { authenticateSocket } from "./utils/ws-auth.util";
import { bindEventsNamespace, emitToAll, emitToUser, userRoom } from "./events.service";
import { createAccessToken } from "../../common/utils/jwt.util";
import { UnauthorizedException } from "../../exceptions/exceptions";

const PAYLOAD = { id: "u1", email: "a@a.com", role: "user" };

const fakeSocket = (handshake: { cookie?: string; authorization?: string; auth?: Record<string, unknown> }): Socket =>
    ({
        handshake: {
            headers: { cookie: handshake.cookie, authorization: handshake.authorization },
            auth: handshake.auth ?? {},
        },
    }) as unknown as Socket;

describe("events module", () => {
    describe("authenticateSocket", () => {
        it("rechaza el handshake sin token", async () => {
            await expect(authenticateSocket(fakeSocket({}))).rejects.toBeInstanceOf(UnauthorizedException);
        });

        it("rechaza tokens inválidos", async () => {
            await expect(authenticateSocket(fakeSocket({ auth: { token: "no.es.un.token" } }))).rejects.toBeInstanceOf(
                UnauthorizedException,
            );
        });

        it("autentica con la cookie access_token del handshake", async () => {
            const token = await createAccessToken(PAYLOAD);
            const user = await authenticateSocket(fakeSocket({ cookie: `other=1; access_token=${token}` }));
            expect(user).toEqual(PAYLOAD);
        });

        it("autentica con el token de handshake auth (clientes no-browser)", async () => {
            const token = await createAccessToken(PAYLOAD);
            const user = await authenticateSocket(fakeSocket({ auth: { token } }));
            expect(user).toEqual(PAYLOAD);
        });

        it("autentica con Authorization: Bearer como último fallback", async () => {
            const token = await createAccessToken(PAYLOAD);
            const user = await authenticateSocket(fakeSocket({ authorization: `Bearer ${token}` }));
            expect(user).toEqual(PAYLOAD);
        });
    });

    describe("events.service", () => {
        it("userRoom arma la room por usuario", () => {
            expect(userRoom("u1")).toBe("user:u1");
        });

        it("emitir sin namespace bindeado es no-op (WS_ENABLED=false)", () => {
            expect(() => emitToUser("u1", "evento", {})).not.toThrow();
            expect(() => emitToAll("evento", {})).not.toThrow();
        });

        it("emitToUser emite a la room del usuario y emitToAll al namespace", () => {
            const emit = vi.fn();
            const to = vi.fn().mockReturnValue({ emit });
            bindEventsNamespace({ to, emit } as unknown as Namespace);

            emitToUser("u1", "notificacion", { ok: true });
            expect(to).toHaveBeenCalledWith(userRoom("u1"));
            expect(emit).toHaveBeenCalledWith("notificacion", { ok: true });

            emitToAll("broadcast", { ok: true });
            expect(emit).toHaveBeenCalledWith("broadcast", { ok: true });
        });
    });
});
