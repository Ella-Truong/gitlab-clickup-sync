import express from "express";
import cors from "cors";

//This means import all webhook-related routes ==> provides HTTP methods: GET, POST, PUT, DELETE
import webhookRoutes from "./routes/gitlab.routes";
import healthRoutes from "./routes/health.routes";

//create Express app 
const app = express();

//This is middleware ==> automatically parse incoming JSON requests
app.use(cors());
app.use(express.json());

//check health
app.use("/health", healthRoutes);

//connect webhook routes to the app like entry point of the app
//any request starting with /webhook should use wehbookRoutes
app.use("/webhook", webhookRoutes);

export default app;