import { SECRET } from "../../global.js";
import * as md from "./user.model.js";
import cloudinary from "../cloudinary.config.js";
import "dotenv/config";
import jwt from "jsonwebtoken";
import {
  trackUserAdded,
  trackUserRemoved,
} from "../Global/global.controller.js";

// .get("/", getAllUsers)
//   .get("/:id", getUserById)
//   .post("/", createNewUser)
//   .put("/:id", updateUser)
//   .delete("/:id", deleteUser);

export async function getAllUsers(req, res) {
  // res.send("Hello I'm the getALLUsers :D:D:D");

  let users = await md.User.GetAllUsers();

  if (!users) return res.status(404).json({ message: "No users found" });

  //else
  return res.status(200).json({ message: "Here are the users", users });
}

export async function getUserById(req, res) {
  let { id } = req.params;

  // // We have a string so it's ok, - Commented below
  // // If id is not a number do not call function
  // if (isNaN(id)) return res.status(400).json({ message: "Bad request.." });

  let user = await md.User.GetAllUsers(id);

  if (!user) return res.status(404).json({ message: "Not Found." });

  //else
  return res.status(200).json({ message: `Here is user with ID ${id}`, user });
}

// WAYPOINT ADD \\
export async function createNewUser(req, res) {
  let { id, email, pass, username } = req.body;

  if (!id || !email || !pass || !username)
    return res.status(400).json({ message: "Some data is missing.." });

  if (pass.length < 5)
    return res.status(403).json({ message: "Password is too small.." });

  let user = new md.User(id, email, pass, username);

  try {
    // If all is good.. continue
    await user.AddUser();

    // Track user addition in global stats
    await trackUserAdded();

    let token = jwt.sign(user.toJSON(), SECRET, {
      algorithm: process.env.JWT_ALGORITHM,
      expiresIn: process.env.JWT_LOGIN_TIME,
    });
    return res.status(201).json({ message: "User added successfully!", token });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Failed to create user" });
  }
}

// "playerName": "GeorgeTheBoss",
//   "phone": "054-2422222",
//   "email": "gg@gg.com",
//   "group": "TheBoyz"
// }
export async function addFavoritePlayer(req, res) {
  const id = req.params.id;
  let { playerName, phone, email, group } = req.body;

  if (!playerName || !phone || !email || !group)
    return res.status(400).json({ message: "Some data is missing.." });

  // Validate email format (basic validation)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format",
    });
  }

  let favPlayer = new md.FavPlayer(playerName, phone, email, group);

  // If all is good.. continue
  await md.User.addFavoritePlayer(id, favPlayer);

  return res
    .status(201)
    .json({ message: "Favorite Player added successfully!" });
}

export async function deleteUserPhysical(req, res) {
  const id = req.params.id;

  try {
    const success = await md.User.DeleteUserFromDBPhysical(id);

    if (!success) {
      return res.status(404).json({ message: "User not found" });
    }

    // Track user removal in global stats
    await trackUserRemoved();

    return res.json({ message: "User physically deleted successfully!" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Failed to delete user" });
  }
}

export async function deleteUserLogical(req, res) {
  const id = req.params.id;
  const success = await md.User.DeleteUserFromDBLogical(id);

  if (!success) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ message: "User logically deleted successfully!" });
}

export async function deleteFavPlayer(req, res) {
  const id = req.params.id;
  let { favPlayerName } = req.body;
  const success = await md.User.deleteFavPlayer(id, favPlayerName);

  if (!success) {
    return res
      .status(404)
      .json({ message: "User / Favorite player not found" });
  }

  return res.json({ message: "Favorite player deleted successfully!" });
}

