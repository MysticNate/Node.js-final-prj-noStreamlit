import { Router } from "express";
import userRouter from "../Services/Users/user.router.js";
import gameRouter from "../Services/Games/game.router.js";
import globalRouter from "../Services/Global/global.router.js";

const v1Router = new Router();

// Add micro services
v1Router.use("/users", userRouter);
v1Router.use("/games", gameRouter);
v1Router.use("/global", globalRouter);

export default v1Router;
