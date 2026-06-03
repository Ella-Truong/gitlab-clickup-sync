/**
 * Consumes GitLab events from RabbitMQ
 */

import { connectRabbitMQ } from "../services/rabbitmq";

const QUEUE_NAME = "gitlab-events";

export async function startConsumer(){
    //start a connection with RabbitMQ
    const connection = await connectRabbitMQ();

    //after connecting, create a channel 
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, {
        durable: true,
    });

    console.log(`Listening on queue: ${QUEUE_NAME}`);

    channel.consume(QUEUE_NAME, (msg) => {
        if (!msg) return;

        try {
            const payload = JSON.parse(msg.content.toString());
            
            console.log("Received event: ");
            console.log(payload);

            channel.ack(msg);
        }catch(error){
            console.error("Failed to process message", error)
        }
    })
}