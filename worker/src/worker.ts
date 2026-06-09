//start the worker
import dotenv from "dotenv";
import { startConsumer } from "./consumers/gitlabEventConsumer";

dotenv.config();

async function bootstrap(){
    await startConsumer();
}

bootstrap();
