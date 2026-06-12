interface UsuarioAutenticado {
    id: string;
    correo: string;
    rol: string;
    activo: boolean;
}

declare namespace Express {
    interface Request {
        usuario?: UsuarioAutenticado;
    }
}
