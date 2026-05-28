import { Request, Response } from "express";

export const handleGitLabWebhook = async (
    req: Request,
    res: Response,
) => {
    console.log(req.body);

    return res.status(200).json({
        success: true,
        message: "GitLab webhook received"
    })
}