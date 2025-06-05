import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const sendNotifications = asyncHandler(async (req, res) => {
    console.log(req.body);
    const { emoji, alertText } = req.body;
    const sender = req.user;

    console.log("text")

    if (sender.role !== "admin") {
        throw new ApiError(403, "Access Denied: Only admins can send notifications.");
    }

    const newNotification = {
        icon: emoji,
        alertText,
        date: Date.now(), 
    };

    await User.updateMany({}, { $push: { notifications: newNotification } });

    res.status(201).json(new ApiResponse(201, newNotification, "Notification sent to all users successfully."));
});

export const getNotifications = asyncHandler(async (req, res) => {
    const adminUser = await User.findOne({ role: "admin" }).select("notifications");

    if (!adminUser) {
        throw new ApiError(404, "Admin user not found.");
    }

    res.status(200).json(new ApiResponse(200, adminUser.notifications, "Admin notifications fetched successfully."));
});

export const deleteNotificationByText = asyncHandler(async (req, res) => {
    const { alertText } = req.params; // Get alertText from request params

    console.log("Deleting notification with text:", alertText);

    const result = await User.updateMany({}, { $pull: { notifications: { alertText: alertText } } });

    if (result.modifiedCount === 0) {
        return res.status(404).json(new ApiResponse(404, null, "No notifications found with the given text."));
    }

    console.log("Notification deleted successfully.");
    res.status(200).json(new ApiResponse(200, null, "Notification deleted successfully."));
});


export const updateNotificationById = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const { alertText, emoji } = req.body;

    await User.updateMany(
        { "notifications._id": notificationId }, // Find users with the notification
        {
            $set: {
                "notifications.$.alertText": alertText,
                "notifications.$.icon": emoji,
            },
        }
    );

    res.status(200).json(new ApiResponse(200, null, "Notification updated successfully."));
});
