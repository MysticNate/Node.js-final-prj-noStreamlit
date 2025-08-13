import * as db from "./user.db.js";
import bcrypt from "bcryptjs";

import { ROLES } from "./user.roles.js";

export class FavPlayer {
  constructor(
    playerName,
    phone,
    email,
    group,
    profitLoss = 0,
    created = new Date(),
    updated = new Date()
  ) {
    this.playerName = playerName;
    this.phone = phone;
    this.email = email;
    this.group = group;
    this.profitLoss = profitLoss;
    this.created = created;
    this.updated = updated;
  }
}

export class User {
  constructor(
    _id,
    email,
    hash_password,
    username,
    role = ROLES.USER,
    created_at = new Date(),
    isDeleted = false,
    userStatistics = {
      gamesRecorded: 0,
      problemsSolved: 0,
      winningStreak: 0,
      maxProfitPersonal: 0,
      maxProfitGameID: null,
      maxChipsOnTable: 0,
      maxChipsOnTableGameID: null,
      maxLossAll: 0,
      maxProfitAll: 0,
      maxLossAllName: "",
      maxProfitAllName: "",
      maxLossAllGameID: null,
      maxProfitAllGameID: null,
    },
    favPlayers = [],
    profilePicture = null,
    isPasswordHashed = false
  ) {
    this._id = _id;
    this.email = email;

    // Hash the password if it's not already hashed
    if (!isPasswordHashed && hash_password) {
      this.hash_password = bcrypt.hashSync(hash_password, 12);
    } else {
      this.hash_password = hash_password;
    }

    this.username = username;
    this.role = role;
    this.created_at = created_at;
    this.isDeleted = isDeleted;
    this.userStatistics = userStatistics;
    this.favPlayers = favPlayers;
    this.profilePicture = profilePicture;
  }

  // Static factory method for creating user with async password hashing
  static async createUser(
    _id,
    email,
    plainPassword,
    username,
    role = ROLES.USER,
    created_at = new Date(),
    isDeleted = false,
    userStatistics = {
      gamesRecorded: 0,
      problemsSolved: 0,
      winningStreak: 0,
      maxProfitPersonal: 0,
      maxProfitGameID: null,
      maxChipsOnTable: 0,
      maxChipsOnTableGameID: null,
      maxLossAll: 0,
      maxProfitAll: 0,
      maxLossAllName: "",
      maxProfitAllName: "",
      maxLossAllGameID: null,
      maxProfitAllGameID: null,
    },
    favPlayers = []
  ) {
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    return new User(
      _id,
      email,
      hashedPassword,
      username,
      role,
      created_at,
      isDeleted,
      userStatistics,
      favPlayers,
      true // isPasswordHashed = true
    );
  }

  // Method to verify password
  async verifyPassword(plainPassword) {
    return await bcrypt.compare(plainPassword, this.hash_password);
  }

  // Method to update password with hashing
  async updatePassword(newPlainPassword) {
    this.hash_password = await bcrypt.hash(newPlainPassword, 12);
  }

  static async GetAllUsers(id) {
    if (!id) return await db.findAllUsers();

    // else
    return await db.findSpecificUser(id);
  }

  static async userLogin(email, pass) {
    return await db.userLogin(email, pass);
  }

  async AddUser() {
    let playerR = await db.AddUserToDB(this);
    if (playerR) {
      delete playerR.pass;
      return playerR;
    }
    return null;
  }

  static async addFavoritePlayer(_id, favPlayer) {
    let favPlayerGot = await db.addFavPlayerToUser(_id, favPlayer);
    if (favPlayerGot) {
      return favPlayerGot;
    }
    return null;
  }

  static async DeleteUserFromDBPhysical(id) {
    return await db.DeleteUserFromDBPhysical(id);
  }

  static async DeleteUserFromDBLogical(id) {
    return await db.DeleteUserFromDBLogical(id);
  }

  static async deleteFavPlayer(id, favPlayerName) {
    return await db.deleteFavPlayer(id, favPlayerName);
  }

  // WAYPOINT: Update methods
  static async UpdateUserEmailInDB(id, newEmail, oldEmail) {
    return await db.UpdateUserEmailInDB(id, newEmail, oldEmail);
  }
  static async UpdateUserPasswordInDB(id, newPassword, oldPassword) {
    return await db.UpdateUserPasswordInDB(id, newPassword, oldPassword);
  }
  static async UpdateUserUsernameInDB(id, newUsername) {
    return await db.UpdateUserUsernameInDB(id, newUsername);
  }

  static async UpdateUserAdminInDB(id, userData) {
    return await db.UpdateUserAdminInDB(id, userData);
  }

  // Profile Picture Methods
  static async updateUserProfilePicture(id, profilePictureData) {
    return await db.updateUserProfilePicture(id, profilePictureData);
  }

  static async removeUserProfilePicture(id) {
    return await db.removeUserProfilePicture(id);
  }

  static async playerLogin(email, pass) {
    return await db.playerLogin(email, pass);
  }

  // Helper methods for managing user statistics
  updateStatistics(newStats) {
    this.userStatistics = { ...this.userStatistics, ...newStats };
  }

  addFavoritePlayer(favPlayer) {
    if (favPlayer instanceof FavPlayer) {
      this.favPlayers.push(favPlayer);
    } else {
      // Create FavPlayer instance if plain object is passed
      this.favPlayers.push(
        new FavPlayer(
          favPlayer.playerName,
          favPlayer.phone,
          favPlayer.email,
          favPlayer.group,
          favPlayer.profitLoss,
          favPlayer.created,
          favPlayer.updated
        )
      );
    }
  }

  removeFavoritePlayer(playerName) {
    this.favPlayers = this.favPlayers.filter(
      (player) => player.playerName !== playerName
    );
  }

  updateFavoritePlayer(playerName, updates) {
    const playerIndex = this.favPlayers.findIndex(
      (player) => player.playerName === playerName
    );
    if (playerIndex !== -1) {
      this.favPlayers[playerIndex] = {
        ...this.favPlayers[playerIndex],
        ...updates,
        updated: new Date(),
      };
    }
  }

  softDelete() {
    this.isDeleted = true;
  }

  restore() {
    this.isDeleted = false;
  }

  toString() {
    return JSON.stringify({
      _id: this._id,
      email: this.email,
      hash_password: this.hash_password,
      username: this.username,
      role: this.role,
      created_at: this.created_at,
      isDeleted: this.isDeleted,
      userStatistics: this.userStatistics,
      favPlayers: this.favPlayers,
    });
  }

  toJSON() {
    return {
      _id: this._id,
      email: this.email,
      hash_password: this.hash_password,
      username: this.username,
      role: this.role,
      created_at: this.created_at,
      isDeleted: this.isDeleted,
      userStatistics: this.userStatistics,
      favPlayers: this.favPlayers,
    };
  }
}
