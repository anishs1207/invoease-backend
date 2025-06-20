import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // console.log ("verify JWT")
        // console.log("Request Cookies", res.cookies);
        let token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "").trim();

        // console.log (token);

        if (!token) {
            throw new ApiError(401, "Unauthorized Request - No Token Provided");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Unauthorized Request - User Not Found");
        }

        if (!user.isVerified) {
            throw new ApiError(403, "Access Denied, User is Not Verified");
        }
       
        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new ApiError(401, "Access Token Expired");
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new ApiError(401, "Invalid Access Token");
        }
        // console.log("Auth Middleware", error)
        // console.error("JWT Verification Error:", error.message);
        throw new ApiError(401, error.message || "Unauthorized Request");
    }
});


export const authoriseAdmin = asyncHandler(async (req, res, next) => {
    console.log(req.user)
    if (!req.user || req.user.role !== 'admin') {
        return next(new ApiError(403, "Access Denied: Admins Only"));
    }
    next();
});
