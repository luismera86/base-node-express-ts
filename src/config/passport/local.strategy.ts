import { Strategy } from "passport-local";
import passport from "passport";
import { User } from "../../modules/user/entities/user.entity";
import AppDataSource from "../datasource.config";
import { Hash } from "../../common/utils/hash.util";

const loginStrategy = new Strategy(
    {
        usernameField: "email",
    },
    async (email: string, password: string, done: any) => {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { email } });

            if (!user || !Hash.compare(password, user.password))
                return done(null, false, { message: "Invalid credentials" });

            const userWithRelations = await userRepository.findOne({
                where: { id: user.id },
                relations: {
                    userRoles: {
                        permissions: true,
                        role: true,
                    },
                },
            });

            return done(null, userWithRelations);
        } catch (error) {
            return done(error);
        }
    },
);

passport.use("login", loginStrategy);

// Serialization
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

// Deserialization
passport.deserializeUser(async (id: any, done) => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error);
    }
});
