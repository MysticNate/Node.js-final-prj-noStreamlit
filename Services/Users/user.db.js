import { __dirname, __filename } from "../../global.js";
import bcrypt from "bcryptjs";
import * as mong from "mongodb";
import "dotenv/config"; // Sets the .env file

export async function findAllUsers() {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);
    return await db.collection(process.env.USER_COLLECTION).find({}).toArray();
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

export async function userLogin(email, pass) {
  // Find user by email
  let user = await findUserByEmail(email);
  // Try to match pass
  if (user && bcrypt.compareSync(pass, user.hash_password))
    // If match success => return user
    return user;

  // Else return null
  return null;
}
// No need for a Mongo Version :)

export async function findUserByEmail(email) {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);
    let collection = await db
      .collection(process.env.USER_COLLECTION)
      .find({})
      .toArray();
    let user = collection.find((u) => u.email == email);
    return user;
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

export async function findSpecificUser(_id) {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);
    let collection = await db
      .collection(process.env.USER_COLLECTION)
      .find({})
      .toArray();
    let user = collection.find((u) => u._id == _id);
    return user;
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

export async function AddUserToDB(user) {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);
    // user.pass = bcrypt.hashSync(user.pass, 10);
    await db.collection(process.env.USER_COLLECTION).insertOne(user);
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }

  // Log the user
  delete user.pass;
  console.log(user);
}

export async function addFavPlayerToUser(_id, favPlayer) {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);

    // First, check if the player already exists in the favPlayers array
    let existingUser = await db
      .collection(process.env.USER_COLLECTION)
      .findOne({
        _id: _id,
        "favPlayers.playerName": favPlayer.playerName,
      });

    if (existingUser) {
      throw new Error("Player already exists in favorites");
    }

    // Find the user and add the favPlayer to the favPlayers array
    let res = await db
      .collection(process.env.USER_COLLECTION)
      .updateOne({ _id: _id }, { $push: { favPlayers: favPlayer } });

    console.log(res);
    return res.modifiedCount > 0; // Return true if updated, false if user not found
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

export async function DeleteUserFromDBPhysical(_id) {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);
    let res = await db
      .collection(process.env.USER_COLLECTION)
      .deleteOne({ _id: _id });

    console.log(res);
    return res.deletedCount > 0; // Return true if deleted, false if not found
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

export async function DeleteUserFromDBLogical(_id) {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);
    let res = await db
      .collection(process.env.USER_COLLECTION)
      .updateOne({ _id: _id }, { $set: { isDeleted: true } });

    console.log(res);
    return res.modifiedCount > 0; // Return true if updated, false if not found or no changes made
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

export async function deleteFavPlayer(_id, favPlayerName) {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);

    // Remove the favorite player from the favPlayers array
    let res = await db
      .collection(process.env.USER_COLLECTION)
      .updateOne(
        { _id: _id },
        { $pull: { favPlayers: { playerName: favPlayerName } } }
      );

    console.log(res);
    return res.modifiedCount > 0; // Return true if updated, false if not found or no changes made
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

export async function UpdateUserEmailInDB(_id, newEmail, oldEmail) {
  let client = null;

  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);

    // First, verify that the current email matches the oldEmail parameter
    let user = await db
      .collection(process.env.USER_COLLECTION)
      .findOne({ _id: _id });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.email !== oldEmail) {
      throw new Error("Current email does not match the provided old email");
    }

    // If verification passes, proceed with the email update
    let res = await db
      .collection(process.env.USER_COLLECTION)
      .updateOne({ _id: _id }, { $set: { email: newEmail } });

    console.log(res);
    return res.modifiedCount > 0; // Return true if updated, false if no changes made
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

export async function UpdateUserPasswordInDB(_id, newPassword, oldPassword) {
  let client = null;

  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);

    // First, verify that the current email matches the oldEmail parameter
    let user = await db
      .collection(process.env.USER_COLLECTION)
      .findOne({ _id: _id });

    if (!user) {
      throw new Error("User not found");
    }

    let passwordMatch = bcrypt.compareSync(oldPassword, user.hash_password);
    if (!passwordMatch) {
      throw new Error("Old password must match.");
    }
    let newHashedPass = bcrypt.hashSync(newPassword, 12);

    // If verification passes, proceed with the email update
    let res = await db
      .collection(process.env.USER_COLLECTION)
      .updateOne({ _id: _id }, { $set: { hash_password: newHashedPass } });

    console.log(res);
    return res.modifiedCount > 0; // Return true if updated, false if no changes made
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

export async function UpdateUserUsernameInDB(_id, newUsername) {
  let client = null;

  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);

    // First, verify that the current email matches the oldEmail parameter
    let user = await db
      .collection(process.env.USER_COLLECTION)
      .findOne({ _id: _id });

    if (!user) {
      throw new Error("User not found");
    }

    let res = await db
      .collection(process.env.USER_COLLECTION)
      .updateOne({ _id: _id }, { $set: { username: newUsername } });

    console.log(res);
    return res.modifiedCount > 0; // Return true if updated, false if no changes made
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

// Profile Picture Functions
export async function updateUserProfilePicture(userId, profilePictureData) {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);

    // Don't convert to ObjectId - use direct string comparison like other functions
    let res = await db
      .collection(process.env.USER_COLLECTION)
      .updateOne(
        { _id: userId },
        { $set: { profilePicture: profilePictureData } }
      );

    console.log("Profile picture updated:", res);
    return res.modifiedCount > 0;
  } catch (error) {
    console.error("Error updating profile picture!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

export async function removeUserProfilePicture(userId) {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);

    // Don't convert to ObjectId - use direct string comparison like other functions
    let res = await db
      .collection(process.env.USER_COLLECTION)
      .updateOne({ _id: userId }, { $unset: { profilePicture: "" } });

    console.log("Profile picture removed:", res);
    return res.modifiedCount > 0;
  } catch (error) {
    console.error("Error removing profile picture!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

export async function UpdateUserAdminInDB(_id, userData) {
  let client = null;

  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);

    // First, verify that the user exists
    let user = await db
      .collection(process.env.USER_COLLECTION)
      .findOne({ _id: _id });

    if (!user) {
      throw new Error("User not found");
    }

    // Update the user with the provided data
    let res = await db
      .collection(process.env.USER_COLLECTION)
      .updateOne({ _id: _id }, { $set: userData });

    console.log("Admin user update result:", res);
    return res.modifiedCount > 0; // Return true if updated, false if no changes made
  } catch (error) {
    console.error("Error updating user (admin)!");
    throw error;
  } finally {
    if (client) client.close();
  }
}
