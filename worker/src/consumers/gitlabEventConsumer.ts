/**
 * Consumes GitLab events from RabbitMQ
 * For now, console.log(event) when a message arrives
 * This stage happens between RabbitMQ and ClickUp
 */

import { connectRabbitMQ } from "../services/rabbitmq";


const QUEUE_NAME = "gitlab-events";

export async function startConsumer(){
    //start a connection with RabbitMQ
    const connection = await connectRabbitMQ();

    //after connecting, create a channel
    //this is an AMQP channel used to communicate with RabbitMQ
    const channel = await connection.createChannel();
    
    //make sure a queue with this name EXIST
    //when RabbitMQ restart, the queue still exist
    await channel.assertQueue(QUEUE_NAME, {
        durable: true,
    });

    console.log(`Listening on queue: ${QUEUE_NAME}`);
    
    //start consumer
    //whenever a new message arrives in QUEUE_NAME, call this function
    channel.consume(QUEUE_NAME, (msg) => {
        //no message was received -> stop
        if (!msg) return;

        try {
            /**
             * RabbitMQ stores message data as a Buffer
             * Cannot directly read that
             * Must convert it to text: msg.content.toString()
             * Convert JSON string into an object
             */
            const payload = JSON.parse(msg.content.toString());
            
            console.log("Received event: ");
            console.log(payload);

            channel.ack(msg);
        }catch(error){
            console.error("Failed to process message", error)
        }
    })
}