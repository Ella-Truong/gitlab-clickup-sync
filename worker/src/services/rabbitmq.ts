//create connection to RabbitMQ
//establish TCP connection between Node.js app and RabbitMQ
//AMQP (Advanced Message Queuing Protocol)
/**
 * webhook-server -> RabbitMQ = AMQP
 * RabbitMQ -> worker = AMQP
 */ 
import amqp from "amqplib";

export async function connectRabbitMQ() {
    console.log("RabbitMQ URL: ", process.env.RABBITMQ_URL)
    return amqp.connect(process.env.RABBITMQ_URL!);
}