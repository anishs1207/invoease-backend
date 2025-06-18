import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import { generateAccessAndRefreshTokens } from "../controllers/user.controller.js";

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
       async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    
                    user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        user.googleId = profile.id;
                        await user.save();

                    } else {
                        user = await User.create({
                            googleId: profile.id,
                            fullName: profile.displayName,
                            email: profile.emails[0].value,
                            username: profile.emails[0].value.split("@")[0], 
                            isVerified: true, 
                            isOAuthUser: true,
                        });
                    }
                }

                const tokens = await generateAccessAndRefreshTokens(user._id);
                const userObj = user.toObject();
                userObj.tokens = tokens;
                
                return done(null, userObj);
                
            } catch (error) {
                return done(error, null);
            }
        }
    )
);
