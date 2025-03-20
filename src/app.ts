import "reflect-metadata"; 
import express from "express";
import envConfig from "./config/config";
import AppDataSource from "./config/datasource.config";


const { PORT } = envConfig;

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    
  })
  .catch((error) => console.log(error));


