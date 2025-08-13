import { SECRET } from "../global.js";
import { ROLES } from "../Services/Users/user.roles.js";
import jwt from "jsonwebtoken";
import { findSpecificGame } from "../Services/Games/game.db.js";

export async function authAdmin(req, res, next) {
  let token = req.headers.authorization.split(" ")[1];
  // Get the user from the token
  let user = jwt.verify(token, SECRET);
  console.log(user);

  let role = user.role;
  if (role != ROLES.ADMIN)
    return res.status(403).json({ message: "Auth failed!" });
  // If all good continue (next)
  next();
}

export async function authUser(req, res, next) {
  try {
    // Check if authorization header exists
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "No token provided" });
    }

    let token = req.headers.authorization.split(" ")[1];
    // Get the user from the token
    let user = jwt.verify(token, SECRET);
    console.log(user);

    // Add the verified user to the request object for use in controllers
    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(401).json({ message: "Authentication failed" });
  }
}

export async function authSelf(req, res, next) {
  try {
    // Check if authorization header exists
    if (!req.headers.authorization) {
      console.log("No authorization header provided");
      return res.status(401).json({ message: "No token provided" });
    }

    let token = req.headers.authorization.split(" ")[1];
    // Get the user from the token
    let user = jwt.verify(token, SECRET);
    console.log("Verified user from token:", user);

    // Get the user ID from the URL parameters (handle both :id and :userId patterns)
    const requestedUserId = req.params.id || req.params.userId;
    console.log("Requested user ID from URL:", requestedUserId);
    console.log("Token user ID:", user._id);
    console.log("IDs match:", user._id === requestedUserId);
    console.log("User role:", user.role);

    // Check if the token's user ID matches the requested user ID
    // OR if the user is an admin (admins can access any user)
    if (user._id === requestedUserId || user.role === ROLES.ADMIN) {
      // Add the verified user to the request object for use in controllers
      req.user = user;
      console.log("Authentication successful, proceeding...");
      return next();
    }

    // If neither the same user nor admin, deny access
    console.log("Access denied - user can only access own resources");
    return res.status(403).json({
      message: "Access denied. You can only access your own resources.",
    });
  } catch (error) {
    console.log("Authentication error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(401).json({ message: "Authentication failed" });
  }
}

export async function authGame(req, res, next) {
  try {
    // Check if authorization header exists
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "No token provided" });
    }

    let token = req.headers.authorization.split(" ")[1];
    // Get the user from the token
    let user = jwt.verify(token, SECRET);
    console.log(user);

    let role = user.role;

    // If admin, allow access
    if (role === ROLES.ADMIN) {
      req.user = user; // Add user to request for controller use
      return next();
    }

    // If not admin, check if the user owns the game
    const gameId = req.params.id || req.params.gameId;
    if (!gameId) {
      return res.status(400).json({ message: "Game ID is required" });
    }

    // Get the game from database and check ownership
    const game = await findSpecificGame(gameId);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Check if the current user created this game
    if (user._id === game.userID) {
      req.user = user; // Add user to request
      req.game = game; // Add game to request for controller use
      return next();
    }

    // If neither admin nor owner, deny access
    return res.status(403).json({
      message: "Access denied. You can only access games you created.",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(401).json({ message: "Authentication failed" });
  }
}
