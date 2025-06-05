import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

import passport from "passport";


dotenv.config({
    path: './.env'
});

const app = express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    },
));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static('public'));

app.use(cookieParser());

import "./controllers/auth.controller.js";


import userRouter from "./routes/user.route.js";
import invoiceRouter from "./routes/invoice.router.js"
import authRoutes from "./routes/auth.router.js";
import adminRoutes from "./routes/admin.route.js"

app.use('/api/v1/user', userRouter);
app.use('/api/v1/invoice', invoiceRouter);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);

export { app };


