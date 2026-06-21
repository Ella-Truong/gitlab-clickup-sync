//start the worker
import dotenv from "dotenv";
import express from "express";

import { startConsumer } from "./consumers/githubEventConsumer";
import { getWorkspaceUsers } from "./services/clickup.service";
import { saveUserMapping } from "./services/redis.service";

dotenv.config();
const app = express();

app.get("/", (_,res) => {
    res.send("Worker is running")
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`Health server running on port ${PORT}`)
});

async function bootstrap(): Promise<void>{
    const users = await getWorkspaceUsers();

    for (const user of users){
        await saveUserMapping(user.username, user.id);
    }

    await startConsumer();
}

bootstrap().catch(console.error);
