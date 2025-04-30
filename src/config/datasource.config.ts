import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path";
import envConfig from "./env.config";

const AppDataSource = new DataSource({
  type: "postgres",
  host: envConfig.DB_HOST,
  port: parseInt(envConfig.DB_PORT),
  username: envConfig.DB_USER,
  password: envConfig.DB_PASSWORD,
  database: envConfig.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [path.join(__dirname, "/../**/*.entity{.ts,.js}")],
  migrations: [path.join(__dirname, "/../migrations/*{.ts,.js}")],
  subscribers: [],
});

export default AppDataSource;
