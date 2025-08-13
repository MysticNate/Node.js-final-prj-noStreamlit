import { __dirname, __filename } from "../../global.js";
import * as mong from "mongodb";
import "dotenv/config"; // Sets the .env file

export async function findGlobalStats() {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);
    // Since there's only one global document, find it by _id
    return await db
      .collection(process.env.GLOBAL_COLLECTION)
      .findOne({ _id: "Global" });
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

export async function CreateGlobalStatsIfNotExists() {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);

    // Check if global document exists
    const existing = await db
      .collection(process.env.GLOBAL_COLLECTION)
      .findOne({ _id: "Global" });

    if (!existing) {
      // Create initial global document
      const initialGlobal = {
        _id: "Global",
        totalGamesRecorded: 0,
        totalProblemsSolved: 0,
        totalUsers: 0,
      };
      await db
        .collection(process.env.GLOBAL_COLLECTION)
        .insertOne(initialGlobal);
      return initialGlobal;
    }

    return existing;
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

export async function UpdateGlobalStats(updates) {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);

    // Update the global document
    let res = await db
      .collection(process.env.GLOBAL_COLLECTION)
      .updateOne({ _id: "Global" }, { $set: updates });

    console.log(res);
    return res.modifiedCount > 0; // Return true if updated, false if no changes made
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

export async function IncrementGlobalStats(field, value = 1) {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);

    // Use $inc to increment/decrement the field
    let res = await db
      .collection(process.env.GLOBAL_COLLECTION)
      .updateOne({ _id: "Global" }, { $inc: { [field]: value } });

    console.log(res);
    return res.modifiedCount > 0; // Return true if updated, false if no changes made
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}

export async function ResetGlobalStats() {
  let client = null;
  try {
    client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
    const db = client.db(process.env.DB_NAME);

    // Reset all stats to 0
    const resetStats = {
      totalGamesRecorded: 0,
      totalProblemsSolved: 0,
      totalUsers: 0,
    };

    let res = await db
      .collection(process.env.GLOBAL_COLLECTION)
      .updateOne({ _id: "Global" }, { $set: resetStats });

    console.log(res);
    return res.modifiedCount > 0; // Return true if updated, false if no changes made
  } catch (error) {
    console.error("Error!");
    throw error;
  } finally {
    if (client) client.close();
  }
}
