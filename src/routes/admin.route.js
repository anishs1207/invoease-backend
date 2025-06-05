import { Router } from "express";
import { authoriseAdmin, verifyJWT } from "../middleware/auth.middleware.js";
import { sendNotifications, getNotifications, updateNotificationById, deleteNotificationByText } from "../controllers/admin.controller.js";

const router = Router();

router.post('/send-notifications', verifyJWT, authoriseAdmin, sendNotifications);
router.get('/all-notifications', verifyJWT, authoriseAdmin, getNotifications);
router.delete('/delete-notification/:alertText', verifyJWT, authoriseAdmin, deleteNotificationByText);
router.put('/update-notification', verifyJWT, authoriseAdmin, updateNotificationById);

export default router;
