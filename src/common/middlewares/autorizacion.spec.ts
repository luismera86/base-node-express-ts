import { describe, it, expect, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { requerirRol } from "./requerir-rol.middleware";
import { propietarioOAdmin, restringirCamposPrivilegiados } from "./propiedad.middleware";
import { Rol } from "../enums/rol.enum";
import { ForbiddenException, UnauthorizedException } from "../../exceptions/exceptions";

const mockReq = (over: Partial<Request> = {}): Request => ({ params: {}, body: {}, ...over }) as Request;
const noopRes = {} as Response;

describe("requerirRol", () => {
    it("rechaza si no hay usuario (401)", () => {
        const next = vi.fn() as unknown as NextFunction;
        requerirRol(Rol.ADMINISTRADOR)(mockReq(), noopRes, next);
        expect((next as any).mock.calls[0][0]).toBeInstanceOf(UnauthorizedException);
    });

    it("rechaza rol no permitido (403)", () => {
        const next = vi.fn() as unknown as NextFunction;
        requerirRol(Rol.ADMINISTRADOR)(
            mockReq({ usuario: { id: "1", correo: "a@a.com", rol: "user", activo: true } }),
            noopRes,
            next,
        );
        expect((next as any).mock.calls[0][0]).toBeInstanceOf(ForbiddenException);
    });

    it("permite rol válido", () => {
        const next = vi.fn() as unknown as NextFunction;
        requerirRol(Rol.ADMINISTRADOR)(
            mockReq({ usuario: { id: "1", correo: "a@a.com", rol: "admin", activo: true } }),
            noopRes,
            next,
        );
        expect((next as any).mock.calls[0][0]).toBeUndefined();
    });
});

describe("propietarioOAdmin", () => {
    it("permite al dueño del recurso", () => {
        const next = vi.fn() as unknown as NextFunction;
        propietarioOAdmin()(
            mockReq({ usuario: { id: "u1", correo: "a@a.com", rol: "user", activo: true }, params: { id: "u1" } }),
            noopRes,
            next,
        );
        expect((next as any).mock.calls[0][0]).toBeUndefined();
    });

    it("permite a un admin sobre cualquier recurso", () => {
        const next = vi.fn() as unknown as NextFunction;
        propietarioOAdmin()(
            mockReq({
                usuario: { id: "admin", correo: "a@a.com", rol: "admin", activo: true },
                params: { id: "otro" },
            }),
            noopRes,
            next,
        );
        expect((next as any).mock.calls[0][0]).toBeUndefined();
    });

    it("rechaza a un usuario sobre recurso ajeno (403)", () => {
        const next = vi.fn() as unknown as NextFunction;
        propietarioOAdmin()(
            mockReq({ usuario: { id: "u1", correo: "a@a.com", rol: "user", activo: true }, params: { id: "otro" } }),
            noopRes,
            next,
        );
        expect((next as any).mock.calls[0][0]).toBeInstanceOf(ForbiddenException);
    });
});

describe("restringirCamposPrivilegiados", () => {
    it("elimina rol/activo para no-admin", () => {
        const next = vi.fn() as unknown as NextFunction;
        const req = mockReq({
            usuario: { id: "u1", correo: "a@a.com", rol: "user", activo: true },
            body: { nombre: "Ana", rol: "admin", activo: false },
        });
        restringirCamposPrivilegiados(req, noopRes, next);
        expect(req.body).toEqual({ nombre: "Ana" });
    });

    it("mantiene rol/activo para admin", () => {
        const next = vi.fn() as unknown as NextFunction;
        const req = mockReq({
            usuario: { id: "admin", correo: "a@a.com", rol: "admin", activo: true },
            body: { nombre: "Ana", rol: "admin" },
        });
        restringirCamposPrivilegiados(req, noopRes, next);
        expect(req.body).toEqual({ nombre: "Ana", rol: "admin" });
    });
});
