import "dotenv/config";

import { __dirname, __filename } from "./global.js";

import * as middle from "./Middlewares/errorHandler.js";

import v1Router from "./Routes/v1.js";

import express from "express";

// EXPRESS \\
const PORT = process.env.PORT || 5500;
const server = express();
server.use(express.json()); // Supporting read write
server.use(express.urlencoded({ extended: true })); // Form support

// Serve static files from uploads directory
server.use("/uploads", express.static("uploads"));

// For all routing (will host inside different routes)
server.use("/api/v1", v1Router);

// Adding middleware (errorHandler) - MUST be after routes
server.use(middle.errorHandler);

// Sever start
server.listen(PORT, () => console.log(`http://localhost:${PORT}/`));

// // TEST: .env (OK)?
// console.log(process.env.DB_NAME);
// // __________________________________________________________

// // TEST: CMD Creation of Mongo DB \\
// import * as funcs from "./functions.js";
// await funcs.runMongoCreationCMD();
// // __________________________________________________________

// // TEST: Other stuff
// // console.clear();
// console.log(`hi ${__dirname}`);
// // ...................................................
// // Un-check to create random player DB :)
// funcs.CreateDB();
// // ...................................................
// // Testing
server.get("/", (req, res) => {
  res.send("Welcome to HP"); // We cannot send 2 'send' functions, after using sent it will end.
});
// // ...................................................
// server.post("/", (req, res) => {
//   res.send("Hello from post :)");
// });
// // __________________________________________________________
