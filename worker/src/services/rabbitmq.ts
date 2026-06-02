//Create a RabbitMQ service
import amqp from "amqplib";

export async function connectRabbitMQ() {
    return amqp.connect(process.env.RABBITMQ_URL!);
}