/**
 * Processing Gitlab webhook data before publishing events
 */
import { Request, Response } from "express";
import { processWebhook } from "../services/github.service";

export const handleGitHubWebhook = async (
    req: Request,
    res: Response,
) => {
    const webhookType = req.header("X-GitHub-Event") as string;

    if(!webhookType){
        res.status(400).json({
            error: "Missing X-GitHub-Event header"
        });
    };

    await processWebhook(req.body, webhookType);

    res.status(200).json({
        sucess: true,
    })
};