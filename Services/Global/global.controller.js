import { Global } from "./global.model.js";

// GET: Get global statistics
export async function getGlobalStats(req, res) {
  try {
    const globalStats = await Global.getGlobalStats();

    if (!globalStats) {
      return res.status(404).json({
        success: false,
        message: "Global statistics not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Global statistics retrieved successfully",
      data: globalStats.toObject(),
    });
  } catch (error) {
    console.error("Error getting global stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// PUT: Update global statistics (manual update)
export async function updateGlobalStats(req, res) {
  try {
    const updates = req.body;

    // Validate that we're not trying to update the _id
    if (updates._id && updates._id !== "Global") {
      return res.status(400).json({
        success: false,
        message: "Cannot change global document ID",
      });
    }

    // Remove _id from updates if present
    delete updates._id;

    // Validate the updates
    if (!Global.isValidGlobalData({ ...updates, _id: "Global" })) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid global statistics data. All fields must be non-negative numbers.",
      });
    }

    const updatedGlobal = await Global.updateGlobalStats(updates);

    if (!updatedGlobal) {
      return res.status(404).json({
        success: false,
        message: "Failed to update global statistics",
      });
    }

    res.status(200).json({
      success: true,
      message: "Global statistics updated successfully",
      data: updatedGlobal.toObject(),
    });
  } catch (error) {
    console.error("Error updating global stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// PUT: Increment a specific statistic
export async function incrementGlobalStat(req, res) {
  try {
    const { field } = req.params;
    const { value = 1 } = req.body;

    // Validate field
    const validFields = [
      "totalGamesRecorded",
      "totalProblemsSolved",
      "totalUsers",
    ];
    if (!validFields.includes(field)) {
      return res.status(400).json({
        success: false,
        message: `Invalid field. Must be one of: ${validFields.join(", ")}`,
      });
    }

    // Validate value
    if (typeof value !== "number") {
      return res.status(400).json({
        success: false,
        message: "Value must be a number",
      });
    }

    const updatedGlobal = await Global.incrementStat(field, value);

    if (!updatedGlobal) {
      return res.status(404).json({
        success: false,
        message: "Failed to increment global statistic",
      });
    }

    res.status(200).json({
      success: true,
      message: `${field} ${
        value >= 0 ? "incremented" : "decremented"
      } successfully`,
      data: updatedGlobal.toObject(),
    });
  } catch (error) {
    console.error("Error incrementing global stat:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// PUT: Reset all statistics to 0
export async function resetGlobalStats(req, res) {
  try {
    const resetGlobal = await Global.resetStats();

    if (!resetGlobal) {
      return res.status(404).json({
        success: false,
        message: "Failed to reset global statistics",
      });
    }

    res.status(200).json({
      success: true,
      message: "Global statistics reset successfully",
      data: resetGlobal.toObject(),
    });
  } catch (error) {
    console.error("Error resetting global stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// POST: Initialize global statistics (if needed)
export async function initializeGlobalStats(req, res) {
  try {
    const globalStats = await Global.getGlobalStats();

    res.status(200).json({
      success: true,
      message: "Global statistics initialized successfully",
      data: globalStats.toObject(),
    });
  } catch (error) {
    console.error("Error initializing global stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// Helper functions for automatic tracking (to be called from other services)
export async function trackGameAdded() {
  try {
    return await Global.incrementGamesRecorded();
  } catch (error) {
    console.error("Error tracking game added:", error);
    throw error;
  }
}

export async function trackGameDeleted() {
  try {
    return await Global.decrementGamesRecorded();
  } catch (error) {
    console.error("Error tracking game deleted:", error);
    throw error;
  }
}

export async function trackProblemSolved() {
  try {
    return await Global.incrementProblemsSolved();
  } catch (error) {
    console.error("Error tracking problem solved:", error);
    throw error;
  }
}

export async function trackProblemUnsolved() {
  try {
    return await Global.decrementProblemsSolved();
  } catch (error) {
    console.error("Error tracking problem unsolved:", error);
    throw error;
  }
}

export async function trackUserAdded() {
  try {
    return await Global.incrementTotalUsers();
  } catch (error) {
    console.error("Error tracking user added:", error);
    throw error;
  }
}

export async function trackUserRemoved() {
  try {
    return await Global.decrementTotalUsers();
  } catch (error) {
    console.error("Error tracking user removed:", error);
    throw error;
  }
}
