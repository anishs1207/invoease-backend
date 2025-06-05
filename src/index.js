import connectionDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";
import serverless from 'serverless-http';

dotenv.config({
    path: './.env'
});

connectionDB()
    .then(() => {
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server Running at port:${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.log("MONGODB Connection Failed : Error ", err);
        process.exit(1);
    });

export const handler = serverless(app);
