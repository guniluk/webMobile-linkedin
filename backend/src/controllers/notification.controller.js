import Notification from "../models/notification.model.js";

// Helper function to find and validate notification ownership
const findAndValidateNotification = async (id, userId, actionMessage) => {
  const notification = await Notification.findById(id);
  if (!notification) {
    return { error: { status: 404, message: "Notification not found" } };
  }
  if (notification.recipient.toString() !== userId.toString()) {
    return {
      error: {
        status: 401,
        message: `You are not authorized to ${actionMessage} this notification`,
      },
    };
  }
  return { notification };
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("relatedUser", "name username profilePicture")
      .populate("relatedPost", "content image")
      .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.log("Error in getNotifications controller: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
    const { notification, error } = await findAndValidateNotification(
      id,
      req.user._id,
      "delete"
    );
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    await notification.deleteOne();
    res.status(200).json(notification);
  } catch (error) {
    console.log("Error in deleteNotification controller: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const { notification, error } = await findAndValidateNotification(
      id,
      req.user._id,
      "mark"
    );
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    notification.read = true;
    await notification.save();
    res.status(200).json(notification);
  } catch (error) {
    console.log("Error in markNotificationAsRead controller: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
