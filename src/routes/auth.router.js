import express from "express";
import passport from "passport";

const router = express.Router();

router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        console.log(req.user)
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Google authentication failed" });
        }

        const { accessToken, refreshToken } = req.user.tokens;

        console.log(accessToken, refreshToken);

        const options = { httpOnly: true, secure: false };

        console.log("access", accessToken);
        console.log("refresh", refreshToken)

        res.cookie("accessToken", accessToken, options);
        res.cookie("refreshToken", refreshToken, options);
        console.log ("cookied are set")

        res.redirect(`${process.env.FRONTEND_URL}/invoice`)
    }
);

export default router;
