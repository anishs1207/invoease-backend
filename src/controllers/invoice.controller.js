import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Invoice } from "../models/invoice.model.js";

const createInvoice = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(400).json({
            message: "User ID is required"
        })
    }

    const {
        invoiceNumber,
        invoiceDate,
        dueDate,
        clientName,
        clientEmail,
        clientAddress,
        items,
        tax,
        discount,
        companyName,
        companyAddress,
    } = req.body;

    const user = req.user._id;

    if (
        !invoiceNumber || !invoiceDate || !dueDate || !clientName || !clientEmail ||
        !clientAddress || !items || !companyName || !companyAddress
    ) {
        return res.json({ message: "All Items Not Given" });
    }

    if (!Array.isArray(items) || items.length === 0) {
        return res.json({ message: "Atleast 1 Item is required" });
    }

    const existingInvoice = await Invoice.findOne({ invoiceNumber, user });

    if (existingInvoice) {
        return res.json({
            message: "Duplicate Invoice Number"
        })
    }

    const invoice = await Invoice.create({
        invoiceNumber,
        invoiceDate,
        dueDate,
        clientName,
        clientEmail,
        clientAddress,
        items,
        tax: tax || 0,
        discount: discount || 0, 
        companyName,
        companyAddress,
        user,
        status: "Pending",
        createdBy: req.user._id,
    });

    if (!invoice) throw new ApiError(500, "Error creating invoice");

    return res.status(201).json(new ApiResponse(201, invoice, "Invoice created successfully"));
});

const getInvoices = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const userInvoices = await Invoice.find({ user: userId })
        return res.status(200).json(new ApiResponse(200, userInvoices, "Invoices retrieved successfully"));

    } catch (error) {
        console.error("Error fetching invoices:", error);
        return res.status(500).json(new ApiResponse(500, null, "Failed to retrieve invoices"));
    }
});

const getInvoiceById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const invoice = await Invoice.findById(id);
    
    if (!invoice) throw new ApiError(404, "Invoice not found");

    return res.status(200).json(new ApiResponse(200, invoice, "Invoice retrieved successfully"));
});

const updateInvoice = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const invoice = await Invoice.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!invoice) throw new ApiError(404, "Invoice not found");

    return res.status(200).json(new ApiResponse(200, invoice, "Invoice updated successfully"));
});

const deleteInvoice = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const invoice = await Invoice.findByIdAndDelete(id);

    if (!invoice) throw new ApiError(404, "Invoice not found");

    return res.status(200).json(new ApiResponse(200, null, "Invoice deleted successfully"));
});

const updateInvoiceStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) throw new ApiError(400, "Status is required");

    const invoice = await Invoice.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    
    if (!invoice) throw new ApiError(404, "Invoice not found");

    return res.status(200).json(new ApiResponse(200, invoice, "Invoice status updated successfully"));
});

export { updateInvoiceStatus, createInvoice, getInvoices, getInvoiceById, updateInvoice, deleteInvoice };
