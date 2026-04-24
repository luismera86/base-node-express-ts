import { Strategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import envConfig from "../../config/env.config";
import { prisma } from "../prisma.config";

const jwtStrategy = new Strategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: envConfig.JWT_SECRET,
    },
    async (payload, done) => {
        try {
            // TODO: replace with your user model once created
            // const user = await prisma.<model>.findUnique({ where: { id: payload.id } });
            // if (!user) return done(null, false);
            // return done(null, user);
            return done(null, payload);
        } catch (error) {
            return done(error);
        }
    },
);

passport.use("jwt", jwtStrategy);
