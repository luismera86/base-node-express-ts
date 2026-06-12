interface AuthenticatedUser {
    id: string;
    email: string;
    role: string;
    is_active: boolean;
}

declare namespace Express {
    interface Request {
        user?: AuthenticatedUser;
    }
}
