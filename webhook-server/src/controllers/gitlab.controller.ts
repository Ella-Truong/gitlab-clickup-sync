import { Request, Response } from "express";
import { publishMessage } from "../services/rabbitmq.service";

export const handleGitLabWebhook = async (
    req: Request,
    res: Response,
) => {
    try {
        await publishMessage(req.body);

        return res.status(200).json({
            success: true,
            message: "Webhook published"
        });
    }catch(error){
        console.error(error);

        return res.status(500).json({
            success: false
        });
    }
};