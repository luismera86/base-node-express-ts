import { Request, Response, NextFunction } from "express";
import { obtenerTodosUsuarios } from "./use-cases/obtener-todos-usuarios.use-case";
import { obtenerUsuario } from "./use-cases/obtener-usuario.use-case";
import { crearUsuario } from "./use-cases/crear-usuario.use-case";
import { actualizarUsuario } from "./use-cases/actualizar-usuario.use-case";
import { eliminarUsuario } from "./use-cases/eliminar-usuario.use-case";
import { ActualizarUsuarioDto } from "./schemas/usuario.schema";

export const obtenerTodosUsuariosController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const usuarios = await obtenerTodosUsuarios();
        res.json(usuarios);
    } catch (error) {
        next(error);
    }
};

export const obtenerUsuarioController = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const usuario = await obtenerUsuario(id);
        res.status(200).json(usuario);
    } catch (error) {
        next(error);
    }
};

export const crearUsuarioController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const usuario = await crearUsuario(req.body);
        res.status(201).json(usuario);
    } catch (error) {
        next(error);
    }
};

export const actualizarUsuarioController = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const usuario = await actualizarUsuario(id, req.body as ActualizarUsuarioDto);
        res.status(200).json(usuario);
    } catch (error) {
        next(error);
    }
};

export const eliminarUsuarioController = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        await eliminarUsuario(id);
        res.status(200).json({ status: "ok", message: "Usuario eliminado correctamente" });
    } catch (error) {
        next(error);
    }
};
