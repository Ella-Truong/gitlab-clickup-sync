/**
 * Processing Gitlab webhook data before publishing events
 */
import { Request, Response } from "express";
import { processWebhook } from "../services/gitlab.service";
import { GitHubEventType } from "../../../shared/src/types/github.types";

export const handleGitHubWebhook = async (
    req: Request,
    res: Response,
) => {
    try {
        const eventType = req.header(
            "X-GitHub-Event",
        ) as GitHubEventType;
        
        await processWebhook(req.body, eventType);
        
        return res.status(200).json({
            success: true,
            message: "Webhook published",
        })
    }catch(error){
        console.error(error);

        return res.status(500).json({
            success: false
        });
    }
};