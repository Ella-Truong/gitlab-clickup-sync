//start the worker
import dotenv from "dotenv";
import express from "express";
import { startConsumer } from "./consumers/githubEventConsumer";

dotenv.config();
const app = express();

app.get("/", (_,res) => {
    res.send("Worker is running")
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`Health server running on port ${PORT}`)
});

async function bootstrap(){
    await startConsumer();
}

bootstrap();
