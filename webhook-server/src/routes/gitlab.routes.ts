import { Router } from "express";
import { handleGitHubWebhook } from "../controllers/github.controller";

const router = Router();

//If a POST request is sent to /gitlab, then handleGitLabWebhook() is executed
router.post("/gitlab", handleGitHubWebhook);

export default router;