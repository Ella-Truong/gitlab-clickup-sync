/**
 * Handles incoming GitHub webhook requests.
 *
 * Extracts the GitHub event type from the request header
 * and delegates processing to the GitHub service.
 */

import { Request, Response } from "express";
import { processWebhook } from "../services/github.service";

export const handleGitHubWebhook = async (
    req: Request,
    res: Response,
) => {
    try {
        const webhookType = req.header("X-GitHub-Event");

        if (!webhookType) {
            return res.status(400).json({
                error: "Missing X-GitHub-Event header",
            });
        }

        await processWebhook(req.body, webhookType);
        console.log(webhookType);

        return res.status(200).json({
            success: true,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to process webhook",
        });
    }
};