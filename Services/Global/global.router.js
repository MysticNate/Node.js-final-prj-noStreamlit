import { Router } from "express";
import { authAdmin } from "../../Middlewares/auth.js";
import {
  getGlobalStats,
  updateGlobalStats,
  incrementGlobalStat,
  resetGlobalStats,
  initializeGlobalStats,
} from "./global.controller.js";

const router = Router();

// GET: Get global statistics (admin only)
router.get("/", authAdmin, getGlobalStats);

// PUT: Update global statistics manually (admin only)
router.put("/", authAdmin, updateGlobalStats);

// PUT: Increment/decrement specific statistic (admin only)
router.put("/increment/:field", authAdmin, incrementGlobalStat);

// PUT: Reset all statistics to 0 (admin only)
router.put("/reset", authAdmin, resetGlobalStats);

export default router;
