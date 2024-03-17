import dotenv from "dotenv";
dotenv.config();

const envConfig = {
  DB_URL: process.env.DB_URL,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  SECRET_KEY: process.env.SECRET_KEY,
  PORT: process.env.PORT || 8080,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION,
};

export default envConfig;
