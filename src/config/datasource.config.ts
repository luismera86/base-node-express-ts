import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path";
import envConfig from "./env.config";

const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "admin",
  password: "admin",
  database: "mydatabase",
  synchronize: envConfig.DB_SYNCHRONIZE,
  logging: envConfig.DB_SYNCHRONIZE,
  entities: [path.join(__dirname, "/../**/*.entity{.ts,.js}")],
  migrations: [path.join(__dirname, "/../migrations/*{.ts,.js}")],
  subscribers: [],
});

export default AppDataSource;
