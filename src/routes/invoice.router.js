import express from "express";
import {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoiceStatus,
    deleteInvoice,
} from "../controllers/invoice.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-invoice", verifyJWT, createInvoice);
router.delete("/delete-invoice/:id", verifyJWT, deleteInvoice);
router.put("/update-status/:id", verifyJWT, updateInvoiceStatus);
router.get("/invoices", verifyJWT, getInvoices);
router.get("/invoice/:id", verifyJWT, getInvoiceById);

export default router;
