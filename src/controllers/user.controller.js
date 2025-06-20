import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/emailService.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User Not Found");

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error Generating Tokens:", error);
        throw new ApiError(500, "Error generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    let role = "user";

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
        if (existingUser.isOAuthUser) {
            return res.status(409).json({
                success: false, message: "User already registered via Google. Please login using Google."
            })
        }

        return res.status(409).json({
            success: false, message: "User with Email Already Exists"
        })
    }

    if (email.toLowerCase() == 'anishs1207@gmail.com') role = "admin";

    const verificationCode = Math.floor(100000 + Math.random() * 90000);
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); 

    const user = await User.create({
        fullName,
        email,
        role,
        password,
        username: username.toLowerCase(),
        verificationCode,
        verificationCodeExpires: expiryTime,
        isVerified: false,
    });

    if (!user) throw new ApiError(500, "Error registering the user");

    await sendVerificationEmail(email, verificationCode);

    const createdUser = await User.findById(user._id).select("username email fullName createdAt updatedAt");

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const options = { httpOnly: true, secure: false };

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            success: true,
            message: "User registered successfully",
            user: createdUser,
        });
});

const verifyCode = asyncHandler(async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) throw new ApiError(400, "Email and verification code are required");

    const user = await User.findOne({ email });

    if (!user) throw new ApiError(404, "User not found");
    if (user.isVerified) throw new ApiError(400, "User is already verified.");
    if (user.verificationCode !== code) throw new ApiError(400, "Invalid verification code.");
    if (new Date() > user.verificationCodeExpires) throw new ApiError(400, "Verification code expired.");

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    return res.status(200).json(new ApiResponse(200, { isVerified: true }, "Verification successful!"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) throw new ApiError(400, "Email and Password are required");

    const user = await User.findOne({ $or: [{ email }] }).select("+password");

    if (!user) {
        return res.status(409).json({
            success: false, message: "User with Email does not Exist"
        })
    }

    if (!user.isVerified) {
        await resendVerificationCode({ body: { email } }, res);
        return res.json({
            success: false,
            message: "Email not verified. A new verification code has been sent."
        });
    }

    const isPassValid = await user.isPasswordCorrect(password);
    if (!isPassValid) throw new ApiError(401, "Invalid User Credentials");

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("username email fullName createdAt updatedAt");

    const options = { httpOnly: true, secure: true };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User Logged in Successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } }, { new: true });

    const options = { httpOnly: true, secure: true };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, null, "User Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized Request");

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);

        if (!user) throw new ApiError(401, "Invalid Refresh Token");
        if (incomingRefreshToken !== user?.refreshToken) throw new ApiError(401, "Refresh Token is Expired or Used");

        const options = { httpOnly: true, secure: true };

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access Token Refreshed"));
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }
});

const getUserSession = asyncHandler(async (req, res) => {
    console.log ("session fetching")
    if (!req.user) {
        throw new ApiError(401, "User not authenticated");
    }

    const user = await User.findById(req.user._id).select("username email fullName isVerified createdAt updatedAt");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, { user }, "User session retrieved successfully"));
});

const resendVerificationCode = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    if (!email) throw new ApiError(400, "Email is required");

    const user = await User.findOne({ email });


    if (!user) throw new ApiError(404, "User not found");
    if (user.isVerified) throw new ApiError(400, "User is already verified");

    const newVerificationCode = Math.floor(100000 + Math.random() * 90000);
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verificationCode = newVerificationCode;
    user.verificationCodeExpires = expiryTime;

    await user.save();

    await sendVerificationEmail(user.email, newVerificationCode);

    return res.status(200).json(new ApiResponse(200, null, "Verification code resent successfully"));
});

const deleteAllNotifications = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;  
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }
       
        user.notifications = [];

        await user.save();

        return res.status(200).json(new ApiResponse(200, null, "All notifications deleted successfully"));
    } catch (error) {
        console.error("Error deleting notifications:", error);
        throw new ApiError(500, "Error deleting notifications");
    }
});

const getUserNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).select("notifications");
    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(new ApiResponse(200, user.notifications, "User notifications retrieved successfully"));
});

const subscribeUser = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) throw new ApiError(400, "Email is required");

    const user = await User.findOne({ email });

    if (!user) throw new ApiError(404, "User not found");

    user.isSubscribed = true;
    await user.save();

    return res.status(200).json(new ApiResponse(200, { isSubscribed: true }, "User subscribed successfully"));
});

const checkSubscriptionStatus = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) throw new ApiError(400, "Email is required");

    const user = await User.findOne({ email });

    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(new ApiResponse(200, { isSubscribed: user.isSubscribed }, "Subscription status retrieved successfully"));
});


export { resendVerificationCode, 
    registerUser, 
    generateAccessAndRefreshTokens, 
    verifyCode, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    getUserSession, 
    deleteAllNotifications, 
    getUserNotifications, 
    subscribeUser, 
    checkSubscriptionStatus };
