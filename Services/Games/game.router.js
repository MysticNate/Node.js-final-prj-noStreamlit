import { Router } from "express";
import { authSelf, authGame, authUser } from "../../Middlewares/auth.js";

import * as ctrl from "./game.controller.js";

const gameRouter = Router();

gameRouter
  // GET routes
  .get("/", authUser, ctrl.getAllGames) // Get all games (admin sees all, users see their own)
  .get("/:id", authGame, ctrl.getGameById) // Get specific game by ID
  .get("/user/:userId", authSelf, ctrl.getGamesByUser) // Get all games for a specific user

  // POST routes
  .post("/", authUser, ctrl.createNewGame) // Create a new game
  .post("/player/:id", authGame, ctrl.addPlayerToGame) // Add player to a game
  .post("/debt/:id", authGame, ctrl.addDebtToGame) // Add debt to a game

  // PUT routes
  .put("/:id", authGame, ctrl.updateGame) // Update entire game
  .put("/resolve/:id", authGame, ctrl.resolveGame) // Mark game as resolved
  .put("/player/:id", authGame, ctrl.updatePlayerInGame) // Update specific player in game
  .put("/debt/:id", authGame, ctrl.updateDebtInGame) // Update specific debt in game

  // DELETE routes
  .delete("/:id", authGame, ctrl.deleteGame) // Delete entire game
  .delete("/player/:id", authGame, ctrl.removePlayerFromGame) // Remove player from game
  .delete("/debt/:id", authGame, ctrl.removeDebtFromGame); // Remove debt from game

// // Default exportation allows to not use '{}' when importing.
// // e.g. import gameRouter from "../Games/game.router";
// // NOT import { gameRouter } from "../Games/game.router";
export default gameRouter;
