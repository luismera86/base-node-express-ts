import { describe, it, expect, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { requireRole } from "./requireRole.middleware";
import { ownerOrAdmin, restrictPrivilegedFields } from "./ownership.middleware";
import { Role } from "../enums/role.enum";
import { ForbiddenException, UnauthorizedException } from "../../exceptions/exceptions";

const mockReq = (over: Partial<Request> = {}): Request => ({ params: {}, body: {}, ...over }) as Request;
const noopRes = {} as Response;

describe("requireRole", () => {
    it("rechaza si no hay usuario (401)", () => {
        const next = vi.fn() as unknown as NextFunction;
        requireRole(Role.ADMIN)(mockReq(), noopRes, next);
        expect((next as any).mock.calls[0][0]).toBeInstanceOf(UnauthorizedException);
    });

    it("rechaza rol no permitido (403)", () => {
        const next = vi.fn() as unknown as NextFunction;
        requireRole(Role.ADMIN)(
            mockReq({ user: { id: "1", email: "a@a.com", role: "user", is_active: true } }),
            noopRes,
            next,
        );
        expect((next as any).mock.calls[0][0]).toBeInstanceOf(ForbiddenException);
    });

    it("permite rol válido", () => {
        const next = vi.fn() as unknown as NextFunction;
        requireRole(Role.ADMIN)(
            mockReq({ user: { id: "1", email: "a@a.com", role: "admin", is_active: true } }),
            noopRes,
            next,
        );
        expect((next as any).mock.calls[0][0]).toBeUndefined();
    });
});

describe("ownerOrAdmin", () => {
    it("permite al dueño del recurso", () => {
        const next = vi.fn() as unknown as NextFunction;
        ownerOrAdmin()(
            mockReq({ user: { id: "u1", email: "a@a.com", role: "user", is_active: true }, params: { id: "u1" } }),
            noopRes,
            next,
        );
        expect((next as any).mock.calls[0][0]).toBeUndefined();
    });

    it("permite a un admin sobre cualquier recurso", () => {
        const next = vi.fn() as unknown as NextFunction;
        ownerOrAdmin()(
            mockReq({
                user: { id: "admin", email: "a@a.com", role: "admin", is_active: true },
                params: { id: "otro" },
            }),
            noopRes,
            next,
        );
        expect((next as any).mock.calls[0][0]).toBeUndefined();
    });

    it("rechaza a un usuario sobre recurso ajeno (403)", () => {
        const next = vi.fn() as unknown as NextFunction;
        ownerOrAdmin()(
            mockReq({ user: { id: "u1", email: "a@a.com", role: "user", is_active: true }, params: { id: "otro" } }),
            noopRes,
            next,
        );
        expect((next as any).mock.calls[0][0]).toBeInstanceOf(ForbiddenException);
    });
});

describe("restrictPrivilegedFields", () => {
    it("elimina role/is_active para no-admin", () => {
        const next = vi.fn() as unknown as NextFunction;
        const req = mockReq({
            user: { id: "u1", email: "a@a.com", role: "user", is_active: true },
            body: { first_name: "Ana", role: "admin", is_active: false },
        });
        restrictPrivilegedFields(req, noopRes, next);
        expect(req.body).toEqual({ first_name: "Ana" });
    });

    it("mantiene role/is_active para admin", () => {
        const next = vi.fn() as unknown as NextFunction;
        const req = mockReq({
            user: { id: "admin", email: "a@a.com", role: "admin", is_active: true },
            body: { first_name: "Ana", role: "admin" },
        });
        restrictPrivilegedFields(req, noopRes, next);
        expect(req.body).toEqual({ first_name: "Ana", role: "admin" });
    });
});
