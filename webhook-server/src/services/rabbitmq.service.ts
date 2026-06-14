/**
 * Connect to RabbitMQ
 * Initiliaze a shared channel to send messages to the queue
 * Make sure channel exist before publishing messages
 */

import amqp from "amqplib";

const QUEUE_NAME = "github-events";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(
            process.env.RABBITMQ_URL!
        );

        channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME);

        console.log("Connected to RabbitMQ");
    }catch(error){
        console.error("RabbitMQ connection failed: ", error)
    }
};

export const publishMessage = async (message: object) => {
    if(!channel) {
        throw new Error("RabbitMQ channel not initialized")
    }

    channel.sendToQueue(
        QUEUE_NAME,
        Buffer.from(JSON.stringify(message))
    );

    console.log("Message published")
}