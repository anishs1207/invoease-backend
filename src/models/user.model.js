import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is Required"],
        unique: true,
        lowercase: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please enter a valid email address",
        ]
    },
    password: {
        type: String,
        required: function () { return !this.isOAuthUser },
        minlength: [6, "Password must be alteast 6 charcters"],
        select: false,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription"
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
    },
    verificationCodeExpires: {
        type: Date,
    },
    isOAuthUser: {  // ✅ Fix: Added this field
        type: Boolean,
        default: false,
    },
    isSubscribedToNewsletter: {
        type: Boolean,
        default: false,
    },
    notifications: [{
        icon: {
            type: String,
            required: true,
        },
        alertText: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now
        }
    }]

}, { timestamps: true });


userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isOAuthUser) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    if (!password || !this.password) {
        throw new ApiError(400, "Password is Missing");
    }
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw new ApiError(500, "Error comparing passwords: " + error.message);
    }
};


userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,

    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        })
}




export const User = mongoose.model("User", userSchema);