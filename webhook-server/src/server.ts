import app from "./app";
import dotenv from "dotenv";
import { connectRabbitMQ } from "./services/rabbitmq.service";

dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    await connectRabbitMQ();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
