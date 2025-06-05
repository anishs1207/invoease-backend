import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        clientName: {
            type: String,
            required: [true, "Client Name is required"],
            trim: true,
        },
        invoiceNumber: {
            type: String,
            unique: false,
            sparse: true,
        },
        clientEmail: {
            type: String,
            required: [true, "Client Email is required"],
            trim: true,
            lowercase: true,
        },
        clientAddress: {
            type: String,
            required: [true, "Client Address is required"],
            trim: true,
        },
        companyName: {
            type: String,
            trim: true,
        },
        companyAddress: {
            type: String,
            required: [true, "Company Address is required"],
            trim: true,
        },
        items: [
            {
                description: {
                    type: String,
                    required: [true, "Item description is required"],
                },
                quantity: {
                    type: Number,
                    required: [true, "Item quantity is required"],
                    min: [1, "Quantity must be at least 1"],
                },
                price: {
                    type: Number,
                    required: [true, "Item price is required"],
                    min: [0, "Price cannot be negative"],
                },
                desc: {
                    type: String,
                    required: false,
                }
            },
        ],
        tax: {
            type: Number,
            required: [true, "Tax amount is required"],
            min: [0, "Tax cannot be negative"],
        },
        discount: {
            type: Number,
            required: [true, "Discount amount is required"],
            min: [0, "Discount cannot be negative"],
        },
        status: {
            type: String,
            enum: ["Pending", "Paid"],
            default: "Pending",
        },
        invoiceDate: {
            type: Date,
            required: [true, "Invoice Date is required"],
            default: Date.now,
        },
        dueDate: {
            type: Date,
            required: [true, "Due Date is required"],
        },
        pdfUrl: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);


export const Invoice = mongoose.model("Invoice", invoiceSchema);



