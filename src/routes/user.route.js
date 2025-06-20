import { Router } from "express";
import {
    loginUser,
    resendVerificationCode,
    verifyCode,
    registerUser,
    logoutUser,
    refreshAccessToken,
    getUserSession,
    getUserNotifications,
    deleteAllNotifications,
    subscribeUser,
    checkSubscriptionStatus
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', verifyJWT, logoutUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/verify', verifyCode);
router.get('/session', verifyJWT, getUserSession);
router.post('/resend-code', resendVerificationCode);
router.get('/get-notifications', verifyJWT, getUserNotifications);
router.delete('/delete-notifications', verifyJWT, deleteAllNotifications)
router.post('/subscribe', subscribeUser);
router.get('/check-subscribe', checkSubscriptionStatus);


export default router;
