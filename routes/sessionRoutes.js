import express from "express";
import {
  createSession,
  getActiveSession,
  getUserSessions,
  saveData,
  saveFallAndSendAlert,
  updateSession,
} from "../controllers/sessionControllers.js";

const router = express.Router();

router.post("/create-session", createSession);

router.get("/active-session", getActiveSession);

router.put("/update-session", updateSession);

router.get("/user-sessions", getUserSessions);

router.post("/save-fall", saveFallAndSendAlert);

router.post("/save-data", saveData);

export default router;
