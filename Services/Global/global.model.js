import {
  findGlobalStats,
  CreateGlobalStatsIfNotExists,
  UpdateGlobalStats,
  IncrementGlobalStats,
  ResetGlobalStats,
} from "./global.db.js";

export class Global {
  constructor(
    _id = "Global",
    totalGamesRecorded = 0,
    totalProblemsSolved = 0,
    totalUsers = 0
  ) {
    this._id = _id;
    this.totalGamesRecorded = totalGamesRecorded;
    this.totalProblemsSolved = totalProblemsSolved;
    this.totalUsers = totalUsers;
  }

  // Static method to get global stats
  static async getGlobalStats() {
    try {
      // Ensure global document exists, create if not
      const globalData = await CreateGlobalStatsIfNotExists();
      return new Global(
        globalData._id,
        globalData.totalGamesRecorded,
        globalData.totalProblemsSolved,
        globalData.totalUsers
      );
    } catch (error) {
      console.error("Error getting global stats:", error);
      throw error;
    }
  }

  // Static method to update global stats
  static async updateGlobalStats(updates) {
    try {
      const success = await UpdateGlobalStats(updates);
      if (success) {
        return await Global.getGlobalStats();
      }
      return null;
    } catch (error) {
      console.error("Error updating global stats:", error);
      throw error;
    }
  }

  // Static method to increment/decrement specific stat
  static async incrementStat(field, value = 1) {
    try {
      const success = await IncrementGlobalStats(field, value);
      if (success) {
        return await Global.getGlobalStats();
      }
      return null;
    } catch (error) {
      console.error("Error incrementing stat:", error);
      throw error;
    }
  }

  // Static method to reset all stats to 0
  static async resetStats() {
    try {
      const success = await ResetGlobalStats();
      if (success) {
        return await Global.getGlobalStats();
      }
      return null;
    } catch (error) {
      console.error("Error resetting stats:", error);
      throw error;
    }
  }

  // Specific increment methods for tracking
  static async incrementGamesRecorded(value = 1) {
    return await Global.incrementStat("totalGamesRecorded", value);
  }

  static async incrementProblemsSolved(value = 1) {
    return await Global.incrementStat("totalProblemsSolved", value);
  }

  static async incrementTotalUsers(value = 1) {
    return await Global.incrementStat("totalUsers", value);
  }

  // Decrement methods for when things are deleted
  static async decrementGamesRecorded(value = 1) {
    return await Global.incrementStat("totalGamesRecorded", -value);
  }

  static async decrementProblemsSolved(value = 1) {
    return await Global.incrementStat("totalProblemsSolved", -value);
  }

  static async decrementTotalUsers(value = 1) {
    return await Global.incrementStat("totalUsers", -value);
  }

  // Helper method to get current stats as plain object
  toObject() {
    return {
      _id: this._id,
      totalGamesRecorded: this.totalGamesRecorded,
      totalProblemsSolved: this.totalProblemsSolved,
      totalUsers: this.totalUsers,
    };
  }

  // Helper method to validate global stats data
  static isValidGlobalData(data) {
    return (
      data &&
      typeof data === "object" &&
      typeof data.totalGamesRecorded === "number" &&
      typeof data.totalProblemsSolved === "number" &&
      typeof data.totalUsers === "number" &&
      data.totalGamesRecorded >= 0 &&
      data.totalProblemsSolved >= 0 &&
      data.totalUsers >= 0
    );
  }
}
