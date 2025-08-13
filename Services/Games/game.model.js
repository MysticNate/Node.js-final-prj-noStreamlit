import * as db from "./game.db.js";

export class GamePlayer {
  constructor(playerName, buyIn, cashOut, profitLoss = cashOut - buyIn) {
    this.playerName = playerName;
    this.buyIn = buyIn;
    this.cashOut = cashOut;
    this.profitLoss = profitLoss;
  }
}

export class GameDebt {
  constructor(debtor, creditor, amount, paymentType = "default") {
    this.debtor = debtor;
    this.creditor = creditor;
    this.amount = amount;
    this.paymentType = paymentType;
  }
}

export class Game {
  constructor(
    _id,
    userID,
    userGameID,
    type,
    programRunTime = new Date(),
    location,
    resolved = false,
    resolvedString = "",
    gameString = "",
    gameUserNote = "",
    totalCashOnTable = 0,
    gamePlayers = [],
    gameDebts = []
  ) {
    this._id = _id;
    this.userID = userID;
    this.userGameID = userGameID;
    this.type = type;
    this.programRunTime = programRunTime;
    this.location = location;
    this.resolved = resolved;
    this.resolvedString = resolvedString;
    this.gameString = gameString;
    this.gameUserNote = gameUserNote;
    this.totalCashOnTable = totalCashOnTable;
    this.gamePlayers = gamePlayers;
    this.gameDebts = gameDebts;
  }

  // Helper methods for managing game players
  addPlayer(player) {
    if (player instanceof GamePlayer) {
      this.gamePlayers.push(player);
    } else {
      // Create GamePlayer instance if plain object is passed
      this.gamePlayers.push(
        new GamePlayer(
          player.playerName,
          player.buyIn,
          player.cashOut,
          player.profitLoss
        )
      );
    }
  }

  removePlayer(playerName) {
    this.gamePlayers = this.gamePlayers.filter(
      (player) => player.playerName !== playerName
    );
  }

  updatePlayer(playerName, updates) {
    const playerIndex = this.gamePlayers.findIndex(
      (player) => player.playerName === playerName
    );
    if (playerIndex !== -1) {
      this.gamePlayers[playerIndex] = {
        ...this.gamePlayers[playerIndex],
        ...updates,
      };
      // Recalculate profit/loss if buyIn or cashOut changed
      if (updates.buyIn !== undefined || updates.cashOut !== undefined) {
        this.gamePlayers[playerIndex].profitLoss =
          this.gamePlayers[playerIndex].cashOut -
          this.gamePlayers[playerIndex].buyIn;
      }
    }
  }

  // Helper methods for managing game debts
  addDebt(debt) {
    if (debt instanceof GameDebt) {
      this.gameDebts.push(debt);
    } else {
      // Create GameDebt instance if plain object is passed
      this.gameDebts.push(
        new GameDebt(debt.debtor, debt.creditor, debt.amount, debt.paymentType)
      );
    }
  }

  removeDebt(debtor, creditor) {
    this.gameDebts = this.gameDebts.filter(
      (debt) => !(debt.debtor === debtor && debt.creditor === creditor)
    );
  }

  // Calculate total cash on table from players
  calculateTotalCash() {
    this.totalCashOnTable = this.gamePlayers.reduce(
      (total, player) => total + player.buyIn,
      0
    );
    return this.totalCashOnTable;
  }

  // Mark game as resolved
  markResolved(resolvedString) {
    this.resolved = true;
    this.resolvedString = resolvedString;
  }

  // Static methods for database operations
  static async GetAllGames(id) {
    if (!id) return await db.findAllGames();
    return await db.findSpecificGame(id);
  }

  static async GetGamesByUser(userID) {
    return await db.findGamesByUser(userID);
  }

  async AddGame() {
    return await db.AddGameToDB(this);
  }

  static async DeleteGameFromDB(id) {
    return await db.DeleteGameFromDB(id);
  }

  static async UpdateGameInDB(id, updates) {
    return await db.UpdateGameInDB(id, updates);
  }

  toString() {
    return JSON.stringify({
      _id: this._id,
      userID: this.userID,
      userGameID: this.userGameID,
      type: this.type,
      programRunTime: this.programRunTime,
      location: this.location,
      resolved: this.resolved,
      resolvedString: this.resolvedString,
      gameString: this.gameString,
      gameUserNote: this.gameUserNote,
      totalCashOnTable: this.totalCashOnTable,
      gamePlayers: this.gamePlayers,
      gameDebts: this.gameDebts,
    });
  }

  toJSON() {
    return {
      _id: this._id,
      userID: this.userID,
      userGameID: this.userGameID,
      type: this.type,
      programRunTime: this.programRunTime,
      location: this.location,
      resolved: this.resolved,
      resolvedString: this.resolvedString,
      gameString: this.gameString,
      gameUserNote: this.gameUserNote,
      totalCashOnTable: this.totalCashOnTable,
      gamePlayers: this.gamePlayers,
      gameDebts: this.gameDebts,
    };
  }
}
