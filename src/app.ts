import express from "express";
import envConfig from "./config/config";
import { AppDataSource } from "./config/datasource.configi";

const { PORT } = envConfig;

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => console.log(error));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