// WAYPOINT: Update function
export async function updateUserEmail(req, res) {
  try {
    const id = req.params.id;

    // Check if req.body exists
    if (!req.body) {
      return res.status(400).json({
        message:
          "Request body is missing. Make sure to send JSON data with Content-Type: application/json header",
      });
    }

    const { newEmail, oldEmail } = req.body;

    // Validate input
    if (!newEmail || !oldEmail) {
      return res.status(400).json({
        message: "Both newEmail and oldEmail are required",
      });
    }

    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    const success = await md.User.UpdateUserEmailInDB(id, newEmail, oldEmail);

    if (!success) {
      return res
        .status(404)
        .json({ message: "User not found or email update failed" });
    }

    return res.json({ message: "User email updated successfully!" });
  } catch (error) {
    console.error("Error updating user email:", error);

    if (error.message === "User not found") {
      return res.status(404).json({ message: "User not found" });
    } else if (
      error.message === "Current email does not match the provided old email"
    ) {
      return res.status(400).json({
        message: "Current email does not match the provided old email",
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateUserPassword(req, res) {
  const id = req.params.id;

  const { newPassword, oldPassword } = req.body;

  const success = await md.User.UpdateUserPasswordInDB(
    id,
    newPassword,
    oldPassword
  );

  if (!success) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ message: "User password updated successfully!" });
}
export async function updateUserUsername(req, res) {
  const id = req.params.id;

  const { newUsername } = req.body;

  const success = await md.User.UpdateUserUsernameInDB(id, newUsername);

  if (!success) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ message: "User username updated successfully!" });
}

export async function updateUserAdmin(req, res) {
  const id = req.params.id;
  const userData = req.body;

  // Validate required fields
  if (!userData.username || !userData.email || !userData.role) {
    return res
      .status(400)
      .json({ message: "Username, email, and role are required" });
  }

  try {
    const success = await md.User.UpdateUserAdminInDB(id, userData);

    if (!success) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User updated successfully!" });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// WAYPOINT LOGIN \\
export async function loginUser(req, res) {
  let { email, pass } = req.body;

  if (!email || !pass) {
    return res.status(400).json({ message: "Some or all credentials are missing.." });
  }

  let user = await md.User.userLogin(email, pass);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials!" });
  }

  // Convert to plain object and remove password
  const userPayload = {
    _id: user._id,
    email: user.email,
    role: user.role
  };

  let token = jwt.sign(userPayload, SECRET, {
    algorithm: process.env.JWT_ALGORITHM,
    expiresIn: process.env.JWT_LOGIN_TIME,
  });

  return res.status(200).json({ message: "Login Successful!", token });
}

// PROFILE PICTURE FUNCTIONS

// Test Cloudinary connection
export async function testCloudinary(req, res) {
  try {
    console.log("Testing Cloudinary connection...");

    // Test API connection by getting account details
    const result = await cloudinary.api.ping();
    console.log("Cloudinary ping result:", result);

    // Also test the configuration
    console.log("Cloudinary config:", {
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key,
      // Don't log the secret for security
      has_api_secret: !!cloudinary.config().api_secret,
    });

    res.status(200).json({
      message: "Cloudinary connection successful!",
      result: result,
      config: {
        cloud_name: cloudinary.config().cloud_name,
        api_key: cloudinary.config().api_key,
      },
    });
  } catch (error) {
    console.error("Cloudinary test error:", error);
    res.status(500).json({
      message: "Cloudinary connection failed",
      error: error.message,
    });
  }
}

export async function uploadProfilePicture(req, res) {
  try {
    console.log("Upload profile picture called");
    const { id } = req.params;
    console.log("User ID:", id);

    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log(
      "File received:",
      req.file.originalname,
      "Size:",
      req.file.size
    );

    // Check if user exists
    const user = await md.User.GetAllUsers(id);
    console.log("User found:", user ? "Yes" : "No");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user already has a profile picture, delete it from Cloudinary
    if (user.profilePicture && user.profilePicture.cloudinaryId) {
      console.log("Deleting existing profile picture");
      try {
        await cloudinary.uploader.destroy(user.profilePicture.cloudinaryId);
      } catch (deleteError) {
        console.log("Error deleting old image:", deleteError.message);
      }
    }

    console.log("Starting Cloudinary upload");
    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "poker_profiles",
            public_id: `user_${id}_${Date.now()}`,
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" },
              { quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(req.file.buffer);
    });

    console.log("Cloudinary upload successful:", uploadResult.public_id);

    // Create thumbnail URL
    const thumbnailUrl = cloudinary.url(uploadResult.public_id, {
      width: 150,
      height: 150,
      crop: "fill",
      gravity: "face",
    });

    // Update user with profile picture information
    const profilePictureData = {
      cloudinaryId: uploadResult.public_id,
      url: uploadResult.secure_url,
      thumbnailUrl: thumbnailUrl,
      uploadedAt: new Date(),
    };

    console.log("Updating user in database with profile picture data");
    const updatedUser = await md.User.updateUserProfilePicture(
      id,
      profilePictureData
    );

    if (!updatedUser) {
      console.log("Failed to update user in database");
      return res
        .status(500)
        .json({ message: "Failed to update user profile picture" });
    }

    console.log("Profile picture upload completed successfully");
    res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePicture: profilePictureData,
    });
  } catch (error) {
    console.error("Profile picture upload error:", error);
    res.status(500).json({
      message: "Failed to upload profile picture",
      error: error.message,
    });
  }
}

export async function deleteProfilePicture(req, res) {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await md.User.GetAllUsers(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has a profile picture
    if (!user.profilePicture || !user.profilePicture.cloudinaryId) {
      return res.status(404).json({ message: "No profile picture found" });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(user.profilePicture.cloudinaryId);

    // Remove profile picture from user document
    const updatedUser = await md.User.removeUserProfilePicture(id);

    if (!updatedUser) {
      return res
        .status(500)
        .json({ message: "Failed to remove profile picture from user" });
    }

    res.status(200).json({ message: "Profile picture deleted successfully" });
  } catch (error) {
    console.error("Profile picture deletion error:", error);
    res.status(500).json({
      message: "Failed to delete profile picture",
      error: error.message,
    });
  }
}
