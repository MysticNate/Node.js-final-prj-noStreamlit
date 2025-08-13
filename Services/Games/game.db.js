import { __dirname, __filename } from "../../global.js";
import * as mong from "mongodb";
import "dotenv/config"; // Sets the .env file

export async function findAllGames() {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);
    return await db.collection(process.env.GAMES_COLLECTION).find({}).toArray();
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

export async function findSpecificGame(_id) {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);
    let collection = await db
      .collection(process.env.GAMES_COLLECTION)
      .find({})
      .toArray();
    let game = collection.find((g) => g._id == _id);
    return game;
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

export async function findGamesByUser(userID) {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);
    let collection = await db
      .collection(process.env.GAMES_COLLECTION)
      .find({})
      .toArray();
    let games = collection.filter((g) => g.userID == userID);
    return games;
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

export async function AddGameToDB(game) {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);
    await db.collection(process.env.GAMES_COLLECTION).insertOne(game);
    return true;
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

export async function DeleteGameFromDB(_id) {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);
    let res = await db
      .collection(process.env.GAMES_COLLECTION)
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

export async function UpdateGameInDB(_id, updates) {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);

    // First, verify that the game exists
    let game = await db
      .collection(process.env.GAMES_COLLECTION)
      .findOne({ _id: _id });

    if (!game) {
      throw new Error("Game not found");
    }

    // If verification passes, proceed with the game update
    let res = await db
      .collection(process.env.GAMES_COLLECTION)
      .updateOne({ _id: _id }, { $set: updates });

    console.log(res);
    return res.modifiedCount > 0; // Return true if updated, false if no changes made
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}
