import express from "express";
import envConfig from "./config/config";

const { PORT } = envConfig;

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
