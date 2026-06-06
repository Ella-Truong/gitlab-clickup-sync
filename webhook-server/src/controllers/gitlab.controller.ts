/**
 * Processing Gitlab webhook data before publishing events
 */
import { Request, Response } from "express";
import { processWebhook } from "../services/gitlab.service";
import { GitLabPayload } from "../../../shared/src/types/gitlab.types";

export const handleGitLabWebhook = async (
    req: Request,
    res: Response,
) => {
    try {
        //putting a label on payload in advance
        const payload = req.body as GitLabPayload;
        
        await processWebhook(payload);
        
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