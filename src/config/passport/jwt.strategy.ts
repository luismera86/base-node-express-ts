import { Strategy, ExtractJwt } from "passport-jwt";
import AppDataSource from "../datasource.config";
import envConfig from "../../config/env.config";
import { User } from "../../modules/user/entities/user.entity";
import passport from "passport";

const jwtStrategy = new Strategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: envConfig.JWT_SECRET,
    },
    async (payload, done) => {
        try {
            const user = await AppDataSource.getRepository(User).findOne({
                where: { id: payload.id },
                relations: {
                    userRoles: {
                        permissions: true,
                        role: true,
                    },
                },
            });
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    },
);

passport.use("jwt", jwtStrategy);
