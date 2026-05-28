import { Router } from "express";
import { handleGitLabWebhook } from "../controllers/gitlab.controller";

const router = Router();

//If a POST request is sent to /gitlab, then handleGitLabWebhook() is executed
router.post("/gitlab", handleGitLabWebhook);

export default router;