//start the worker
import { start } from "node:repl";
import { startConsumer } from "./consumers/gitlabEventConsumer";

async function bootstrap(){
    await startConsumer();
}

bootstrap();
