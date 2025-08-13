import { Router } from "express";
import { authAdmin, authSelf } from "../../Middlewares/auth.js";
import multer from "multer";

import * as ctrl from "./user.controller.js";

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

const userRouter = Router();

userRouter
  .get("/", ctrl.getAllUsers)
  .get("/:id", ctrl.getUserById)
  .get("/test/cloudinary", ctrl.testCloudinary)
  .get("/test/profile-picture/:id", (req, res) => {
    res.json({
      message: `Test endpoint reached for user ${req.params.id}`,
      success: true,
    });
  })
  .post("/", ctrl.createNewUser)
  .post("/login", ctrl.loginUser)
  .post("/favPlayer/:id", authSelf, ctrl.addFavoritePlayer) // Specific route for addition of favPlayers
  .post(
    "/profile-picture/:id",
    authSelf,
    upload.single("profilePicture"),
    ctrl.uploadProfilePicture
  ) // Upload profile picture
  .put("/email/:id", authSelf, ctrl.updateUserEmail) // Specific route for email updates
  .put("/password/:id", authSelf, ctrl.updateUserPassword) // Specific route for password updates
  .put("/username/:id", authSelf, ctrl.updateUserUsername) // Specific route for username updates
  .put("/:id", authAdmin, ctrl.updateUserAdmin) // Admin route for updating user data
  .delete("/physical/:id", authAdmin, ctrl.deleteUserPhysical)
  .delete("/logical/:id", authAdmin, ctrl.deleteUserLogical)
  .delete("/favPlayer/:id", authSelf, ctrl.deleteFavPlayer)
  .delete("/profile-picture/:id", authSelf, ctrl.deleteProfilePicture); // Delete profile picture

// // Default exportation allows to not use '{}' when importing.
// // e.g. import userRouter from "../Users/user.router";
// // NOT import { userRouter } from "../Users/user.router";
export default userRouter;
