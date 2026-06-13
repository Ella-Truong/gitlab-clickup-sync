/**
 * Consumes GitLab events from RabbitMQ
 * For now, console.log(event) when a message arrives
 * This stage happens between RabbitMQ and ClickUp, done by worker
 * This function doesn't return anything, just waiting for the setup to complete
 */

import { connectRabbitMQ } from "../services/rabbitmq";
import { handleGitHubEvent } from "../handler/github.handler";

const QUEUE_NAME = "github-events";

export async function startConsumer(){
    //start a connection with RabbitMQ
    const connection = await connectRabbitMQ();

   //create communication channel
    const channel = await connection.createChannel();
    
    //make sure a queue with this name EXIST
    //durable: true means RabbitMQ will try to keep the queue after a broker restart
    await channel.assertQueue(QUEUE_NAME, {
        durable: true,
    });

    console.log(`Listening on queue: ${QUEUE_NAME}`);
    
    //start consumer
    //whenever a new message arrives in QUEUE_NAME, call this function
    await channel.consume(QUEUE_NAME, async (msg) => {
        //no message was received -> stop
        console.log("Consumer received message")
        if (!msg) return;

        try {
            /**
             * RabbitMQ stores message data as a Buffer
             * Cannot directly read that
             * Must convert it to text: msg.content.toString()
             * Convert JSON string into an object
            */
            
            //extract data (msg.content) from the message -> payload
            const payload = JSON.parse(msg.content.toString());
            console.log(`Received ${payload.eventType} event from ${payload.projectName}`)

            //process business logic
            await handleGitHubEvent(payload)

            console.log(`Successfully processed ${payload.eventType} event`)
            
            //acknowledge the message is successfully handled
            //can remove it from the queue 
            channel.ack(msg);
        }catch(error){
            console.error("Failed to process message", error);

            /**
             * Message is NOT acknowledged
             * 
             * RabbitMQ will keep the message unacknowledged, 
             * allowing it to be retried or investigated
             */
            
        }
    })
}