import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },

        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
        },

        clientName: {
            type: String,
            required: true,
        },

        dueDate: {
            type: Date,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ["Paid", "Pending"],
            default: "Pending",
        },
        link: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);


export const Subscription = mongoose.model("Subscription", subscriptionSchema);
