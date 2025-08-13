import { __dirname, __filename } from "./global.js";
import { User } from "./Services/Users/user.model.js";

import { exec } from "child_process";
import { promisify } from "util";

import * as mong from "mongodb";
import bcrypt from "bcryptjs";

import "dotenv/config"; // Sets the .env file

const execAsync = promisify(exec); // This will execute the CMD


export async function CreatePokerMateMongo() {
  db = db.getSiblingDB("PokerMateJSFinal");

  db.Users.drop();

  db.createCollection("Users");

  for (let i = 0; i < 100; i++) {
    const firstNames = [
      "Avigail",
      "Yitzhak",
      "Rivka",
      "Moshe",
      "Sarah",
      "David",
      "Leah",
      "Shmuel",
      "Esther",
      "Yonatan",
    ];
    const lastNames = [
      "Cohen",
      "Levi",
      "Mizrahi",
      "Friedman",
      "Weiss",
      "Ben-David",
      "Grossman",
      "Katz",
      "Goldberg",
      "Peretz",
    ];
    const lastE = ["gmail.com", "google.com", "ruppin.com"];

    for (let i = 1; i <= 100; i++) {
      let fName = firstNames[Math.floor(Math.random() * firstNames.length)];
      let lName = lastNames[Math.floor(Math.random() * lastNames.length)];
      let email = `${fName}${lName}@${
        lastE[Math.floor(Math.random() * lastE.length)]
      }`;

      let buyIn = Math.floor(Math.random() * 1000) + 1;
      let buyOut = Math.floor(Math.random() * 1000) + 1;

      let pass = bcrypt.hashSync(`${fName}_${i}`, 10);

      let player = new User(i, email, pass, fName, lName, buyIn, buyOut);

      let client = null;
      try {
        client = await mong.MongoClient.connect(process.env.CONNECTION_STRING);
        const db = client.db(process.env.DB_NAME);
        await db.collection(process.env.COLLECTION_NAME).insertOne(player);
      } catch (error) {
        console.error("Error!");
        throw error;
      } finally {
        if (client) client.close();
      }
    }
  }
}

export async function runMongoCreationCMD() {
  const scriptPath = process.env.CMD_MONGO_CREATE_BAT_LOCATION;
  // "C:\\Users\\Giora\\Desktop\\Mongo_BAT_Ops\\run_mongo_script.bat";

  try {
    console.log(`Executing MongoDB script at: ${scriptPath}`);

    // Execute the batch file
    const { stdout, stderr } = await execAsync(`"${scriptPath}"`);

    if (stdout) {
      console.log("Script output:", stdout);
    }

    if (stderr) {
      console.warn("Script warnings/errors:", stderr);
    }

    console.log("MongoDB script executed successfully!");
    return { success: true, output: stdout, error: stderr };
  } catch (error) {
    console.error("Error executing MongoDB script:", error.message);
    return { success: false, error: error.message };
  }
}
