import { SECRET } from "../../global.js";
import * as md from "./Game.model.js";
import "dotenv/config";
import {
  trackGameAdded,
  trackGameDeleted,
  trackProblemSolved,
  trackProblemUnsolved,
} from "../Global/global.controller.js";

import jwt from "jsonwebtoken";

// GET ROUTES \\

export async function getAllGames(req, res) {
  try {
    // Check if user is authenticated (should be handled by middleware)
    const userRole = req.user?.role;
    const userId = req.user?._id;

    let games;

    // If admin, get all games. If regular user, get only their games
    if (userRole === "admin") {
      games = await md.Game.GetAllGames();
    } else if (userId) {
      games = await md.Game.GetGamesByUser(userId);
    } else {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!games || games.length === 0) {
      return res.status(404).json({ message: "No games found" });
    }

    return res.status(200).json({ message: "Here are the games", games });
  } catch (error) {
    console.error("Error getting all games:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getGameById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Game ID is required" });
    }

    const game = await md.Game.GetAllGames(id);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    return res.status(200).json({
      message: `Here is game with ID ${id}`,
      game,
    });
  } catch (error) {
    console.error("Error getting game by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getGamesByUser(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const games = await md.Game.GetGamesByUser(userId);

    if (!games || games.length === 0) {
      return res.status(404).json({ message: "No games found for this user" });
    }

    return res.status(200).json({
      message: `Here are games for user ${userId}`,
      games,
    });
  } catch (error) {
    console.error("Error getting games by user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST ROUTES \\

export async function createNewGame(req, res) {
  try {
    const {
      _id,
      userGameID,
      type,
      location,
      gameUserNote,
      totalCashOnTable,
      gamePlayers,
      gameDebts,
    } = req.body;

    // Get userID from authenticated user
    const userID = req.user?._id;

    if (!_id || !userID || !userGameID || !type || !location) {
      return res.status(400).json({
        message: "Required fields missing: _id, userGameID, type, location",
      });
    }

    const game = new md.Game(
      _id,
      userID,
      userGameID,
      type,
      new Date(), // programRunTime
      location,
      false, // resolved
      "", // resolvedString
      "", // gameString
      gameUserNote || "",
      totalCashOnTable || 0, // totalCashOnTable
      gamePlayers || [], // gamePlayers
      gameDebts || [] // gameDebts
    );

    const result = await game.AddGame();

    // Track game added in global statistics
    try {
      await trackGameAdded();
    } catch (trackError) {
      console.error("Failed to track game added:", trackError);
      // Don't fail the game creation if tracking fails
    }

    return res.status(201).json({
      message: "Game created successfully!",
      game: game.toJSON(),
    });
  } catch (error) {
    console.error("Error creating new game:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function addPlayerToGame(req, res) {
  try {
    const { id } = req.params;
    const { playerName, buyIn, cashOut } = req.body;

    if (!playerName || buyIn === undefined) {
      return res.status(400).json({
        message: "playerName and buyIn are required",
      });
    }

    const game = await md.Game.GetAllGames(id);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Create game instance and add player
    const gameInstance = new md.Game(
      game._id,
      game.userID,
      game.userGameID,
      game.type,
      game.programRunTime,
      game.location,
      game.resolved,
      game.resolvedString,
      game.gameString,
      game.gameUserNote,
      game.totalCashOnTable,
      game.gamePlayers,
      game.gameDebts
    );

    gameInstance.addPlayer(new md.GamePlayer(playerName, buyIn, cashOut || 0));
    gameInstance.calculateTotalCash();

    const success = await md.Game.UpdateGameInDB(id, {
      gamePlayers: gameInstance.gamePlayers,
      totalCashOnTable: gameInstance.totalCashOnTable,
    });

    if (!success) {
      return res.status(500).json({ message: "Failed to add player to game" });
    }

    return res.status(200).json({ message: "Player added successfully!" });
  } catch (error) {
    console.error("Error adding player to game:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function addDebtToGame(req, res) {
  try {
    const { id } = req.params;
    const { debtor, creditor, amount, paymentType } = req.body;

    if (!debtor || !creditor || !amount) {
      return res.status(400).json({
        message: "debtor, creditor, and amount are required",
      });
    }

    const game = await md.Game.GetAllGames(id);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Create game instance and add debt
    const gameInstance = new md.Game(
      game._id,
      game.userID,
      game.userGameID,
      game.type,
      game.programRunTime,
      game.location,
      game.resolved,
      game.resolvedString,
      game.gameString,
      game.gameUserNote,
      game.totalCashOnTable,
      game.gamePlayers,
      game.gameDebts
    );

    gameInstance.addDebt(
      new md.GameDebt(debtor, creditor, amount, paymentType || "BIT")
    );

    const success = await md.Game.UpdateGameInDB(id, {
      gameDebts: gameInstance.gameDebts,
    });

    if (!success) {
      return res.status(500).json({ message: "Failed to add debt to game" });
    }

    return res.status(200).json({ message: "Debt added successfully!" });
  } catch (error) {
    console.error("Error adding debt to game:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// PUT ROUTES \\

export async function updateGame(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ message: "Game ID is required" });
    }

    // If updating resolved status, handle global statistics
    if ("resolved" in updates) {
      const existingGame = await md.Game.GetAllGames(id);
      if (!existingGame) {
        return res.status(404).json({ message: "Game not found" });
      }

      const wasResolved = existingGame.resolved;
      const willBeResolved = updates.resolved;

      // Update the game
      const success = await md.Game.UpdateGameInDB(id, updates);

      if (!success) {
        return res
          .status(404)
          .json({ message: "Game not found or update failed" });
      }

      // Handle global statistics for resolution status change
      try {
        if (!wasResolved && willBeResolved) {
          // Game became resolved
          await trackProblemSolved();
        } else if (wasResolved && !willBeResolved) {
          // Game became unresolved
          await trackProblemUnsolved();
        }
      } catch (trackError) {
        console.error("Failed to track resolution change:", trackError);
        // Don't fail the operation if tracking fails
      }
    } else {
      // Normal update without resolution status change
      const success = await md.Game.UpdateGameInDB(id, updates);

      if (!success) {
        return res
          .status(404)
          .json({ message: "Game not found or update failed" });
      }
    }

    return res.status(200).json({ message: "Game updated successfully!" });
  } catch (error) {
    console.error("Error updating game:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function resolveGame(req, res) {
  try {
    const { id } = req.params;
    const { resolvedString } = req.body;

    if (!resolvedString) {
      return res.status(400).json({ message: "resolvedString is required" });
    }

    // Check if game was already resolved to avoid double counting
    const existingGame = await md.Game.GetAllGames(id);
    if (!existingGame) {
      return res.status(404).json({ message: "Game not found" });
    }

    const wasAlreadyResolved = existingGame.resolved;

    const success = await md.Game.UpdateGameInDB(id, {
      resolved: true,
      resolvedString: resolvedString,
    });

    if (!success) {
      return res
        .status(404)
        .json({ message: "Game not found or resolve failed" });
    }

    // Track problem solved in global statistics only if it wasn't already resolved
    if (!wasAlreadyResolved) {
      try {
        await trackProblemSolved();
      } catch (trackError) {
        console.error("Failed to track problem solved:", trackError);
        // Don't fail the operation if tracking fails
      }
    }

    return res.status(200).json({ message: "Game resolved successfully!" });
  } catch (error) {
    console.error("Error resolving game:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updatePlayerInGame(req, res) {
  try {
    const { id } = req.params;
    const { playerName, updates } = req.body;

    if (!playerName || !updates) {
      return res.status(400).json({
        message: "playerName and updates object are required",
      });
    }

    const game = await md.Game.GetAllGames(id);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Create game instance and update player
    const gameInstance = new md.Game(
      game._id,
      game.userID,
      game.userGameID,
      game.type,
      game.programRunTime,
      game.location,
      game.resolved,
      game.resolvedString,
      game.gameString,
      game.gameUserNote,
      game.totalCashOnTable,
      game.gamePlayers,
      game.gameDebts
    );

    gameInstance.updatePlayer(playerName, updates);
    gameInstance.calculateTotalCash();

    const success = await md.Game.UpdateGameInDB(id, {
      gamePlayers: gameInstance.gamePlayers,
      totalCashOnTable: gameInstance.totalCashOnTable,
    });

    if (!success) {
      return res
        .status(500)
        .json({ message: "Failed to update player in game" });
    }

    return res.status(200).json({ message: "Player updated successfully!" });
  } catch (error) {
    console.error("Error updating player in game:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateDebtInGame(req, res) {
  try {
    const { id } = req.params;
    const { debtor, creditor, updates } = req.body;

    if (!debtor || !creditor || !updates) {
      return res.status(400).json({
        message: "debtor, creditor, and updates object are required",
      });
    }

    const game = await md.Game.GetAllGames(id);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Find and update the specific debt
    const gameInstance = new md.Game(
      game._id,
      game.userID,
      game.userGameID,
      game.type,
      game.programRunTime,
      game.location,
      game.resolved,
      game.resolvedString,
      game.gameString,
      game.gameUserNote,
      game.totalCashOnTable,
      game.gamePlayers,
      game.gameDebts
    );

    const debtIndex = gameInstance.gameDebts.findIndex(
      (debt) => debt.debtor === debtor && debt.creditor === creditor
    );

    if (debtIndex === -1) {
      return res.status(404).json({ message: "Debt not found" });
    }

    gameInstance.gameDebts[debtIndex] = {
      ...gameInstance.gameDebts[debtIndex],
      ...updates,
    };

    const success = await md.Game.UpdateGameInDB(id, {
      gameDebts: gameInstance.gameDebts,
    });

    if (!success) {
      return res.status(500).json({ message: "Failed to update debt in game" });
    }

    return res.status(200).json({ message: "Debt updated successfully!" });
  } catch (error) {
    console.error("Error updating debt in game:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// DELETE ROUTES \\

export async function deleteGame(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Game ID is required" });
    }

    // Get the game before deletion to check if it was resolved
    const existingGame = await md.Game.GetAllGames(id);
    if (!existingGame) {
      return res.status(404).json({ message: "Game not found" });
    }

    const wasResolved = existingGame.resolved;
    const playerCount = existingGame.gamePlayers
      ? existingGame.gamePlayers.length
      : 0;

    const success = await md.Game.DeleteGameFromDB(id);

    if (!success) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Track game deleted and adjust other statistics accordingly
    try {
      await trackGameDeleted();

      // If the game was resolved, decrement problems solved count
      if (wasResolved) {
        await trackProblemUnsolved();
      }
    } catch (trackError) {
      console.error("Failed to track game deletion:", trackError);
      // Don't fail the operation if tracking fails
    }

    return res.status(200).json({ message: "Game deleted successfully!" });
  } catch (error) {
    console.error("Error deleting game:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function removePlayerFromGame(req, res) {
  try {
    const { id } = req.params;
    const { playerName } = req.body;

    if (!playerName) {
      return res.status(400).json({ message: "playerName is required" });
    }

    const game = await md.Game.GetAllGames(id);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Create game instance and remove player
    const gameInstance = new md.Game(
      game._id,
      game.userID,
      game.userGameID,
      game.type,
      game.programRunTime,
      game.location,
      game.resolved,
      game.resolvedString,
      game.gameString,
      game.gameUserNote,
      game.totalCashOnTable,
      game.gamePlayers,
      game.gameDebts
    );

    gameInstance.removePlayer(playerName);
    gameInstance.calculateTotalCash();

    const success = await md.Game.UpdateGameInDB(id, {
      gamePlayers: gameInstance.gamePlayers,
      totalCashOnTable: gameInstance.totalCashOnTable,
    });

    if (!success) {
      return res
        .status(500)
        .json({ message: "Failed to remove player from game" });
    }

    return res.status(200).json({ message: "Player removed successfully!" });
  } catch (error) {
    console.error("Error removing player from game:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function removeDebtFromGame(req, res) {
  try {
    const { id } = req.params;
    const { debtor, creditor } = req.body;

    if (!debtor || !creditor) {
      return res.status(400).json({
        message: "debtor and creditor are required",
      });
    }

    const game = await md.Game.GetAllGames(id);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Create game instance and remove debt
    const gameInstance = new md.Game(
      game._id,
      game.userID,
      game.userGameID,
      game.type,
      game.programRunTime,
      game.location,
      game.resolved,
      game.resolvedString,
      game.gameString,
      game.gameUserNote,
      game.totalCashOnTable,
      game.gamePlayers,
      game.gameDebts
    );

    gameInstance.removeDebt(debtor, creditor);

    const success = await md.Game.UpdateGameInDB(id, {
      gameDebts: gameInstance.gameDebts,
    });

    if (!success) {
      return res
        .status(500)
        .json({ message: "Failed to remove debt from game" });
    }

    return res.status(200).json({ message: "Debt removed successfully!" });
  } catch (error) {
    console.error("Error removing debt from game:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
