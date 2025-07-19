import { NextFunction, Request, Response } from "express";
import { User } from "../../modules/user/entities/user.entity";
import AppDataSource from "../../config/datasource.config";
import { ForbiddenException, UnauthorizedException } from "../../exceptions/exceptions";

export const validateRolesAndPermissions = (roles: string[], permissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) throw new UnauthorizedException("User not authenticated");
            const userRepository = AppDataSource.getRepository(User);
            const user = req.user as User;
            const userPermissions = await userRepository.findOne({
                where: {
                    id: user.id,
                },
                relations: {
                    userRoles: {
                        permissions: true,
                        role: true,
                    },
                },
            });

            const authorized = userPermissions?.userRoles.some((userRole) => {
                if (roles.includes(userRole.role.name)) {
                    return userRole.permissions.some((permission) => permissions.includes(permission.name));
                }
                return false;
            });

            if (!authorized) {
                // Mensaje de error más descriptivo para facilitar diagnóstico
                const userRoles = userPermissions?.userRoles.map((ur) => ur.role.name).join(", ");
                const userPerms = userPermissions?.userRoles
                    .flatMap((ur) => ur.permissions.map((p) => p.name))
                    .join(", ");

                throw new ForbiddenException(
                    `Not authorized to access this resource. Required roles: [${roles.join(", ")}] with permissions: [${permissions.join(", ")}]. ` +
                        `User has roles: [${userRoles}] with permissions: [${userPerms}]`,
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
