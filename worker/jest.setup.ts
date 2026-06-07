import dotenv from "dotenv";

dotenv.config({
  path: "../.env",
});

console.log("RABBITMQ_URL:", process.env.RABBITMQ_URL);