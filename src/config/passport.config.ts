import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { User } from "../modules/user/entities/user.entity";
import AppDataSource from "./datasource.config";
import envConfig from "./env.config";

export class PassportConfig {
  private userRepository = AppDataSource.getRepository(User);
  private passport = passport;

  constructor() {
    this.initializeStrategies();
    this.initializeSerialization();
  }

  private initializeStrategies(): void {
    this.initializeGoogleStrategy();
    this.initializeMicrosoftStrategy();
  }

  private initializeGoogleStrategy(): void {
    this.passport.use(
      new GoogleStrategy(
        {
          clientID: envConfig.GOOGLE_CLIENT_ID || "",
          clientSecret: envConfig.GOOGLE_CLIENT_SECRET || "",
          callbackURL: "/auth/google/callback",
        },
        this.handleGoogleAuth.bind(this),
      ),
    );
  }

  private initializeMicrosoftStrategy(): void {
    this.passport.use(
      new MicrosoftStrategy(
        {
          clientID: envConfig.MICROSOFT_CLIENT_ID || "",
          clientSecret: envConfig.MICROSOFT_CLIENT_SECRET || "",
          callbackURL: "/auth/microsoft/callback",
          scope: ["user.read"],
        },
        this.handleMicrosoftAuth.bind(this),
      ),
    );
  }

  private async handleGoogleAuth(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<void> {
    try {
      const user = await this.findOrCreateUser(profile);
      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }

  private async handleMicrosoftAuth(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<void> {
    try {
      const user = await this.findOrCreateUser(profile);
      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }

  private async findOrCreateUser(profile: any): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { email: profile.emails?.[0].value },
    });

    if (!user) {
      user = this.userRepository.create({
        email: profile.emails?.[0].value,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
      });
      await this.userRepository.save(user);
    }

    return user;
  }

  private initializeSerialization(): void {
    this.passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    this.passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await this.userRepository.findOne({ where: { id } });
        done(null, user);
      } catch (error) {
        done(error);
      }
    });
  }

  public getPassport() {
    return this.passport;
  }
}

const passportConfig = new PassportConfig();

export default passportConfig.getPassport();
