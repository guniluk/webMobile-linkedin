import express from "express";
import {
  getSuggestedConnections,
  getPublicProfile,
  updateProfile,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/suggestions", protectRoute, getSuggestedConnections);
router.get("/profile/:username", protectRoute, getPublicProfile);
router.put("/profile", protectRoute, updateProfile);

export default router;
