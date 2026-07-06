import User from "../models/user.model.js";
import ConnectionRequest from "../models/connectionRequest.model.js";
import Notification from "../models/notification.model.js";
import { sendConnectionAcceptedEmail } from "../emails/emailHandler.js";

export const sendConnectionRequest = async (req, res) => {
  try {
    const { UserId: recipientId } = req.params;
    const senderId = req.user._id;

    if (senderId.toString() === recipientId.toString()) {
      return res
        .status(400)
        .json({ error: "You cannot send a connection request to yourself" });
    }
    if (req.user.connections.includes(recipientId)) {
      return res
        .status(400)
        .json({ error: "You are already connected with this user" });
    }
    const user = await User.findById(recipientId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const existingRequest = await ConnectionRequest.findOne({
      sender: senderId,
      recipient: recipientId,
      status: "pending",
    });
    if (existingRequest) {
      return res.status(400).json({ error: "Connection request already sent" });
    }
    const connectionRequest = await ConnectionRequest.create({
      sender: senderId,
      recipient: recipientId,
    });
    res.status(201).json({ message: "Connection request sent successfully" });
  } catch (error) {
    console.log("error in sendConnectionRequest controller: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const connectionRequest = await ConnectionRequest.findById(requestId)
      .populate("sender", "name email username")
      .populate("recipient", "name username");

    if (!connectionRequest) {
      return res.status(404).json({ error: "Connection request not found" });
    }
    if (connectionRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    if (connectionRequest.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Connection request is already accepted or rejected" });
    }
    connectionRequest.status = "accepted";
    await connectionRequest.save();

    const sender = await User.findById(connectionRequest.sender);
    const recipient = await User.findById(connectionRequest.recipient);
    sender.connections.push(connectionRequest.recipient);
    recipient.connections.push(connectionRequest.sender);
    await sender.save();
    await recipient.save();

    //create notification for sender
    const notification = new Notification({
      type: "connectionAccepted",
      recipient: sender._id,
      relatedUser: recipient._id,
    });
    await notification.save();

    //send email for request connection
    const senderEmail = connectionRequest.sender.email;
    const senderName = connectionRequest.recipient.name;
    const recipientName = connectionRequest.sender.name;
    const profileUrl = `${process.env.CLIENT_URL}/profile/${connectionRequest.recipient.username}`;

    try {
      await sendConnectionAcceptedEmail(
        senderEmail,
        senderName,
        recipientName,
        profileUrl,
      );
    } catch (emailError) {
      console.error("Error sending connection accepted email:", emailError);
    }

    res
      .status(200)
      .json({ message: "Connection request accepted successfully" });
  } catch (error) {
    console.log("error in acceptConnectionRequest controller: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const connectionRequest = await ConnectionRequest.findById(requestId);
    if (!connectionRequest) {
      return res.status(404).json({ error: "Connection request not found" });
    }
    if (connectionRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    if (connectionRequest.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Connection request is already accepted or rejected" });
    }

    connectionRequest.status = "rejected";
    await connectionRequest.save();
    res
      .status(200)
      .json({ message: "Connection request rejected successfully" });
  } catch (error) {
    console.log("error in rejectConnectionRequest controller: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//get all pending connection requests for the current user
export const getConnectionRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const connectionRequests = await ConnectionRequest.find({
      recipient: userId,
      status: "pending",
    }).populate("sender", "name username profilePicture headline connections");
    res.status(200).json(connectionRequests);
  } catch (error) {
    console.log("error in getConnectionRequests controller: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//get all connections for the current user
export const getUserConnections = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate(
      "connections",
      "name username profilePicture headline connections",
    );
    res.status(200).json(user.connections);
  } catch (error) {
    console.log("error in getUserConnections controller: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const removeConnection = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;
    const user = await User.findById(userId);
    const me = await User.findById(myId);
    if (!user || !me) {
      return res.status(404).json({ error: "User not found" });
    }
    user.connections.pull(myId);
    me.connections.pull(userId);
    await user.save();
    await me.save();
    res.status(200).json({ message: "Connection removed successfully" });
  } catch (error) {
    console.log("error in removeConnection controller: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getConnectionStatus = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const myId = req.user._id;
    const user = await User.findById(targetUserId);
    const me = await User.findById(myId);
    if (!user || !me) {
      return res.status(404).json({ error: "User not found" });
    }

    if (me.connections.includes(targetUserId)) {
      return res.status(200).json({ status: "connected" });
    }

    const pendingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: myId, recipient: targetUserId },
        { sender: targetUserId, recipient: myId },
      ],
      status: "pending",
    });
    if (pendingRequest) {
      if (pendingRequest.sender.toString() === myId.toString()) {
        return res.status(200).json({ status: "pending" });
      } else {
        return res
          .status(200)
          .json({ status: "received", requestId: pendingRequest._id });
      }
    }

    return res.status(200).json({ status: "not_connected" });
  } catch (error) {
    console.log("error in getConnectionStatus controller: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
