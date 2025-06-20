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

         const accessTokenMaxAge = convertDurationToMs(process.env.ACCESS_TOKEN_EXPIRY);
        const refreshTokenMaxAge = convertDurationToMs(process.env.REFRESH_TOKEN_EXPIRY);

        const acessTokensOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: accessTokenMaxAge,
        }

        const refreshTokenOptions = {
             httpOnly: true,
             secure: true, 
             sameSite: 'None',
             maxAge:  refreshTokenMaxAge,
        }

        console.log("access", accessToken);
        console.log("refresh", refreshToken)

        res.cookie("accessToken", accessToken, acessTokensOptions);
        res.cookie("refreshToken", refreshToken, refreshTokenOptions);
        console.log ("cookied are set")

        res.redirect(`${process.env.FRONTEND_URL}/invoice`)
    }
);

export default router;
