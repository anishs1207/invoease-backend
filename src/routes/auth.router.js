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

        const convertDurationToMs = (durationString) => {
    const value = parseInt(durationString);
    if (isNaN(value)) {
        console.warn(`Invalid duration string for maxAge: ${durationString}. Defaulting to 0ms.`);
        return 0; // Or throw a more specific error
    }

    if (durationString.endsWith('d')) {
        return value * 24 * 60 * 60 * 1000; // days to milliseconds
    }
    if (durationString.endsWith('h')) {
        return value * 60 * 60 * 1000; // hours to milliseconds
    }
    if (durationString.endsWith('m')) {
        return value * 60 * 1000; // minutes to milliseconds
    }
    if (durationString.endsWith('s')) {
        return value * 1000; // seconds to milliseconds
    }
    // If no unit, assume it's already in milliseconds or handle as an error
    return value;
};

        const { accessToken, refreshToken } = req.user.tokens;

        console.log(accessToken, refreshToken);

        const accessTokenMaxAge = convertDurationToMs(process.env.ACCESS_TOKEN_EXPIRY);
        const refreshTokenMaxAge = convertDurationToMs(process.env.REFRESH_TOKEN_EXPIRY);

        const accessTokensOptions = {
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

        res.cookie("accessToken", accessToken, accessTokensOptions);
        res.cookie("refreshToken", refreshToken, refreshTokenOptions);
        console.log ("cookied are set")

        res.redirect(`${process.env.FRONTEND_URL}/invoice`)
    }
);

export default router;
