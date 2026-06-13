import { Channel, Connection } from "amqplib";
import { connectRabbitMQ } from "../../src/services/rabbitmq";

const QUEUE_NAME = "github-events";

let connection: Awaited<ReturnType<typeof connectRabbitMQ>>
let channel: Channel;

export async function setupRabbitMQ() {
    console.log("Creating connection")
    connection = await connectRabbitMQ();

    console.log("Creating channel")
    channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, {
        durable: true,
    });

    return { connection, channel };
}

export async function publishMessage(
    payload: unknown
): Promise<void> {
    console.log("Publising message")
    channel.sendToQueue(
        QUEUE_NAME,
        Buffer.from(JSON.stringify(payload))
    );
}

export async function cleanupRabbitMQ() {
    if(channel){
        await channel.close();
    }

    if(connection){
        await connection.close()
    }
}